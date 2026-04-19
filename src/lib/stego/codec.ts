const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function serializePayload(input: string): Uint8Array {
  return encoder.encode(input);
}

export function deserializePayload(input: Uint8Array): string {
  return decoder.decode(input);
}

export function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  bytes.forEach((byte) => {
    for (let shift = 7; shift >= 0; shift -= 1) {
      bits.push((byte >> shift) & 1);
    }
  });
  return bits;
}

export function bitsToBytes(bits: number[]): Uint8Array {
  const byteLength = Math.ceil(bits.length / 8);
  const output = new Uint8Array(byteLength);

  for (let bitIndex = 0; bitIndex < bits.length; bitIndex += 1) {
    const byteIndex = Math.floor(bitIndex / 8);
    output[byteIndex] = (output[byteIndex] << 1) | bits[bitIndex];
    if (bitIndex % 8 === 7) {
      continue;
    }
  }

  const remainder = bits.length % 8;
  if (remainder !== 0) {
    output[byteLength - 1] <<= 8 - remainder;
  }

  return output;
}
