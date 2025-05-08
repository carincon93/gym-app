import type { Week } from "@/lib/types";
import { openDB } from "./connection.service";

const STORE_NAME = "weeks";

export const getWeek = async (): Promise<Week> => {
  const db = await openDB(STORE_NAME);
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result;
      resolve(items.length > 0 ? items[items.length - 1] : null);
    };
  });
};

export const addWeek = async () => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const timestamp = Date.now();
  const firstDayOfWeek = new Date(timestamp);
  const lastDayOfWeek = new Date(timestamp + 604800000);

  store.add({ firstDayOfWeek: firstDayOfWeek, lastDayOfWeek: lastDayOfWeek });
};
