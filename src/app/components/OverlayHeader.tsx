import { MethodData } from "../types";
import BrowserIcon, { BrowserName } from "./BrowserIcon";
import styles from "./OverlayHeader.module.css";
import PlatformIcon, { PlatformName } from "./PlatformIcon";

interface OverlayProps {
  data: MethodData;
  onClose: () => void;
}

const OverlayHeader: React.FC<OverlayProps> = ({ data, onClose }) => {
  const {
    commandName,
    description,
    instanceData: { browser, deviceName, platform },
    fileData: { actualFilePath, diffFilePath },
    misMatchPercentage,
    tag,
    test,
  } = data;
  const notKnown = "not-known";
  const browserName = browser?.name || notKnown;
  const browserVersion =
    browser?.version === "not-known" ? notKnown : browser?.version;
  const device = deviceName || notKnown;
  const platformVersion = platform.version || notKnown;

  return (
    <header className={styles.header}>
      <div className={styles.headerTextWrapper}>
        <div className={styles.headerContent}>
          <div className={styles.testContainer}>
            <div className={styles.description}>
              <h3>{description}</h3>
            </div>
            <div className={styles.test}>
              <p>
                {test} | {tag}
              </p>
            </div>
          </div>
          <div className={styles.controls}>Controls</div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.instanceDataWrapper}>
        <div className={styles.baselineContainer}>
          <h3>Baseline:</h3>
          <PlatformIcon platformName={platform.name as PlatformName} />
          {platformVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {platformVersion}
            </>
          )}
          <span className={styles.divider}>|</span>
          <BrowserIcon
            className={styles.browserIcon}
            browserName={browserName as BrowserName}
          />
          {browserVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {browserVersion}
            </>
          )}
          {device !== notKnown && (
            <>
              <span className={styles.divider}>|</span> {device}
            </>
          )}
        </div>
        <div className={styles.actualContainer}>
          <h3>Actual:</h3>
          <PlatformIcon platformName={platform.name as PlatformName} />
          <span className={styles.divider} />
          {platformVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {platformVersion}
            </>
          )}
          <span className={styles.divider}>|</span>
          <BrowserIcon
            className={styles.browserIcon}
            browserName={browserName as BrowserName}
          />
          {browserVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {browserVersion}
            </>
          )}
          {device !== notKnown && (
            <>
              <span className={styles.divider}>|</span> {device}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default OverlayHeader;
