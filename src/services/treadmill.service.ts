import type { Treadmill } from "@/lib/types";
import { openDB } from "./connection.service";

const STORE_NAME = "treadmill";

export const getTreadmillRecords = async (): Promise<Treadmill[]> => {
  const db = await openDB(STORE_NAME);
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const allRecords = request.result.map((record) => ({
        ...record,
        time: Math.round(record.time / (60 * 1000)), // Convert milliseconds to minutes
      }));
      resolve(allRecords.toSorted((a, b) => a.id - b.id));
    };
  });
};

export const addTreadmillRecord = async (
  treadmill: Treadmill
): Promise<Treadmill> => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.add(treadmill);

  return treadmill;
};

export const updateTreadmillRecord = async (
  treadmill: Treadmill
): Promise<Treadmill> => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.put(treadmill);

  return treadmill;
};

export const deleteTreadmillRecord = async (treadmill: Treadmill) => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.delete(treadmill.id);
};
