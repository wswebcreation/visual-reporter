import Image from "next/image";
import styles from "./LoadingContainer.module.css";

const LoadingContainer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image
          src="/static/img/logo-webdriver-io.png"
          alt="WebdriverIO Visual Report"
          width={50}
          height={50}
        />
        <h1>Visual Report</h1>
      </div>
      <p className={styles.text}>
        Please wait while we create your report. We are:
      </p>
      <ul>
        <li className={styles.text}>fetching data</li>
        <li className={styles.text}>creating thumbnails</li>
      </ul>
    </div>
  );
};

export default LoadingContainer;
