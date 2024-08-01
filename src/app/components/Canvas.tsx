import React, { useEffect, useRef, useCallback } from "react";
import styles from "./Canvas.module.css";

interface BoundingBox {
  bottom: number;
  right: number;
  left: number;
  top: number;
}

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
  const imageRef = useRef<HTMLImageElement>(new Image());
  const transformedBoxesRef = useRef<BoundingBox[]>([]);

  const getTransformedBoxes = useCallback(
    (
      boxes: BoundingBox[],
      drawWidth: number,
      drawHeight: number,
      drawX: number,
      drawY: number,
      imageWidth: number,
      imageHeight: number,
      scale: number
    ): BoundingBox[] =>
      boxes.map((box) => ({
        left: box.left * (drawWidth / imageWidth) * scale + drawX,
        top: box.top * (drawHeight / imageHeight) * scale + drawY,
        right: box.right * (drawWidth / imageWidth) * scale + drawX,
        bottom: box.bottom * (drawHeight / imageHeight) * scale + drawY,
      })),
    []
  );

  const translateBox = useCallback(
    (
      box: BoundingBox,
      drawWidth: number,
      drawHeight: number,
      drawX: number,
      drawY: number,
      imageWidth: number,
      imageHeight: number,
      scale: number
    ): BoundingBox => {
      return {
        left: box.left * (drawWidth / imageWidth) * scale + drawX,
        top: box.top * (drawHeight / imageHeight) * scale + drawY,
        right: box.right * (drawWidth / imageWidth) * scale + drawX,
        bottom: box.bottom * (drawHeight / imageHeight) * scale + drawY,
      };
    },
    []
  );

  const drawImage = useCallback(
    (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
      transform: { x: number; y: number; scale: number }
    ) => {
      const { x, y, scale } = transform;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = image.width / image.height;

      let drawWidth, drawHeight;
      if (canvasWidth / canvasHeight > aspectRatio) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * aspectRatio;
      } else {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / aspectRatio;
      }

      const drawX = x + (canvasWidth - drawWidth * scale) / 2;
      const drawY = y + (canvasHeight - drawHeight * scale) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        drawX,
        drawY,
        drawWidth * scale,
        drawHeight * scale
      );

      const newTransformedBoxes = getTransformedBoxes(
        diffBoxes,
        drawWidth,
        drawHeight,
        drawX,
        drawY,
        image.width,
        image.height,
        scale
      );
      transformedBoxesRef.current = newTransformedBoxes;

      newTransformedBoxes.forEach((box) => {
        const boxWidth = box.right - box.left;
        const boxHeight = box.bottom - box.top;

        context.save();
        context.globalAlpha = 0.5;
        context.fillStyle = "rgba(255, 0, 255, 0.5)";
        context.fillRect(box.left, box.top, boxWidth, boxHeight);

        if (highlightedBox) {
          const translatedBox = translateBox(
            highlightedBox,
            drawWidth,
            drawHeight,
            drawX,
            drawY,
            image.width,
            image.height,
            scale
          );
          if (
            Math.abs(box.left - translatedBox.left) < 1 &&
            Math.abs(box.top - translatedBox.top) < 1 &&
            Math.abs(box.right - translatedBox.right) < 1 &&
            Math.abs(box.bottom - translatedBox.bottom) < 1
          ) {
            // Add animated effect
            const existingCircles = document.querySelectorAll(
              `.${styles["highlight-circle"]}`
            );
            existingCircles.forEach((circle) => circle.remove());

            const circle = document.createElement("div");
            circle.className = styles["highlight-circle"];
            circle.style.left = `${
              canvas.width + (box.left + box.right) / 2
            }px`;
            circle.style.top = `${(box.top + box.bottom) / 2}px`;

            // Append the circle to the canvas container instead of the canvas parent
            canvas.parentElement?.appendChild(circle);

            setTimeout(() => {
              circle.remove();
            }, 1000);
          }
        }
        context.restore();
      });
    },
    [diffBoxes, getTransformedBoxes, highlightedBox, translateBox]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...transform };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setTransform({
        ...startTransform,
        x: startTransform.x + dx,
        y: startTransform.y + dy,
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = e.deltaY * -0.01;
      setTransform((prev) => ({
        ...prev,
        scale: Math.min(Math.max(0.1, prev.scale + scaleAmount), 5),
      }));
    },
    [setTransform]
  );

  useEffect(() => {
    imageRef.current.src = imageSrc;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const style = window.getComputedStyle(canvas);
      const width = parseInt(style.width);
      const height = parseInt(style.height);

      // Ensure the canvas dimensions are set correctly
      canvas.width = width;
      canvas.height = height;

      drawImage(imageRef.current, canvas, context, transform);
    };

    const canvas = canvasRef.current;
    window.addEventListener("resize", handleResize);
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }
    imageRef.current.onload = handleResize;
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [drawImage, imageSrc, transform, handleWheel]);

  const classes = [
    diffBoxes.length > 0 ? "diffContainer" : "",
    styles.canvas,
  ].join(" ");

  return (
    <canvas ref={canvasRef} onMouseDown={handleMouseDown} className={classes} />
  );
};

export default Canvas;
