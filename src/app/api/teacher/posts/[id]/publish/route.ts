import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function getTeacherId() {
  const session = await getServerSession(authOptions);
  return (session?.user as Record<string, unknown>)?.id as string | undefined;
}

export async function PATCH(
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
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Toggle publish status
  if (post.status === "PUBLISHED") {
    // Unpublish
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        status: "DRAFT",
        publishedAt: null,
        slug: null,
      },
    });
    return NextResponse.json(updated);
  }

  // Publish: Generate unique slug
  let baseSlug = slugify(post.title || "blog-eintrag");
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      slug,
    },
  });

  return NextResponse.json(updated);
}
