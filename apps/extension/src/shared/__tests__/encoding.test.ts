import { describe, it, expect } from 'vitest'
import { arrayBufferToBase64, base64ToArrayBuffer } from '../encoding'

describe('encoding', () => {
  it('round-trips an ArrayBuffer through base64', () => {
    const original = new Uint8Array([0, 1, 2, 100, 42, 254, 255])
    const b64 = arrayBufferToBase64(original.buffer)
    expect(typeof b64).toBe('string')

    const restored = new Uint8Array(base64ToArrayBuffer(b64))
    expect(Array.from(restored)).toEqual(Array.from(original))
  })

  it('handles an empty buffer', () => {
    const b64 = arrayBufferToBase64(new ArrayBuffer(0))
    expect(b64).toBe('')
    expect(base64ToArrayBuffer(b64).byteLength).toBe(0)
  })

  it('round-trips a buffer larger than the chunk boundary', () => {
    const size = 0x8000 * 2 + 123 // spans three fromCharCode chunks
    const bytes = new Uint8Array(size)
    for (let i = 0; i < size; i++) bytes[i] = i % 256

    const restored = new Uint8Array(
      base64ToArrayBuffer(arrayBufferToBase64(bytes.buffer)),
    )

    expect(restored.length).toBe(size)
    expect(restored[0]).toBe(0)
    expect(restored[size - 1]).toBe((size - 1) % 256)
    expect(Array.from(restored)).toEqual(Array.from(bytes))
  })
})
