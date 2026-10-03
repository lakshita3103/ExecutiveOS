import { generateText } from "../lib/geminiClient.js";
import buildMeetingIntelligencePrompt from "../prompts/meetingIntelligencePrompt.js";
import parseModelJson from "../utils/parseModelJson.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function toActionItems(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      task: typeof item.task === "string" ? item.task : "",
      owner: typeof item.owner === "string" ? item.owner : "",
      deadline: typeof item.deadline === "string" ? item.deadline : "",
    }))
    .filter((item) => item.task);
}

export const postMeetingIntelligence = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const prompt = buildMeetingIntelligencePrompt({ notes });

  let rawText;
  try {
    rawText = await generateText(prompt);
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 502, {
      payload: { message: error.message || "Meeting Intelligence request failed." },
    });
  }

  let parsed;
  try {
    parsed = parseModelJson(rawText);
  } catch (parseError) {
    logger.warn("Meeting Intelligence model returned invalid JSON", {
      requestId: req.id,
      rawText,
    });

    throw new AppError("Gemini returned an invalid response.", 500, {
      payload: { message: "Gemini returned an invalid response." },
    });
  }

  res.json({
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    decisions: toStringArray(parsed.decisions),
    actionItems: toActionItems(parsed.actionItems),
    nextSteps: toStringArray(parsed.nextSteps),
  });
});

export default { postMeetingIntelligence };