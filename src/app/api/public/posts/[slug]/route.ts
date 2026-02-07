import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      authors: {
        select: { displayName: true },
      },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { comments: { where: { approved: true } } },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse content JSON string (SQLite stores as text)
  const response = {
    ...post,
    content: post.content ? JSON.parse(post.content) : null,
  };

  return NextResponse.json(response);
}
