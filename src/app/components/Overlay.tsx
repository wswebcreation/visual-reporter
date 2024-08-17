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

  const {
    transform,
    setTransform,
    currentChange,
    handlePrevChange,
    handleNextChange,
    centerImage,
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
