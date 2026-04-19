import { clearStore, getAllFromStore, putToStore, storeNames } from "./db";

export type StoredCard = {
  id: string;
  name: string;
  previewDataUrl?: string;
  secretPreview: string;
  createdAt: string;
  kind: "generated" | "received";
};

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片预览生成失败。"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function loadStoredCards(): Promise<StoredCard[]> {
  const records = await getAllFromStore<StoredCard>(storeNames.cards);
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 24);
}

export async function saveStoredCard(card: StoredCard): Promise<void> {
  await putToStore(storeNames.cards, card);
}

export async function clearStoredCards(): Promise<void> {
  await clearStore(storeNames.cards);
}
