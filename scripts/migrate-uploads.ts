import { copyFile, readdir, mkdir, stat } from "fs/promises";
import { join } from "path";

async function migrateDirectory(sourcePath: string, targetPath: string) {
  // Create target directory
  await mkdir(targetPath, { recursive: true });

  // Read all items in the source directory
  const items = await readdir(sourcePath, { withFileTypes: true });

  for (const item of items) {
    const sourceItemPath = join(sourcePath, item.name);
    const targetItemPath = join(targetPath, item.name);

    if (item.isDirectory()) {
      // Recursively migrate subdirectory
      await migrateDirectory(sourceItemPath, targetItemPath);
    } else {
      // Copy file
      await copyFile(sourceItemPath, targetItemPath);
      console.log(`Migrated: ${item.name}`);
    }
  }
}

async function migrateUploads() {
  try {
    const oldUploadsDir = join(process.cwd(), "public/uploads");
    const newUploadsDir = join(process.cwd(), "uploads");

    // Check if old uploads directory exists
    try {
      await stat(oldUploadsDir);
    } catch (error) {
      console.log("No existing uploads to migrate");
      return;
    }

    // Migrate all contents recursively
    await migrateDirectory(oldUploadsDir, newUploadsDir);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateUploads();
