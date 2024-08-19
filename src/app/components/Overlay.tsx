import React from "react";
import styles from "./Overlay.module.css";
import { MethodData } from "../types";
import OverlayHeader from "./OverlayHeader";
import Canvas from "./Canvas";
import { useChangeNavigation } from "../hooks/useChangeNavigation";

interface OverlayProps {
  data: MethodData;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ data, onClose }) => {
  const {
    boundingBoxes: { diffBoundingBoxes = [] },
    fileData: { actualFilePath, baselineFilePath },
  } = data;
  const isStatic = process.env.NEXT_PUBLIC_BUILD_MODE === "static";
  let baselineImagePath;
  let actualImagePath;
  if (isStatic) {
    baselineImagePath = baselineFilePath;
    actualImagePath = actualFilePath;
  } else {
    baselineImagePath = `/api/image?filePath=${encodeURIComponent(
      baselineFilePath
    )}`;
    actualImagePath = `/api/image?filePath=${encodeURIComponent(
      actualFilePath
    )}`;
  }

  const {
    transform,
    setTransform,
    currentChange,
    handlePrevChange,
    handleNextChange,
  } = useChangeNavigation(diffBoundingBoxes, actualImagePath);

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
