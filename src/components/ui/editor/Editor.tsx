'use client';
import React, { useEffect, useRef, useState } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import {
  Plus,
  Type,
  Heading,
  Image as ImageIcon,
  Minus,
  Upload,
  Search,
  Globe,
  List,
  CheckSquare,
  Quote as QuoteIcon,
} from 'lucide-react';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { FileBrowser } from '@/modules/files/components/FileBrowser';
import { AssetMetadataForm } from '@/modules/files/components/AssetMetadataForm';
import { useFiles } from '@/modules/files/hooks/useFiles';
import { FileData } from '@/modules/files/types/file.types';
import { toast } from 'react-hot-toast';

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
  const isInitializing = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const { openModal, closeModal } = useGlobalModal();
  const { uploadFile, isUploading } = useFiles();

  // Effect to inject delete buttons into blocks
  useEffect(() => {
    const holderEl = document.getElementById(holder);
    if (!holderEl) return;

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

      const addBtn = target.closest('.custom-add-btn');
      if (addBtn && ejInstance.current) {
        const block = addBtn.closest('.ce-block');
        if (block && block.parentNode) {
          const index = Array.from(block.parentNode.children).indexOf(block);
          setInsertionIndex(index + 1);
          setIsMenuOpen(true);
          setTimeout(() => {
            document
              .getElementById('block-menu-anchor')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        }
      }
    };
    holderEl.addEventListener('click', handleEditorClick);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
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

                const addBtn = document.createElement('button');
                addBtn.className =
                  'custom-add-btn absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg border-2 border-white dark:border-navy-800 pointer-events-auto';
                addBtn.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
                addBtn.type = 'button';
                addBtn.title = 'Add Section Below';
                content.appendChild(addBtn);

                block.classList.add('group');
                (content as HTMLElement).style.position = 'relative';
                (content as HTMLElement).style.overflow = 'visible';
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
    if (isInitializing.current) return;
    isInitializing.current = true;

    let cancelled = false;

    const initEditor = async () => {
      try {
        const [
          EditorJSMod,
          HeaderMod,
          ListMod,
          QuoteMod,
          EmbedMod,
          ImageToolMod,
          DelimiterMod,
          TableMod,
          CodeMod,
          RawMod,
          UnderlineMod,
          InlineCodeMod,
          ChecklistMod,
          ColorMod,
          AlignmentMod,
        ] = await Promise.all([
          import('@editorjs/editorjs'),
          import('@editorjs/header'),
          import('@editorjs/list'),
          import('@editorjs/quote'),
          import('@editorjs/embed'),
          import('@editorjs/image'),
          import('@editorjs/delimiter'),
          import('@editorjs/table'),
          import('@editorjs/code'),
          import('@editorjs/raw'),
          import('@editorjs/underline'),
          import('@editorjs/inline-code'),
          import('@editorjs/checklist'),
          import('editorjs-text-color-plugin'),
          import('editorjs-text-alignment-blocktune'),
        ]);

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const unwrap = (mod: any): any => {
          if (!mod) return null;
          const m = mod as any;
          if (m.default && typeof m.default === 'function') return m.default;
          if (typeof m === 'function') return m;
          return m.default || m;
        };
        /* eslint-enable @typescript-eslint/no-explicit-any */

        const EditorJSClass = unwrap(EditorJSMod);
        const Header = unwrap(HeaderMod);
        const List = unwrap(ListMod);
        const Quote = unwrap(QuoteMod);
        const Embed = unwrap(EmbedMod);
        const ImageTool = unwrap(ImageToolMod);
        const Delimiter = unwrap(DelimiterMod);
        const Table = unwrap(TableMod);
        const Code = unwrap(CodeMod);
        const Raw = unwrap(RawMod);
        const Underline = unwrap(UnderlineMod);
        const InlineCode = unwrap(InlineCodeMod);
        const Checklist = unwrap(ChecklistMod);
        const Color = unwrap(ColorMod);
        const Alignment = unwrap(AlignmentMod);

        if (cancelled) return;

        const holderEl = document.getElementById(holder);
        if (holderEl) {
          holderEl.innerHTML = '';
        }

        if (!ejInstance.current) {
          let normalizedData: OutputData | undefined = undefined;
          if (data) {
            if (Array.isArray(data)) {
              normalizedData = { time: Date.now(), blocks: data, version: '2.31.6' };
            } else if (data.blocks && Array.isArray(data.blocks)) {
              normalizedData = data as OutputData;
            }
          }

          const hasContent =
            normalizedData && normalizedData.blocks && normalizedData.blocks.length > 0;

          // Validate tools before initialization
          if (!EditorJSClass) throw new Error('EditorJS class not found');

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
              if (cancelled) return;
              try {
                const content = await editor.save();
                if (!cancelled) {
                  onChange(content);
                }
              } catch (e) {
                toast.error('Failed to save content');
              }
            },
            tools: {
              alignment: Alignment || undefined,
              header: {
                class: Header,
                inlineToolbar: ['bold', 'italic', 'underline', 'color', 'marker', 'link'],
                tunes: Alignment ? ['alignment'] : undefined,
                config: {
                  placeholder: 'Enter a header',
                  levels: [2, 3, 4],
                  defaultLevel: 2,
                },
              },
              list: {
                class: List,
                inlineToolbar: true,
                tunes: Alignment ? ['alignment'] : undefined,
              },
              checklist: {
                class: Checklist,
                inlineToolbar: true,
              },
              table: {
                class: Table,
                inlineToolbar: true,
              },
              quote: {
                class: Quote,
                inlineToolbar: true,
                tunes: Alignment ? ['alignment'] : undefined,
                config: {
                  quotePlaceholder: 'Enter a quote',
                  captionPlaceholder: "Quote's author",
                },
              },
              embed: {
                class: Embed,
                config: {
                  services: {
                    youtube: true,
                    twitter: true,
                  },
                },
              },
              image: {
                class: ImageTool,
                config: {
                  endpoints: {
                    byFile: '/api/v1/admin/blogs/upload-image',
                  },
                },
              },
              code: {
                class: Code,
              },
              raw: {
                class: Raw,
              },
              underline: Underline,
              inlineCode: InlineCode,
              color: {
                class: Color,
                config: {
                  colorCollections: [
                    '#1e1b4b',
                    '#ef4444',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#6366f1',
                    '#8b5cf6',
                    '#ec4899',
                    '#000000',
                    '#ffffff',
                  ],
                  defaultColor: '#1e1b4b',
                  type: 'text',
                  customPicker: true,
                },
              },
              marker: {
                class: Color,
                config: {
                  colorCollections: [
                    '#1e1b4b',
                    '#ef4444',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#6366f1',
                    '#8b5cf6',
                    '#ec4899',
                    '#000000',
                    '#ffffff',
                  ],
                  defaultColor: '#FFBF00',
                  type: 'marker',
                  icon: `<svg width="16" height="15" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg"><path d="M10.358 5.874L8.4 3.915c-.244-.244-.64-.244-.884 0l-5.65 5.65c-.244.244-.244.64 0 .884l1.958 1.958c.244.244.64.244.884 0l5.65-5.65c.244-.244.244-.64 0-.884zM14 14.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1 0-1h11a.5.5 0 0 1 .5.5z" fill="currentColor" fill-rule="nonzero"/></svg>`,
                  customPicker: true,
                },
              },
              delimiter: {
                class: Delimiter,
              },
            },
            // Enable tunes for built-in paragraph tool without redefining it explicitly
            tunes: Alignment ? ['alignment'] : undefined,
          });
        }
      } catch (err) {
        toast.error('Editor initialization failed');
      }
    };

    initEditor();

    return () => {
      cancelled = true;
      isInitializing.current = false;
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [holder]);

  const handleAddSection = (type: string = 'paragraph') => {
    if (ejInstance.current) {
      if (type === 'image') {
        openImagePicker();
      } else {
        const index = insertionIndex ?? ejInstance.current.blocks.getBlocksCount();
        ejInstance.current.blocks.insert(type, {}, {}, index);
        ejInstance.current.caret.setToBlock(index, 'end');
        setInsertionIndex(null);
      }
      setIsMenuOpen(false);
    }
  };

  const openImagePicker = () => {
    const openExistingBrowser = () => {
      openModal({
        title: 'Browse Image Library',
        size: '3xl',
        content: (
          <div className="max-h-[75vh] overflow-y-auto px-1">
            <FileBrowser
              initialFileType="image"
              onSelect={(file: FileData) => {
                insertImageBlock(file.url || '', file.metadata?.alt || '');
                closeModal();
              }}
            />
          </div>
        ),
      });
    };

    const PickerModalContent = () => {
      const [step, setStep] = React.useState<'selector' | 'upload_details' | 'url_details'>(
        'selector',
      );
      const [file, setFile] = React.useState<File | null>(null);
      const [url, setUrl] = React.useState('');
      const [alt, setAlt] = React.useState('');
      const [keywords, setKeywords] = React.useState<string[]>([]);
      const [modalModule, setModalModule] = React.useState('blogs');
      const [visibility, setVisibility] = React.useState('public');

      const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
          setFile(selectedFile);
          setStep('upload_details');
        }
      };

      const handleFinalSubmit = async () => {
        const formData = new FormData();
        if (step === 'upload_details' && file) {
          formData.append('file', file);
        } else if (step === 'url_details' && url) {
          formData.append('url', url);
        } else {
          return;
        }

        formData.append('module', modalModule);
        formData.append('visibility', visibility);
        formData.append('alt', alt);
        keywords.forEach((k) => formData.append('keywords[]', k));
        formData.append('entityType', 'blog_content');
        formData.append('entityId', 'none');

        try {
          const response = await uploadFile(formData);
          insertImageBlock(response.url || '', alt);
          closeModal();
          toast.success('Image added to content');
        } catch (error) {
          toast.error('Failed to upload image');
        }
      };

      if (step === 'selector') {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
            <button
              onClick={() => document.getElementById('editor-image-input')?.click()}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Upload</p>
                <p className="text-xs text-gray-500 mt-1">From computer</p>
              </div>
              <input
                id="editor-image-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </button>

            <button
              onClick={openExistingBrowser}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Search size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Library</p>
                <p className="text-xs text-gray-500 mt-1">Existing assets</p>
              </div>
            </button>

            <button
              onClick={() => setStep('url_details')}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Globe size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">URL</p>
                <p className="text-xs text-gray-500 mt-1">External link</p>
              </div>
            </button>
          </div>
        );
      }

      return (
        <div className="py-6">
          <AssetMetadataForm
            step={step === 'upload_details' ? 'upload' : 'url'}
            file={file}
            url={url}
            setUrl={setUrl}
            alt={alt}
            setAlt={setAlt}
            keywords={keywords}
            setKeywords={setKeywords}
            module={modalModule}
            setModule={setModalModule}
            visibility={visibility}
            setVisibility={setVisibility}
            onBack={() => setStep('selector')}
            onSubmit={handleFinalSubmit}
            isProcessing={isUploading}
            submitLabel="Add to Editor"
          />
        </div>
      );
    };

    openModal({
      title: 'Insert Image',
      description: 'Choose an image to add to your blog content',
      size: 'lg',
      hideFooter: true,
      content: <PickerModalContent />,
    });
  };

  const insertImageBlock = (url: string, caption: string = '') => {
    if (ejInstance.current) {
      const index = insertionIndex ?? ejInstance.current.blocks.getBlocksCount();
      ejInstance.current.blocks.insert(
        'image',
        {
          file: { url },
          caption: caption,
          withBorder: false,
          stretched: false,
          withBackground: false,
        },
        {},
        index,
      );
      ejInstance.current.caret.setToBlock(index, 'end');
      setInsertionIndex(null);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl p-6 flex flex-col">
      <div
        id={holder}
        className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert flex-grow mb-4"
      />

      {isMenuOpen ? (
        <div
          id="block-menu-anchor"
          className="w-full mt-4 p-6 border-2 border-brand-100 dark:border-brand-900/30 rounded-2xl bg-white dark:bg-navy-900 shadow-theme-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {insertionIndex !== null
                ? `Insert After Section ${insertionIndex}`
                : 'Add New Section'}
            </h4>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setInsertionIndex(null);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Minus size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleAddSection('paragraph')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <Type size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Text</span>
            </button>
            <button
              onClick={() => handleAddSection('header')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <Heading size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Heading</span>
            </button>
            <button
              onClick={() => handleAddSection('image')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <ImageIcon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Image</span>
            </button>
            <button
              onClick={() => handleAddSection('list')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <List size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">List</span>
            </button>
            <button
              onClick={() => handleAddSection('checklist')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <CheckSquare size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Tasks</span>
            </button>
            {/* <button
              onClick={() => handleAddSection('table')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <TableIcon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Table</span>
            </button>
            <button
              onClick={() => handleAddSection('code')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <Code size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Code Snippet</span>
            </button>
            <button
              onClick={() => handleAddSection('raw')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <Terminal size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Raw HTML</span>
            </button> */}
            <button
              onClick={() => handleAddSection('quote')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <QuoteIcon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Quote</span>
            </button>
            <button
              onClick={() => handleAddSection('delimiter')}
              className="flex flex-col items-center justify-center p-4 gap-2 border border-gray-100 dark:border-navy-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 group/btn"
            >
              <Minus size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Divider</span>
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
          <span className="text-sm font-semibold tracking-wide uppercase">
            Click to add a new section
          </span>
        </button>
      )}
    </div>
  );
}
