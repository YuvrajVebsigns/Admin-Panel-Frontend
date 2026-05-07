'use client';
import React, { useEffect, useRef, useState } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import {
  Plus,
  Type,
  Heading,
  List as ListIcon,
  Quote as QuoteIcon,
  Image as ImageIcon,
  Minus,
} from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Effect to inject delete buttons into blocks
  useEffect(() => {
    const holderEl = document.getElementById(holder);
    if (!holderEl) return;

    // Delegate click for delete buttons
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const deleteBtn = target.closest('.custom-delete-btn');
      if (deleteBtn && ejInstance.current) {
        const block = deleteBtn.closest('.ce-block');
        if (block && block.parentNode) {
          const index = Array.from(block.parentNode.children).indexOf(block);
          ejInstance.current.blocks.delete(index);
        }
      }
    };
    holderEl.addEventListener('click', handleEditorClick);

    // Observer to inject delete buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            // Check if added node is a block or contains blocks
            const blocks = el.classList?.contains('ce-block')
              ? [el]
              : Array.from(el.querySelectorAll('.ce-block'));
            blocks.forEach((block) => {
              const content = block.querySelector('.ce-block__content');
              if (content && !content.querySelector('.custom-delete-btn')) {
                const btn = document.createElement('button');
                btn.className =
                  'custom-delete-btn absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors z-20 shadow-sm bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-600 opacity-0 group-hover:opacity-100';
                btn.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
                btn.type = 'button';
                btn.title = 'Delete Section';
                content.appendChild(btn);
                // Ensure block is a group so we can hover it
                block.classList.add('group');
                (content as HTMLElement).style.position = 'relative';
              }
            });
          }
        });
      });
    });

    observer.observe(holderEl, { childList: true, subtree: true });

    return () => {
      holderEl.removeEventListener('click', handleEditorClick);
      observer.disconnect();
    };
  }, [holder]);

  useEffect(() => {
    let cancelled = false;

    const initEditor = async () => {
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

      // If this effect was already cleaned up (React StrictMode), abort
      if (cancelled) return;

      // Clear any leftover DOM content from a previous mount (React StrictMode double-run)
      const holderEl = document.getElementById(holder);
      if (holderEl) {
        holderEl.innerHTML = '';
      }

      if (!ejInstance.current) {
        // Normalize data to handle both EditorJS OutputData and raw block arrays (from seed data)
        let normalizedData: OutputData | undefined = undefined;
        if (data) {
          if (Array.isArray(data)) {
            normalizedData = { time: Date.now(), blocks: data, version: '2.29.1' };
          } else if (data.blocks && Array.isArray(data.blocks)) {
            normalizedData = data as OutputData;
          }
        }

        const hasContent =
          normalizedData && normalizedData.blocks && normalizedData.blocks.length > 0;

        const editor = new EditorJSClass({
          holder: holder,
          placeholder: placeholder,
          ...(hasContent ? { data: normalizedData } : {}),
          onReady: () => {
            if (!cancelled) {
              ejInstance.current = editor;
            }
          },
          onChange: async () => {
            const content = await editor.save();
            if (!cancelled) {
              onChange(content);
            }
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
                  byFile: '/api/v1/admin/blogs/upload-image',
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
      cancelled = true;
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []); // Only init once

  const handleAddSection = (type: string = 'paragraph') => {
    if (ejInstance.current) {
      ejInstance.current.blocks.insert(type);
      const count = ejInstance.current.blocks.getBlocksCount();
      ejInstance.current.caret.setToBlock(count - 1, 'end');
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl p-6 flex flex-col">
      <div
        id={holder}
        className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert flex-grow mb-4"
      />

      {isMenuOpen ? (
        <div className="w-full mt-4 p-6 border-2 border-brand-100 dark:border-brand-900/30 rounded-2xl bg-white dark:bg-navy-900 shadow-theme-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Choose Block Type
            </h4>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-400 hover:text-red-500"
            >
              <Minus size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleAddSection('paragraph')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Type size={24} />
              <span className="text-xs font-semibold">Text</span>
            </button>
            <button
              onClick={() => handleAddSection('header')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Heading size={24} />
              <span className="text-xs font-semibold">Heading</span>
            </button>
            <button
              onClick={() => handleAddSection('image')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <ImageIcon size={24} />
              <span className="text-xs font-semibold">Image</span>
            </button>
            <button
              onClick={() => handleAddSection('list')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <ListIcon size={24} />
              <span className="text-xs font-semibold">List</span>
            </button>
            <button
              onClick={() => handleAddSection('quote')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <QuoteIcon size={24} />
              <span className="text-xs font-semibold">Quote</span>
            </button>
            <button
              onClick={() => handleAddSection('delimiter')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Minus size={24} />
              <span className="text-xs font-semibold">Divider</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="w-full mt-2 py-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-navy-700 rounded-xl bg-gray-50/50 dark:bg-navy-800/30 text-gray-500 dark:text-gray-400 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-navy-800 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
            <Plus size={20} />
          </div>
          <span className="text-sm font-semibold tracking-wide">CLICK TO ADD A NEW SECTION</span>
        </button>
      )}
    </div>
  );
}
