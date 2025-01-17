"server only";
import crypto from "crypto";
import { writeFile, access, mkdir, chmod } from "fs/promises";
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

    // Create the full path - store directly in public
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    const filePath = path.join(uploadDir, filename);
    // URL path should be relative to public
    const fileUrl = `/uploads/${folder}/${filename}`;

    // Ensure the directory exists with proper permissions
    await createDirectoryIfNotExists(uploadDir);

    // Write the file
    await writeFile(filePath, buffer);

    // Set proper permissions after writing
    try {
      await chmod(filePath, 0o644);
      await chmod(uploadDir, 0o755);
    } catch (error) {
      console.error("Failed to set permissions:", error);
      // Don't throw here as the file was written successfully
    }

    // Verify the file was written successfully
    try {
      await access(filePath);
    } catch (error) {
      console.error("Failed to verify file write:", error);
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
    // Create directory with proper permissions
    await mkdir(dir, { recursive: true });
    try {
      await chmod(dir, 0o755);
    } catch (error) {
      console.error("Failed to set directory permissions:", error);
    }
  }
}
