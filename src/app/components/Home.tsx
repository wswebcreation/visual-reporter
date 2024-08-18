"use client";

import React, { useEffect, useState } from "react";
import Description from "./Description";
import SelectHeader from "./SelectHeader";
import {
  SelectedOptions,
  SnapshotInstanceData,
  DescriptionData,
} from "../types";
import UseFilteredDescriptionData from "../hooks/filterSnapshotData";
import styles from "./home.module.css";
import { sortSnapshotData } from "../utils/sortSnapshotData";

interface HomeProps {
  initialData: DescriptionData[];
}

const Home: React.FC<HomeProps> = ({ initialData }) => {
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    app: [],
    browser: [],
    device: [],
    platform: [],
    status: "all",
  });
  const { descriptionData, instanceData } = sortSnapshotData(initialData);
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
    setLoading(false);
  }, []);

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
