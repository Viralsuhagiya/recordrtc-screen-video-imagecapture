import React, { useRef, useState } from 'react';
import RecordRTC from 'recordrtc';
import { syncAll } from './uploadS3';
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  switchButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
};

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const videoRef2 = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [mixedStream, setMixedStream] = useState([]);
  const [facingMode, setFacingMode] = useState('environment');


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
  
  const switchCameraFacingMode = () => {
    if (facingMode === 'environment') {
      setFacingMode('user');
    } else {
      setFacingMode('environment');
    }
  };

  const startRecording = async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia({video: { facingMode },
      audio: true });
    
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
        <ResponsiveButton variant="contained" onClick={syncAll}>Sync All</ResponsiveButton>
      )}
      
      {recordedVideoUrl && (
        <ResponsiveButton variant="contained" onClick={closeRecord}>Close</ResponsiveButton>
      )}
      {recordedVideoUrl && (
        <video  style={{ paddingTop: 20, maxWidth: '100%', height: 'auto' }} src={recordedVideoUrl} controls autoPlay />
      )}
    <video ref={videoRef2} style={{ maxWidth: '100%', height: 'auto' }}/>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!recording && capturedImages.map((imageUrl) => (
        <img key={imageUrl} src={imageUrl} alt="test" style={{ maxWidth: '100%', height: 'auto', padding: '5px' }} />
      ))}
    </div>
    {!cameraStream && facingMode === 'environment' && <ResponsiveButton variant="contained" onClick={switchCameraFacingMode}>Front Camera</ResponsiveButton>}
    {!cameraStream && facingMode !== 'environment' && <ResponsiveButton variant="contained" onClick={switchCameraFacingMode}>Back Camera</ResponsiveButton>}
      {cameraStream && (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ResponsiveButton variant="contained" onClick={takePhoto}>Take Photo</ResponsiveButton>
        <ResponsiveButton variant="contained" onClick={stopRecording}>Stop Recording</ResponsiveButton>
      </div>
    )}
    </div>
  );
};

export default ScreenRecorder;
