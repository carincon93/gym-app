import type { Machine, Record } from "@/lib/types";
import { openDB } from "./connection.service";

const STORE_NAME = "records";

export const getRecords = async (machine: Machine): Promise<Record[]> => {
  const db = await openDB(STORE_NAME);
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    // Since IndexedDB doesn't support filtering directly, we'll need to filter after getting results
    request.onsuccess = () => {
      const allRecords = request.result;
      const filteredRecords = allRecords.filter(
        (record) => record.machineId === machine?.id
      );
      resolve(filteredRecords);
    };
  });
};

export const addRecord = async (record: Record) => {
  const db = await openDB(STORE_NAME);
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.add(record);
};
