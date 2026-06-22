import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const KEEP_EMAIL = "demo@devstash.io";

async function main() {
  const deleted = await prisma.user.deleteMany({
    where: { email: { not: KEEP_EMAIL } },
  });

  console.log(`Deleted ${deleted.count} user(s). Kept: ${KEEP_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
