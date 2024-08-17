import React, { useRef, useEffect } from "react";
import styles from "./Canvas.module.css";
import { BoundingBox } from "../types";
import { useImageLoader } from "../hooks/useImageLoader";
import { useTransform } from "../hooks/useTransform";
import { useCanvasDrawing } from "../hooks/useCanvasDrawing";

interface CanvasProps {
  imageSrc: string;
  transform: { x: number; y: number; scale: number };
  setTransform: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; scale: number }>
  >;
  diffBoxes?: BoundingBox[];
  highlightedBox?: BoundingBox | null;
}

const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  transform,
  setTransform,
  diffBoxes = [],
  highlightedBox = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useImageLoader(imageSrc, () => {});

  const { handleMouseDown, handleWheel } = useTransform(
    transform,
    setTransform
  );

  useCanvasDrawing(imageRef, canvasRef, transform, diffBoxes, highlightedBox);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  const classes = [
    diffBoxes.length > 0 ? "diffContainer" : "",
    styles.canvas,
  ].join(" ");

  return (
    <canvas ref={canvasRef} onMouseDown={handleMouseDown} className={classes} />
  );
};

export default Canvas;
