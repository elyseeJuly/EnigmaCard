import { AppSettings, saveSettings } from "../../lib/storage/settings";

type SettingsPanelProps = {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
};

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  function apply(next: AppSettings) {
    onChange(next);
    void saveSettings(next);
  }

  return (
    <section className="workspace single-column">
      <div className="panel soft-panel">
        <div className="panel-heading">
          <h3>设置</h3>
          <p>把“纯本地”和“分享护栏”作为首版默认价值观。</p>
        </div>

        <label className="toggle-row">
          <span>开启原图发送提醒</span>
          <input
            checked={settings.shareGuardEnabled}
            type="checkbox"
            onChange={(event) =>
              apply({ ...settings, shareGuardEnabled: event.target.checked })
            }
          />
        </label>

        <label className="toggle-row">
          <span>默认偏好原图传递</span>
          <input
            checked={settings.preferOriginalImage}
            type="checkbox"
            onChange={(event) =>
              apply({ ...settings, preferOriginalImage: event.target.checked })
            }
          />
        </label>

        <label className="toggle-row">
          <span>启用备用密钥徽章入口</span>
          <input
            checked={settings.fallbackBadgeEnabled}
            type="checkbox"
            onChange={(event) =>
              apply({ ...settings, fallbackBadgeEnabled: event.target.checked })
            }
          />
        </label>

        <label className="field">
          <span>默认分享方式</span>
          <select
            value={settings.defaultShareMode}
            onChange={(event) =>
              apply({ ...settings, defaultShareMode: event.target.value })
            }
          >
            <option>原图</option>
            <option>PNG 文件发送</option>
            <option>聊天文件发送</option>
            <option>社媒转发</option>
            <option>截图</option>
          </select>
        </label>
      </div>
    </section>
  );
}
