import type { CreateOrderInput } from "@/types/api";

const DB_NAME = "cemal-cemul-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending_orders";

export type QueuedOrderStatus = "pending" | "syncing" | "error";

export type QueuedOrderRecord = {
  localId: string;
  createdAt: string;
  customerName: string;
  previewTotal: number;
  itemCount: number;
  payload: CreateOrderInput;
  proofBlob: Blob | null;
  proofFileName: string | null;
  status: QueuedOrderStatus;
  lastError: string | null;
};

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB tidak tersedia di browser ini."));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "localId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Gagal membuka penyimpanan offline."));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  execute: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openOfflineDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = execute(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () =>
          reject(req.error ?? new Error("Gagal mengakses antrean offline."));
        tx.oncomplete = () => db.close();
        tx.onabort = () => db.close();
      })
  );
}

/**
 * Lists queued offline orders in chronological FIFO order.
 */
export async function listQueuedOrders(): Promise<QueuedOrderRecord[]> {
  try {
    const items = await runTransaction("readonly", (store) => store.getAll());
    return (items as QueuedOrderRecord[]).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  } catch {
    return [];
  }
}

/**
 * Adds an order (and optional proof image Blob) to IndexedDB offline queue.
 */
export async function enqueueOrder(input: {
  payload: CreateOrderInput;
  previewTotal: number;
  itemCount: number;
  proofFile?: File | null;
}): Promise<QueuedOrderRecord> {
  const localId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const record: QueuedOrderRecord = {
    localId,
    createdAt: new Date().toISOString(),
    customerName: input.payload.customerName,
    previewTotal: input.previewTotal,
    itemCount: input.itemCount,
    payload: input.payload,
    proofBlob: input.proofFile ?? null,
    proofFileName: input.proofFile?.name ?? null,
    status: "pending",
    lastError: null,
  };

  await runTransaction("readwrite", (store) => store.put(record));
  return record;
}

/**
 * Updates fields on an existing queued order record.
 */
export async function updateQueuedOrder(
  localId: string,
  patch: Partial<Omit<QueuedOrderRecord, "localId">>
): Promise<void> {
  const existing = (await runTransaction("readonly", (store) =>
    store.get(localId)
  )) as QueuedOrderRecord | undefined;
  if (!existing) return;

  await runTransaction("readwrite", (store) =>
    store.put({
      ...existing,
      ...patch,
      localId,
    })
  );
}

/**
 * Removes a queued order record from IndexedDB.
 */
export async function removeQueuedOrder(localId: string): Promise<void> {
  await runTransaction("readwrite", (store) => store.delete(localId));
}

/**
 * Returns true if an error or HTTP status likely indicates network/connectivity failure rather than validation.
 */
export function isRetryableNetworkStatus(status: number): boolean {
  return status === 408 || status === 502 || status === 503 || status === 504;
}
