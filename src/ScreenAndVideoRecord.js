import React, { useRef, useState } from 'react';
import RecordRTC from 'recordrtc';
import { uploadBatchVideo,uploadBatchImages } from './uploadS3';
import { storeImageData, storeVideoData } from './storeIndexedData';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const ResponsiveButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
    margin: theme.spacing(1),
  },
}));


const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
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
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true,
      audio: false });
    
    const videoTrack = cameraStream.getVideoTracks()[0];

    const videoElem = videoRef2.current;
    videoElem.srcObject = new MediaStream([videoTrack]);
    videoElem.muted = true;
    await videoElem.play();

    const mixedStream = new MediaStream(cameraStream);
    
    const recorder = RecordRTC(mixedStream, { type: 'video', mimeType: 'video/webm' });
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
      cameraStream.getTracks().forEach(track => track.stop());
      mixedStream.getTracks().forEach(track => track.stop());
      setRecordedVideoUrl(url);
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
        <ResponsiveButton variant="contained" onClick={startRecording}>Start Recording</ResponsiveButton>
      )}

      {!recording && !recordedVideoUrl && (
        <ResponsiveButton variant="contained" onClick={uploadBatchVideo}>Sync All Videos to S3</ResponsiveButton>
      )}
      
      {!recording && !recordedVideoUrl && (
        <ResponsiveButton variant="contained" onClick={uploadBatchImages}>Sync All Images to S3</ResponsiveButton>
      )}
      
      {recording && (
        <ResponsiveButton variant="contained" onClick={stopRecording}>Stop Recording</ResponsiveButton>
      )}
      {recordedVideoUrl && (
        <ResponsiveButton variant="contained" onClick={closeRecord}>Close</ResponsiveButton>
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
        <ResponsiveButton variant="contained" onClick={takePhoto}>Take Photo</ResponsiveButton>
      )}
    </div>

  );
};

export default ScreenRecorder;
