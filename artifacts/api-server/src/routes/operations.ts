import { randomBytes } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  AssignCollectorBody,
  AssignCollectorParams,
  AssignCollectorResponse,
  GetInventoryBatchByQrParams,
  GetInventoryBatchByQrResponse,
  GetInventoryBatchParams,
  GetInventoryBatchResponse,
  GetReceiptParams,
  GetReceiptResponse,
  InventoryProcessingStatus,
  ListAllReceiptsResponse,
  ListCollectorsResponse,
  ListCollectorAssignmentsResponse,
  ListInventoryBatchesResponse,
  ListMyReceiptsResponse,
  PickupRequest,
  SchedulePickupBody,
  SchedulePickupParams,
  SchedulePickupResponse,
  UpdateCollectorPickupStatusBody,
  UpdateCollectorPickupStatusParams,
  UpdateCollectorPickupStatusResponse,
  UpdateInventoryProcessingBody,
  UpdateInventoryProcessingParams,
  UpdateInventoryProcessingResponse,
  VerifyCollectionBody,
  VerifyCollectionParams,
  VerifyCollectionResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { InventoryBatch } from "../models/inventory-batch";
import { PickupRequest as PickupRequestModel } from "../models/pickup-request";
import { Receipt } from "../models/receipt";
import { User } from "../models/user";
import { WasteRate } from "../models/waste-rate";
import { toPickupRequestResponse, type PickupRequestRecord } from "./waste";

const router: IRouter = Router();
const adminOnly = [requireAuth, requireRole("admin")];
const collectorOnly = [requireAuth, requireRole("collector")];
const cents = (value: number) => Math.round(value * 100) / 100;
const idOf = (value: unknown) =>
  value && typeof value === "object" && "_id" in value
    ? String(value._id)
    : String(value);

function issueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues.map((issue) => issue.message).join(" ");
}

function toReceiptResponse(receipt: {
  _id: { toString(): string };
  receiptNumber: string;
  pickupRequest: unknown;
  userName: string;
  userEmail: string;
  category: string;
  estimatedQuantityKg: number;
  estimatedRatePerKg: number;
  estimatedValue: number;
  actualWeightKg: number;
  finalRatePerKg: number;
  finalAmount: number;
  collectionDate: Date;
  verificationDate: Date;
  paymentStatus: "pending";
  createdAt: Date;
}) {
  return {
    id: receipt._id.toString(),
    receiptNumber: receipt.receiptNumber,
    pickupRequestId: idOf(receipt.pickupRequest),
    userName: receipt.userName,
    userEmail: receipt.userEmail,
    category: receipt.category,
    estimatedQuantityKg: receipt.estimatedQuantityKg,
    estimatedRatePerKg: receipt.estimatedRatePerKg,
    estimatedValue: receipt.estimatedValue,
    actualWeightKg: receipt.actualWeightKg,
    finalRatePerKg: receipt.finalRatePerKg,
    finalAmount: receipt.finalAmount,
    collectionDate: receipt.collectionDate,
    verificationDate: receipt.verificationDate,
    paymentStatus: receipt.paymentStatus,
    createdAt: receipt.createdAt,
  };
}

