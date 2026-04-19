import { useEffect, useMemo, useState } from "react";
import { AppSettings } from "../../lib/storage/settings";
import { downloadBlob } from "../../lib/utils/download";
import {
  encodeImageWithText,
  encodeTemplateCanvasWithText,
  estimateTextCapacity,
  measureSecretPayloadBytes,
} from "../../lib/stego/encode";
import {
  AiAssistOptions,
  buildReaderInstruction,
  classifyShareRisk,
  estimateOcrRedundancy,
  getShareRiskLabel,
  instructionPresets,
  MAX_SECRET_CHARACTERS,
  RECOMMENDED_SECRET_CHARACTERS,
} from "../../lib/stego/robustness";
import { blobToDataUrl, saveStoredCard } from "../../lib/storage/gallery";
import { builtInTemplates } from "./templates";

type EncodePanelProps = {
  settings: AppSettings;
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export function EncodePanel({ settings }: EncodePanelProps) {
  const [aiAssist, setAiAssist] = useState<AiAssistOptions>({
    enabled: true,
    contrastPreset: "medium",
    redundancy: 3,
    includeInstructionBand: true,
  });
  const [surfaceMode, setSurfaceMode] = useState<"upload" | "template">("template");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(builtInTemplates[0].id);
  const [overlayText, setOverlayText] = useState("这是一张隐信片，请交给支持视觉理解的模型查阅。");
  const [secretText, setSecretText] = useState("");
  const [status, setStatus] = useState("等待封存。");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [exportFilename, setExportFilename] = useState("");
  const [shareMode, setShareMode] = useState(settings.defaultShareMode);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(
    builtInTemplates[0].size,
  );
  const [selectedInstructionPreset, setSelectedInstructionPreset] = useState(
    instructionPresets[0].id,
  );
  const [copiedState, setCopiedState] = useState("");

  const estimatedCapacity = useMemo(() => {
    if (!imageSize) {
      return 0;
    }

    return estimateTextCapacity(imageSize.width, imageSize.height);
  }, [imageSize]);

  const selectedTemplate =
    builtInTemplates.find((template) => template.id === selectedTemplateId) ?? builtInTemplates[0];
  const risk = classifyShareRisk(shareMode);
  const payloadPreview = secretText.slice(0, 160) || "等待密语写入。";
  const estimatedPayloadBytes = useMemo(() => measureSecretPayloadBytes(secretText), [secretText]);
  const readerInstruction = buildReaderInstruction(
    selectedInstructionPreset,
    overlayText,
    aiAssist.enabled,
  );

  // TC2.2: derive visual warning state from current character count
  const charState: "ok" | "warn" | "danger" =
    secretText.length >= MAX_SECRET_CHARACTERS * 0.95
      ? "danger"
      : secretText.length > RECOMMENDED_SECRET_CHARACTERS
        ? "warn"
        : "ok";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function copyInstruction() {
    try {
      await navigator.clipboard.writeText(readerInstruction);
      setCopiedState("读取指令已复制。");
    } catch {
      setCopiedState("复制失败，请手动复制。");
    }
  }

  async function handleGenerate() {
    if (surfaceMode === "upload" && !coverFile) {
      setStatus("请先选择一张作为表层的图片。");
      return;
    }

    if (!secretText.trim()) {
      setStatus("需要先写下要封存的内容。");
      return;
    }

    if (secretText.length > MAX_SECRET_CHARACTERS) {
      setStatus(`当前密语超过 ${MAX_SECRET_CHARACTERS} 字上限，请先精简后再生成。`);
      return;
    }

    if (imageSize && estimatedPayloadBytes > estimateTextCapacity(imageSize.width, imageSize.height)) {
      setStatus("当前图片容量不足，无法封存全部文本。请改用更大图片或缩短密语。");
      return;
    }

    try {
      setBusy(true);
      setStatus("正在封存这段私语……");
      setLastBlob(null);
      setExportFilename("");
      const blob =
        surfaceMode === "upload" && coverFile
          ? await encodeImageWithText(coverFile, secretText, overlayText, aiAssist)
          : await encodeTemplateCanvasWithText(
              selectedTemplate.renderToCanvas(secretText, aiAssist),
              secretText,
            );
      const url = URL.createObjectURL(blob);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
      setLastBlob(blob);
      const filename = `enigmacard-${Date.now()}.png`;
      setExportFilename(filename);
      setStatus("封存完成。请点击“下载 PNG”或在移动端长按预览图保存原图。");

      const previewDataUrl = await blobToDataUrl(blob);

      await saveStoredCard({
        id: crypto.randomUUID(),
        name: overlayText.slice(0, 18) || "未命名隐信片",
        previewDataUrl,
        secretPreview: secretText.slice(0, 80),
        createdAt: new Date().toISOString(),
        kind: "generated",
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "封存失败。");
    } finally {
      setBusy(false);
    }
  }

  function handleManualDownload() {
    if (!lastBlob) {
      setStatus("当前没有可下载的导出结果。");
      return;
    }

    const filename = exportFilename || `enigmacard-${Date.now()}.png`;
    downloadBlob(lastBlob, filename);
    setStatus("已触发下载。若移动端未弹出，请直接长按预览图保存。");
  }

  return (
    <section className="workspace two-column">
      <div className="panel soft-panel">
        <div className="panel-heading">
          <h3>表面视觉层</h3>
          <p>可以上传你自己的封面，也可以直接调用馆藏模板。</p>
        </div>

        <div className="mode-toggle">
          <button
            className={surfaceMode === "template" ? "toggle-chip active" : "toggle-chip"}
            onClick={() => {
              setSurfaceMode("template");
              setImageSize(selectedTemplate.size);
            }}
            type="button"
          >
            内置模板
          </button>
          <button
            className={surfaceMode === "upload" ? "toggle-chip active" : "toggle-chip"}
            onClick={() => setSurfaceMode("upload")}
            type="button"
          >
            上传图片
          </button>
        </div>

        {surfaceMode === "template" ? (
          <>
            <div className="template-list">
              {builtInTemplates.map((template) => (
                <button
                  key={template.id}
                  className={
                    template.id === selectedTemplateId
                      ? "template-option active"
                      : "template-option"
                  }
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setImageSize(template.size);
                  }}
                  type="button"
                >
                  <div className="template-option-copy">
                    <strong>{template.name}</strong>
                    <span>{template.description}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="template-preview-wrap">
              {selectedTemplate.renderPreview(payloadPreview)}
            </div>
          </>
        ) : null}

        {surfaceMode === "upload" ? (
        <label className="field">
          <span>封面图片</span>
          <input
            accept="image/*"
            type="file"
            onChange={async (event) => {
              const file = event.target.files?.[0] ?? null;
              setCoverFile(file);
              if (!file) {
                setImageSize(null);
                return;
              }
              if (!file.type.startsWith("image/")) {
                setStatus("仅支持图片文件作为封面。");
                setCoverFile(null);
                setImageSize(null);
                return;
              }
              if (file.size > MAX_IMAGE_BYTES) {
                setStatus("封面图片过大（>20MB），请先压缩后再导入。");
                setCoverFile(null);
                setImageSize(null);
                return;
              }

              const bitmap = await createImageBitmap(file);
              setImageSize({ width: bitmap.width, height: bitmap.height });
              bitmap.close();
            }}
          />
        </label>
        ) : null}

        {surfaceMode === "upload" ? (
          <label className="field">
            <span>表层引导文案</span>
            <textarea
              value={overlayText}
              rows={3}
              onChange={(event) => setOverlayText(event.target.value)}
            />
          </label>
        ) : (
          <div className="template-note">
            <strong>{selectedTemplate.name}</strong>
            <p>模板文案、边框和指纹区已内置，生成时会直接参与卡面渲染。</p>
          </div>
        )}

        <label className="field">
          <span>分享方式预设</span>
          <select value={shareMode} onChange={(event) => setShareMode(event.target.value)}>
            <option>原图</option>
            <option>PNG 文件发送</option>
            <option>聊天文件发送</option>
            <option>社媒转发</option>
            <option>截图</option>
          </select>
        </label>

        <div className={`risk-box risk-${risk}`}>
          <strong>分享护栏</strong>
          <p>{getShareRiskLabel(risk)}</p>
          {settings.shareGuardEnabled ? (
            <p>发送前请勾选“原图”，否则平台压缩可能吞噬秘密。</p>
          ) : null}
        </div>

        <div className="template-note">
          <strong>抗压缩与 AI 可读层</strong>
          <p>这里会把低对比度重复文字铺进卡面，提升外部多模态模型读取的概率。</p>
        </div>

        <label className="toggle-row">
          <span>启用 AI 可读层</span>
          <input
            checked={aiAssist.enabled}
            type="checkbox"
            onChange={(event) =>
              setAiAssist((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
        </label>

        <label className="field">
          <span>色差强度</span>
          <select
            value={aiAssist.contrastPreset}
            onChange={(event) =>
              setAiAssist((current) => ({
                ...current,
                contrastPreset: event.target.value as AiAssistOptions["contrastPreset"],
              }))
            }
          >
            <option value="soft">柔和</option>
            <option value="medium">中等</option>
            <option value="strong">强化</option>
          </select>
        </label>

        <label className="field">
          <span>冗余铺排</span>
          <select
            value={aiAssist.redundancy}
            onChange={(event) =>
              setAiAssist((current) => ({
                ...current,
                redundancy: Number(event.target.value) as AiAssistOptions["redundancy"],
              }))
            }
          >
            <option value="1">1 次</option>
            <option value="2">2 次</option>
            <option value="3">3 次</option>
          </select>
        </label>

        <label className="toggle-row">
          <span>导出图上附加读取提示</span>
          <input
            checked={aiAssist.includeInstructionBand}
            type="checkbox"
            onChange={(event) =>
              setAiAssist((current) => ({
                ...current,
                includeInstructionBand: event.target.checked,
              }))
            }
          />
        </label>
      </div>

      <div className="panel soft-panel">
        <div className="panel-heading">
          <h3>隐秘注入层</h3>
          <p>首版默认使用 LSB 稳定模式。模板模式会把密语同时铺进底层隐写区。</p>
        </div>

        <label
            className={`field${
                charState === "warn" ? " char-warn-field" : charState === "danger" ? " char-danger-field" : ""
              }`}
          >
            <span>隐藏文本</span>
            <textarea
              value={secretText}
              maxLength={MAX_SECRET_CHARACTERS}
              rows={14}
              className={charState === "warn" ? "textarea-warn" : charState === "danger" ? "textarea-danger" : ""}
              onChange={(event) => setSecretText(event.target.value)}
              placeholder="把 Prompt、情书、密令或世界观设定写在这里。"
            />
          </label>

        <div className="stats-grid">
          <div className="stat-card">
            <span>文本长度</span>
            <strong className={charState === "warn" ? "char-warn" : charState === "danger" ? "char-danger" : ""}>
              {secretText.length} / {MAX_SECRET_CHARACTERS} chars
            </strong>
          </div>
          <div className="stat-card">
            <span>容量预估</span>
            <strong>{estimatedCapacity ? `${estimatedCapacity} bytes` : "待载入图片"}</strong>
          </div>
          <div className="stat-card">
            <span>载荷体积</span>
            <strong>{estimatedPayloadBytes} bytes</strong>
          </div>
        </div>

        <div className="template-note">
          <strong>长度护栏</strong>
          <p>
            建议控制在 {RECOMMENDED_SECRET_CHARACTERS} 字内以兼顾 AI 可读层稳定性；硬上限为 {MAX_SECRET_CHARACTERS} 字，
            超出将直接拦截，避免底部隐写区溢出或卡面变形。
          </p>
          <p>{estimateOcrRedundancy(secretText)}</p>
        </div>

        <div className="action-row">
          <button className="primary-button" disabled={busy} onClick={handleGenerate} type="button">
            {busy ? "封存中..." : "生成并导出 PNG"}
          </button>
          <button
            className="ghost-button"
            disabled={!lastBlob || busy}
            onClick={handleManualDownload}
            type="button"
          >
            下载 PNG
          </button>
          <p className="status-text">{status}</p>
        </div>

        {previewUrl ? (
          <>
            <div className="preview-card">
              <p>导出预览</p>
              <span className="preview-hint">
                移动端请直接长按下方原图，必须呼出系统原生“保存图片/分享”菜单。
              </span>
              <img alt="隐信片预览" draggable="false" src={previewUrl} />
            </div>

            <div className="instruction-panel">
              <div className="panel-heading inline-heading">
                <div>
                  <h3>导出读取指令</h3>
                  <p>复制这段话，再把导出的图片发给任意多模态模型。</p>
                </div>
                <button className="ghost-button" onClick={copyInstruction} type="button">
                  复制读取指令
                </button>
              </div>

              <label className="field">
                <span>指令风格</span>
                <select
                  value={selectedInstructionPreset}
                  onChange={(event) => setSelectedInstructionPreset(event.target.value)}
                >
                  {instructionPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} · {preset.audience}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>发给外部模型的读取指令</span>
                <textarea readOnly rows={9} value={readerInstruction} />
              </label>
              {copiedState ? <p className="status-text">{copiedState}</p> : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
