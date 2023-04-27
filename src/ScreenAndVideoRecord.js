import React, { useRef, useState } from 'react';
import RecordRTC from 'recordrtc';
import { uploadBatchVideo,uploadBatchImages } from './uploadS3';
import { storeImageData, storeVideoData } from './storeIndexedData';

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const videoRef2 = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [mixedStream, setMixedStream] = useState([]);

  const closeRecord = () => {
    setRecordedVideoUrl(null)
    setCapturedImages([]);
  }

  const clearVideo = () => {
    const videoElem = videoRef2.current;
    if (videoElem) {
      videoElem.pause();
      videoElem.srcObject = null;
    }
  }
  
  const startRecording = async () => {
    const screenStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    
    const videoTrack = cameraStream.getVideoTracks()[0];

    const videoElem = videoRef2.current;
    videoElem.srcObject = new MediaStream([videoTrack]);
    videoElem.muted = true;
    await videoElem.play();

    const tracks = [...screenStream.getTracks(), ...cameraStream.getTracks()];
    const mixedStream = new MediaStream(tracks);
    
    const recorder = RecordRTC(mixedStream, { type: 'video', mimeType: 'video/webm' });
    setScreenStream(screenStream);
    setCameraStream(cameraStream);
    setMixedStream(mixedStream);
    setRecorder(recorder);
    recorder.startRecording();
    setRecording(true);
  };

  const takePhoto = () => {
    const videoTrack = cameraStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    imageCapture.takePhoto().then((blob) => {
      storeImageData(blob);
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImages([...capturedImages, imageUrl]);
    });
  }

  const stopRecording = () => {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      const url = URL.createObjectURL(blob);
      screenStream.getTracks().forEach(track => track.stop());
      cameraStream.getTracks().forEach(track => track.stop());
      mixedStream.getTracks().forEach(track => track.stop());
      setRecordedVideoUrl(url);
      setScreenStream(null);
      setMixedStream(null);
      setCameraStream(null);
      setRecorder(null);
      setRecording(false);
      storeVideoData(blob);
      clearVideo()
    });
  };

  return (
    <div>
      {!recording && !recordedVideoUrl && (
        <button onClick={startRecording}>Start Recording</button>
      )}

      {!recording && !recordedVideoUrl && (
        <button onClick={uploadBatchVideo}>Sync All Videos to S3</button>
      )}
      
      {!recording && !recordedVideoUrl && (
        <button onClick={uploadBatchImages}>Sync All Images to S3</button>
      )}
      
      {recording && (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
      {recordedVideoUrl && (
        <button onClick={closeRecord}>Close</button>
      )}
      {recordedVideoUrl && (
        <video  style={{ paddingTop: 20 }} src={recordedVideoUrl} controls autoPlay />
      )}
      <video ref={videoRef2}/>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {!recording && capturedImages.map((imageUrl) => (
          <img key={imageUrl} src={imageUrl} alt="test" style={{ width: '50%', height: 'auto', padding: '5px' }} />
        ))}
      </div>
      {cameraStream && (
        <button onClick={takePhoto}>Take Photo</button>
      )}
    </div>
  );
};

export default ScreenRecorder;
