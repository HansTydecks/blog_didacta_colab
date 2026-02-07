import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTeacherId() {
  const session = await getServerSession(authOptions);
  return (session?.user as Record<string, unknown>)?.id as string | undefined;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const classroom = await prisma.classroom.findFirst({
    where: { id, teacherId },
  });

  if (!classroom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.classroom.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
