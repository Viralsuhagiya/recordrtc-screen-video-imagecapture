import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: "ASIASJVQ7YRDVJC6NFGS",
    secretAccessKey: "mJzKlep3Pbj0wTpQy9nWgO+WF6nnk8KvO9f2ZnvW",
    sessionToken: "IQoJb3JpZ2luX2VjEDYaCXVzLWVhc3QtMiJHMEUCIQDSyj904V/qmJQyX0kK85Ow4d0Kbfvcqu4t8X+IgTHVcgIgXUYC+g0l/EdlqgjNn96tZCUNlKTbLalvd6KDyMBM5yMqmQMIPxAAGgwxNTgyMTEyMjg3NDMiDGOS2n4dJxP/BgtLKyr2AnsIhJycTMT9mKgEkcv3NDxBAeaScyfFV9XOVn4FNJMnw8psLp4e9nXgbIyaecTA/UV+fir4TslCb5pQPOQgFvKMNYwS0qoErMCI8yKWYJhBT7TBZY0Izxzf/xZqlhFcAqK2+8nF/2V1286Bb8kfd68K9gTp+K1MNFUN0jbaZW+n/s+30fhKRZqlpdXb3LCcMQbEytZRVprwlat21JesaetoqXiA0JUaRJXDKX3HRI8yvKE7jmU/jrvIUvJjiuQ8VRkjbJ8/dqgmey9ft1NFinZ4Q+jnIki3gYuOWlgMLJuDiPOE+FG7kVWPErck2JnChCuyZEassHEE8Xm2TE1ntMrfImQCiLQKW0fWuQJvL/sepViwBJ15k3+4cPqkf2aRCz+qZx2zj8NYH8Pat62CaotoBgWCxEJ1DNiEPBgu+zNL+HmcPlgUZHh4XGfdyC/Aw4Z1r1Nm1XmHRVyCGoNAnptJQbkVW5MmYYIAkAan4QbXCdPWbPy7MPeiqKIGOqYBwE2zJGtNtj7odsc2jxjiUcesYNlaXNe2BuVdQlXU794zfc18trMn1nhwctGz/oAWIewbO+csyJLYADvUy6kRnbSLUIiNfV7dPQfnGZqpmqFCd/pKLiTh5FFkDDub4MwYoJzrqHQ3WcgptCfqAZTeknN09sbXKt/Gunps2t78jCyGkPfC+rR6ug/dJ+UsHr6xUmEQKx3vxE8M/718ejjvDb3eJX+k8Q=="
});

const s3 = new AWS.S3();
const uploadToS3 = (db, objectStoreName, fileExtension, dataCallback) => {
    const transaction = db.transaction([objectStoreName], "readwrite");
    const store = transaction.objectStore(objectStoreName);

    // retrieve all the data from the object store
    const getRequest = store.getAll();
    getRequest.onsuccess = () => {
        console.log(`Retrieved stored ${objectStoreName} from IndexedDB:`, getRequest.result);
        for (let i = 0; i < getRequest.result.length; i++) {
            const objectData = getRequest.result[i];
            const now = new Date();
            const timestamp = now.getTime(); 
            const keyName = `${objectStoreName}/${objectStoreName}-${timestamp}.${fileExtension}`;
            const params = {
                Bucket: "viral-react-deploy",
                Key: keyName,
                Body: dataCallback(objectData),
                ACL: "public-read",
                ContentType: `video/${fileExtension}`
            };
            s3.upload(params, (err, data) => {
                if (err) {
                    console.log(`Error uploading stored ${objectStoreName} to S3:`, err);
                } else {
                    const request = db.transaction(objectStoreName, 'readwrite')
                        .objectStore(objectStoreName).delete(objectData.id);

                    request.onsuccess = () => {
                        console.log(`${objectStoreName} deleted`);
                    }

                    request.onerror = (err) => {
                        console.error(`Error to delete ${objectStoreName}: ${err}`)
                    }
                }
            });
        }
    };
    getRequest.onerror = () => {
        console.log(`Error retrieving stored ${objectStoreName} from IndexedDB`);
    };
}

export const uploadBatchVideo = () => {
    const dbName = 'recorded-videos';
    const dbVersion = 1;

    const request = indexedDB.open(dbName, dbVersion);

    request.onsuccess = () => {
        const db = request.result;
        uploadToS3(db, 'videos', 'mp4', (videoData) => videoData.video);
    };
}

export const uploadBatchImages = () => {
    const dbName = 'recorded-images';
    const dbVersion = 1;

    const request = indexedDB.open(dbName, dbVersion);

    request.onsuccess = () => {
        const db = request.result;
        uploadToS3(db, 'images', 'jpg', (imageData) => imageData.image);
    };
}
