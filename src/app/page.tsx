"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Description from "./components/Description";
import GetSnapshotData from "./hooks/getSnapshotData";
import SelectHeader from "./components/SelectHeader";
import { SelectedOptions, SnapshotInstanceData } from "./types";
import UseFilteredDescriptionData from "./hooks/filterSnapshotData";

const Home: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    app: [],
    browser: [],
    device: [],
    platform: [],
    status: "all",
  });
  const [loading, setLoading] = useState(true);
  const outputJsonPath =
    process.env.NEXT_PUBLIC_VISUAL_REPORT_OUTPUT_JSON_PATH ||
    "public/.tmp/fail/actual/output.json";

  const { descriptionData, error, instanceData } =
    GetSnapshotData(outputJsonPath);
  const handleSelectedOptions = (
    selectedOptions: string[] | keyof SelectedOptions,
    type: keyof typeof selectedOptions | string
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [type]: selectedOptions,
    }));
  };
  const filteredDescriptionData = UseFilteredDescriptionData(
    descriptionData,
    selectedOptions
  );

  useEffect(() => {
    if (descriptionData.length > 0 || error) {
      setLoading(false);
    }
  }, [descriptionData, error]);

  return (
    <div className={styles.main}>
      <h1>WebdriverIO Visual Report</h1>
      {loading ? (
        <div className={styles.loadingContainer}>
          <p className={styles.loading}>
            Please wait while we create your report. We are:
          </p>
          <ul>
            <li className={styles.loading}>fetching data</li>
            <li className={styles.loading}>creating thumbnails</li>
          </ul>
        </div>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <SelectHeader
            handleSelectedOptions={handleSelectedOptions}
            instanceData={instanceData as SnapshotInstanceData}
          />
          <div>
            {filteredDescriptionData.map((item, index) => (
              <Description
                data={item.data}
                description={item.description}
                key={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
