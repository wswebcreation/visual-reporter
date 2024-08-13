import { useEffect, useRef, useState } from "react";
import { DescriptionData } from "../types";
import { sortSnapshotData } from "../helpers/sortSnapshotData";

const GetSnapshotData = () => {
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
        const sortedData = sortSnapshotData(jsonData);
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

  return { data, error };
};

export default GetSnapshotData;
