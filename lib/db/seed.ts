import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.user.upsert({
      where: { email: "test@nexis.com" },
      update: {
        email: "test@nexis.com",
        password: await bcrypt.hash("test2025@@", 10),
        provider: "credentials",
        providerId: randomUUID(),
      },
      create: {
        email: "test@nexis.com",
        password: await bcrypt.hash("test2025@@", 10),
        provider: "credentials",
        providerId: randomUUID(),
      },
    });

    const foundAdmin = await prisma.user.findFirst({
      where: {
        isAdmin: true,
      },
    });

    if (foundAdmin) {
      console.log("Admin already exists");
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { isAdmin: true },
        });
      } else {
        console.log("No user found");
      }
    } else {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { isAdmin: true },
        });
      } else {
        console.log("No user found");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(async () => {
    console.log("Seeded");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
