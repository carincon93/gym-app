import type { Week } from "@/lib/types";
import { openDB } from "./connection.service";

const STORE_NAME = "weeks";

const endOfDayUtc5 = (timestamp: number | null) => {
  if (!timestamp) return null;

  // Convertir a fecha en UTC-5 (Bogotá)
  const date = new Date(timestamp);

  // Extraer componentes en la zona horaria de Bogotá
  const utc5Time = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(utc5Time.find((p) => p.type === "year")?.value ?? "0");
  const month =
    Number(utc5Time.find((p) => p.type === "month")?.value ?? "1") - 1; // JS months are 0-indexed
  const day = Number(utc5Time.find((p) => p.type === "day")?.value ?? "1");

  return new Date(Date.UTC(year, month, day, 23 + 5, 59, 59, 999)).getTime();
};

const getMondayMilliseconds = (): number => {
  const now = new Date();
  const bogota = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Bogota" })
  );
  const dayOfWeek = bogota.getDay();
  const diff = bogota.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(bogota.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
};

export const getWeek = async (): Promise<Week> => {
  const db = await openDB();
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

export const getAllWeeks = async (): Promise<Week[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result || []);
    };
  });
};

export const addWeek = async (currentWeek: Week): Promise<Week> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const week4 = {
    id: Date.now(),
    firstDayOfWeek: 1748840400000,
    lastDayOfWeek: 1749445199000,
  };
  await store.add(week4);

  return week4;

  // const firstDayOfWeek = getMondayMilliseconds();
  // const lastDayOfWeek = endOfDayUtc5(firstDayOfWeek + 518400000);

  // if (!lastDayOfWeek) return currentWeek;

  // const now = Date.now();

  // if (Number(currentWeek?.lastDayOfWeek) > now && now < lastDayOfWeek)
  //   return currentWeek;

  // const week = {
  //   id: Date.now(),
  //   firstDayOfWeek: firstDayOfWeek,
  //   lastDayOfWeek: lastDayOfWeek ?? firstDayOfWeek + 518400000,
  // };

  // const week = {
  //   id: Date.now(),
  //   firstDayOfWeek: 1748113412481,
  //   lastDayOfWeek: 1748718212481,
  // };

  // store.add(week);

  // return week;
};
