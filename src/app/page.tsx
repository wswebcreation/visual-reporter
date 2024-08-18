import React from "react";
import Home from "./components/Home";
import { readFileSync } from "fs";

const Page = async () => {
  const outputJsonPath =
    process.env.NEXT_PUBLIC_VISUAL_REPORT_OUTPUT_JSON_PATH ||
    "public/.tmp/fail/actual/output.json";
  const data = JSON.parse(readFileSync(outputJsonPath, "utf-8"));

  return <Home initialData={data} />;
};

export default Page;
