import React, { useEffect, useState } from "react";
import styles from "./Overlay.module.css";
import { MethodData } from "../types";
import OverlayHeader from "./OverlayHeader";
import Canvas from "./Canvas";

interface OverlayProps {
  data: MethodData;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ data, onClose }) => {
  const {
    fileData: { actualFilePath, baselineFilePath, diffFilePath },
    misMatchPercentage,
  } = data;

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const baselineImagePath = `/tmp/sauceLabsBaseline${
    baselineFilePath.split("/tests/sauceLabsBaseline")[1]
  }`;
  const actualImagePath = `/tmp/actual${
    actualFilePath.split("/.tmp/actual")[1]
  }`.replace("/tmp/", "/tmp/fail/");
  const diffImagePath = `/tmp/diff${
    diffFilePath.split("/.tmp/diff")[1]
  }`.replace("/tmp/", "/tmp/fail/");

  return (
    <div className={styles.overlay}>
      <OverlayHeader data={data} onClose={onClose} />
      <div className={styles.content}>
        <div className={styles.canvasContainer}>
          <Canvas
            imageSrc={baselineImagePath}
            transform={transform}
            setTransform={setTransform}
          />
          <Canvas
            imageSrc={
              parseFloat(misMatchPercentage) > 0
                ? diffImagePath
                : actualImagePath
            }
            transform={transform}
            setTransform={setTransform}
          />
        </div>
      </div>
    </div>
  );
};

export default Overlay;
