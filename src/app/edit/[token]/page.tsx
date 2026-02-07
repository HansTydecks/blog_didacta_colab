"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Loader2, PenLine, AlertCircle, Users } from "lucide-react";

// Dynamic import to avoid SSR issues with TipTap/Yjs
const CollaborativeEditor = dynamic(
  () => import("@/components/editor/collaborative-editor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="glass-strong rounded-3xl p-8 animate-pulse">
      <div className="h-10 bg-gray-200/40 rounded-xl mb-6" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200/40 rounded w-3/4" />
        <div className="h-4 bg-gray-200/40 rounded w-full" />
        <div className="h-4 bg-gray-200/40 rounded w-5/6" />
      </div>
    </div>
  );
}

interface PostInfo {
  id: string;
  title: string;
  status: string;
  language: string;
  authors: { id: string; displayName: string; color: string }[];
  classroom: { name: string };
}

interface Author {
  id: string;
  displayName: string;
  color: string;
}

export default function EditPage() {
  const params = useParams();
  const token = params.token as string;
  const t = useTranslations();

  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function fetchPostInfo() {
      try {
        const res = await fetch(`/api/collab/${token}`);
        if (res.ok) {
          setPostInfo(await res.json());
        } else {
          const data = await res.json();
          setError(data.error || "Post not found");
        }
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    }
    fetchPostInfo();
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    setError("");

    try {
      const res = await fetch(`/api/collab/${token}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      if (res.ok) {
        const authorData = await res.json();
        setAuthor(authorData);
      } else {
        const data = await res.json();
        setError(data.error || "Join failed");
      }
    } catch {
      setError("Connection error");
    } finally {
      setJoining(false);
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

  if (error && !postInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="glass-strong rounded-3xl p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-bold mb-2">{t("common.error")}</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show join form if author hasn't joined yet
  if (!author) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="blob-1" />
        <div className="blob-2" />
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md">
            <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
                  <PenLine className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("editor.joinTitle")}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {t("editor.joinSubtitle")}
                </p>
                {postInfo && (
                  <div className="mt-4 glass rounded-xl p-3">
                    <p className="font-medium text-sm">{postInfo.title}</p>
                    <p className="text-xs text-gray-500">
                      {postInfo.classroom.name}
                    </p>
                    {postInfo.authors.length > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {postInfo.authors.map((a) => a.displayName).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <label htmlFor="displayName" className="label">
                    {t("editor.displayName")}
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input"
                    placeholder="z. B. Max"
                    required
                    minLength={1}
                    maxLength={30}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={joining}
                  className="btn-primary w-full btn-lg"
                >
                  {joining ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <PenLine className="w-5 h-5" />
                      {t("editor.join")}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Show editor
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="blob-1" />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Post title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{postInfo?.title}</h1>
          <p className="text-sm text-gray-500">
            {postInfo?.classroom.name} · {t("editor.collaborators")}:{" "}
            {postInfo?.authors.map((a) => a.displayName).join(", ")}
          </p>
        </div>

        {/* Editor */}
        <CollaborativeEditor
          roomId={postInfo?.id || token}
          author={author}
          accessToken={token}
        />
      </main>

      <Footer />
    </div>
  );
}
