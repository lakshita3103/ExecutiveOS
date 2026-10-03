import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import requestId from "./middleware/requestId.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestId);
  app.use(
    helmet({
      // This is a JSON API with no server-rendered HTML, so the default
      // CSP (meant for pages serving scripts/styles) isn't relevant here.
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin/non-browser requests (no Origin header) and
        // anything explicitly listed in ALLOWED_ORIGINS.
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        return callback(
          new AppError(`Origin ${origin} is not allowed by CORS.`, 403)
        );
      },
      // Required for the browser to send/receive the httpOnly session
      // cookie used by /api/auth and /api/workspace.
      credentials: true,
    })
  );

  // Raised from a smaller default to comfortably fit a base64-encoded
  // profile picture (~2MB) alongside normal JSON payloads.
  app.use(express.json({ limit: "3mb" }));
  app.use(cookieParser());

  app.use(
    morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
      skip: () => env.NODE_ENV === "test",
    })
  );

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;