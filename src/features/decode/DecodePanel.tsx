import { useState } from "react";
import { decodeImageText } from "../../lib/stego/decode";
import { blobToDataUrl, saveStoredCard } from "../../lib/storage/gallery";

const MAX_DECODE_IMAGE_BYTES = 20 * 1024 * 1024;

export function DecodePanel() {
  const [decodedText, setDecodedText] = useState("");
  const [status, setStatus] = useState("把收到的隐信片拖进来，看看暗格里藏了什么。");

  async function handleDecode(file: File | null) {
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setDecodedText("");
      setStatus("仅支持图片文件。");
      return;
    }
    if (file.size > MAX_DECODE_IMAGE_BYTES) {
      setDecodedText("");
      setStatus("图片过大（>20MB），请先压缩或裁剪后再显影。");
      return;
    }

    try {
      setStatus("显影中，请稍候。");
      const payload = await decodeImageText(file);
      setDecodedText(payload.text);
      setStatus(`显影完成，封存时间 ${new Date(payload.createdAt).toLocaleString("zh-CN")}`);
      const previewDataUrl = await blobToDataUrl(file);

      await saveStoredCard({
        id: crypto.randomUUID(),
        name: file.name,
        previewDataUrl,
        secretPreview: payload.text.slice(0, 80),
        createdAt: new Date().toISOString(),
        kind: "received",
      });
    } catch (error) {
      setDecodedText("");
      setStatus(error instanceof Error ? error.message : "显影失败。");
    }
  }

  return (
    <section className="workspace single-column">
      <div className="panel soft-panel">
        <div className="panel-heading">
          <h3>显影液</h3>
          <p>首版只保证读取本产品生成的标准格式图片。</p>
        </div>

        <label className="field">
          <span>导入隐信片</span>
          <input
            accept="image/png,image/*"
            type="file"
            onChange={(event) => handleDecode(event.target.files?.[0] ?? null)}
          />
        </label>

        <p className="status-text">{status}</p>

        <div className="telegraph-box" aria-live="polite">
          {decodedText || "暂时还没有显影结果。"}
        </div>
      </div>
    </section>
  );
}
