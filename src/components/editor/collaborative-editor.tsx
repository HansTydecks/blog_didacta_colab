"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useTranslations } from "next-intl";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Link2,
  Undo2,
  Redo2,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Author {
  id: string;
  displayName: string;
  color: string;
}

interface CollaborativeEditorProps {
  roomId: string;
  author: Author;
  accessToken: string;
}

export default function CollaborativeEditor({
  roomId,
  author,
  accessToken,
}: CollaborativeEditorProps) {
  const t = useTranslations("editor");
  const [connected, setConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<
    { name: string; color: string }[]
  >([]);

  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL || "ws://localhost:1234";

    const wsProvider = new WebsocketProvider(wsUrl, roomId, ydoc);

    wsProvider.on("status", ({ status }: { status: string }) => {
      setConnected(status === "connected");
    });

    wsProvider.awareness.setLocalStateField("user", {
      name: author.displayName,
      color: author.color,
    });

    wsProvider.awareness.on("change", () => {
      const states = wsProvider.awareness.getStates();
      const users: { name: string; color: string }[] = [];
      states.forEach((state) => {
        if (state.user) {
          users.push(state.user);
        }
      });
      setConnectedUsers(users);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [roomId, author, ydoc]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // Yjs handles undo/redo
        }),
        Underline,
        Image.configure({
          HTMLAttributes: { class: "rounded-2xl max-w-full shadow-lg my-4" },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-brand-600 underline underline-offset-2",
          },
        }),
        Placeholder.configure({
          placeholder: "Fange an zu schreiben…",
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider: provider,
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class: "tiptap prose-blog focus:outline-none min-h-[400px]",
        },
      },
    },
    [provider]
  );

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/collab/${accessToken}/media`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          editor
            .chain()
            .focus()
            .setImage({ src: data.url, alt: data.originalName })
            .run();
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };

    input.click();
  }, [editor, accessToken]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const url = prompt("URL eingeben:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    icon: React.ElementType;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active
          ? "bg-brand-100 text-brand-700"
          : "text-gray-500 hover:bg-white/60 hover:text-gray-700"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="glass-strong rounded-3xl overflow-hidden shadow-xl">
      {/* Toolbar */}
      <div className="border-b border-white/20 px-4 py-2 flex items-center gap-1 flex-wrap bg-white/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={Bold}
          title={t("toolbar.bold")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={Italic}
          title={t("toolbar.italic")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={UnderlineIcon}
          title={t("toolbar.underline")}
        />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          title={t("toolbar.heading1")}
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          title={t("toolbar.heading2")}
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          title={t("toolbar.heading3")}
        />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={List}
          title={t("toolbar.bulletList")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={ListOrdered}
          title={t("toolbar.orderedList")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={Quote}
          title={t("toolbar.blockquote")}
        />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={handleImageUpload}
          icon={ImageIcon}
          title={t("toolbar.image")}
        />
        <ToolbarButton
          onClick={handleLink}
          active={editor.isActive("link")}
          icon={Link2}
          title={t("toolbar.link")}
        />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo2}
          title={t("toolbar.undo")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo2}
          title={t("toolbar.redo")}
        />

        {/* Connection status + users */}
        <div className="ml-auto flex items-center gap-3">
          {connectedUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <div className="flex -space-x-1">
                {connectedUsers.map((u, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
                    style={{ backgroundColor: u.color }}
                    title={u.name || "?"}
                  >
                    {(u.name || "?").charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            className={`flex items-center gap-1 text-xs ${
              connected ? "text-green-600" : "text-red-500"
            }`}
          >
            {connected ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
