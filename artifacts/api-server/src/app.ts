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
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;

  if (statusCode >= 500) {
    logger.error({ err: error }, "Unhandled API error");
  }
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error." : "Invalid request.",
  });
};

app.use(errorHandler);

export default app;
