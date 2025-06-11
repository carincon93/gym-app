export const DB_NAME = "GymDB";
const OBJECTS_STORE = [
  "weeks",
  "maxgymtime",
  "records",
  "climbmill",
  "treadmill",
];

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

export const openDB = async (): Promise<IDBDatabase> => {
  const currentVersion = await getDBVersion();

  // Check which stores need to be created
  const request = indexedDB.open(DB_NAME);
  const missingStores = await new Promise<string[]>((resolve) => {
    request.onsuccess = () => {
      const db = request.result;
      const missing = OBJECTS_STORE.filter(
        (store) => !db.objectStoreNames.contains(store)
      );
      db.close();
      resolve(missing);
    };
  });

  // If there are missing stores
  if (missingStores.length > 0) {
    // If it's first time (version 0), set version to 1
    // Otherwise increment existing version
    const newVersion = currentVersion === 0 ? 1 : currentVersion + 1;

    // Create all missing stores in one version upgrade
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, newVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        missingStores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // If all stores exist, just open DB with current version
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, currentVersion);
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
