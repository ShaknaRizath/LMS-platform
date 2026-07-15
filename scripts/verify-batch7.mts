import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`);
  }
  console.log(`OK: ${msg}`);
}

async function main() {
  const lecturer = await prisma.user.findUniqueOrThrow({ where: { email: "lecturer1@cims.edu" } });
  const examUnit = await prisma.user.findUniqueOrThrow({ where: { email: "registrar@cims.edu" } });

  const assignment = await prisma.lecturerModuleAssignment.findFirstOrThrow({
    where: { lecturerId: lecturer.id },
    include: { module: true },
  });
  const moduleId = assignment.moduleId;
  console.log(`Using module ${assignment.module.code} (${moduleId})`);

  // --- Learning outcomes ---
  await prisma.learningOutcome.deleteMany({ where: { moduleId, code: { in: ["LO1-TEST", "LO2-TEST"] } } });

  const lo1 = await prisma.learningOutcome.create({
    data: { moduleId, code: "LO1-TEST", description: "Design a normalized schema" },
  });
  const lo2 = await prisma.learningOutcome.create({
    data: { moduleId, code: "LO2-TEST", description: "Write correct SQL joins" },
  });
  assert(lo1.id && lo2.id, "created 2 learning outcomes for the module");

  const dupAttempt = await prisma.learningOutcome
    .create({ data: { moduleId, code: "LO1-TEST", description: "dup" } })
    .catch((e) => e);
  assert(dupAttempt instanceof Error, "duplicate (moduleId, code) rejected by unique constraint");

  // --- Quiz tagging with `set` semantics ---
  const quiz = await prisma.quiz.findFirst({ where: { moduleId } });
  assert(quiz !== null, "found an existing quiz on the module to tag");
  if (!quiz) throw new Error("unreachable");

  await prisma.quiz.update({ where: { id: quiz.id }, data: { learningOutcomes: { set: [{ id: lo1.id }, { id: lo2.id }] } } });
  let tagged = await prisma.quiz.findUniqueOrThrow({ where: { id: quiz.id }, include: { learningOutcomes: true } });
  assert(tagged.learningOutcomes.length === 2, `quiz tagged with both outcomes (got ${tagged.learningOutcomes.length})`);

  // set with a smaller subset should REPLACE, not add
  await prisma.quiz.update({ where: { id: quiz.id }, data: { learningOutcomes: { set: [{ id: lo1.id }] } } });
  tagged = await prisma.quiz.findUniqueOrThrow({ where: { id: quiz.id }, include: { learningOutcomes: true } });
  assert(
    tagged.learningOutcomes.length === 1 && tagged.learningOutcomes[0].id === lo1.id,
    "set([lo1]) replaced the relation rather than adding — now only LO1 is tagged"
  );

  // cleanup tagging (leave quiz untagged so live curl verification starts clean)
  await prisma.quiz.update({ where: { id: quiz.id }, data: { learningOutcomes: { set: [] } } });

  // --- Marks locking ---
  await prisma.moduleGradeLock.deleteMany({ where: { moduleId } });

  async function isLocked(): Promise<boolean> {
    const lock = await prisma.moduleGradeLock.findUnique({ where: { moduleId } });
    return lock !== null && lock.unlockedAt === null;
  }

  assert((await isLocked()) === false, "module starts unlocked (no lock row)");

  await prisma.moduleGradeLock.upsert({
    where: { moduleId },
    update: { lockedAt: new Date(), lockedById: examUnit.id, unlockedAt: null, unlockedById: null },
    create: { moduleId, lockedById: examUnit.id },
  });
  assert((await isLocked()) === true, "isModuleGradesLocked() === true after locking");

  const lockedRow = await prisma.moduleGradeLock.findUniqueOrThrow({ where: { moduleId } });
  assert(lockedRow.lockedById === examUnit.id, "lock row records who locked it");

  await prisma.moduleGradeLock.update({
    where: { moduleId },
    data: { unlockedAt: new Date(), unlockedById: lecturer.id },
  });
  assert((await isLocked()) === false, "isModuleGradesLocked() === false after unlocking");

  const unlockedRow = await prisma.moduleGradeLock.findUniqueOrThrow({ where: { moduleId } });
  assert(
    unlockedRow.lockedAt !== null && unlockedRow.unlockedAt !== null && unlockedRow.lockedById === examUnit.id,
    "history preserved: both lockedAt and unlockedAt populated on the same row after unlock (not deleted)"
  );

  // re-lock so curl verification can observe a locked state at /examinations/marks and lecturer pages
  await prisma.moduleGradeLock.update({
    where: { moduleId },
    data: { lockedAt: new Date(), lockedById: examUnit.id, unlockedAt: null, unlockedById: null },
  });
  assert((await isLocked()) === true, "re-locked module for live curl verification");

  console.log(`\nModule left LOCKED for curl verification: ${assignment.module.code} (${moduleId})`);
  console.log("All batch 7 assertions passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
