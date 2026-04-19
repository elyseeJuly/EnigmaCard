const DB_NAME = "enigma-card-local-workshop";
const DB_VERSION = 1;
const CARD_STORE = "cards";
const SETTINGS_STORE = "settings";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("IndexedDB 打开失败。"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(CARD_STORE)) {
        database.createObjectStore(CARD_STORE, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
      }
    };
  });

  return dbPromise;
}

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onerror = () => reject(request.error ?? new Error("读取本地数据失败。"));
    request.onsuccess = () => resolve((request.result as T[]) ?? []);
  });
}

export async function putToStore<T>(storeName: string, value: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("写入本地数据失败。"));
    transaction.oncomplete = () => resolve();
    transaction.objectStore(storeName).put(value);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("清空本地数据失败。"));
    transaction.oncomplete = () => resolve();
    transaction.objectStore(storeName).clear();
  });
}

export const storeNames = {
  cards: CARD_STORE,
  settings: SETTINGS_STORE,
};
