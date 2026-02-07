import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTeacherId() {
  const session = await getServerSession(authOptions);
  return (session?.user as Record<string, unknown>)?.id as string | undefined;
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

  const post = await prisma.blogPost.findFirst({
    where: { id, classroom: { teacherId } },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const approved = Boolean(body.approved);

  const comment = await prisma.comment.findFirst({
    where: { id: body.commentId, blogPostId: id },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const updated = await prisma.comment.update({
    where: { id: body.commentId },
    data: { approved },
  });

  return NextResponse.json(updated);
}
