import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogPostUpdateSchema } from "@/lib/validations";

async function getTeacherId() {
  const session = await getServerSession(authOptions);
  return (session?.user as Record<string, unknown>)?.id as string | undefined;
}

async function verifyPostOwnership(postId: string, teacherId: string) {
  return prisma.blogPost.findFirst({
    where: { id: postId, classroom: { teacherId } },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.blogPost.findFirst({
    where: { id, classroom: { teacherId } },
    include: {
      classroom: { select: { name: true } },
      authors: true,
      comments: { orderBy: { createdAt: "desc" } },
      media: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse content JSON string (SQLite stores as text)
  const response = {
    ...post,
    content: post.content ? JSON.parse(post.content) : null,
  };

  return NextResponse.json(response);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await verifyPostOwnership(id, teacherId);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = blogPostUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  // Stringify content if it's an object (SQLite stores as text)
  const data = { ...parsed.data };
  if (data.content && typeof data.content === "object") {
    data.content = JSON.stringify(data.content);
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
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
  const post = await verifyPostOwnership(id, teacherId);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
