import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinCollabSchema } from "@/lib/validations";
import { randomCursorColor } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { accessToken: token },
    select: { id: true, status: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.status === "PUBLISHED") {
    return NextResponse.json(
      { error: "Post already published" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = joinCollabSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const author = await prisma.blogAuthor.create({
    data: {
      displayName: parsed.data.displayName,
      color: randomCursorColor(),
      blogPostId: post.id,
    },
  });

  return NextResponse.json(author, { status: 201 });
}
