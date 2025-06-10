export const DB_NAME = "GymDB";

export const getDBVersion = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = () => {
      const version = request.result.version;
      request.result.close();
      resolve(version);
    };

    request.onerror = () => reject(request.error);
  });
};

export const openDB = async (storeName: string): Promise<IDBDatabase> => {
  const DB_VERSION = await getDBVersion();

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteObjectStore = async (storeName: string): Promise<void> => {
  const DB_VERSION = await getDBVersion();

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION + 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(storeName)) {
        db.deleteObjectStore(storeName);
      }
    };

    request.onsuccess = () => {
      request.result.close();
      resolve();
    };

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
