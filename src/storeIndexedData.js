
export const storeImageData = (blob) => {
    const dbName = 'recorded-images';
    const dbVersion = 1;

    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['images'], 'readwrite');
      const objectStore = transaction.objectStore('images');
      const request = objectStore.add({ image: blob });
      request.onsuccess = () => {
        console.log('Image added to IndexedDB.');
      };
      request.onerror = (error) => {
        console.error('Error adding Image to IndexedDB:', error);
      };
    };

    request.onerror = (error) => {
      console.error('Error opening IndexedDB:', error);
    };
  }

  export const storeVideoData = (blob) => {
    const dbName = 'recorded-videos';
    const dbVersion = 1;

    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['videos'], 'readwrite');
      const objectStore = transaction.objectStore('videos');
      const request = objectStore.add({ video: blob });
      request.onsuccess = () => {
        console.log('Recorded video added to IndexedDB.');
      };
      request.onerror = (error) => {
        console.error('Error adding recorded video to IndexedDB:', error);
      };
    };

    request.onerror = (error) => {
      console.error('Error opening IndexedDB:', error);
    };
  };