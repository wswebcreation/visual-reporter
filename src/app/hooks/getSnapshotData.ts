import { useEffect, useRef, useState } from "react";
import { DescriptionData, SnapshotInstanceData } from "../types";
import { sortSnapshotData } from "../helpers/sortSnapshotData";

const GetSnapshotData = () => {
  const [descriptionData, setDescriptionData] = useState<DescriptionData[]>([]);
  const [instanceData, setInstanceData] = useState<SnapshotInstanceData>();
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
        const sortedData = sortSnapshotData(jsonData);
        setDescriptionData(sortedData.descriptionData);
        setInstanceData(sortedData.instanceData);
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

  return { descriptionData, error, instanceData };
};

export default GetSnapshotData;