function toBatchResponse(batch: {
  _id: { toString(): string };
  batchCode: string;
  category: string;
  verifiedQuantityKg: number;
  availableQuantityKg: number;
  reservedQuantityKg: number;
  quality: string;
  pickupRequest: unknown;
  collectionDate: Date;
  processingStatus: string;
  storageLocation?: string | null;
  qrToken: string;
  statusHistory?: Array<{
    status: string;
    actorName?: string | null;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: batch._id.toString(),
    batchCode: batch.batchCode,
    category: batch.category,
    verifiedQuantityKg: batch.verifiedQuantityKg,
    availableQuantityKg: batch.availableQuantityKg,
    reservedQuantityKg: batch.reservedQuantityKg,
    quality: batch.quality,
    pickupRequestId: idOf(batch.pickupRequest),
    collectionDate: batch.collectionDate,
    processingStatus: batch.processingStatus,
    storageLocation: batch.storageLocation ?? null,
    qrToken: batch.qrToken,
    qrUrl: `/inventory/qr/${encodeURIComponent(batch.qrToken)}`,
    statusHistory: (batch.statusHistory ?? []).map((entry) => ({
      status: entry.status,
      actorName: entry.actorName ?? null,
      createdAt: entry.createdAt,
    })),
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  };
}

async function actorNameFor(id: string): Promise<string | null> {
  const actor = await User.findById(id).select("name").lean();
  return actor?.name ?? null;
}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function createOrGetReceipt(
  request: NonNullable<
    Awaited<ReturnType<typeof PickupRequestModel.findById>>
  >,
  verification: {
    actualWeightKg: number;
    ratePerKg: number;
    finalAmount: number;
    verifiedAt: Date;
  },
) {
  const user = await User.findById(request.user).select("name email").lean();
  if (!user) throw new Error("The account for this pickup is no longer available.");
  const receiptNumber = `EC-${request._id.toString().slice(-10).toUpperCase()}`;
  const values = {
    receiptNumber,
    pickupRequest: request._id,
    user: request.user,
    userName: user.name,
    userEmail: user.email,
    category: request.category,
    estimatedQuantityKg: request.estimatedQuantityKg,
    estimatedRatePerKg: request.ratePerKg,
    estimatedValue: request.estimatedValue,
    actualWeightKg: verification.actualWeightKg,
    finalRatePerKg: verification.ratePerKg,
    finalAmount: verification.finalAmount,
    collectionDate: request.collectedAt ?? verification.verifiedAt,
    verificationDate: verification.verifiedAt,
    paymentStatus: "pending" as const,
  };
  try {
    return await Receipt.findOneAndUpdate(
      { pickupRequest: request._id },
      { $setOnInsert: values },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    const receipt = await Receipt.findOne({ pickupRequest: request._id });
    if (!receipt) throw error;
    return receipt;
  }
}

async function createOrGetInventoryBatch(
  request: NonNullable<
    Awaited<ReturnType<typeof PickupRequestModel.findById>>
  >,
  verification: {
    actualWeightKg: number;
    quality: string;
    verifiedAt: Date;
  },
  actorName: string | null,
) {
  const batchCode = `EC-B-${request._id.toString().slice(-10).toUpperCase()}`;
  const qrToken = randomBytes(24).toString("hex");
  const values = {
    batchCode,
    category: request.category,
    verifiedQuantityKg: verification.actualWeightKg,
    availableQuantityKg: verification.actualWeightKg,
    reservedQuantityKg: 0,
    quality: verification.quality,
    pickupRequest: request._id,
    collectionDate: request.collectedAt ?? verification.verifiedAt,
    processingStatus: "collected",
    storageLocation: null,
    qrToken,
    statusHistory: [
      {
        status: "collected",
        actorName,
        createdAt: request.collectedAt ?? verification.verifiedAt,
      },
    ],
  };
  try {
    return await InventoryBatch.findOneAndUpdate(
      { pickupRequest: request._id },
      { $setOnInsert: values },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    const batch = await InventoryBatch.findOne({ pickupRequest: request._id });
    if (!batch) throw error;
    return batch;
  }
}

router.get("/admin/collectors", ...adminOnly, async (_req, res): Promise<void> => {
  const collectors = await User.find({ role: "collector" })
    .select("_id name email")
    .sort({ name: 1 })
    .lean();
  res.json(
    ListCollectorsResponse.parse(
      collectors.map((collector) => ({
        id: collector._id.toString(),
        name: collector.name,
        email: collector.email,
      })),
    ),
  );
});

router.patch(
  "/admin/waste-requests/:requestId/assignment",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = AssignCollectorParams.safeParse(req.params);
    const body = AssignCollectorBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? issueMessage(params.error)
          : issueMessage(body.error),
      });
      return;
    }
    const collector = await User.findOne({
      _id: body.data.collectorId,
      role: "collector",
    })
      .select("_id name email")
      .lean();
    if (!collector) {
      res.status(400).json({ error: "Choose an active collector account." });
      return;
    }
    const current = await PickupRequestModel.findById(params.data.requestId);
    if (!current) {
      res.status(404).json({ error: "Pickup request not found." });
      return;
    }
    if (!["pending", "accepted", "scheduled"].includes(current.status)) {
      res.status(409).json({ error: "This pickup can no longer be assigned." });
      return;
    }
    const actorName = await actorNameFor(res.locals.userId);
    const isFirstAssignment = current.status === "pending";
    const updated = await PickupRequestModel.findOneAndUpdate(
      { _id: current._id, status: current.status },
      {
        $set: {
          assignedCollector: collector._id,
          ...(isFirstAssignment ? { status: "accepted" } : {}),
        },
        $push: {
          statusHistory: {
            status: isFirstAssignment ? "accepted" : current.status,
            note: `Assigned to ${collector.name}`,
            actorName,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("assignedCollector", "name email")
      .lean();
    if (!updated) {
      res.status(409).json({ error: "The pickup changed while it was being assigned. Refresh and try again." });
      return;
    }
    res.json(
      AssignCollectorResponse.parse(
        toPickupRequestResponse(updated as unknown as PickupRequestRecord),
      ),
    );
  },
);

router.patch(
  "/admin/waste-requests/:requestId/schedule",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = SchedulePickupParams.safeParse(req.params);
    const body = SchedulePickupBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? issueMessage(params.error)
          : issueMessage(body.error),
      });
      return;
    }
    const scheduledAt = new Date(body.data.scheduledAt);
    if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      res.status(400).json({ error: "Choose a pickup time in the future." });
      return;
    }
    const current = await PickupRequestModel.findById(params.data.requestId);
    if (!current) {
      res.status(404).json({ error: "Pickup request not found." });
      return;
    }
    if (!current.assignedCollector) {
      res.status(409).json({ error: "Assign a collector before scheduling this pickup." });
      return;
    }
    if (!["accepted", "scheduled"].includes(current.status)) {
      res.status(409).json({ error: "Only accepted pickups can be scheduled or rescheduled." });
      return;
    }
    const actorName = await actorNameFor(res.locals.userId);
    const wasScheduled = current.status === "scheduled";
    const updated = await PickupRequestModel.findOneAndUpdate(
      { _id: current._id, status: current.status },
      {
        $set: { status: "scheduled", scheduledAt },
        $push: {
          statusHistory: {
            status: "scheduled",
            note: wasScheduled ? "Pickup rescheduled" : "Pickup scheduled",
            actorName,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("assignedCollector", "name email")
      .lean();
    if (!updated) {
      res.status(409).json({ error: "The pickup changed while it was being scheduled. Refresh and try again." });
      return;
    }
    res.json(
      SchedulePickupResponse.parse(
        toPickupRequestResponse(updated as unknown as PickupRequestRecord),
      ),
    );
  },
);

router.get(
  "/collector/assignments",
  ...collectorOnly,
  async (_req, res): Promise<void> => {
    const requests = await PickupRequestModel.find({
      assignedCollector: res.locals.userId,
      status: { $in: ["accepted", "scheduled", "collected", "verified", "completed"] },
    })
      .sort({ scheduledAt: 1, createdAt: -1 })
      .populate("user", "name email")
      .populate("assignedCollector", "name email")
      .lean();
    res.json(
      ListCollectorAssignmentsResponse.parse(
        requests.map((request) =>
          toPickupRequestResponse(request as unknown as PickupRequestRecord),
        ),
      ),
    );
  },
);

router.patch(
  "/collector/waste-requests/:requestId/status",
  ...collectorOnly,
  async (req, res): Promise<void> => {
    const params = UpdateCollectorPickupStatusParams.safeParse(req.params);
    const body = UpdateCollectorPickupStatusBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? issueMessage(params.error)
          : issueMessage(body.error),
      });
      return;
    }
    const current = await PickupRequestModel.findOne({
      _id: params.data.requestId,
      assignedCollector: res.locals.userId,
    });
    if (!current) {
      res.status(404).json({ error: "Assigned pickup not found." });
      return;
    }
    if (current.status === "collected") {
      const unchanged = await PickupRequestModel.findById(current._id)
        .populate("user", "name email")
        .populate("assignedCollector", "name email")
        .lean();
      res.json(
        UpdateCollectorPickupStatusResponse.parse(
          toPickupRequestResponse(unchanged as unknown as PickupRequestRecord),
        ),
      );
      return;
    }
    if (current.status !== "scheduled") {
      res.status(409).json({ error: "Only a scheduled pickup can be marked collected." });
      return;
    }
    const actorName = await actorNameFor(res.locals.userId);
    const now = new Date();
    const updated = await PickupRequestModel.findOneAndUpdate(
      { _id: current._id, assignedCollector: res.locals.userId, status: "scheduled" },
      {
        $set: { status: body.data.status, collectedAt: now },
        $push: {
          statusHistory: {
            status: body.data.status,
            note: "Materials collected",
            actorName,
            createdAt: now,
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("assignedCollector", "name email")
      .lean();
    if (!updated) {
      res.status(409).json({ error: "The pickup changed while it was being updated. Refresh and try again." });
      return;
    }
    res.json(
      UpdateCollectorPickupStatusResponse.parse(
        toPickupRequestResponse(updated as unknown as PickupRequestRecord),
      ),
    );
  },
);

router.post(
  "/collector/waste-requests/:requestId/verification",
  requireAuth,
  requireRole("collector", "admin"),
  async (req, res): Promise<void> => {
    const params = VerifyCollectionParams.safeParse(req.params);
    const body = VerifyCollectionBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? issueMessage(params.error)
          : issueMessage(body.error),
      });
      return;
    }
    const isAdmin = res.locals.userRole === "admin";
    let current = await PickupRequestModel.findById(params.data.requestId);
    if (!current) {
      res.status(404).json({ error: "Pickup request not found." });
      return;
    }
    if (!isAdmin && current.assignedCollector?.toString() !== res.locals.userId) {
      res.status(403).json({ error: "You can only verify a pickup assigned to you." });
      return;
    }
    if (!current.verification && current.status !== "collected") {
      res.status(409).json({ error: "Mark the pickup collected before verifying it." });
      return;
    }

    const activeRate = await WasteRate.findOne({
      category: current.category,
      active: true,
    }).lean();
    const allowedRates = [current.ratePerKg, activeRate?.ratePerKg].filter(
      (rate): rate is number => typeof rate === "number",
    );
    const selectedRate = body.data.ratePerKg;
    if (!allowedRates.some((rate) => Math.abs(rate - selectedRate) < 0.000001)) {
      res.status(409).json({
        error: "Use the request's saved rate or the current active administrator-approved rate.",
      });
      return;
    }
    const expectedVerification = {
      actualWeightKg: body.data.actualWeightKg,
      quality: body.data.quality,
      ratePerKg: selectedRate,
      finalAmount: cents(body.data.actualWeightKg * selectedRate),
      notes: body.data.notes?.trim() || null,
    };
    if (current.verification) {
      const saved = current.verification;
      if (
        saved.actualWeightKg !== expectedVerification.actualWeightKg ||
        saved.quality !== expectedVerification.quality ||
        saved.ratePerKg !== expectedVerification.ratePerKg ||
        saved.notes !== expectedVerification.notes
      ) {
        res.status(409).json({
          error: "This collection was already verified. Its financial record cannot be overwritten.",
        });
        return;
      }
    } else {
      const actorName = await actorNameFor(res.locals.userId);
      const collector = await User.findById(current.assignedCollector)
        .select("name")
        .lean();
      const verifiedAt = new Date();
      current =
        (await PickupRequestModel.findOneAndUpdate(
          {
            _id: current._id,
            status: "collected",
            verification: null,
            ...(isAdmin ? {} : { assignedCollector: res.locals.userId }),
          },
          {
            $set: {
              status: "verified",
              verification: {
                ...expectedVerification,
                collectorName: collector?.name ?? actorName,
                verifiedAt,
              },
            },
            $push: {
              statusHistory: {
                status: "verified",
                note: "Weight and material quality verified",
                actorName,
                createdAt: verifiedAt,
              },
            },
          },
          { new: true, runValidators: true },
        )) ?? (await PickupRequestModel.findById(params.data.requestId));
      if (!current?.verification) {
        res.status(409).json({
          error: "The pickup changed while it was being verified. Refresh and review its status.",
        });
        return;
      }
    }

    const verification = current.verification;
    const actorName = await actorNameFor(res.locals.userId);
    const [receipt, batch] = await Promise.all([
      createOrGetReceipt(current, verification),
      createOrGetInventoryBatch(
        current,
        verification,
        verification.collectorName ?? actorName,
      ),
    ]);
    const populated = await PickupRequestModel.findById(current._id)
      .populate("user", "name email")
      .populate("assignedCollector", "name email")
      .lean();
    res.status(201).json(
      VerifyCollectionResponse.parse({
        request: toPickupRequestResponse(
          populated as unknown as PickupRequestRecord,
        ),
        receipt: toReceiptResponse(receipt),
        batch: toBatchResponse(batch),
      }),
    );
  },
);

