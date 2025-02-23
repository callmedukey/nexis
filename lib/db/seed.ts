import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    // First delete all orders since they have foreign key relationships
    // await prisma.order.deleteMany({});
    // console.log("Deleted all orders");

    // // Then delete all users
    // await prisma.user.deleteMany({});
    // console.log("Deleted all users");

    // await prisma.user.upsert({
    //   where: {
    //     email: "admin@nexis.com",
    //   },
    //   update: {
    //     isAdmin: true,
    //   },
    //   create: {
    //     providerId: randomUUID(),
    //     provider: "credentials",
    //     name: "Admin",
    //     email: "admin@nexis.com",
    //     phone: "1234567890",
    //     isAdmin: true,
    //     password: bcrypt.hashSync("admin2025@@", 10),
    //   },
    // });

    // await prisma.user.upsert({
    //   where: {
    //     email: "user@nexis.com",
    //   },
    //   update: {
    //     isAdmin: false,
    //   },
    //   create: {
    //     providerId: randomUUID(),
    //     provider: "credentials",
    //     name: "Test User",
    //     email: "test@nexis.com",
    //     phone: "1234567890",
    //     isAdmin: false,
    //     password: bcrypt.hashSync("test2025@@", 10),
    //   },
    // });

    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(async () => {
    console.log("Database wiped successfully");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
