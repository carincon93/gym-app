import type { Climbmill } from "@/lib/types";
import { openDB } from "./connection.service";

const STORE_NAME = "climbmill";

export const getClimbmillRecords = async (): Promise<Climbmill[]> => {
  const db = await openDB();

  return new Promise((resolve) => {
    // const transaction = db.transaction(STORE_NAME, "readonly");
    // const store = transaction.objectStore(STORE_NAME);
    // const request = store.getAll();
    // request.onsuccess = () => {
    //   const allRecords = request.result.map((record) => ({
    //     ...record,
    //     time: Math.round(record.time / (60 * 1000)), // Convert milliseconds to minutes
    //   }));
    //   resolve(allRecords.toSorted((a, b) => a.id - b.id));
    // };
  });
};

export const addClimbmillRecord = async (
  climbmill: Climbmill
): Promise<Climbmill> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.add(climbmill);

  return climbmill;
};

export const updateClimbmillRecord = async (
  climbmill: Climbmill
): Promise<Climbmill> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.put(climbmill);

  return climbmill;
};

export const deleteClimbmillRecord = async (climbmill: Climbmill) => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.delete(climbmill.id);
};
