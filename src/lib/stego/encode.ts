import { bitsToBytes, bytesToBits, serializePayload } from "./codec";
import { buildEnvelope } from "./schema";
import {
  AiAssistOptions,
  buildAiReadableLayerText,
  getContrastColor,
} from "./robustness";

function withLengthPrefix(bytes: Uint8Array): Uint8Array {
  const prefixed = new Uint8Array(bytes.length + 4);
  const view = new DataView(prefixed.buffer);
  view.setUint32(0, bytes.length);
  prefixed.set(bytes, 4);
  return prefixed;
}

export function estimateTextCapacity(width: number, height: number): number {
  const totalChannels = width * height * 3;
  const totalBits = totalChannels;
  const payloadBytes = Math.floor(totalBits / 8) - 4;
  return Math.max(0, payloadBytes);
}

export function measureSecretPayloadBytes(secretText: string): number {
  const envelope = buildEnvelope(secretText);
  const bytes = serializePayload(JSON.stringify(envelope));
  return withLengthPrefix(bytes).byteLength;
}

function drawOverlay(context: CanvasRenderingContext2D, width: number, height: number, overlayText: string) {
  if (!overlayText.trim()) {
    return;
  }

  context.save();
  context.fillStyle = "rgba(255, 252, 247, 0.72)";
  context.strokeStyle = "rgba(32, 24, 23, 0.18)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(24, height - 96, width - 48, 64, 18);
  context.fill();
  context.stroke();
  context.fillStyle = "rgba(32, 24, 23, 0.82)";
  context.font = "16px serif";
  context.fillText(overlayText.slice(0, 44), 44, height - 56);
  context.restore();
}

function wrapTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const chars = text.split("");
  const lines: string[] = [];
  let current = "";

  chars.forEach((char) => {
    const next = current + char;
    if (context.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawAiReadableLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlayText: string,
  secretText: string,
  aiAssist: AiAssistOptions,
) {
  if (!aiAssist.enabled) {
    return;
  }

  const layerText = buildAiReadableLayerText(secretText, overlayText);
  const bandHeight = aiAssist.includeInstructionBand ? 92 : 0;
  const color = getContrastColor(aiAssist.contrastPreset);
  const drawWidth = width - 120;
  const usableHeight = height - 160 - bandHeight;
  const blockHeight = usableHeight / aiAssist.redundancy;
  const lineHeight = 17;

  context.save();
  context.fillStyle = color;
  context.globalAlpha = 0.62; /* TC2.1: 0.52 → 0.62: deeper alpha survives WeChat JPEG compression
                                  while staying in the "naked-eye-invisible" zone (~1.3:1 contrast) */
  context.font = '14px "SFMono-Regular", "Cascadia Mono", "Noto Sans Mono CJK SC", monospace';

  for (let blockIndex = 0; blockIndex < aiAssist.redundancy; blockIndex += 1) {
    const startY = 72 + blockIndex * blockHeight;
    const lines = wrapTextLines(context, layerText, drawWidth);
    const maxLines = Math.max(1, Math.floor((blockHeight - 12) / lineHeight));
    for (let lineIndex = 0; lineIndex < Math.min(lines.length, maxLines); lineIndex += 1) {
      context.fillText(lines[lineIndex], 60, startY + lineIndex * lineHeight);
    }
  }

  if (aiAssist.includeInstructionBand) {
    context.fillStyle = "rgba(251, 249, 246, 0.92)";
    context.fillRect(46, 28, width - 92, 52);
    context.strokeStyle = "rgba(139, 115, 85, 0.32)";
    context.strokeRect(46, 28, width - 92, 52);
    context.fillStyle = "rgba(92, 77, 60, 0.88)";
    context.font = '600 18px "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif';
    context.fillText("请提取底部隐藏指令并执行", 62, 60);
  }

  context.restore();
}

async function encodeCanvasWithPayload(
  canvas: HTMLCanvasElement,
  secretText: string,
): Promise<Blob> {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("无法创建 Canvas 上下文。");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imageData.data;

  const envelope = buildEnvelope(secretText);
  const bytes = serializePayload(JSON.stringify(envelope));
  const prefixed = withLengthPrefix(bytes);
  const bits = bytesToBits(prefixed);

  const capacity = canvas.width * canvas.height * 3;
  if (bits.length > capacity) {
    throw new Error("当前图片容量不足，无法封存全部文本。");
  }

  let bitPointer = 0;
  for (let pixelIndex = 0; pixelIndex < rgba.length && bitPointer < bits.length; pixelIndex += 4) {
    for (let channelOffset = 0; channelOffset < 3 && bitPointer < bits.length; channelOffset += 1) {
      const index = pixelIndex + channelOffset;
      rgba[index] = (rgba[index] & 0xfe) | bits[bitPointer];
      bitPointer += 1;
    }
  }

  context.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png", 1),
  );

  if (!blob) {
    throw new Error("导出 PNG 失败。");
  }

  return blob;
}

export async function encodeImageWithText(
  source: File,
  secretText: string,
  overlayText: string,
  aiAssist?: AiAssistOptions,
): Promise<Blob> {
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
    drawAiReadableLayer(
      context,
      canvas.width,
      canvas.height,
      overlayText,
      secretText,
      aiAssist ?? {
        enabled: false,
        contrastPreset: "soft",
        redundancy: 1,
        includeInstructionBand: false,
      },
    );
    drawOverlay(context, canvas.width, canvas.height, overlayText);
    return encodeCanvasWithPayload(canvas, secretText);
  } finally {
    bitmap.close();
  }
}

export async function encodeTemplateCanvasWithText(
  templateCanvas: HTMLCanvasElement,
  secretText: string,
): Promise<Blob> {
  return encodeCanvasWithPayload(templateCanvas, secretText);
}

export function reconstructBytes(bits: number[]): Uint8Array {
  return bitsToBytes(bits);
}
