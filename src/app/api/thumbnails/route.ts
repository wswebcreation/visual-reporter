import { NextRequest, NextResponse } from "next/server";
import { DescriptionData } from "../../types";
import { createThumbnailForFile } from "@/app/utils/createThumbnail";

export async function POST(req: NextRequest) {
  try {
    const jsonData: DescriptionData[] = await req.json();

    for (const description of jsonData) {
      for (const testData of description.data) {
        for (const methodData of testData.data) {
          const { fileData } = methodData;
          if (fileData?.actualFilePath) {
            await createThumbnailForFile(fileData.actualFilePath);
          }
          if (fileData?.diffFilePath) {
            await createThumbnailForFile(fileData.diffFilePath);
          }
        }
      }
    }

    return NextResponse.json(
      { message: "Thumbnails created successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating thumbnails:", error);
    return NextResponse.json(
      { error: "Failed to create thumbnails" },
      { status: 500 }
    );
  }
}
