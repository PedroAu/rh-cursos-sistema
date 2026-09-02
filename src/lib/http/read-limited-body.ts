/** Reads a request body without materializing more than the configured limit. */
export async function readLimitedBody(request: Request, maxBytes: number): Promise<string | null> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const length = Number(declaredLength);
    if (Number.isFinite(length) && length > maxBytes) return null;
  }

  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      result += decoder.decode(chunk.value, { stream: true });
    }
    return result + decoder.decode();
  } catch {
    return null;
  }
}
