"server only";
import crypto from "crypto";
import { writeFile, access, mkdir, chmod, stat } from "fs/promises";
import path from "path";

export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; filename: string }> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename using crypto
    const ext = path.extname(file.name).toLowerCase();
    const hash = crypto
      .createHash("sha1")
      .update(Date.now() + file.name)
      .digest("hex");
    const filename = `${hash}${ext}`;

    // Create the full path - ensure we're in the public directory
    const publicDir = path.join(process.cwd(), "public");
    const uploadDir = path.join(publicDir, "uploads", folder);
    const filePath = path.join(uploadDir, filename);
    const fileUrl = `/uploads/${folder}/${filename}`;

    // Ensure the public directory exists
    await createDirectoryIfNotExists(publicDir);
    // Ensure the uploads directory exists
    await createDirectoryIfNotExists(path.join(publicDir, "uploads"));
    // Ensure the specific folder exists
    await createDirectoryIfNotExists(uploadDir);

    // Write the file
    await writeFile(filePath, buffer);

    // Verify the file was written successfully and has content
    try {
      const stats = await stat(filePath);
      if (stats.size === 0) {
        throw new Error("File was written but is empty");
      }
    } catch (error) {
      console.error("Failed to verify file:", error);
      throw new Error("Failed to verify file write");
    }

    return {
      url: fileUrl,
      filename,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

async function createDirectoryIfNotExists(dir: string) {
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}
