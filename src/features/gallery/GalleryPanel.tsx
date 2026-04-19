import { useEffect, useState } from "react";
import {
  StoredCard,
  clearStoredCards,
  loadStoredCards,
} from "../../lib/storage/gallery";

export function GalleryPanel() {
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const next = await loadStoredCards();
    setCards(next);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <section className="workspace single-column">
      <div className="panel soft-panel">
        <div className="panel-heading inline-heading">
          <div>
            <h3>手帐本</h3>
            <p>本地保存最近生成或收到的卡片摘要。</p>
          </div>
          <button
            className="ghost-button"
            onClick={async () => {
              await clearStoredCards();
              await refresh();
            }}
            type="button"
          >
            清空本地记录
          </button>
        </div>

        <div className="gallery-grid">
          {loading ? <div className="empty-card">正在翻开手帐本……</div> : null}
          {!loading && cards.length === 0 ? (
            <div className="empty-card">
              把想说的话，藏进一张安静的图里。这里会替你留住最近的痕迹。
            </div>
          ) : null}

          {cards.map((card) => (
            <article className="gallery-card" key={card.id}>
              {card.previewDataUrl ? (
                <img alt={card.name} className="gallery-thumb" src={card.previewDataUrl} />
              ) : null}
              <div className="gallery-meta">
                <span>{card.kind === "generated" ? "已生成" : "已接收"}</span>
                <small>{new Date(card.createdAt).toLocaleString("zh-CN")}</small>
              </div>
              <h4>{card.name}</h4>
              <p>{card.secretPreview || "没有摘要"}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