router.get("/receipts", requireAuth, async (_req, res): Promise<void> => {
  const receipts = await Receipt.find({ user: res.locals.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(
    ListMyReceiptsResponse.parse(
      receipts.map((receipt) =>
        toReceiptResponse(receipt as Parameters<typeof toReceiptResponse>[0]),
      ),
    ),
  );
});

router.get("/receipts/:receiptId", requireAuth, async (req, res): Promise<void> => {
  const params = GetReceiptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: issueMessage(params.error) });
    return;
  }
  const receipt = await Receipt.findById(params.data.receiptId).lean();
  if (!receipt) {
    res.status(404).json({ error: "Receipt not found." });
    return;
  }
  if (
    res.locals.userRole !== "admin" &&
    receipt.user.toString() !== res.locals.userId
  ) {
    res.status(403).json({ error: "You do not have permission to view this receipt." });
    return;
  }
  res.json(
    GetReceiptResponse.parse(
      toReceiptResponse(receipt as Parameters<typeof toReceiptResponse>[0]),
    ),
  );
});

router.get("/admin/receipts", ...adminOnly, async (_req, res): Promise<void> => {
  const receipts = await Receipt.find().sort({ createdAt: -1 }).lean();
  res.json(
    ListAllReceiptsResponse.parse(
      receipts.map((receipt) =>
        toReceiptResponse(receipt as Parameters<typeof toReceiptResponse>[0]),
      ),
    ),
  );
});

