"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  slug: string;
  comments: Comment[];
}

export function CommentSection({ slug, comments: initialComments }: CommentSectionProps) {
  const t = useTranslations("blog");
  const [comments, setComments] = useState(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, content }),
      });

      if (res.ok) {
        setAuthorName("");
        setContent("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-brand-500" />
        {t("comments")}
      </h2>

      {/* Comment form */}
      <div className="glass-strong rounded-2xl p-6 mb-8">
        <h3 className="font-medium mb-4">{t("writeComment")}</h3>

        {submitted && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            {t("commentPending")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="commentAuthor" className="label">
              {t("commentName")}
            </label>
            <input
              id="commentAuthor"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input"
              placeholder="Dein Name"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="commentContent" className="label">
              {t("commentContent")}
            </label>
            <textarea
              id="commentContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[100px] resize-y"
              placeholder="Schreibe deinen Kommentar…"
              required
              maxLength={2000}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {t("submitComment")}
          </button>
        </form>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center text-gray-500 text-sm">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {t("noComments")}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{comment.authorName}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
