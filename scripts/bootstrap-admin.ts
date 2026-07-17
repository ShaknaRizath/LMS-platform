import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

// One-time bootstrap: creates a single SUPER_ADMIN account so the app can be
// tested end-to-end by hand from an empty database, with zero other seed data.
// Safe to re-run (upserts on email).

const EMAIL = "superadmin@cims.edu";
const PASSWORD = "Passw0rd!";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hashPassword(PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {},
    create: {
      email: EMAIL,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      passwordHash,
    },
  });

  console.log(`Super Admin ready: ${user.email} / ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
