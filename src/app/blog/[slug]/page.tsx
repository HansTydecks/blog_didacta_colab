"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommentSection } from "@/components/blog/comment-section";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import ImageExt from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown> | null;
  excerpt: string | null;
  coverImage: string | null;
  commentsEnabled: boolean;
  publishedAt: string;
  language: string;
  authors: { displayName: string }[];
  comments: Comment[];
  _count: { comments: number };
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function BlogPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations();

  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/public/posts/${slug}`);
        if (res.ok) {
          setPost(await res.json());
        } else {
          setError("Blog post not found");
        }
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const renderContent = () => {
    if (!post?.content) return null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html = generateHTML(post.content as any, [
        StarterKit,
        Underline,
        ImageExt,
        Link,
      ]);

      return (
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <p className="text-gray-500">Content could not be rendered.</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="glass-strong rounded-3xl p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-bold mb-2">404</h1>
            <p className="text-gray-600">{error || "Not found"}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="blob-1" />
      <div className="blob-2" />
      <Navbar />

      <main className="flex-1 relative z-10">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Cover image */}
          {post.coverImage && (
            <div className="mb-8 rounded-3xl overflow-hidden shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          )}

          {/* Title & meta */}
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {post.authors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>
                    {t("blog.by")}{" "}
                    {post.authors.map((a) => a.displayName).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {t("blog.publishedOn")}{" "}
                  {formatDate(
                    post.publishedAt,
                    post.language === "en"
                      ? "en-US"
                      : post.language === "es"
                      ? "es-ES"
                      : "de-DE"
                  )}
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="glass-strong rounded-3xl p-6 sm:p-10 shadow-xl mb-12">
            {renderContent()}
          </div>

          {/* Comments */}
          {post.commentsEnabled && (
            <CommentSection
              slug={slug}
              comments={post.comments}
            />
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
