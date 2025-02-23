"server only";
import crypto from "crypto";
import { writeFile, access, mkdir, stat } from "fs/promises";
import path from "path";

import sharp from "sharp";

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
    const fileNameWithoutExt = hash;

    // Create paths - now using public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads", folder);
    const filePath = path.join(uploadDir, filename);
    const webpPath = path.join(uploadDir, `${fileNameWithoutExt}.webp`);

    // URL paths for client
    const fileUrl = `/uploads/${folder}/${fileNameWithoutExt}.webp`;

    // Ensure upload directory exists
    await createDirectoryIfNotExists(uploadDir);

    // Process and save the image with different sizes based on folder
    const imageProcessor = sharp(buffer);

    if (folder === "categories") {
      // Categories images are tiny but high quality
      await imageProcessor
        .resize(50, null, {
          fit: "contain",
          withoutEnlargement: true,
        })
        .webp({ quality: 100, lossless: true })
        .toFile(webpPath);
    } else {
      // Standard size for all other images
      await imageProcessor
        .resize(640, null, {
          fit: "contain",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, lossless: true })
        .toFile(webpPath);
    }

    // Save original as backup
    await writeFile(filePath, buffer);

    // Verify the files were written successfully
    try {
      const stats = await stat(webpPath);
      if (stats.size === 0) {
        throw new Error("WebP file was written but is empty");
      }

      // Verify files are accessible
      await access(webpPath);
      await access(filePath);
    } catch (error) {
      console.error("Failed to verify files:", error);
      throw new Error("Failed to verify file writes");
    }

    return {
      url: fileUrl,
      filename: `${fileNameWithoutExt}.webp`,
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
