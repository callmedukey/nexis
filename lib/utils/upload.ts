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
    const isGif = ext === ".gif";
    const hash = crypto
      .createHash("sha1")
      .update(Date.now() + file.name)
      .digest("hex");
    const filename = `${hash}${ext}`;
    const fileNameWithoutExt = hash;

    // Create paths - now using public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads", folder);
    const filePath = path.join(uploadDir, filename);

    // For GIFs, we'll use the original format instead of WebP
    const outputFilename = isGif ? filename : `${fileNameWithoutExt}.webp`;
    const outputPath = path.join(uploadDir, outputFilename);

    // URL paths for client
    const fileUrl = `/uploads/${folder}/${outputFilename}`;

    // Ensure upload directory exists
    await createDirectoryIfNotExists(uploadDir);

    // For GIFs, skip Sharp processing to preserve animation
    if (isGif) {
      // Save the original GIF directly
      await writeFile(outputPath, buffer);
    } else {
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
          .toFile(outputPath);
      } else if (folder === "events") {
        // Event images are larger at 1024px width
        await imageProcessor
          .resize(1024, null, {
            fit: "contain",
            withoutEnlargement: true,
          })
          .webp({ quality: 100, lossless: true })
          .toFile(outputPath);
      } else {
        // Standard size for all other images
        await imageProcessor
          .resize(640, null, {
            fit: "contain",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, lossless: true })
          .toFile(outputPath);
      }

      // Save original as backup
      await writeFile(filePath, buffer);
    }

    // Verify the files were written successfully
    try {
      const stats = await stat(outputPath);
      if (stats.size === 0) {
        throw new Error("Output file was written but is empty");
      }

      // Verify files are accessible
      await access(outputPath);
      if (!isGif) {
        await access(filePath); // Only check backup file for non-GIFs
      }
    } catch (error) {
      console.error("Failed to verify files:", error);
      throw new Error("Failed to verify file writes");
    }

    return {
      url: fileUrl,
      filename: outputFilename,
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
