import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: "ASIASJVQ7YRDVJC6NFGS",
    secretAccessKey: "mJzKlep3Pbj0wTpQy9nWgO+WF6nnk8KvO9f2ZnvW",
    sessionToken: "IQoJb3JpZ2luX2VjEDYaCXVzLWVhc3QtMiJHMEUCIQDSyj904V/qmJQyX0kK85Ow4d0Kbfvcqu4t8X+IgTHVcgIgXUYC+g0l/EdlqgjNn96tZCUNlKTbLalvd6KDyMBM5yMqmQMIPxAAGgwxNTgyMTEyMjg3NDMiDGOS2n4dJxP/BgtLKyr2AnsIhJycTMT9mKgEkcv3NDxBAeaScyfFV9XOVn4FNJMnw8psLp4e9nXgbIyaecTA/UV+fir4TslCb5pQPOQgFvKMNYwS0qoErMCI8yKWYJhBT7TBZY0Izxzf/xZqlhFcAqK2+8nF/2V1286Bb8kfd68K9gTp+K1MNFUN0jbaZW+n/s+30fhKRZqlpdXb3LCcMQbEytZRVprwlat21JesaetoqXiA0JUaRJXDKX3HRI8yvKE7jmU/jrvIUvJjiuQ8VRkjbJ8/dqgmey9ft1NFinZ4Q+jnIki3gYuOWlgMLJuDiPOE+FG7kVWPErck2JnChCuyZEassHEE8Xm2TE1ntMrfImQCiLQKW0fWuQJvL/sepViwBJ15k3+4cPqkf2aRCz+qZx2zj8NYH8Pat62CaotoBgWCxEJ1DNiEPBgu+zNL+HmcPlgUZHh4XGfdyC/Aw4Z1r1Nm1XmHRVyCGoNAnptJQbkVW5MmYYIAkAan4QbXCdPWbPy7MPeiqKIGOqYBwE2zJGtNtj7odsc2jxjiUcesYNlaXNe2BuVdQlXU794zfc18trMn1nhwctGz/oAWIewbO+csyJLYADvUy6kRnbSLUIiNfV7dPQfnGZqpmqFCd/pKLiTh5FFkDDub4MwYoJzrqHQ3WcgptCfqAZTeknN09sbXKt/Gunps2t78jCyGkPfC+rR6ug/dJ+UsHr6xUmEQKx3vxE8M/718ejjvDb3eJX+k8Q=="
});

const s3 = new AWS.S3();

export const uploadBatchVideo = () => {
    const dbName = 'recorded-videos';
    const dbVersion = 1;

    const request = indexedDB.open(dbName, dbVersion);

    request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(["videos"], "readwrite");
    const store = transaction.objectStore("videos");
    
    // retrieve all the videos from the object store
    const getRequest = store.getAll();
    getRequest.onsuccess = () => {
        console.log("Retrieved stored videos from IndexedDB:", getRequest.result);
        for (let i = 0; i < getRequest.result.length; i++) {
        const videoData = getRequest.result[i];
        const now = new Date();
        const timestamp = now.getTime(); 
        const keyName = `recorded-videos/video-${timestamp}.mp4`;
        const params = {
            Bucket: "viral-react-deploy",
            Key: keyName,
            Body: videoData.video,
            ACL: "public-read",
            ContentType: "video/mp4"
        };
        s3.upload(params, (err, data) => {
            if (err) {
            console.log("Error uploading stored video to S3:", err);
            } else {
            const request = db.transaction('videos', 'readwrite')
                .objectStore('videos').delete(videoData.id);

            request.onsuccess = () => {
                console.log(`Video deleted`);
            }

            request.onerror = (err) => {
                console.error(`Error to delete video: ${err}`)
            }
            }
        });
        }
    };
    getRequest.onerror = () => {
        console.log("Error retrieving stored videos from IndexedDB");
    };

    // close the transaction and the database
    // transaction.oncomplete = () => {
    //     db.close();
    // };
    };
}

export const uploadBatchImages = () => {
  const dbName = 'recorded-images';
  const dbVersion = 1;

  const request = indexedDB.open(dbName, dbVersion);

  request.onsuccess = () => {
  const db = request.result;
  const transaction = db.transaction(["images"], "readwrite");
  const store = transaction.objectStore("images");
  
  // retrieve all the images from the object store
  const getRequest = store.getAll();
  getRequest.onsuccess = () => {
      console.log("Retrieved stored images from IndexedDB:", getRequest.result);
      for (let i = 0; i < getRequest.result.length; i++) {
      const imageData = getRequest.result[i];
      const now = new Date();
      const timestamp = now.getTime(); 
      const keyName = `images/image-${timestamp}.jpg`;
      const params = {
          Bucket: "viral-react-deploy",
          Key: keyName,
          Body: imageData.image
      };
    
      s3.upload(params, (err, data) => {
          if (err) {
          console.log("Error uploading stored image to S3:", err);
          } else {
          const request = db.transaction('images', 'readwrite')
              .objectStore('images').delete(imageData.id);

          request.onsuccess = () => {
              console.log(`image deleted`);
          }

          request.onerror = (err) => {
              console.error(`Error to delete image: ${err}`)
          }
          }
      });
      }
  };
  getRequest.onerror = () => {
      console.log("Error retrieving stored image from IndexedDB");
  };

  // close the transaction and the database
  // transaction.oncomplete = () => {
  //     db.close();
  // };
  };
}