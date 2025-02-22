import prisma from "@/lib/prisma";

async function updateImageUrls() {
  try {
    console.log("Starting to update image URLs and filetypes...");

    // Get and display productMainImages before update
    const mainImagesBefore = await prisma.productMainImage.findMany({
      where: {
        OR: [
          { url: { startsWith: "/api/uploads" } },
          { url: { endsWith: ".jpg" } },
          { filetype: "image/jpg" },
        ],
      },
      select: {
        id: true,
        url: true,
        filetype: true,
      },
    });

    console.log("\nProduct Main Images to be updated:");
    mainImagesBefore.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`From URL: ${img.url}`);
      console.log(`From type: ${img.filetype}`);
      console.log(
        `To URL: ${img.url
          .replace("/api/uploads", "/uploads")
          .replace(".jpg", ".webp")}`
      );
      console.log(`To type: image/webp`);
      console.log("---");
    });

    // Update productMainImages
    const mainImagesResult = await prisma.$executeRaw`
      UPDATE "ProductMainImage"
      SET 
        url = REPLACE(REPLACE(url, '/api/uploads', '/uploads'), '.jpg', '.webp'),
        filetype = 'image/webp'
      WHERE url LIKE '/api/uploads%' OR url LIKE '%.jpg' OR filetype = 'image/jpg'
    `;

    console.log(`\nUpdated ${mainImagesResult} product main images`);

    // Get and display productImages before update
    const productImagesBefore = await prisma.productImage.findMany({
      where: {
        OR: [
          { url: { startsWith: "/api/uploads" } },
          { url: { endsWith: ".jpg" } },
          { filetype: "image/jpg" },
        ],
      },
      select: {
        id: true,
        url: true,
        filetype: true,
      },
    });

    console.log("\nProduct Images to be updated:");
    productImagesBefore.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`From URL: ${img.url}`);
      console.log(`From type: ${img.filetype}`);
      console.log(
        `To URL: ${img.url
          .replace("/api/uploads", "/uploads")
          .replace(".jpg", ".webp")}`
      );
      console.log(`To type: image/webp`);
      console.log("---");
    });

    // Update productImages
    const imagesResult = await prisma.$executeRaw`
      UPDATE "ProductImage"
      SET 
        url = REPLACE(REPLACE(url, '/api/uploads', '/uploads'), '.jpg', '.webp'),
        filetype = 'image/webp'
      WHERE url LIKE '/api/uploads%' OR url LIKE '%.jpg' OR filetype = 'image/jpg'
    `;

    console.log(`\nUpdated ${imagesResult} product images`);

    // Get and display categoryThumbnails before update
    const categoryThumbnailsBefore = await prisma.categoryThumbnail.findMany({
      where: {
        OR: [
          { url: { startsWith: "/api/uploads" } },
          { url: { endsWith: ".jpg" } },
          { filetype: "image/jpg" },
        ],
      },
      select: {
        id: true,
        url: true,
        filetype: true,
      },
    });

    console.log("\nCategory Thumbnails to be updated:");
    categoryThumbnailsBefore.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`From URL: ${img.url}`);
      console.log(`From type: ${img.filetype}`);
      console.log(
        `To URL: ${img.url
          .replace("/api/uploads", "/uploads")
          .replace(".jpg", ".webp")}`
      );
      console.log(`To type: image/webp`);
      console.log("---");
    });

    // Update categoryThumbnails
    const categoryThumbnailsResult = await prisma.$executeRaw`
      UPDATE "CategoryThumbnail"
      SET 
        url = REPLACE(REPLACE(url, '/api/uploads', '/uploads'), '.jpg', '.webp'),
        filetype = 'image/webp'
      WHERE url LIKE '/api/uploads%' OR url LIKE '%.jpg' OR filetype = 'image/jpg'
    `;

    console.log(`\nUpdated ${categoryThumbnailsResult} category thumbnails`);

    // Get and display postThumbnails before update
    const postThumbnailsBefore = await prisma.postThumbnail.findMany({
      where: {
        OR: [
          { url: { startsWith: "/api/uploads" } },
          { url: { endsWith: ".jpg" } },
          { filetype: "image/jpg" },
        ],
      },
      select: {
        id: true,
        url: true,
        filetype: true,
      },
    });

    console.log("\nPost Thumbnails to be updated:");
    postThumbnailsBefore.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`From URL: ${img.url}`);
      console.log(`From type: ${img.filetype}`);
      console.log(
        `To URL: ${img.url
          .replace("/api/uploads", "/uploads")
          .replace(".jpg", ".webp")}`
      );
      console.log(`To type: image/webp`);
      console.log("---");
    });

    // Update postThumbnails
    const postThumbnailsResult = await prisma.$executeRaw`
      UPDATE "PostThumbnail"
      SET 
        url = REPLACE(REPLACE(url, '/api/uploads', '/uploads'), '.jpg', '.webp'),
        filetype = 'image/webp'
      WHERE url LIKE '/api/uploads%' OR url LIKE '%.jpg' OR filetype = 'image/jpg'
    `;

    console.log(`\nUpdated ${postThumbnailsResult} post thumbnails`);

    // Summary
    console.log("\nSummary:");
    console.log(`Total Main Images changed: ${mainImagesBefore.length}`);
    console.log(`Total Product Images changed: ${productImagesBefore.length}`);
    console.log(
      `Total Category Thumbnails changed: ${categoryThumbnailsBefore.length}`
    );
    console.log(
      `Total Post Thumbnails changed: ${postThumbnailsBefore.length}`
    );
    console.log("Successfully updated all image URLs and filetypes!");
  } catch (error) {
    console.error("Error updating image URLs and filetypes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImageUrls();
