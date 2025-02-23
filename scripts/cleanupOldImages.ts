import fs from "fs/promises";
import path from "path";

const TARGET_DIR: string = "./public/uploads";

async function isOldImageFormat(filePath: string): Promise<boolean> {
  const imageExtensions: string[] = [".jpg", ".jpeg", ".png"];
  return imageExtensions.includes(path.extname(filePath).toLowerCase());
}

async function hasWebPVersion(filePath: string): Promise<boolean> {
  const directory = path.dirname(filePath);
  const filename = path.parse(filePath).name;
  const webpPath = path.join(directory, `${filename}.webp`);

  try {
    await fs.access(webpPath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupDirectory(directoryPath: string): Promise<void> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await cleanupDirectory(fullPath);
    } else if (entry.isFile()) {
      if (await isOldImageFormat(fullPath)) {
        // Check if WebP version exists before deleting
        if (await hasWebPVersion(fullPath)) {
          console.log(`Removing old image: ${fullPath}`);
          await fs.unlink(fullPath);
        } else {
          console.log(
            `Warning: No WebP version found for ${fullPath}, keeping original`
          );
        }
      }
    }
  }
}

async function cleanup(): Promise<void> {
  try {
    console.log("Starting cleanup of old image files...");
    await cleanupDirectory(TARGET_DIR);
    console.log("Cleanup completed successfully!");
  } catch (error) {
    console.error(
      "Error during cleanup:",
      error instanceof Error ? error.message : error
    );
  }
}

// Run the cleanup
cleanup();
