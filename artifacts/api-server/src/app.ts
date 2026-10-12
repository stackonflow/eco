import cookieParser from "cookie-parser";
import express, {
  type ErrorRequestHandler,
  type Express,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import rateLimit from "express-rate-limit";

const app: Express = express();
app.set("trust proxy", 1);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many account requests. Please try again later." },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authLimiter);
app.use("/api", router);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const declaredStatus =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;
  const isMongooseValidation =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ValidationError";
  const isMongooseCast =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "CastError";
  const isDuplicateKey =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;
  const statusCode = isDuplicateKey
    ? 409
    : isMongooseValidation || isMongooseCast
      ? 400
      : declaredStatus;

  if (statusCode >= 500) {
    logger.error({ err: error }, "Unhandled API error");
  }
  const message =
    statusCode < 500 &&
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : statusCode === 409
        ? "This record conflicts with an existing record."
        : statusCode === 400
          ? "The request is invalid."
          : "Internal server error.";
  res.status(statusCode).json({
    error: message,
  });
};

app.use(errorHandler);

export default app;
