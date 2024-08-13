const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

// Resolve paths dynamically based on the current working directory
const BASE_PATH = path.resolve(process.cwd(), "public/.tmp/fail");

async function resizeImage(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    const width = image.bitmap.width;

    let newWidth = width > 300 ? 300 : width;

    // Resize image maintaining aspect ratio
    await image.resize(newWidth, Jimp.AUTO);

    // Crop the height to 300 if it exceeds
    if (image.bitmap.height > 300) {
      await image.crop(0, 0, newWidth, 300);
    }

    await image.writeAsync(outputPath);
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
          `${baseName}-thumbnail${ext}`
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
  const folders = ["actual", "diff"];

  const tasks = folders.map((folder) => {
    const folderPath = path.join(BASE_PATH, folder);
    return processDirectory(folderPath);
  });

  // Execute all directory processing tasks in parallel
  await Promise.all(tasks);
}

main().catch((err) => console.error(`Error in main: ${err.message}`));
