import type { MaxGymTime } from "@/lib/types";
import { openDB } from "./connection.service";

const STORE_NAME = "maxgymtime";

export const getMaxGymTime = async (): Promise<MaxGymTime> => {
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

export const addMaxGymTime = async () => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const timestamp = Date.now();
  const startTime = new Date(timestamp);
  const utc5MaxGymTime = new Date(timestamp + 5400000);

  store.add({ startTime: startTime, maxTime: utc5MaxGymTime });
};
