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

export const addMaxGymTime = async (): Promise<MaxGymTime> => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const startTime = Date.now();
  const maxGymTime = startTime + 5400000;

  await store.add({ startTime: startTime, maxTime: maxGymTime });

  return { id: startTime, startTime: startTime, maxTime: maxGymTime };
};
