import type { Stats } from "fs";
import fs from "fs/promises";
import path from "path";

import sharp from "sharp";

const SOURCE_DIR: string = "./uploads";
const TARGET_DIR: string = "./public/uploads";

async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
}

async function processImage(
  sourcePath: string,
  targetDir: string,
  filename: string
): Promise<void> {
  const fileNameWithoutExt: string = path.parse(filename).name;

  // Move original file
  const originalTargetPath: string = path.join(targetDir, filename);
  await fs.copyFile(sourcePath, originalTargetPath);

  // Create main WebP version (lossless, 100% quality)
  const mainWebpPath: string = path.join(
    targetDir,
    `${fileNameWithoutExt}.webp`
  );
  await sharp(sourcePath)
    .webp({ lossless: true, quality: 100 })
    .toFile(mainWebpPath);

  // Create placeholder version (highly compressed)
  const placeholderWebpPath: string = path.join(
    targetDir,
    `${fileNameWithoutExt}ph.webp`
  );
  await sharp(sourcePath)
    .webp({ quality: 20 }) // Low quality for smaller file size
    .toFile(placeholderWebpPath);

  // Delete original file from source directory after successful processing
  await fs.unlink(sourcePath);
}

async function isImage(filePath: string): Promise<boolean> {
  const imageExtensions: string[] = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
  ];
  return imageExtensions.includes(path.extname(filePath).toLowerCase());
}

async function processFiles(
  sourcePath: string,
  targetPath: string
): Promise<void> {
  const stats: Stats = await fs.stat(sourcePath);

  if (stats.isDirectory()) {
    // Create corresponding directory in target
    await ensureDirectoryExists(targetPath);

    // Process all files in directory
    const files = await fs.readdir(sourcePath);
    for (const file of files) {
      const currentSourcePath = path.join(sourcePath, file);
      const currentTargetPath = path.join(targetPath, file);
      await processFiles(currentSourcePath, currentTargetPath);
    }

    // Try to remove directory if empty
    try {
      const remainingFiles = await fs.readdir(sourcePath);
      if (remainingFiles.length === 0) {
        await fs.rmdir(sourcePath);
      }
    } catch {
      console.log(`Could not remove directory: ${sourcePath}`);
    }
  } else if (stats.isFile()) {
    if (await isImage(sourcePath)) {
      // Process image files
      console.log(`Processing image: ${sourcePath}`);
      await processImage(
        sourcePath,
        path.dirname(targetPath),
        path.basename(sourcePath)
      );
    } else {
      // Move non-image files
      console.log(`Moving file: ${sourcePath}`);
      await fs.copyFile(sourcePath, targetPath);
      await fs.unlink(sourcePath);
    }
  }
}

async function processDirectory(): Promise<void> {
  try {
    console.log("Starting file processing...");
    await processFiles(SOURCE_DIR, TARGET_DIR);
    console.log("All files processed successfully!");
  } catch (error) {
    console.error(
      "Error processing files:",
      error instanceof Error ? error.message : error
    );
  }
}

// Run the script
processDirectory();