router.get("/admin/inventory", ...adminOnly, async (_req, res): Promise<void> => {
  const batches = await InventoryBatch.find().sort({ createdAt: -1 }).lean();
  res.json(
    ListInventoryBatchesResponse.parse(
      batches.map((batch) =>
        toBatchResponse(batch as Parameters<typeof toBatchResponse>[0]),
      ),
    ),
  );
});

router.get(
  "/admin/inventory/qr/:token",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = GetInventoryBatchByQrParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: issueMessage(params.error) });
      return;
    }
    const batch = await InventoryBatch.findOne({ qrToken: params.data.token }).lean();
    if (!batch) {
      res.status(404).json({ error: "Inventory batch not found." });
      return;
    }
    res.json(
      GetInventoryBatchByQrResponse.parse(
        toBatchResponse(batch as Parameters<typeof toBatchResponse>[0]),
      ),
    );
  },
);

router.get(
  "/admin/inventory/:batchId",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = GetInventoryBatchParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: issueMessage(params.error) });
      return;
    }
    const batch = await InventoryBatch.findById(params.data.batchId).lean();
    if (!batch) {
      res.status(404).json({ error: "Inventory batch not found." });
      return;
    }
    res.json(
      GetInventoryBatchResponse.parse(
        toBatchResponse(batch as Parameters<typeof toBatchResponse>[0]),
      ),
    );
  },
);

