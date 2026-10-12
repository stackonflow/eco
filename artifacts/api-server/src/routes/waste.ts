import { Router, type IRouter } from "express";
import {
  CreateWasteRateBody,
  CreateWasteRateResponse,
  CreateWasteRequestBody,
  CreateWasteRequestResponse,
  GetWasteRequestParams,
  GetWasteRequestResponse,
  ListActiveWasteRatesResponse,
  ListAllWasteRatesResponse,
  ListAllWasteRequestsResponse,
  ListMyWasteRequestsResponse,
  UpdateWasteRateBody,
  UpdateWasteRateParams,
  UpdateWasteRateResponse,
  UpdateWasteRequestStatusBody,
  UpdateWasteRequestStatusParams,
  UpdateWasteRequestStatusResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { PickupRequest } from "../models/pickup-request";
import { WasteRate } from "../models/waste-rate";

const router: IRouter = Router();
const adminOnly = [requireAuth, requireRole("admin")];

function issueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues.map((issue) => issue.message).join(" ");
}

function toRateResponse(rate: {
  _id: { toString(): string };
  category: string;
  ratePerKg: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: rate._id.toString(),
    category: rate.category,
    ratePerKg: rate.ratePerKg,
    active: rate.active,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
  };
}

type UserSummary = {
  _id?: { toString(): string };
  name?: string;
  email?: string;
  toString(): string;
};

type StatusHistoryEntry = {
  status: string;
  note?: string | null;
  actorName?: string | null;
  createdAt: Date;
};

type VerificationRecord = {
  actualWeightKg: number;
  quality: string;
  ratePerKg: number;
  finalAmount: number;
  notes?: string | null;
  collectorName?: string | null;
  verifiedAt: Date;
};

export type PickupRequestRecord = {
  _id: { toString(): string };
  user: UserSummary;
  category: string;
  estimatedQuantityKg: number;
  pickupAddress: string;
  preferredPickupAt: Date;
  description?: string | null;
  ratePerKg: number;
  estimatedValue: number;
  status: string;
  assignedCollector?: UserSummary | null;
  scheduledAt?: Date | null;
  statusHistory?: StatusHistoryEntry[];
  verification?: VerificationRecord | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPickupRequestResponse(request: PickupRequestRecord) {
  const maybePopulated = request.user as UserSummary;
  const populated =
    typeof maybePopulated === "object" &&
    maybePopulated !== null &&
    typeof maybePopulated.name === "string"
      ? maybePopulated
      : undefined;
  const maybeCollector = request.assignedCollector;
  const populatedCollector =
    typeof maybeCollector === "object" &&
    maybeCollector !== null &&
    typeof maybeCollector.name === "string"
      ? maybeCollector
      : undefined;
  return {
    id: request._id.toString(),
    userId: populated?._id?.toString() ?? maybePopulated.toString(),
    userName: populated?.name ?? null,
    userEmail: populated?.email ?? null,
    category: request.category,
    estimatedQuantityKg: request.estimatedQuantityKg,
    pickupAddress: request.pickupAddress,
    preferredPickupAt: request.preferredPickupAt,
    description: request.description ?? null,
    ratePerKg: request.ratePerKg,
    estimatedValue: request.estimatedValue,
    status: request.status,
    assignedCollector: populatedCollector
      ? {
          id: populatedCollector._id?.toString() ?? maybeCollector?.toString() ?? "",
          name: populatedCollector.name ?? "",
          email: populatedCollector.email ?? "",
        }
      : null,
    scheduledAt: request.scheduledAt ?? null,
    statusHistory: (request.statusHistory ?? []).map((entry) => ({
      status: entry.status,
      note: entry.note ?? null,
      actorName: entry.actorName ?? null,
      createdAt: entry.createdAt,
    })),
    verification: request.verification
      ? {
          actualWeightKg: request.verification.actualWeightKg,
          quality: request.verification.quality,
          ratePerKg: request.verification.ratePerKg,
          finalAmount: request.verification.finalAmount,
          notes: request.verification.notes ?? null,
          collectorName: request.verification.collectorName ?? null,
          verifiedAt: request.verification.verifiedAt,
        }
      : null,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

router.get("/waste-rates", requireAuth, async (_req, res): Promise<void> => {
  const rates = await WasteRate.find({ active: true })
    .sort({ category: 1 })
    .lean();
  res.json(
    ListActiveWasteRatesResponse.parse(rates.map((rate) => toRateResponse(rate))),
  );
});

router.post("/waste-requests", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateWasteRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: issueMessage(parsed.error) });
    return;
  }

  const pickupAt = new Date(parsed.data.preferredPickupAt);
  if (!Number.isFinite(pickupAt.getTime()) || pickupAt.getTime() <= Date.now()) {
    res.status(400).json({ error: "Choose a pickup date and time in the future." });
    return;
  }

  const rate = await WasteRate.findOne({
    category: parsed.data.category,
    active: true,
  }).lean();
  if (!rate) {
    res.status(409).json({
      error: "There is no active rate for this material. Choose another category.",
    });
    return;
  }

  const estimatedValue =
    Math.round(parsed.data.estimatedQuantityKg * rate.ratePerKg * 100) / 100;
  const request = await PickupRequest.create({
    user: res.locals.userId,
    category: parsed.data.category,
    estimatedQuantityKg: parsed.data.estimatedQuantityKg,
    pickupAddress: parsed.data.pickupAddress.trim(),
    preferredPickupAt: pickupAt,
    description: parsed.data.description?.trim() || null,
    ratePerKg: rate.ratePerKg,
    estimatedValue,
    status: "pending",
    statusHistory: [
      { status: "pending", note: "Request submitted", actorName: null, createdAt: new Date() },
    ],
  });

  const payload = toPickupRequestResponse(
    request as unknown as PickupRequestRecord,
  );
  res.status(201).json(CreateWasteRequestResponse.parse(payload));
});

