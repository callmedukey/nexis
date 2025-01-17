"server only";
import crypto from "crypto";
import { writeFile, access, mkdir, stat } from "fs/promises";
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

    // Create paths
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    const filePath = path.join(uploadDir, filename);
    // URL path now points to our API route
    const fileUrl = `/api/uploads/${folder}/${filename}`;

    // Ensure upload directory exists
    await createDirectoryIfNotExists(uploadDir);

    // Write the file
    await writeFile(filePath, buffer);

    // Verify the file was written successfully and has content
    try {
      const stats = await stat(filePath);
      if (stats.size === 0) {
        throw new Error("File was written but is empty");
      }

      // Verify file is accessible
      await access(filePath);
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
