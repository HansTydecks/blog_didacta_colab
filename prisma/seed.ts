import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Dummy-Lehrkraft anlegen ──
  const email = "lehrer@test.de";
  const password = "test1234";
  const displayName = "Max Mustermann";

  const existing = await prisma.teacher.findUnique({ where: { email } });

  if (existing) {
    console.log(`✅ Lehrkraft "${email}" existiert bereits (ID: ${existing.id})`);
  } else {
    const passwordHash = await hash(password, 12);
    const teacher = await prisma.teacher.create({
      data: {
        email,
        passwordHash,
        displayName,
        language: "de",
      },
    });
    console.log(`✅ Lehrkraft erstellt:`);
    console.log(`   ID:    ${teacher.id}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Name:  ${teacher.displayName}`);
  }

  // ── Demo-Klassenzimmer anlegen ──
  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (teacher) {
    const existingClassroom = await prisma.classroom.findFirst({
      where: { teacherId: teacher.id },
    });

    if (existingClassroom) {
      console.log(`✅ Klassenzimmer "${existingClassroom.name}" existiert bereits`);
    } else {
      const classroom = await prisma.classroom.create({
        data: {
          name: "Klasse 10b - Deutsch",
          description: "Demo-Klassenzimmer für Tests",
          teacherId: teacher.id,
        },
      });
      console.log(`✅ Klassenzimmer erstellt: "${classroom.name}"`);
    }
  }

  console.log("\n────────────────────────────────────────");
  console.log("🎉 Seed abgeschlossen!");
  console.log("────────────────────────────────────────");
  console.log("\n📋 Login-Daten:");
  console.log(`   E-Mail:   ${email}`);
  console.log(`   Passwort: ${password}`);
  console.log("────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed-Fehler:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
