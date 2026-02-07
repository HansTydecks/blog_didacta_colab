import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";
import { randomUUID } from "crypto";

async function getTeacherId() {
  const session = await getServerSession(authOptions);
  return (session?.user as Record<string, unknown>)?.id as string | undefined;
}

export async function GET() {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
    where: {
      classroom: { teacherId },
    },
    include: {
      classroom: { select: { name: true } },
      authors: { select: { id: true, displayName: true, color: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ assignmentId: "desc" }, { groupNumber: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = blogPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  // Verify classroom belongs to teacher
  const classroom = await prisma.classroom.findFirst({
    where: { id: parsed.data.classroomId, teacherId },
  });

  if (!classroom) {
    return NextResponse.json(
      { error: "Klasse nicht gefunden" },
      { status: 404 }
    );
  }

  const groupCount = parsed.data.groupCount || 1;
  const assignmentId = groupCount > 1 ? randomUUID() : null;

  // Create N blog posts (one per group)
  const posts = [];
  for (let i = 1; i <= groupCount; i++) {
    const title =
      groupCount > 1
        ? `${parsed.data.title} – Gruppe ${i}`
        : parsed.data.title;

    const post = await prisma.blogPost.create({
      data: {
        title,
        classroomId: parsed.data.classroomId,
        language: parsed.data.language || "de",
        assignmentId,
        groupNumber: groupCount > 1 ? i : null,
        groupCount,
      },
      include: {
        classroom: { select: { name: true } },
        authors: true,
      },
    });
    posts.push(post);
  }

  return NextResponse.json(posts, { status: 201 });
}
