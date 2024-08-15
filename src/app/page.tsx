"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import Description from "./components/Description";
import GetSnapshotData from "./hooks/getSnapshotData";
import SelectHeader from "./components/SelectHeader";
import {
  SnapshotInstanceData,
  DescriptionData,
  TestData,
  MethodData,
} from "./types";

const Home: React.FC = () => {
  const { descriptionData, error, instanceData } = GetSnapshotData();

  const [selectedOptions, setSelectedOptions] = useState({
    app: [] as string[],
    browser: [] as string[],
    device: [] as string[],
    platform: [] as string[],
    status: "all" as "all" | "passed" | "failed",
  });

  const handleSelectOptions = (
    selectedOptions: string[] | "all" | "passed" | "failed",
    type: keyof typeof selectedOptions | string
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [type]: selectedOptions,
    }));
  };

  const filteredDescriptionData = useMemo(() => {
    return descriptionData
      .map((item: DescriptionData) => {
        const filteredTests = item.data
          .map((test: TestData) => {
            const filteredMethods = test.data.filter((method: MethodData) => {
              const appMatch =
                !selectedOptions.app.length ||
                selectedOptions.app.includes(item.description);
              const browserMatch =
                !selectedOptions.browser.length ||
                selectedOptions.browser.includes(
                  `${method.instanceData.browser?.name}-${method.instanceData.browser?.version}` ||
                    ""
                );
              const deviceMatch =
                !selectedOptions.device.length ||
                selectedOptions.device.includes(
                  method.instanceData.deviceName || ""
                );
              const platformMatch =
                !selectedOptions.platform.length ||
                selectedOptions.platform.includes(
                  `${method.instanceData.platform.name}-${method.instanceData.platform.version}` ||
                    ""
                );
              const statusMatch =
                selectedOptions.status === "all" ||
                (selectedOptions.status === "passed" &&
                  parseFloat(method.misMatchPercentage) === 0) ||
                (selectedOptions.status === "failed" &&
                  parseFloat(method.misMatchPercentage) > 0);

              return (
                appMatch &&
                browserMatch &&
                deviceMatch &&
                platformMatch &&
                statusMatch
              );
            });

            return { ...test, data: filteredMethods };
          })
          .filter((test) => test.data.length > 0);

        return { ...item, data: filteredTests };
      })
      .filter((item) => item.data.length > 0);
  }, [descriptionData, selectedOptions]);

  return (
    <div className={styles.main}>
      <h1>WebdriverIO Visual Report</h1>
      {error && <p className={styles.error}>{error}</p>}
      <SelectHeader
        handleSelectOptions={handleSelectOptions}
        instanceData={instanceData as SnapshotInstanceData}
      />
      <div>
        {filteredDescriptionData.map((item, index) => (
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
