import React, { useState, useEffect, useCallback } from "react";
import styles from "./Overlay.module.css";
import { MethodData } from "../types";
import OverlayHeader from "./OverlayHeader";
import Canvas from "./Canvas";

interface BoundingBox {
  bottom: number;
  right: number;
  left: number;
  top: number;
}

interface OverlayProps {
  data: MethodData;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ data, onClose }) => {
  const {
    boundingBoxes: { diffBoundingBoxes = [] },
    fileData: { actualFilePath, baselineFilePath, diffFilePath },
    misMatchPercentage,
  } = data;

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [currentChange, setCurrentChange] = useState(-1); // Initially set to -1 to indicate no change focused

  // @TODO: This needs to be changed in the future when the report is live
  const baselineImagePath = `/tmp/sauceLabsBaseline${
    baselineFilePath.split("/tests/sauceLabsBaseline")[1]
  }`;
  const actualImagePath = `/tmp/actual${
    actualFilePath.split("/.tmp/actual")[1]
  }`.replace("/tmp/", "/tmp/fail/");
  // const diffImagePath = `/tmp/diff${
  //   diffFilePath.split("/.tmp/diff")[1]
  // }`.replace("/tmp/", "/tmp/fail/`);

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

  const centerImage = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const centerChange = useCallback(
    (index: number) => {
      if (index === -1) {
        centerImage();
        return;
      }

      if (index < 0 || index >= diffBoundingBoxes.length) return;

      const box = diffBoundingBoxes[index];
      const canvas = document.querySelector(
        ".diffContainer canvas"
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const { width: canvasWidth, height: canvasHeight } =
        canvas.getBoundingClientRect();

      const image = new Image();
      image.src = actualImagePath;

      image.onload = () => {
        const imageWidth = image.width;
        const imageHeight = image.height;
        const aspectRatio = imageWidth / imageHeight;

        let drawWidth, drawHeight;
        if (canvasWidth / canvasHeight > aspectRatio) {
          drawHeight = canvasHeight;
          drawWidth = drawHeight * aspectRatio;
        } else {
          drawWidth = canvasWidth;
          drawHeight = drawWidth / aspectRatio;
        }

        const scale = 2;
        const drawX = (canvasWidth - drawWidth * scale) / 2;
        const drawY = (canvasHeight - drawHeight * scale) / 2;

        const transformedBoxes = getTransformedBoxes(
          [box],
          drawWidth,
          drawHeight,
          drawX,
          drawY,
          imageWidth,
          imageHeight,
          scale
        );

        const transformedBox = transformedBoxes[0];
        const centerX = (transformedBox.left + transformedBox.right) / 2;
        const centerY = (transformedBox.top + transformedBox.bottom) / 2;

        setTransform({
          x: canvasWidth / 2 - centerX,
          y: canvasHeight / 2 - centerY,
          scale: scale,
        });
      };
    },
    [diffBoundingBoxes, actualImagePath, getTransformedBoxes, centerImage]
  );

  useEffect(() => {
    if (currentChange === -1) {
      centerImage();
    } else if (currentChange >= 0 && diffBoundingBoxes.length > 0) {
      centerChange(currentChange);
    }
  }, [currentChange, diffBoundingBoxes, centerChange, centerImage]);

  const handlePrevChange = () => {
    setCurrentChange((prev) => {
      if (prev === -1) {
        return diffBoundingBoxes.length - 1;
      }
      if (prev === 0) {
        centerImage();
        return -1;
      }
      return prev - 1;
    });
  };

  const handleNextChange = () => {
    setCurrentChange((prev) => {
      if (prev === diffBoundingBoxes.length - 1) {
        centerImage();
        return -1;
      }
      return prev + 1;
    });
  };

  return (
    <div className={styles.overlay}>
      <OverlayHeader
        data={data}
        onClose={onClose}
        currentChange={currentChange}
        totalChanges={diffBoundingBoxes.length}
        onPrevChange={handlePrevChange}
        onNextChange={handleNextChange}
      />
      <div className={styles.content}>
        <div className={`${styles.canvasContainer} diffContainer`}>
          <Canvas
            imageSrc={baselineImagePath}
            transform={transform}
            setTransform={setTransform}
          />
          <Canvas
            imageSrc={actualImagePath}
            transform={transform}
            setTransform={setTransform}
            diffBoxes={diffBoundingBoxes}
            highlightedBox={
              currentChange !== -1 ? diffBoundingBoxes[currentChange] : null
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Overlay;
