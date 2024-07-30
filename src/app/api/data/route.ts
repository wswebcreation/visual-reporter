import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DescriptionData } from "../../types";

export async function GET(req: NextRequest) {
  const filePath = path.join(
    process.cwd(),
    "public",
    ".tmp",
    "fail",
    "actual",
    "output.json"
  );
  try {
    const jsonData: DescriptionData[] = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
    return NextResponse.json(jsonData, { status: 200 });
  } catch (error) {
    console.error("Failed to read data:", error);
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}
