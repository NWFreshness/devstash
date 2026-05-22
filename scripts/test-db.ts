import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [users, itemTypes, items, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("Database connection OK. Row counts:");
  console.table({ users, itemTypes, items, collections, tags });
}

main()
  .catch((e) => {
    console.error("Database test failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
