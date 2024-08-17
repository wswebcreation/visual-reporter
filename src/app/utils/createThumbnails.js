const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Resolve paths dynamically based on the current working directory
const BASE_PATH = path.resolve(process.cwd(), "public/.tmp/fail");

async function resizeImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    let width = metadata.width;
    let height = metadata.height;

    // Determine new width and height while maintaining aspect ratio
    let newWidth = width > 300 ? 300 : width;
    let newHeight = Math.round((height / width) * newWidth);

    // Resize and crop if necessary
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
    console.error(`Error processing image ${inputPath}: ${err.message}`);
  }
}

async function processDirectory(directory) {
  try {
    const files = await fs.promises.readdir(directory);

    const tasks = files.map(async (file) => {
      const filePath = path.join(directory, file);

      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        return processDirectory(filePath); // Recursive call for subdirectories
      }

      if (stats.isFile() && path.extname(file).toLowerCase() === ".png") {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const outputFilePath = path.join(
          directory,
          `${baseName}-thumbnail-sharp${ext}`
        );

        // Skip if the thumbnail already exists
        if (fs.existsSync(outputFilePath)) {
          console.log(`Thumbnail already exists: ${outputFilePath}`);
          return;
        }

        return resizeImage(filePath, outputFilePath);
      }
    });

    // Execute all tasks in parallel
    await Promise.all(tasks);
  } catch (err) {
    console.error(`Error processing directory ${directory}: ${err.message}`);
  }
}

async function main() {
  console.time("Total Execution Time");
  const folders = ["actual", "diff"];

  const tasks = folders.map((folder) => {
    const folderPath = path.join(BASE_PATH, folder);
    return processDirectory(folderPath);
  });

  // Execute all directory processing tasks in parallel
  await Promise.all(tasks);
  console.timeEnd("Total Execution Time");
}

main().catch((err) => console.error(`Error in main: ${err.message}`));