router.get("/waste-requests", requireAuth, async (_req, res): Promise<void> => {
  const requests = await PickupRequest.find({ user: res.locals.userId })
    .populate("assignedCollector", "name email")
    .sort({ createdAt: -1 })
    .lean();
  const payload = requests.map((request) =>
    toPickupRequestResponse(request as unknown as PickupRequestRecord),
  );
  res.json(ListMyWasteRequestsResponse.parse(payload));
});

router.get(
  "/waste-requests/:requestId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetWasteRequestParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: issueMessage(params.error) });
      return;
    }

    const request = await PickupRequest.findById(params.data.requestId)
      .populate("assignedCollector", "name email")
      .lean();
    if (!request) {
      res.status(404).json({ error: "Pickup request not found." });
      return;
    }
    const isAdmin = res.locals.userRole === "admin";
    if (!isAdmin && request.user.toString() !== res.locals.userId) {
      res.status(403).json({ error: "You do not have permission to view this request." });
      return;
    }
    res.json(
      GetWasteRequestResponse.parse(
        toPickupRequestResponse(request as unknown as PickupRequestRecord),
      ),
    );
  },
);

router.get(
  "/admin/waste-rates",
  ...adminOnly,
  async (_req, res): Promise<void> => {
    const rates = await WasteRate.find().sort({ category: 1 }).lean();
    res.json(
      ListAllWasteRatesResponse.parse(
        rates.map((rate) => toRateResponse(rate)),
      ),
    );
  },
);

router.post(
  "/admin/waste-rates",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const parsed = CreateWasteRateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: issueMessage(parsed.error) });
      return;
    }
    try {
      const rate = await WasteRate.create({
        category: parsed.data.category,
        ratePerKg: parsed.data.ratePerKg,
        active: true,
      });
      res.status(201).json(
        CreateWasteRateResponse.parse(toRateResponse(rate)),
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          error: "A rate already exists for this material. Edit that rate instead.",
        });
        return;
      }
      throw error;
    }
  },
);

router.patch(
  "/admin/waste-rates/:rateId",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = UpdateWasteRateParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: issueMessage(params.error) });
      return;
    }
    const parsed = UpdateWasteRateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: issueMessage(parsed.error) });
      return;
    }
    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({ error: "Provide a rate or active status to update." });
      return;
    }
    if (
      parsed.data.ratePerKg !== undefined &&
      (!Number.isFinite(parsed.data.ratePerKg) ||
        parsed.data.ratePerKg <= 0 ||
        parsed.data.ratePerKg > 1_000_000)
    ) {
      res.status(400).json({ error: "Rate per kilogram must be positive and within range." });
      return;
    }
    const rate = await WasteRate.findByIdAndUpdate(
      params.data.rateId,
      { $set: parsed.data },
      { new: true, runValidators: true },
    );
    if (!rate) {
      res.status(404).json({ error: "Waste rate not found." });
      return;
    }
    res.json(UpdateWasteRateResponse.parse(toRateResponse(rate)));
  },
);

router.get(
  "/admin/waste-requests",
  ...adminOnly,
  async (_req, res): Promise<void> => {
    const requests = await PickupRequest.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("assignedCollector", "name email")
      .lean();
    const payload = requests.map((request) =>
      toPickupRequestResponse(request as unknown as PickupRequestRecord),
    );
    res.json(ListAllWasteRequestsResponse.parse(payload));
  },
);

router.patch(
  "/admin/waste-requests/:requestId",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = UpdateWasteRequestStatusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: issueMessage(params.error) });
      return;
    }
    const parsed = UpdateWasteRequestStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: issueMessage(parsed.error) });
      return;
    }
    const current = await PickupRequest.findById(params.data.requestId);
    if (!current) {
      res.status(404).json({ error: "Pickup request not found." });
      return;
    }
    const allowedTransitions: Record<string, string[]> = {
      pending: ["accepted", "cancelled", "rejected"],
      accepted: ["cancelled", "rejected"],
      scheduled: ["cancelled", "rejected"],
      collected: [],
      verified: ["completed"],
      completed: [],
      cancelled: [],
      rejected: [],
    };
    const nextStatus = parsed.data.status;
    if (!(allowedTransitions[current.status] ?? []).includes(nextStatus)) {
      res.status(409).json({
        error: `A pickup cannot move from ${current.status} to ${nextStatus}. Use the assignment, scheduling, or collection workflow for that step.`,
      });
      return;
    }
    const actor = await User.findById(res.locals.userId).select("name").lean();
    const request = await PickupRequest.findOneAndUpdate(
      { _id: current._id, status: current.status },
      {
        $set: { status: nextStatus },
        $push: {
          statusHistory: {
            status: nextStatus,
            note: null,
            actorName: actor?.name ?? null,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("assignedCollector", "name email");
    if (!request) {
      res.status(409).json({ error: "The pickup changed while you were updating it. Refresh and try again." });
      return;
    }
    res.json(
      UpdateWasteRequestStatusResponse.parse(
        toPickupRequestResponse(request as unknown as PickupRequestRecord),
      ),
    );
  },
);

export default router;
