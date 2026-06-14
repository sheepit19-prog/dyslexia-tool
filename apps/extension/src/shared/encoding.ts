/**
 * Binary ⇄ base64 helpers for moving an ArrayBuffer through APIs that only
 * persist JSON-serializable values.
 *
 * `chrome.storage` (all areas, including `session`) silently serializes a raw
 * ArrayBuffer to an empty object `{}`, losing the data. Encoding to a base64
 * string round-trips safely.
 *
 * Chunked to avoid `RangeError: Maximum call stack size exceeded` when
 * spreading a large Uint8Array into `String.fromCharCode`.
 */

const CHUNK_SIZE = 0x8000 // 32 KiB per fromCharCode call

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE)
    binary += String.fromCharCode(...(chunk as unknown as number[]))
  }
  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
