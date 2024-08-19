import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function GET(req: NextRequest) {
  // Check if running in a static export context
  if (process.env.NEXT_PUBLIC_BUILD_MODE === "static") {
    return NextResponse.json(
      { error: "This route is not available during export" },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("filePath");

  if (!filePath) {
    return NextResponse.json(
      { error: "File path is required" },
      { status: 400 }
    );
  }

  const decodedFilePath = decodeURIComponent(filePath);

  if (!fs.existsSync(decodedFilePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(decodedFilePath);

  const contentType = decodedFilePath.endsWith(".png")
    ? "image/png"
    : decodedFilePath.endsWith(".jpg") || decodedFilePath.endsWith(".jpeg")
    ? "image/jpeg"
    : "application/octet-stream";

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
    },
  });
}
