import { generateText } from "../lib/geminiClient.js";
import buildEmailPrompt from "../prompts/emailPrompt.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const postEmail = asyncHandler(async (req, res) => {
  const { mode, prompt, email } = req.body;

  const emailPrompt = buildEmailPrompt({ mode, prompt, email });

  let text;
  try {
    text = await generateText(emailPrompt);
  } catch (error) {
    // Preserve this endpoint's established { success: false, ... } shape
    // even when the underlying Gemini call fails.
    throw new AppError(error.message, error.statusCode || 502, {
      payload: {
        success: false,
        error: "Email AI request failed",
        message: error.message || "Unknown error",
      },
    });
  }

  if (!text) {
    text = "I couldn't generate the email.";
  }

  res.json({ success: true, text });
});

export default { postEmail };