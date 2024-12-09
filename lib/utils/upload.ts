"server only";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; filename: string }> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename using crypto
    const ext = path.extname(file.name);
    const hash = crypto
      .createHash("sha1")
      .update(Date.now() + file.name)
      .digest("hex");
    const filename = `${hash}${ext}`;

    // Create the full path
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    const filePath = path.join(uploadDir, filename);
    const fileUrl = `/uploads/${folder}/${filename}`;

    // Ensure the directory exists
    await createDirectoryIfNotExists(uploadDir);

    // Write the file
    await writeFile(filePath, buffer);

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
  const { access, mkdir } = await import("fs/promises");
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}
