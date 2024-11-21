import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {

    const foundAdmin = await prisma.user.findFirst({
        where:{
            isAdmin: true
        }
    })

    if (foundAdmin) {
      console.log("Admin already exists");
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
