// src/components/RecordView.jsx

import { useReactMediaRecorder } from 'react-media-recorder';

export const RecordView = () => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true, screen: true });

  return (
    <div>
      <h2>Screen Recorder</h2>
      <p>{status}</p>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      {mediaBlobUrl && (
        <div>
          <video src={mediaBlobUrl} controls autoPlay></video>
          <a href={mediaBlobUrl} download>Download Video</a>
        </div>
      )}
    </div>
  );
};
