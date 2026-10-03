import { GoogleGenAI } from "@google/genai";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

let client = null;

function getClient() {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      "The AI server is not configured (missing GEMINI_API_KEY).",
      503
    );
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  return client;
}

function isRetryable(error) {
  const status = error?.status ?? error?.response?.status;
  // Retry on rate limiting / transient upstream failures only.
  return status === 429 || (status >= 500 && status < 600);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Calls Gemini's generateContent with a timeout and a couple of retries
 * on transient (429/5xx) failures. Returns the trimmed text output.
 */
export async function generateText(prompt, { retries = 2 } = {}) {
  const ai = getClient();

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      env.GEMINI_TIMEOUT_MS
    );

    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: { abortSignal: controller.signal },
      });

      clearTimeout(timer);
      return (response.text || "").trim();
    } catch (error) {
      clearTimeout(timer);

      const attemptsLeft = retries - attempt;
      const aborted = error?.name === "AbortError";

      logger.warn("Gemini call failed", {
        attempt: attempt + 1,
        aborted,
        message: error?.message,
      });

      if (attemptsLeft > 0 && (aborted || isRetryable(error))) {
        // eslint-disable-next-line no-await-in-loop
        await wait(300 * 2 ** attempt);
        continue;
      }

      if (aborted) {
        throw new AppError(
          "The AI provider took too long to respond.",
          504,
          { cause: error }
        );
      }

      throw new AppError(
        error?.message || "The AI provider request failed.",
        502,
        { cause: error }
      );
    }
  }

  // Unreachable, but keeps the function's return type honest.
  throw new AppError("The AI provider request failed.", 502);
}

export default { generateText };