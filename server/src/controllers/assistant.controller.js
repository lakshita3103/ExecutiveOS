import { generateText } from "../lib/geminiClient.js";
import buildAssistantPrompt from "../prompts/assistantPrompt.js";
import parseModelJson from "../utils/parseModelJson.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const VALID_PRIORITIES = ["Low", "Medium", "High"];

/**
 * Defensive shape-guard for whatever the model hands back. We trust the
 * prompt to keep the model on-contract, but the client executes these
 * actions directly against local state, so a malformed field here should
 * degrade to a safe "none" response rather than propagate garbage.
 */
function sanitizeResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return { action: "none", message: "Done." };
  }

  if (
    result.action === "create_task" &&
    result.task &&
    result.task.priority &&
    !VALID_PRIORITIES.includes(result.task.priority)
  ) {
    result.task.priority = "Medium";
  }

  if (typeof result.message !== "string" || !result.message) {
    result.message = "Done.";
  }

  return result;
}

export const postAssistant = asyncHandler(async (req, res) => {
  const { messages, context } = req.body;

  const prompt = buildAssistantPrompt({ messages, context });

  let rawText;
  try {
    rawText = await generateText(prompt);
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 502, {
      payload: {
        error: "AI request failed",
        message: error.message || "Unknown error",
      },
    });
  }

  let result;
  try {
    result = parseModelJson(rawText);
  } catch (parseError) {
    logger.warn("Assistant model returned non-JSON output", {
      requestId: req.id,
      rawText,
    });
    result = {
      action: "none",
      message: rawText || "I couldn't generate a response.",
    };
  }

  res.json(sanitizeResult(result));
});

export default { postAssistant };