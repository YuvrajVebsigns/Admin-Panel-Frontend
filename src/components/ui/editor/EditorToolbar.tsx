'use client';

import React, { useState, useEffect, useRef } from 'react';
import type EditorJS from '@editorjs/editorjs';
import {
  Type,
  Bold,
  Italic,
  Underline,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronDown,
  Baseline,
  ALargeSmall,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: EditorJS | null;
  onImageClick?: () => void;
}

export default function EditorToolbar({ editor, onImageClick }: EditorToolbarProps) {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [blockType, setBlockType] = useState('Paragraph');
  const [alignment, setAlignment] = useState('left');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [toolbarTop, setToolbarTop] = useState<number | null>(null);
  const [fontFamily, setFontFamily] = useState('Default');
  const [fontSize, setFontSize] = useState('Normal');
  const [isVisible, setIsVisible] = useState(false);

  const savedSelectionRef = useRef<Range | null>(null);

  // Reference for the toolbar to detect outside clicks for dropdowns
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Floating toolbar logic
  useEffect(() => {
    const updatePosition = () => {
      if (!toolbarRef.current) return;

      // Try finding by EditorJS class
      let activeBlock =
        document.querySelector('.ce-block--focused') ||
        document.querySelector('.ce-block--active') ||
        document.querySelector('.ce-block--selected');

      // If not found by class, try finding the block containing current focus
      if (!activeBlock && document.activeElement) {
        activeBlock = document.activeElement.closest('.ce-block');
      }

      const wrapper = toolbarRef.current.parentElement;

      if ((activeBlock || openDropdown) && wrapper) {
        if (activeBlock) {
          const blockRect = activeBlock.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();

          // Calculate relative Top
          const relativeTop = blockRect.top - wrapperRect.top;

          // Hover above the block (approx 70px), but don't go below 10px from wrapper top
          setToolbarTop(Math.max(10, relativeTop - 70));
        }
        setIsVisible(true);
      } else {
        // Hide if no active block found and no dropdown open
        setIsVisible(false);
      }
    };

    // Update position on various events
    document.addEventListener('selectionchange', updatePosition);
    document.addEventListener('click', updatePosition);
    document.addEventListener('keyup', updatePosition);

    // Initial check
    setTimeout(updatePosition, 500);

    return () => {
      document.removeEventListener('selectionchange', updatePosition);
      document.removeEventListener('click', updatePosition);
      document.removeEventListener('keyup', updatePosition);
    };
  }, [openDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monitor selection and update toolbar state
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      // 1. Check Inline Formats
      const formats = [];
      if (document.queryCommandState('bold')) formats.push('bold');
      if (document.queryCommandState('italic')) formats.push('italic');
      if (document.queryCommandState('underline')) formats.push('underline');

      // 2. Check Block Type
      try {
        const index = editor.blocks.getCurrentBlockIndex();
        if (index !== -1) {
          const block = editor.blocks.getBlockByIndex(index);
          if (block) {
            setBlockType(block.name.charAt(0).toUpperCase() + block.name.slice(1));
          }
        }
      } catch (e) {
        // ignore
      }

      // 3. Check Hyperlink
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const node = selection.anchorNode;
        // Search up the DOM tree to see if we are inside a link
        const anchorElement = node?.parentElement?.closest('a');
        if (anchorElement) {
          formats.push('link');
          // Update the link input value to show existing URL if we haven't manually opened the dropdown yet
          if (openDropdown !== 'link') {
            setLinkUrl(anchorElement.href);
          }
        } else if (openDropdown !== 'link') {
          // Clear link URL if not in a link and not typing a new one
          setLinkUrl('');
        }
      }

      setActiveFormats(formats);
    };

    document.addEventListener('selectionchange', updateState);
    return () => document.removeEventListener('selectionchange', updateState);
  }, [editor]);

  const toggleFormat = (command: string) => {
    document.execCommand(command, false);
    // Trigger a selection change to update UI
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      sel.removeAllRanges();
      sel.addRange(range);

      // Force EditorJS to detect the change and trigger its onChange callback
      // We must select the active block's contenteditable element because document.activeElement is the button we just clicked
      const activeBlockContent =
        document.querySelector('.ce-block--focused [contenteditable="true"]') ||
        document.querySelector('.ce-block--focused [contenteditable]');
      if (activeBlockContent) {
        // Dispatching on the editable element allows EditorJS mutation observers to catch it
        activeBlockContent.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const setBlock = async (type: string, level?: number) => {
    if (!editor) return;
    const index = editor.blocks.getCurrentBlockIndex();
    if (index === -1) return;

    try {
      const block = editor.blocks.getBlockByIndex(index);
      if (!block) return;
      const savedBlock = await block.save();
      if (!savedBlock || !savedBlock.data) return;
      const currentData = savedBlock.data;

      // EditorJS doesn't have a built-in convert method, so we replace the block
      editor.blocks.delete(index);

      let newData: Record<string, unknown> = {
        text: (currentData as { text?: string }).text || '',
      };
      if (type === 'header') {
        newData = { ...newData, level: level || 2 };
      }

      editor.blocks.insert(type.toLowerCase(), newData, {}, index, true);
    } catch (e) {
      // Failed to convert block
    }
    setOpenDropdown(null);
  };

  const applyFontFamily = (font: string) => {
    document.execCommand('fontName', false, font);
    setFontFamily(font);
    setOpenDropdown(null);
  };

  const applyFontSize = (label: string, value: string) => {
    document.execCommand('fontSize', false, value);
    setFontSize(label);
    setOpenDropdown(null);
  };

  const handleAlignment = async (align: string) => {
    if (!editor) return;
    try {
      const index = editor.blocks.getCurrentBlockIndex();
      if (index === -1) return;

      const block = editor.blocks.getBlockByIndex(index);
      if (!block) return;

      // The alignment blocktune plugin reads the class from the block wrapper during save.
      // Since editor.blocks.update() does not natively support tune updates in all 2.x versions,
      // we manually apply the class and then trigger an input event to force a save.
      const blockEl = block.holder || document.querySelector(`[data-id="${block.id}"]`);
      if (blockEl) {
        blockEl.classList.remove(
          'ce-tune-alignment--left',
          'ce-tune-alignment--center',
          'ce-tune-alignment--right',
          'ce-tune-alignment--justify',
        );
        blockEl.classList.add(`ce-tune-alignment--${align}`);
      }

      // Force EditorJS to detect the programmatic tune update and save
      setTimeout(() => {
        const editableElement =
          blockEl?.querySelector('[contenteditable="true"]') ||
          blockEl?.querySelector('[contenteditable]');
        if (editableElement) {
          editableElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 50);

      setAlignment(align);
    } catch (error) {
      // Failed to set alignment
    } finally {
      setOpenDropdown(null);
    }
  };

  const applyLink = () => {
    if (!linkUrl) return;

    // Restore selection
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }

    document.execCommand('createLink', false, linkUrl);

    // Force EditorJS to detect the change
    setTimeout(() => {
      const activeBlockContent =
        document.querySelector('.ce-block--focused [contenteditable="true"]') ||
        document.querySelector('.ce-block--focused [contenteditable]');
      if (activeBlockContent) {
        activeBlockContent.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 50);

    setOpenDropdown(null);
    setLinkUrl('');
  };

  const handleAction = (action: string) => {
    if (!editor) return;
    const currentIndex = editor.blocks.getCurrentBlockIndex();
    const insertIndex = currentIndex !== -1 ? currentIndex + 1 : editor.blocks.getBlocksCount();

    switch (action) {
      case 'link':
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        } else {
          savedSelectionRef.current = null;
        }
        setLinkUrl('');
        setOpenDropdown(openDropdown === 'link' ? null : 'link');
        return; // Early return to avoid closing dropdown below
      case 'image':
        onImageClick?.();
        break;
      case 'video':
        const videoUrl = prompt('Enter Video URL:');
        if (videoUrl) {
          editor.blocks.insert(
            'embed',
            { service: 'youtube', source: videoUrl, embed: videoUrl },
            {},
            insertIndex,
          );
        }
        break;
      case 'list-bullet':
        editor.blocks.insert('list', { style: 'unordered' }, {}, insertIndex);
        break;
      case 'list-ordered':
        editor.blocks.insert('list', { style: 'ordered' }, {}, insertIndex);
        break;
      case 'table':
        editor.blocks.insert('table', {}, {}, insertIndex);
        break;
      case 'quote':
        editor.blocks.insert('quote', {}, {}, insertIndex);
        break;
      case 'delimiter':
        editor.blocks.insert('delimiter', {}, {}, insertIndex);
        break;
    }
    setOpenDropdown(null);
  };

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    active,
    label,
    showArrow,
  }: {
    icon?: React.ElementType;
    onClick?: (e: React.MouseEvent) => void;
    active?: boolean;
    label?: string;
    showArrow?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        'h-8 flex items-center gap-1.5 px-2 rounded-md transition-all duration-200 shrink-0',
        active
          ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800',
      )}
    >
      {Icon && <Icon size={16} strokeWidth={2.5} />}
      {label && <span className="text-sm font-semibold whitespace-nowrap">{label}</span>}
      {showArrow && <ChevronDown size={12} className="opacity-50" />}
    </button>
  );

  const Divider = () => <div className="w-[1px] h-6 bg-gray-200 dark:bg-navy-700 mx-1 shrink-0" />;

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'flex items-center gap-1 p-1.5 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-full shadow-theme-lg mb-6 absolute left-1/2 -translate-x-1/2 z-[100] w-fit mx-auto max-w-full overflow-visible transition-all duration-300',
        !isVisible && 'opacity-0 pointer-events-none scale-95',
      )}
      style={{
        top: toolbarTop !== null ? `${toolbarTop}px` : '1rem',
      }}
    >
      {/* AI Button */}
      {/* <div className="relative">
        <ToolbarButton
          icon={Wand2}
          showArrow
          onClick={() => setOpenDropdown(openDropdown === 'ai' ? null : 'ai')}
        />
        {openDropdown === 'ai' && (
          <div
            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-2 z-[110]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase p-2 tracking-wider">AI Tools</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAIAction('improve');
              }}
              className="w-full text-left p-2 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg text-sm font-medium transition-colors"
            >
              ✨ Improve Writing
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAIAction('summarize');
              }}
              className="w-full text-left p-2 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg text-sm font-medium transition-colors"
            >
              📝 Summarize
            </button>
          </div>
        )}
      </div>

      <Divider /> */}

      {/* Block Type Selector */}
      <div className="relative">
        <ToolbarButton
          label={blockType}
          showArrow
          onClick={() => setOpenDropdown(openDropdown === 'block' ? null : 'block')}
        />
        {openDropdown === 'block' && (
          <div
            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-2 z-[110]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBlock('paragraph');
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <Type size={16} /> Paragraph
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBlock('header', 2);
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <span className="font-bold">H2</span> Heading 2
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBlock('header', 3);
                setBlockType('Heading 3');
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <span className="font-bold">H3</span> Heading 3
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBlock('header', 4);
                setBlockType('Heading 4');
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <span className="font-bold">H4</span> Heading 4
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Font Family Selector */}
      <div className="relative">
        <ToolbarButton
          icon={Baseline}
          label={fontFamily}
          showArrow
          onClick={() => setOpenDropdown(openDropdown === 'fontFamily' ? null : 'fontFamily')}
        />
        {openDropdown === 'fontFamily' && (
          <div
            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-2 z-[110]"
            onMouseDown={(e) => e.preventDefault()}
          >
            {[
              { label: 'Default', value: 'inherit' },
              { label: 'Inter', value: "'Inter', sans-serif" },
              { label: 'Playfair', value: "'Playfair Display', serif" },
              { label: 'Roboto', value: "'Roboto', sans-serif" },
              { label: 'Mono', value: "'JetBrains Mono', monospace" },
            ].map((font) => (
              <button
                key={font.value}
                onClick={(e) => {
                  e.stopPropagation();
                  applyFontFamily(font.value);
                  setFontFamily(font.label);
                }}
                className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Font Size Selector */}
      <div className="relative">
        <ToolbarButton
          icon={ALargeSmall}
          label={fontSize}
          showArrow
          onClick={() => setOpenDropdown(openDropdown === 'fontSize' ? null : 'fontSize')}
        />
        {openDropdown === 'fontSize' && (
          <div
            className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-2 z-[110]"
            onMouseDown={(e) => e.preventDefault()}
          >
            {[
              { label: 'Small', value: '1' },
              { label: 'Normal', value: '3' },
              { label: 'Large', value: '5' },
              { label: 'Extra Large', value: '7' },
            ].map((size) => (
              <button
                key={size.value}
                onClick={(e) => {
                  e.stopPropagation();
                  applyFontSize(size.label, size.value);
                }}
                className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
              >
                {size.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Basic Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={Bold}
          active={activeFormats.includes('bold')}
          onClick={() => toggleFormat('bold')}
        />
        <ToolbarButton
          icon={Italic}
          active={activeFormats.includes('italic')}
          onClick={() => toggleFormat('italic')}
        />
        <ToolbarButton
          icon={Underline}
          active={activeFormats.includes('underline')}
          onClick={() => toggleFormat('underline')}
        />

        {/* Color Dropdown */}
        <div className="relative">
          <ToolbarButton
            icon={Palette}
            showArrow
            onClick={() => setOpenDropdown(openDropdown === 'color' ? null : 'color')}
          />
          {openDropdown === 'color' && (
            <div
              className="absolute top-full left-0 mt-2 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-3 z-[110]"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-5 gap-2 w-40">
                {[
                  // Grayscale
                  '#000000',
                  '#334155',
                  '#64748b',
                  '#cbd5e1',
                  '#ffffff',
                  // Reds & Oranges
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#eab308',
                  '#84cc16',
                  // Greens & Teals
                  '#22c55e',
                  '#10b981',
                  '#14b8a6',
                  '#06b6d4',
                  '#0ea5e9',
                  // Blues & Purples
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#a855f7',
                  '#d946ef',
                  // Pinks & Dark tones
                  '#ec4899',
                  '#f43f5e',
                  '#7f1d1d',
                  '#1e3a8a',
                  '#4c1d95',
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.execCommand('foreColor', false, c);
                      setOpenDropdown(null);

                      // Force EditorJS to detect the color change
                      setTimeout(() => {
                        const activeBlockContent =
                          document.querySelector('.ce-block--focused [contenteditable="true"]') ||
                          document.querySelector('.ce-block--focused [contenteditable]');
                        if (activeBlockContent) {
                          activeBlockContent.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 50);
                    }}
                    className="w-6 h-6 rounded-md border border-gray-100 dark:border-navy-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* Alignment */}
      <div className="relative">
        <ToolbarButton
          icon={
            alignment === 'center'
              ? AlignCenter
              : alignment === 'right'
                ? AlignRight
                : alignment === 'justify'
                  ? AlignJustify
                  : AlignLeft
          }
          showArrow
          onClick={() => setOpenDropdown(openDropdown === 'align' ? null : 'align')}
        />
        {openDropdown === 'align' && (
          <div
            className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-2 z-[110]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAlignment('left');
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <AlignLeft size={16} /> Left
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAlignment('center');
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <AlignCenter size={16} /> Center
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAlignment('right');
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-sm font-medium"
            >
              <AlignRight size={16} /> Right
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Media & Links */}
      <div className="flex items-center gap-0.5 relative">
        <ToolbarButton
          icon={LinkIcon}
          active={activeFormats.includes('link')}
          onClick={() => handleAction('link')}
        />
        {openDropdown === 'link' && (
          <div
            className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-theme-xl p-2 z-[110] flex gap-2"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyLink();
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-navy-600 rounded-lg bg-gray-50 dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                applyLink();
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Add
            </button>
          </div>
        )}
        <ToolbarButton icon={ImageIcon} onClick={() => handleAction('image')} />
        <ToolbarButton icon={VideoIcon} onClick={() => handleAction('video')} />
      </div>
    </div>
  );
}
