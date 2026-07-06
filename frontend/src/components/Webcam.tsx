import { forwardRef, useImperativeHandle, useRef } from "react";
import Webcam from "react-webcam";

export type WebcamComponentHandle = {
  capture: () => string | null;
};

type WebcamComponentProps = {
  onScreenshot: (imageSrc: string | null) => void;
};

export const WebcamComponent = forwardRef<
  WebcamComponentHandle,
  WebcamComponentProps
>(({ onScreenshot }, ref) => {
  const webcamRef = useRef<Webcam>(null);

  useImperativeHandle(ref, () => ({
    capture() {
      const imageSrc = webcamRef.current?.getScreenshot() ?? null;
      onScreenshot(imageSrc);
      if (!imageSrc) return null;
      return imageSrc.split(",")[1];
    },
  }));

  return <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />;
});
