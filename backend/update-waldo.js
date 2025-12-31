import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  try {
    // Update image 1 URL (already exists)
    const image1 = await prisma.image.update({
      where: { id: 1 },
      data: {
        url: "/public/images/waldo.jpg",
      },
    });
    console.log("✓ Image 1 updated:", image1.title);

    // Create image 2 (waldo3)
    const image2 = await prisma.image.create({
      data: {
        title: "Waldo's Search",
        url: "/public/images/waldo3.jpg",
        width: 2040,
        height: 1260,
      },
    });
    console.log("✓ Image 2 created:", image2.title);

    // Add characters for image 2
    const characters = [
      { name: "Waldo", x_pct: 0.4309, y_pct: 0.75 },
      { name: "Odlaw", x_pct: 0.5902, y_pct: 0.9524 },
      { name: "Wenda", x_pct: 0.4376, y_pct: 0.6024 },
      { name: "Wizard", x_pct: 0.6559, y_pct: 0.7738 },
    ];

    for (const char of characters) {
      const created = await prisma.character.create({
        data: {
          imageId: image2.id,
          name: char.name,
          x_pct: char.x_pct,
          y_pct: char.y_pct,
          radius_pct: 0.03,
        },
      });
      console.log(
        `  ✓ Added ${created.name} at (${created.x_pct}, ${created.y_pct})`
      );
    }

    console.log("\n✓ Database updated successfully!");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
