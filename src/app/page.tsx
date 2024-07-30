"use client";

import React, { useEffect, useState, useRef } from "react";
import { DescriptionData } from "./types";
import styles from "./page.module.css";
import Description from "./components/Description";

const Home: React.FC = () => {
  const [data, setData] = useState<DescriptionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData: DescriptionData[] = await response.json();
        const sortedData = jsonData
          .sort((a, b) => a.description.localeCompare(b.description))
          .map((description) => ({
            ...description,
            data: description.data.map((test) => ({
              ...test,
              data: test.data.sort((methodA, methodB) => {
                const hasMismatchA = parseFloat(methodA.misMatchPercentage) > 0;
                const hasMismatchB = parseFloat(methodB.misMatchPercentage) > 0;

                if (hasMismatchA && !hasMismatchB) return -1;
                if (!hasMismatchA && hasMismatchB) return 1;

                // Sort by test name first
                const testCompare = methodA.test.localeCompare(methodB.test);
                if (testCompare !== 0) return testCompare;

                // Additional sorting criteria
                const platformCompare =
                  methodA.instanceData.platform.name.localeCompare(
                    methodB.instanceData.platform.name
                  );
                if (platformCompare !== 0) return platformCompare;

                const platformVersionA =
                  methodA.instanceData.platform.version || "";
                const platformVersionB =
                  methodB.instanceData.platform.version || "";
                const platformVersionCompare =
                  platformVersionA.localeCompare(platformVersionB);
                if (platformVersionCompare !== 0) return platformVersionCompare;

                const browserNameA = methodA.instanceData.browser?.name || "";
                const browserNameB = methodB.instanceData.browser?.name || "";
                const browserCompare = browserNameA.localeCompare(browserNameB);
                if (browserCompare !== 0) return browserCompare;

                const browserVersionA =
                  methodA.instanceData.browser?.version || "";
                const browserVersionB =
                  methodB.instanceData.browser?.version || "";
                const browserVersionCompare =
                  browserVersionA.localeCompare(browserVersionB);
                if (browserVersionCompare !== 0) return browserVersionCompare;

                const appCompare = (
                  methodA.instanceData.app || ""
                ).localeCompare(methodB.instanceData.app || "");
                return appCompare;
              }),
            })),
          }));
        setData(sortedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    if (!hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, []);

  return (
    <div className={styles.main}>
      <h1>WebdriverIO Visual Report</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div>
        {data.map((item, index) => (
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
