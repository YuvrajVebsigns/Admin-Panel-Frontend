'use client';
import React, { useEffect, useRef } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import { Plus } from 'lucide-react';

interface EditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
  holder?: string;
  placeholder?: string;
}

export default function Editor({
  data,
  onChange,
  holder = 'editorjs',
  placeholder = "Start writing your blog... Type '/' for commands or click the '+' button to add images, headings, and lists.",
}: EditorProps) {
  const ejInstance = useRef<EditorJS | null>(null);

  useEffect(() => {
    const initEditor = async () => {
      // Import plugins dynamically to avoid SSR issues
      const EditorJSClass = (await import('@editorjs/editorjs')).default;
      // @ts-ignore
      const Header = (await import('@editorjs/header')).default;
      // @ts-ignore
      const List = (await import('@editorjs/list')).default;
      // @ts-ignore
      const Quote = (await import('@editorjs/quote')).default;
      // @ts-ignore
      const Embed = (await import('@editorjs/embed')).default;
      // @ts-ignore
      const ImageTool = (await import('@editorjs/image')).default;
      // @ts-ignore
      const Delimiter = (await import('@editorjs/delimiter')).default;

      if (!ejInstance.current) {
        // When no real content exists, pass NO data and let EditorJS create exactly one empty block via placeholder
        const hasContent = data && data.blocks && data.blocks.length > 0;

        const editor = new EditorJSClass({
          holder: holder,
          placeholder: placeholder,
          ...(hasContent ? { data } : {}),
          onReady: () => {
            ejInstance.current = editor;
          },
          onChange: async () => {
            const content = await editor.save();
            onChange(content);
          },
          tools: {
            header: {
              class: Header as unknown as import('@editorjs/editorjs').BlockToolConstructable,
              config: {
                placeholder: 'Enter a header',
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            list: {
              class: List as unknown as import('@editorjs/editorjs').BlockToolConstructable,
              inlineToolbar: true,
            },
            quote: {
              class: Quote as unknown as import('@editorjs/editorjs').BlockToolConstructable,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: "Quote's author",
              },
            },
            embed: {
              class: Embed as unknown as import('@editorjs/editorjs').BlockToolConstructable,
              config: {
                services: {
                  youtube: true,
                  twitter: true,
                },
              },
            },
            image: {
              class: ImageTool as unknown as import('@editorjs/editorjs').BlockToolConstructable,
              config: {
                endpoints: {
                  byFile: '/api/v1/admin/blogs/upload-image', // Backend endpoint
                },
              },
            },
            delimiter: {
              class: Delimiter as unknown as import('@editorjs/editorjs').BlockToolConstructable,
            },
          },
        });
      }
    };

    initEditor();

    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []); // Only init once

  const handleAddSection = () => {
    if (ejInstance.current) {
      ejInstance.current.blocks.insert();
      const count = ejInstance.current.blocks.getBlocksCount();
      ejInstance.current.caret.setToBlock(count - 1, 'end');
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl p-6 flex flex-col">
      <div
        id={holder}
        className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert flex-grow mb-4"
      />

      <button
        type="button"
        onClick={handleAddSection}
        className="w-full mt-2 py-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-navy-700 rounded-xl bg-gray-50/50 dark:bg-navy-800/30 text-gray-500 dark:text-gray-400 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-white dark:bg-navy-800 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
          <Plus size={20} />
        </div>
        <span className="text-sm font-semibold tracking-wide">CLICK TO ADD A NEW SECTION</span>
      </button>
    </div>
  );
}
