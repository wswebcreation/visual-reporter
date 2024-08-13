"use client";

import React from "react";
import styles from "./page.module.css";
import Description from "./components/Description";
import GetSnapshotData from "./hooks/getSnapshotData";

const Home: React.FC = () => {
  const { descriptionData, error, instanceData } = GetSnapshotData();

  console.log("instanceData = ", instanceData);

  return (
    <div className={styles.main}>
      <h1>WebdriverIO Visual Report</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div>
        {descriptionData.map((item, index) => (
          <Description
            key={index}
            description={item.description}
            data={item.data}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
