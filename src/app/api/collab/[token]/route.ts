import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { accessToken: token },
    select: {
      id: true,
      title: true,
      status: true,
      language: true,
      authors: {
        select: { id: true, displayName: true, color: true },
      },
      classroom: {
        select: { name: true },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.status === "PUBLISHED") {
    return NextResponse.json(
      { error: "Dieser Blog wurde bereits veröffentlicht – Bearbeitung ist geschlossen. Bitte wende dich an deine Lehrkraft." },
      { status: 403 }
    );
  }

  return NextResponse.json(post);
}
