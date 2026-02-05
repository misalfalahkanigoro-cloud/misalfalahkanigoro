'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold,
    Italic,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Undo2,
    Redo2,
    Link2,
    Unlink2,
    ImagePlus,
} from 'lucide-react';
import { api } from '@/lib/api';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string, text: string) => void;
    onMessage?: (message: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onMessage }) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML(), editor.getText());
        },
    });

    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [editor, content]);

    const insertImage = async (file: File) => {
        if (!editor) return;
        if (!file.type.startsWith('image/')) {
            onMessage?.('Gambar editor harus berupa file image.');
            return;
        }

        try {
            const result = await api.upload.media(file, 'mis-al-falah/publikasi/content');
            if (result?.url) {
                editor.chain().focus().setImage({ src: result.url }).run();
            }
        } catch (error) {
            console.error('Editor image upload failed', error);
            onMessage?.('Gagal upload gambar ke editor.');
        }
    };

    const toolbarButton = (active: boolean) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-gray-700 hover:bg-emerald-50 dark:bg-white/10 dark:text-gray-200'
        }`;

    if (!editor) return null;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={toolbarButton(editor.isActive('bold'))}
                >
                    <Bold size={14} /> Bold
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={toolbarButton(editor.isActive('italic'))}
                >
                    <Italic size={14} /> Italic
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={toolbarButton(editor.isActive('heading', { level: 2 }))}
                >
                    <Heading2 size={14} /> Heading
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={toolbarButton(editor.isActive('bulletList'))}
                >
                    <List size={14} /> Bullet
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={toolbarButton(editor.isActive('orderedList'))}
                >
                    <ListOrdered size={14} /> Ordered
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={toolbarButton(editor.isActive('blockquote'))}
                >
                    <Quote size={14} /> Quote
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className={toolbarButton(false)}
                >
                    <Undo2 size={14} /> Undo
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    className={toolbarButton(false)}
                >
                    <Redo2 size={14} /> Redo
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = window.prompt('Masukkan URL tautan');
                        if (url) {
                            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                        }
                    }}
                    className={toolbarButton(editor.isActive('link'))}
                >
                    <Link2 size={14} /> Link
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    className={toolbarButton(false)}
                >
                    <Unlink2 size={14} /> Unlink
                </button>
                <label className={toolbarButton(false) + " cursor-pointer"}>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) insertImage(file);
                            e.currentTarget.value = '';
                        }}
                    />
                    <ImagePlus size={14} /> Gambar
                </label>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/30 min-h-[300px]">
                <EditorContent editor={editor} className="prose max-w-none dark:prose-invert focus:outline-none" />
            </div>
        </div>
    );
};

export default RichTextEditor;
