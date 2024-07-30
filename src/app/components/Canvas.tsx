import React, { useEffect, useRef, useCallback, useState } from "react";

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
}

const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  transform,
  setTransform,
  diffBoxes = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);

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

      diffBoxes.forEach((box) => {
        const boxX = box.left * (drawWidth / image.width) * scale + drawX;
        const boxY = box.top * (drawHeight / image.height) * scale + drawY;
        const boxWidth =
          (box.right - box.left) * (drawWidth / image.width) * scale;
        const boxHeight =
          (box.bottom - box.top) * (drawHeight / image.height) * scale;

        context.save();
        context.globalAlpha = 0.5;
        context.fillStyle = "rgba(255, 0, 255, 0.5)";
        context.fillRect(boxX, boxY, boxWidth, boxHeight);
        context.restore();

        if (hoveredBox && hoveredBox === box) {
          context.strokeStyle = "rgba(255, 0, 255, 1)";
          context.strokeRect(boxX, boxY, boxWidth, boxHeight);
          context.font = "12px Arial";
          context.fillStyle = "rgba(255, 0, 255, 1)";
          context.fillText("Changed", boxX, boxY - 5);
        }
      });
    },
    [diffBoxes, hoveredBox]
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - transform.x) / transform.scale;
    const y = (e.clientY - rect.top - transform.y) / transform.scale;

    const box = diffBoxes.find(
      (box) =>
        x >= box.left && x <= box.right && y >= box.top && y <= box.bottom
    );
    setHoveredBox(box || null);
  };

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

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      className="canvas"
      style={{ width: "50vw", height: "100%" }}
    />
  );
};

export default Canvas;
