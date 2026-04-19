import { ReactNode } from "react";

type Tab<TKey extends string> = {
  key: TKey;
  label: string;
  hint: string;
};

type ShellProps<TKey extends string> = {
  tabs: Tab<TKey>[];
  activeTab: TKey;
  onChangeTab: (tab: TKey) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function Shell<TKey extends string>(props: ShellProps<TKey>) {
  const { tabs, activeTab, onChangeTab, title, subtitle, children } = props;

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Enigma Card</p>
          <h1>折叠赛博维度的私语，只给懂的人看。</h1>
          <p className="hero-text">
            人类看到的是明信片，模型读到的是暗格。首版先保证本地可逆、
            离线可用、体面分享。
          </p>
        </div>
        <div className="hero-card">
          <p className="hero-card-label">当前模块</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>

      <nav className="tab-row" aria-label="Primary">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === activeTab ? "tab active" : "tab"}
            onClick={() => onChangeTab(tab.key)}
            type="button"
          >
            <span>{tab.label}</span>
            <small>{tab.hint}</small>
          </button>
        ))}
      </nav>

      <main className="panel-frame">{children}</main>
    </div>
  );
}
