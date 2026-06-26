import createDOMPurify from "dompurify";

const SERVER_ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul"
]);

function sanitizeServerHtml(value: string) {
  const withoutExecutableContent = value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, (match, rawValue) => {
      const normalizedValue = rawValue.replace(/^['"]|['"]$/g, "");
      const attributeName = match.match(/(href|src)/i)?.[1]?.toLowerCase();

      if (!attributeName || !isSafeUrl(normalizedValue)) return "";

      return ` ${attributeName}="${normalizedValue}"`;
    });

  return withoutExecutableContent.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagName, rawAttributes) => {
    const normalizedTagName = tagName.toLowerCase();

    if (!SERVER_ALLOWED_TAGS.has(normalizedTagName)) return "";
    if (match.startsWith("</")) return `</${normalizedTagName}>`;
    if (normalizedTagName === "br") return "<br>";
    if (normalizedTagName === "a") {
      const hrefMatch = rawAttributes.match(/\shref\s*=\s*(".*?"|'.*?'|[^\s>]+)/i);

      if (!hrefMatch) return "<a>";

      const href = hrefMatch[1].replace(/^['"]|['"]$/g, "");
      return isSafeUrl(href) ? `<a href="${href}">` : "<a>";
    }

    return `<${normalizedTagName}>`;
  });
}

export function sanitizeHtml(value: string) {
  if (typeof window === "undefined") {
    return sanitizeServerHtml(value);
  }

  return createDOMPurify(window).sanitize(value, {
    USE_PROFILES: { html: true }
  });
}

export function sanitizeText(value: string) {
  return sanitizeHtml(value).replace(/<[^>]*>/g, "");
}

export function isSafeUrl(value: string) {
  try {
    const url = new URL(value, "https://rhcursos.com.br");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}
