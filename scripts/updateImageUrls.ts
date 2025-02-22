import prisma from "@/lib/prisma";

async function updateImageUrls() {
  try {
    console.log("Starting to update image URLs...");

    // Get and display productMainImages before update
    const mainImagesBefore = await prisma.productMainImage.findMany({
      where: {
        url: {
          startsWith: "/api/uploads",
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    console.log("\nProduct Main Images to be updated:");
    mainImagesBefore.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`From: ${img.url}`);
      console.log(`To: ${img.url.replace("/api/uploads", "/uploads")}`);
      console.log("---");
    });

    // Update productMainImages
    const mainImagesResult = await prisma.$executeRaw`
      UPDATE "ProductMainImage"
      SET url = REPLACE(url, '/api/uploads', '/uploads')
      WHERE url LIKE '/api/uploads%'
    `;

    console.log(`\nUpdated ${mainImagesResult} product main images`);

    // Get and display productImages before update
    const productImagesBefore = await prisma.productImage.findMany({
      where: {
        url: {
          startsWith: "/api/uploads",
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    console.log("\nProduct Images to be updated:");
    productImagesBefore.forEach((img) => {
      console.log(`ID: ${img.id}`);
      console.log(`From: ${img.url}`);
      console.log(`To: ${img.url.replace("/api/uploads", "/uploads")}`);
      console.log("---");
    });

    // Update productImages
    const imagesResult = await prisma.$executeRaw`
      UPDATE "ProductImage"
      SET url = REPLACE(url, '/api/uploads', '/uploads')
      WHERE url LIKE '/api/uploads%'
    `;

    console.log(`\nUpdated ${imagesResult} product images`);

    // Summary
    console.log("\nSummary:");
    console.log(`Total Main Images changed: ${mainImagesBefore.length}`);
    console.log(`Total Product Images changed: ${productImagesBefore.length}`);
    console.log("Successfully updated all image URLs!");
  } catch (error) {
    console.error("Error updating image URLs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImageUrls();