router.patch(
  "/admin/inventory/:batchId/processing",
  ...adminOnly,
  async (req, res): Promise<void> => {
    const params = UpdateInventoryProcessingParams.safeParse(req.params);
    const body = UpdateInventoryProcessingBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? issueMessage(params.error)
          : issueMessage(body.error),
      });
      return;
    }
    const batch = await InventoryBatch.findById(params.data.batchId);
    if (!batch) {
      res.status(404).json({ error: "Inventory batch not found." });
      return;
    }
    const ordered: InventoryProcessingStatus[] = [
      "collected",
      "sorted",
      "stored",
      "sent_for_processing",
      "processed",
    ];
    const currentIndex = ordered.indexOf(
      batch.processingStatus as InventoryProcessingStatus,
    );
    const nextIndex = ordered.indexOf(body.data.processingStatus);
    if (nextIndex < currentIndex || nextIndex > currentIndex + 1) {
      res.status(409).json({
        error: "Processing stages must be updated one step at a time and cannot be reversed.",
      });
      return;
    }
    const actorName = await actorNameFor(res.locals.userId);
    const now = new Date();
    const set: Record<string, unknown> = {};
    if (body.data.processingStatus !== batch.processingStatus) {
      set.processingStatus = body.data.processingStatus;
    }
    if (Object.hasOwn(body.data, "storageLocation")) {
      set.storageLocation = body.data.storageLocation?.trim() || null;
    }
    if (Object.keys(set).length === 0) {
      res.status(400).json({ error: "Provide a processing status or storage location to update." });
      return;
    }
    const updated = await InventoryBatch.findOneAndUpdate(
      { _id: batch._id, processingStatus: batch.processingStatus },
      {
        $set: set,
        ...(body.data.processingStatus !== batch.processingStatus
          ? {
              $push: {
                statusHistory: {
                  status: body.data.processingStatus,
                  actorName,
                  createdAt: now,
                },
              },
            }
          : {}),
      },
      { new: true, runValidators: true },
    ).lean();
    if (!updated) {
      res.status(409).json({ error: "The inventory batch changed while you were updating it. Refresh and try again." });
      return;
    }
    res.json(
      UpdateInventoryProcessingResponse.parse(
        toBatchResponse(updated as Parameters<typeof toBatchResponse>[0]),
      ),
    );
  },
);

export default router;
