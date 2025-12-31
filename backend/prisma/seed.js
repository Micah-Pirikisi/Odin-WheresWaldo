import prisma from "../src/lib/prisma.js";

async function main() {
  // Clean up
  await prisma.score.deleteMany();
  await prisma.session.deleteMany();
  await prisma.character.deleteMany();
  await prisma.image.deleteMany();

  const image = await prisma.image.create({
    data: {
      title: "Just Waldo",
      url: "/assets/waldo1.jpg", 
      width: 2048,
      height: 1346,
    },
  });

  console.log("Seeded image id:", image.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
