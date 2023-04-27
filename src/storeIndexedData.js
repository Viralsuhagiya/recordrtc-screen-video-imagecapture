const addDataToIndexedDB = (dbName, objectStoreName, data) => {
  const dbVersion = 1;
  const request = indexedDB.open(dbName, dbVersion);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore(objectStoreName, { keyPath: 'id', autoIncrement: true });
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction([objectStoreName], 'readwrite');
    const objectStore = transaction.objectStore(objectStoreName);
    const request = objectStore.add(data);
    request.onsuccess = () => {
      console.log(`Data added to ${dbName} IndexedDB.`);
    };
    request.onerror = (error) => {
      console.error(`Error adding data to ${dbName} IndexedDB:`, error);
    };
  };

  request.onerror = (error) => {
    console.error(`Error opening ${dbName} IndexedDB:`, error);
  };
};

export const storeImageData = (blob) => {
  const dbName = 'recorded-images';
  const objectStoreName = 'images';
  const data = { image: blob };
  addDataToIndexedDB(dbName, objectStoreName, data);
};

export const storeVideoData = (blob) => {
  const dbName = 'recorded-videos';
  const objectStoreName = 'videos';
  const data = { video: blob };
  addDataToIndexedDB(dbName, objectStoreName, data);
};
