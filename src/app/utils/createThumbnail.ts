import fs from "fs";
import path from "path";
import sharp from "sharp";

async function resizeImage(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const width = metadata.width || 300;
    const height = metadata.height || 300;

    const newWidth = width > 300 ? 300 : width;
    const newHeight = Math.round((height / width) * newWidth);

    await image
      .resize(newWidth, newHeight)
      .extract({
        left: 0,
        top: 0,
        width: newWidth,
        height: Math.min(newHeight, 300),
      })
      .toFile(outputPath);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error processing image ${inputPath}: ${err.message}`);
    } else {
      console.error(`Unexpected error processing image ${inputPath}:`, err);
    }
  }
}

export async function createThumbnailForFile(filePath: string): Promise<void> {
  try {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const thumbnailName = "VHTMLR-THUMBNAIL";
    const outputFilePath = path.join(
      path.dirname(filePath),
      `${baseName}-${thumbnailName}${ext}`
    );

    if (fs.existsSync(outputFilePath) || baseName.includes(thumbnailName)) {
      return;
    }

    await resizeImage(filePath, outputFilePath);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error creating thumbnail for ${filePath}: ${err.message}`);
    } else {
      console.error(
        `Unexpected error creating thumbnail for ${filePath}:`,
        err
      );
    }
  }
}
