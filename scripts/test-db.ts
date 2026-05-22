import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: {
      collections: {
        orderBy: { name: "asc" },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
            include: { type: true },
          },
        },
      },
    },
  });

  if (!user) {
    console.error(`No demo user found (${DEMO_EMAIL}). Run: npm run db:seed`);
    process.exit(1);
  }

  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log("Database connection OK.\n");

  console.log("Demo user:");
  console.table({
    email: user.email,
    name: user.name,
    isPro: user.isPro,
    emailVerified: user.emailVerified?.toISOString() ?? null,
  });

  console.log("\nSystem item types:");
  console.table(
    types.map((t) => ({ name: t.name, icon: t.icon, color: t.color })),
  );

  console.log("\nCollections and items:");
  for (const collection of user.collections) {
    const star = collection.isFavorite ? " *" : "";
    console.log(`\n  ${collection.name}${star} - ${collection.description}`);
    for (const item of collection.items) {
      const flags = [item.isPinned ? "pinned" : "", item.isFavorite ? "favorite" : ""]
        .filter(Boolean)
        .join(", ");
      const target = item.url ?? item.language ?? "";
      console.log(
        `    [${item.type.name}] ${item.title}` +
          (target ? ` (${target})` : "") +
          (flags ? ` <${flags}>` : ""),
      );
    }
  }

  const totalItems = user.collections.reduce((n, c) => n + c.items.length, 0);
  console.log(
    `\nSummary: ${user.collections.length} collections, ${totalItems} items, ${types.length} system types.`,
  );
}

main()
  .catch((e) => {
    console.error("Database test failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
