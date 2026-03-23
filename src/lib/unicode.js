function hasBrokenSurrogates(str) {
  for (let index = 0; index < str.length; index += 1) {
    const codeUnit = str.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextUnit = str.charCodeAt(index + 1);
      if (!(nextUnit >= 0xdc00 && nextUnit <= 0xdfff)) {
        return true;
      }

      index += 1;
      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function sanitizeMessageText(input) {
  if (typeof input !== "string") {
    throw new TypeError("Message text must be a string.");
  }

  const normalized = input.normalize("NFC");

  if (hasBrokenSurrogates(normalized)) {
    throw new Error("Message contains broken surrogate pairs.");
  }

  return normalized;
}

function getCodePoints(text) {
  return Array.from(text).map((char) => {
    const codePoint = char.codePointAt(0).toString(16).toUpperCase();
    return `U+${codePoint.padStart(codePoint.length <= 4 ? 4 : codePoint.length, "0")}`;
  });
}

function getUtf8Hex(text) {
  return Buffer.from(text, "utf8")
    .toString("hex")
    .match(/.{1,2}/g)
    ?.join(" ") || "";
}

function debugUnicode(label, text) {
  const safeText = sanitizeMessageText(text);

  console.log(`[unicode:${label}] text:`, safeText);
  console.log(`[unicode:${label}] codePoints:`, getCodePoints(safeText).join(" "));
  console.log(`[unicode:${label}] utf8Hex:`, getUtf8Hex(safeText));
  console.log(
    `[unicode:${label}] jsonPreview:`,
    JSON.stringify({
      messaging_product: "whatsapp",
      type: "text",
      text: { body: safeText }
    })
  );
}

function sanitizePayloadStrings(value) {
  if (typeof value === "string") {
    return sanitizeMessageText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayloadStrings(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizePayloadStrings(nestedValue)])
    );
  }

  return value;
}

module.exports = {
  debugUnicode,
  getCodePoints,
  getUtf8Hex,
  hasBrokenSurrogates,
  sanitizeMessageText,
  sanitizePayloadStrings
};
