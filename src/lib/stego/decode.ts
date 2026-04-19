import { deserializePayload } from "./codec";
import { checksum32, MAGIC_HEADER, PayloadEnvelope } from "./schema";

function readLengthPrefix(bytes: Uint8Array): { length: number; body: Uint8Array } {
  if (bytes.byteLength < 4) {
    throw new Error("隐写数据长度头损坏，无法读取。");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const length = view.getUint32(0);

  if (length === 0 || length > bytes.byteLength - 4) {
    throw new Error("隐写数据长度非法，图片可能被压缩或篡改。");
  }

  return {
    length,
    body: bytes.slice(4, 4 + length),
  };
}

export async function decodeImageText(source: File): Promise<PayloadEnvelope> {
  const bitmap = await createImageBitmap(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("无法创建 Canvas 上下文。");
    }

    context.drawImage(bitmap, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const rgba = imageData.data;

    const bits: number[] = [];
    for (let pixelIndex = 0; pixelIndex < rgba.length; pixelIndex += 4) {
      bits.push(rgba[pixelIndex] & 1);
      bits.push(rgba[pixelIndex + 1] & 1);
      bits.push(rgba[pixelIndex + 2] & 1);
    }

    const bytes = new Uint8Array(Math.ceil(bits.length / 8));
    for (let bitIndex = 0; bitIndex < bits.length; bitIndex += 1) {
      const byteIndex = Math.floor(bitIndex / 8);
      bytes[byteIndex] = (bytes[byteIndex] << 1) | bits[bitIndex];
      if (bitIndex % 8 === 7) {
        continue;
      }
    }

    const { length, body } = readLengthPrefix(bytes);
    const payloadText = deserializePayload(body.slice(0, length));

    let envelope: PayloadEnvelope;
    try {
      envelope = JSON.parse(payloadText) as PayloadEnvelope;
    } catch {
      throw new Error("隐写数据解析失败，载荷不是有效 JSON。");
    }

    if (!envelope || typeof envelope !== "object" || envelope.magic !== MAGIC_HEADER) {
      throw new Error("没有找到可识别的隐信片头信息。");
    }

    if (typeof envelope.text !== "string" || typeof envelope.checksum !== "number") {
      throw new Error("隐写数据结构不完整，无法校验内容。");
    }

    if (checksum32(envelope.text) !== envelope.checksum) {
      throw new Error("文本校验失败，图片可能在传递中受损。");
    }

    return envelope;
  } finally {
    bitmap.close();
  }
}
