'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Undo, Redo, Link2, ImageIcon
} from 'lucide-react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const ButtonLink = Link.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            class: {
                default: null,
            },
        };
    },
});

const TiptapEditor: React.FC<TiptapEditorProps> = ({
    content,
    onChange,
    placeholder = 'Tulis konten di sini...',
    minHeight = '400px'
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            ButtonLink.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-emerald-600 underline hover:text-emerald-700',
                },
            }),
        ],
        immediatelyRender: false,
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[' + minHeight + '] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('Masukkan URL gambar:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const insertLinkButton = () => {
        const url = window.prompt('Masukkan URL tombol:');
        if (!url) return;
        const label = window.prompt('Teks tombol:', 'Lihat Selengkapnya');
        if (!label) return;

        editor
            .chain()
            .focus()
            .insertContent({
                type: 'text',
                text: label,
                marks: [
                    {
                        type: 'link',
                        attrs: {
                            href: url,
                            class:
                                'inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white no-underline shadow-md shadow-emerald-600/30 hover:bg-emerald-700',
                        },
                    },
                ],
            })
            .insertContent(' ')
            .run();
    };

    return (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Italic"
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Strikethrough"
                >
                    <Strikethrough size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('code') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Code"
                >
                    <Code size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Heading 3"
                >
                    <Heading3 size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Bullet List"
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Quote"
                >
                    <Quote size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <button
                    type="button"
                    onClick={insertLinkButton}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition ${editor.isActive('link') ? 'bg-gray-200 dark:bg-white/10 text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    title="Add Button Link"
                >
                    <Link2 size={18} />
                </button>
                <button
                    type="button"
                    onClick={addImage}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-400"
                    title="Add Image"
                >
                    <ImageIcon size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-400 disabled:opacity-30"
                    title="Undo"
                >
                    <Undo size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-400 disabled:opacity-30"
                    title="Redo"
                >
                    <Redo size={18} />
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-emerald-600 prose-strong:text-gray-900 dark:prose-strong:text-white"
            />
        </div>
    );
};

export default TiptapEditor;
