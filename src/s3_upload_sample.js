import React, { useState } from 'react';
import RecordRTC from 'recordrtc';
import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    sessionToken: "+pGXmJlDAHU//+/nnmz1f0MxkpS5sckHOfWcecjKXfFD4wE/FsWgMXPvw39tCS0fvCA2nUUBSxZXbldwBBd2mGMs1wSJRftMTllQ+uABLgaB+bIPpJ8fHmulI6sqzozemZSt+/Gr/sLA2NeL9eqGyXSlPal1v9p+mtaW5QpYQ6vwwu92lCINAHnsR1+u3ewW2vgFeN48tvHbrUMTDYH1xTLSrLaRXjMx+qDvKiwzKaBblxU6SqX0x7KLCApHjFI9PmC6ZAyof+khzW8ajXy3W9Sx4LoiK4zaMsAfogGgFYChDcqo6SuqihOuGLPLih6jF0vqnQ1Ek9s4tq5qAXnFiDYWajo+kclq+YnzlZqJ6qJOjVg9GV8lck8ONjw9Em/OmcT29BzjkbZIf/0C8vRvMOTHW8QvMp/Teyo0Oq45UcSpetR7hTNotAeS3IoBbRWny8SfQnXCOL+ftKpc06xwP7bpniHR4oIZJAUwyt6iogY6pwEbSvkb3hLG+Dk6wCCO0w8QbzHY5nT+M/S0DBJyx6KfZ81Qogr7jHRNMfi6OsYMBoOQEUVnzU2qWoFzg2ntg1v6BBV+jUwMhf7oBgjQZQGOZdCO+nrd7UQezdvKgjh82FtrsI+3HOyIUjDPIfif1ski/KQvm4ZxsrWJueq5eik7Hp0LFSvRmYlLq3ZwCJhXtFL//njEVkyd92tTc4ZN7Jd4ti0rbczbFA=="
});

const s3 = new AWS.S3();

function VideoRecorder() {
  const [recording,setRecording] = useState(false)
  const [recorder, setRecorder] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const options = {
          mimeType: 'video/webm',
          bitsPerSecond: 128000
        };
        const newRecorder = RecordRTC(stream, options);
        newRecorder.startRecording();
        setRecorder(newRecorder);
        setRecording(true)
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const stopRecording = () => {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      storeVideoData(blob);
      setRecording(false)
    });
  };

  const storeVideoData = (blob) => {
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

  const uploadBatchVideo = () => {
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

  return (
    <div>
      {!recording && <button onClick={startRecording}>Start Recording</button>}
      {recording && <button onClick={stopRecording}>Stop Recording</button>}
      {recordedVideoUrl && (
        <video src={recordedVideoUrl} controls autoPlay />
      )}
        <button onClick={uploadBatchVideo}>Sync</button>
    </div>
  );
}

export default VideoRecorder;
