import prisma from "../src/lib/prisma.js";

async function main() {
  // Clean up
  await prisma.score.deleteMany();
  await prisma.session.deleteMany();
  await prisma.character.deleteMany();
  await prisma.image.deleteMany();

  const image = await prisma.image.create({
    data: {
      title: "Waldo Test Image",
      url: "/images/waldo.jpg",
      width: 2000,
      height: 1500,
      characters: {
        create: [
          { name: "Waldo", x_pct: 0.45, y_pct: 0.62, radius_pct: 0.02 },
          { name: "Wizard", x_pct: 0.12, y_pct: 0.3, radius_pct: 0.03 },
          { name: "Wilma", x_pct: 0.78, y_pct: 0.55, radius_pct: 0.025 },
        ],
      },
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
