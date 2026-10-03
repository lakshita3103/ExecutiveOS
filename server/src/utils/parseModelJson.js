/**
 * Every prompt in this app instructs Gemini to return ONLY raw JSON.
 * Models occasionally ignore that (markdown fences, a stray sentence
 * before/after the object). This does its best to recover the JSON
 * payload before giving up, instead of failing the whole request on a
 * cosmetic formatting slip.
 */

function stripCodeFences(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1] : text;
}

/**
 * Finds the first balanced {...} or [...] block in the text, respecting
 * strings so braces inside quoted values don't confuse the scan.
 */
function extractFirstJsonBlock(text) {
  const openers = { "{": "}", "[": "]" };
  const startIndex = text.search(/[{[]/);
  if (startIndex === -1) return null;

  const stack = [];
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(openers[char]);
      continue;
    }

    if (char === "}" || char === "]") {
      if (stack.length === 0 || stack[stack.length - 1] !== char) {
        return null;
      }
      stack.pop();
      if (stack.length === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  return null;
}

/**
 * Attempts to parse `rawText` as JSON, trying progressively more forgiving
 * strategies. Throws if none of them work.
 */
export default function parseModelJson(rawText) {
  const trimmed = (rawText || "").trim();

  if (!trimmed) {
    throw new Error("Empty response from model.");
  }

  const attempts = [
    trimmed,
    stripCodeFences(trimmed).trim(),
    extractFirstJsonBlock(trimmed),
  ].filter(Boolean);

  let lastError;

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Model did not return valid JSON: ${lastError?.message || "unknown parse error"}`
  );
}