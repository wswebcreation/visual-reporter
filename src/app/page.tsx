"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Description from "./components/Description";
import GetSnapshotData from "./hooks/getSnapshotData";
import SelectHeader from "./components/SelectHeader";
import { SelectedOptions, SnapshotInstanceData } from "./types";
import UseFilteredDescriptionData from "./hooks/filterSnapshotData";

const Home: React.FC = () => {
  const outputJsonPath =
    process.env.NEXT_PUBLIC_VISUAL_REPORT_OUTPUT_JSON_PATH ||
    "public/.tmp/fail/actual/output.json";
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    app: [],
    browser: [],
    device: [],
    platform: [],
    status: "all",
  });
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

  return (
    <div className={styles.main}>
      <h1>WebdriverIO Visual Report</h1>
      {error && <p className={styles.error}>{error}</p>}
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
    </div>
  );
};

export default Home;
