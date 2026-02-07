import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, status: true, commentsEnabled: true },
  });

  if (!post || post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { blogPostId: post.id, approved: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, status: true, commentsEnabled: true },
  });

  if (!post || post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!post.commentsEnabled) {
    return NextResponse.json(
      { error: "Comments are disabled" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      ...parsed.data,
      blogPostId: post.id,
      approved: false, // Requires teacher approval
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
