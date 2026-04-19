import { useEffect, useMemo, useState } from "react";
import { Shell } from "../components/Shell";
import { EncodePanel } from "../features/encode/EncodePanel";
import { DecodePanel } from "../features/decode/DecodePanel";
import { GalleryPanel } from "../features/gallery/GalleryPanel";
import { SettingsPanel } from "../features/settings/SettingsPanel";
import { AppSettings, defaultSettings, loadSettings } from "../lib/storage/settings";

type TabKey = "home" | "encode" | "decode" | "gallery" | "settings";

const tabs: Array<{ key: TabKey; label: string; hint: string }> = [
  { key: "home", label: "前厅", hint: "本地工坊与分发说明" },
  { key: "encode", label: "铸币局", hint: "生成可分享的隐信片" },
  { key: "decode", label: "显影液", hint: "读取收到的卡片" },
  { key: "gallery", label: "手帐本", hint: "管理本地草稿与成品" },
  { key: "settings", label: "设置", hint: "控制默认导出和分享提醒" },
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadSettings()
      .then((value) => {
        if (!cancelled) {
          setSettings(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSettings(defaultSettings);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeMeta = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) ?? tabs[0],
    [activeTab],
  );

  if (!settings) {
    return <div className="loading-screen">正在打开本地工坊……</div>;
  }

  return (
    <Shell
      tabs={tabs}
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      title={activeMeta.label}
      subtitle={activeMeta.hint}
    >
      {activeTab === "home" ? <HomePanel onStart={() => setActiveTab("encode")} /> : null}
      {activeTab === "encode" ? <EncodePanel settings={settings} /> : null}
      {activeTab === "decode" ? <DecodePanel /> : null}
      {activeTab === "gallery" ? <GalleryPanel /> : null}
      {activeTab === "settings" ? (
        <SettingsPanel settings={settings} onChange={setSettings} />
      ) : null}
    </Shell>
  );
}

function HomePanel({ onStart }: { onStart: () => void }) {
  return (
    <section className="workspace single-column">
      <div className="panel soft-panel">
        <div className="panel-heading">
          <h3>本地工坊</h3>
          <p>
            这是一枚可本地运行的隐信片工坊。只要浏览器在，编码、解码和保存就默认留在你的设备里。
          </p>
        </div>
        <div className="hero-grid">
          <article className="info-card">
            <strong>本地交付</strong>
            <p>构建后的静态文件可以直接打包给别人，后续通过启动脚本在本地浏览器里打开。</p>
          </article>
          <article className="info-card">
            <strong>当前最佳闭环</strong>
            <p>先在铸币局生成，再用显影液本地验码，最后通过原图或文件发送分享。</p>
          </article>
          <article className="info-card">
            <strong>未来可上线</strong>
            <p>同一套前端产物后续可以直接部署成正式网站，不等于把秘密上传给服务器。</p>
          </article>
        </div>
        <div className="action-row">
          <button className="primary-button" onClick={onStart} type="button">
            进入铸币局
          </button>
        </div>
      </div>
    </section>
  );
}
