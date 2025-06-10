export const DB_NAME = "GymDB";
export const DB_VERSION = 1;

export const openDB = (STORE_NAME: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore("records", {
          keyPath: "id",
          autoIncrement: true,
        });

        db.createObjectStore("maxgymtime", {
          keyPath: "id",
          autoIncrement: true,
        });

        db.createObjectStore("weeks", {
          keyPath: "id",
          autoIncrement: true,
        });

        db.createObjectStore("treadmill", {
          keyPath: "id",
          autoIncrement: true,
        });

        db.createObjectStore("climbmill", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

    deleteRequest.onsuccess = () => {
      console.log(`✅ Base de datos "${DB_NAME}" eliminada correctamente.`);
      resolve();
    };

    deleteRequest.onerror = () => {
      console.error(
        `❌ Error al eliminar la base de datos "${DB_NAME}":`,
        deleteRequest.error
      );
      reject(deleteRequest.error);
    };

    deleteRequest.onblocked = () => {
      console.warn(
        `⚠️ La eliminación de la base de datos "${DB_NAME}" fue bloqueada.`
      );
    };
  });
};
