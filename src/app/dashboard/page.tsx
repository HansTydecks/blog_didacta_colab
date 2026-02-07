"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Globe,
  FileEdit,
  MessageCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  description?: string;
  _count: { posts: number };
}

interface Post {
  id: string;
  title: string;
  slug?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  accessToken: string;
  commentsEnabled: boolean;
  classroomId: string;
  assignmentId?: string;
  groupNumber?: number;
  groupCount: number;
  publishedAt?: string;
  updatedAt: string;
  classroom: { name: string };
  authors: { id: string; displayName: string; color: string }[];
  _count: { comments: number };
}

interface Assignment {
  assignmentId: string;
  title: string; // base title (without "– Gruppe X")
  classroomName: string;
  classroomId: string;
  groupCount: number;
  posts: Post[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const t = useTranslations();
  const userName = session?.user?.name || "Lehrkraft";

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Create Classroom form
  const [showNewClassroom, setShowNewClassroom] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");

  // Create Post form
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostClassroom, setNewPostClassroom] = useState("");
  const [newPostGroupCount, setNewPostGroupCount] = useState(1);

  // Expanded post for details
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  // Expanded assignment
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/teacher/classrooms"),
        fetch("/api/teacher/posts"),
      ]);
      if (cRes.ok) setClassrooms(await cRes.json());
      if (pRes.ok) setPosts(await pRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/teacher/classrooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName, description: newClassDesc || undefined }),
    });
    if (res.ok) {
      setNewClassName("");
      setNewClassDesc("");
      setShowNewClassroom(false);
      fetchData();
    }
  };

  const deleteClassroom = async (id: string) => {
    if (!confirm(t("dashboard.confirmDelete"))) return;
    await fetch(`/api/teacher/classrooms/${id}`, { method: "DELETE" });
    fetchData();
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/teacher/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newPostTitle,
        classroomId: newPostClassroom,
        groupCount: newPostGroupCount,
      }),
    });
    if (res.ok) {
      setNewPostTitle("");
      setNewPostClassroom("");
      setNewPostGroupCount(1);
      setShowNewPost(false);
      fetchData();
    }
  };

  const togglePublish = async (postId: string) => {
    await fetch(`/api/teacher/posts/${postId}/publish`, { method: "PATCH" });
    fetchData();
  };

  const toggleComments = async (post: Post) => {
    await fetch(`/api/teacher/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentsEnabled: !post.commentsEnabled }),
    });
    fetchData();
  };

  const deletePost = async (postId: string) => {
    if (!confirm(t("dashboard.confirmDelete"))) return;
    await fetch(`/api/teacher/posts/${postId}`, { method: "DELETE" });
    fetchData();
  };

  const copyAccessLink = (token: string) => {
    const url = `${window.location.origin}/edit/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const statusBadge = (status: Post["status"]) => {
    const map = {
      DRAFT: "badge-warning",
      PUBLISHED: "badge-success",
      ARCHIVED: "badge-danger",
    };
    return (
      <span className={map[status]}>
        {t(`dashboard.status.${status.toLowerCase()}`)}
      </span>
    );
  };

  // Group posts into assignments
  const assignments: Assignment[] = (() => {
    const groups = new Map<string, Post[]>();
    const standalone: Post[] = [];

    for (const post of posts) {
      if (post.assignmentId) {
        const existing = groups.get(post.assignmentId) || [];
        existing.push(post);
        groups.set(post.assignmentId, existing);
      } else {
        standalone.push(post);
      }
    }

    const result: Assignment[] = [];

    for (const [assignmentId, groupPosts] of groups) {
      const first = groupPosts[0];
      // Extract base title (remove " – Gruppe X" suffix)
      const baseTitle = first.title.replace(/\s*–\s*Gruppe\s*\d+$/, "");
      result.push({
        assignmentId,
        title: baseTitle,
        classroomName: first.classroom.name,
        classroomId: first.classroomId,
        groupCount: first.groupCount,
        posts: groupPosts.sort((a, b) => (a.groupNumber || 0) - (b.groupNumber || 0)),
      });
    }

    // Standalone posts (no assignment group) as individual assignments
    for (const post of standalone) {
      result.push({
        assignmentId: post.id,
        title: post.title,
        classroomName: post.classroom.name,
        classroomId: post.classroomId,
        groupCount: 1,
        posts: [post],
      });
    }

    return result;
  })();

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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="blob-1" />
      <div className="blob-2" />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {t("dashboard.welcome", { name: userName })}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ───── Left: Classrooms ───── */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-500" />
                {t("dashboard.classrooms")}
              </h2>
              <button
                onClick={() => setShowNewClassroom(!showNewClassroom)}
                className="btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Create Classroom Form */}
            {showNewClassroom && (
              <form onSubmit={createClassroom} className="glass rounded-2xl p-4 mb-4 animate-slide-down">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder={t("dashboard.classroomName")}
                  className="input mb-3"
                  required
                />
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder={t("dashboard.classroomDesc")}
                  className="input mb-3"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary btn-sm flex-1">
                    {t("common.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewClassroom(false)}
                    className="btn-ghost btn-sm"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            )}

            {/* Classroom list */}
            {classrooms.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center text-gray-500 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                {t("dashboard.noClassrooms")}
              </div>
            ) : (
              <div className="space-y-3">
                {classrooms.map((c) => (
                  <div key={c.id} className="glass rounded-2xl p-4 hover:bg-white/70 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{c.name}</h3>
                        {c.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {c._count.posts} {t("dashboard.posts").toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteClassroom(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ───── Right: Blog Posts ───── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-brand-500" />
                {t("dashboard.posts")}
              </h2>
              <button
                onClick={() => setShowNewPost(!showNewPost)}
                className="btn-primary btn-sm"
                disabled={classrooms.length === 0}
              >
                <Plus className="w-4 h-4" />
                {t("dashboard.newPost")}
              </button>
            </div>

            {/* Create Post Form */}
            {showNewPost && classrooms.length > 0 && (
              <form onSubmit={createPost} className="glass rounded-2xl p-4 mb-4 animate-slide-down">
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder={t("dashboard.postTitle")}
                  className="input mb-3"
                  required
                />
                <select
                  value={newPostClassroom}
                  onChange={(e) => setNewPostClassroom(e.target.value)}
                  className="input mb-3"
                  required
                >
                  <option value="">{t("dashboard.classrooms")}…</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="mb-3">
                  <label className="label">{t("dashboard.groupCount")}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={newPostGroupCount}
                      onChange={(e) => setNewPostGroupCount(Number(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="text-lg font-semibold text-brand-600 w-8 text-center">
                      {newPostGroupCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("dashboard.groupCountHint", { count: newPostGroupCount })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary btn-sm flex-1">
                    {t("common.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewPost(false)}
                    className="btn-ghost btn-sm"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            )}

            {/* Posts list – grouped by assignment */}
            {assignments.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-gray-500">
                <FileEdit className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>{t("dashboard.noPosts")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.assignmentId} className="glass rounded-2xl overflow-hidden transition-all">
                    {/* Assignment header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
                      onClick={() =>
                        setExpandedAssignment(
                          expandedAssignment === assignment.assignmentId
                            ? null
                            : assignment.assignmentId
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{assignment.title}</h3>
                            {assignment.groupCount > 1 && (
                              <span className="badge bg-brand-100 text-brand-700 text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {assignment.groupCount} {t("dashboard.groups")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{assignment.classroomName}</span>
                            <span>
                              {assignment.posts.filter((p) => p.status === "PUBLISHED").length}/{assignment.posts.length} {t("common.publish").toLowerCase()}
                            </span>
                          </div>
                        </div>
                        {expandedAssignment === assignment.assignmentId ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded: show all group blogs */}
                    {expandedAssignment === assignment.assignmentId && (
                      <div className="border-t border-white/20 animate-slide-down">
                        {assignment.posts.map((post) => (
                          <div key={post.id} className="border-b border-white/10 last:border-b-0">
                            {/* Group blog header */}
                            <div
                              className="px-4 py-3 cursor-pointer hover:bg-white/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPost(expandedPost === post.id ? null : post.id);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {post.groupNumber && (
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex-shrink-0">
                                      {post.groupNumber}
                                    </span>
                                  )}
                                  <span className="font-medium text-sm truncate">
                                    {post.groupNumber
                                      ? `${t("dashboard.group")} ${post.groupNumber}`
                                      : post.title}
                                  </span>
                                  {statusBadge(post.status)}
                                  {post.authors.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Users className="w-3 h-3" />
                                      {post.authors.length}
                                    </span>
                                  )}
                                  {post._count.comments > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <MessageCircle className="w-3 h-3" />
                                      {post._count.comments}
                                    </span>
                                  )}
                                </div>
                                {expandedPost === post.id ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Expanded group blog actions */}
                            {expandedPost === post.id && (
                              <div className="px-4 pb-3 animate-slide-down">
                                {/* Authors */}
                                {post.authors.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1">Autor:innen:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {post.authors.map((a) => (
                                        <span
                                          key={a.id}
                                          className="badge text-white text-xs"
                                          style={{ backgroundColor: a.color }}
                                        >
                                          {a.displayName}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => copyAccessLink(post.accessToken)}
                                    className="btn-secondary btn-sm"
                                  >
                                    {copiedToken === post.accessToken ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                        {t("dashboard.linkCopied")}
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        {t("dashboard.copyLink")}
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => togglePublish(post.id)}
                                    className={
                                      post.status === "PUBLISHED"
                                        ? "btn-ghost btn-sm"
                                        : "btn-primary btn-sm"
                                    }
                                  >
                                    <Globe className="w-3.5 h-3.5" />
                                    {post.status === "PUBLISHED"
                                      ? t("common.unpublish")
                                      : t("common.publish")}
                                  </button>

                                  <button
                                    onClick={() => toggleComments(post)}
                                    className="btn-ghost btn-sm"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    {post.commentsEnabled
                                      ? t("dashboard.commentsDisabled")
                                      : t("dashboard.commentsEnabled")}
                                  </button>

                                  {post.status === "PUBLISHED" && post.slug && (
                                    <a
                                      href={`/blog/${post.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-ghost btn-sm"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      Blog ansehen
                                    </a>
                                  )}

                                  <button
                                    onClick={() => deletePost(post.id)}
                                    className="btn-danger btn-sm ml-auto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
