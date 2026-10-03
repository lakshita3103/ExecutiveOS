import { generateText } from "../lib/geminiClient.js";
import buildReportsPrompt from "../prompts/reportsPrompt.js";
import parseModelJson from "../utils/parseModelJson.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

const FALLBACK_REPORT = {
  summary: "I couldn't generate the executive report right now.",
  wins: [],
  focus: [],
  nextMoves: [],
};

export const postReports = asyncHandler(async (req, res) => {
  const { tasks, events, notes } = req.body;

  const prompt = buildReportsPrompt({ tasks, events, notes });

  let rawText;
  try {
    rawText = await generateText(prompt);
  } catch (error) {
    // Matches the original contract: an upstream/network failure is a
    // hard error (500), while a parse hiccup below degrades gracefully.
    throw new AppError(error.message, error.statusCode || 502, {
      payload: {
        error: "Report generation failed",
        message: error.message || "Unknown error",
      },
    });
  }

  let parsed;
  try {
    parsed = parseModelJson(rawText);
  } catch (parseError) {
    logger.warn("Reports model returned invalid JSON, returning fallback report", {
      requestId: req.id,
      rawText,
    });
    return res.json(FALLBACK_REPORT);
  }

  res.json({
    summary: typeof parsed.summary === "string" ? parsed.summary : FALLBACK_REPORT.summary,
    wins: toStringArray(parsed.wins),
    focus: toStringArray(parsed.focus),
    nextMoves: toStringArray(parsed.nextMoves),
  });
});

export default { postReports };