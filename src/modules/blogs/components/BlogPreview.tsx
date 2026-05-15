'use client';
import React from 'react';
import Image from 'next/image';

import { BlogContent } from '../types/blog.types';

interface BlogPreviewProps {
  title: string;
  content: BlogContent | null;
  featureImage?: string;
}

export const BlogPreview: React.FC<BlogPreviewProps> = ({ title, content, featureImage }) => {
  const hasContent = content && content.blocks && content.blocks.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-navy-800 flex items-center justify-center mb-6">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 dark:text-gray-500"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
          No Content to Preview
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
          Add at least one block in the Content Editor first, then click Preview to see how your
          blog will look on the website.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-navy-900 min-h-screen">
      {/* Featured Image */}
      {featureImage && (
        <div className="relative w-full h-[400px] mb-10 overflow-hidden rounded-b-3xl">
          <Image src={featureImage} alt={title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {title || 'Untitled Blog'}
            </h1>
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 pb-20">
        {!featureImage && (
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-10 leading-tight">
            {title || 'Untitled Blog'}
          </h1>
        )}

        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-brand-500 prose-img:rounded-2xl">
          {(content.blocks || []).map((block, index) => {
            if (!block || !block.data) return null;

            // Extract alignment from tunes
            const alignment = block.tunes?.alignment?.alignment || '';
            const alignClass =
              alignment === 'center'
                ? 'text-center'
                : alignment === 'right'
                  ? 'text-right'
                  : alignment === 'justify'
                    ? 'text-justify'
                    : '';

            switch (block.type) {
              case 'header':
                const Level = `h${block.data.level || 2}` as
                  | 'h1'
                  | 'h2'
                  | 'h3'
                  | 'h4'
                  | 'h5'
                  | 'h6';
                return (
                  <Level
                    key={index}
                    className={alignClass}
                    dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
                  />
                );

              case 'paragraph':
                return (
                  <p
                    key={index}
                    className={alignClass}
                    dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
                  />
                );

              case 'list':
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                  <ListTag key={index} className={alignClass}>
                    {(block.data.items || []).map((item: string, i: number) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ListTag>
                );

              case 'checklist':
                return (
                  <div key={index} className="space-y-2 my-4">
                    {(block.data.items || []).map(
                      (item: { checked: boolean; text: string }, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${item.checked ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 dark:border-navy-600'}`}
                          >
                            {item.checked && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-gray-700 dark:text-gray-300 ${item.checked ? 'line-through opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: item.text }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                );

              case 'table':
                return (
                  <div key={index} className="overflow-x-auto my-8">
                    <table className="w-full border-collapse border border-gray-100 dark:border-navy-700 rounded-xl overflow-hidden">
                      <tbody>
                        {(block.data.content || []).map((row: string[], i: number) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? 'bg-gray-50/50 dark:bg-navy-800/30' : ''}
                          >
                            {row.map((cell: string, j: number) => (
                              <td
                                key={j}
                                className="border border-gray-100 dark:border-navy-700 p-4 text-sm"
                                dangerouslySetInnerHTML={{ __html: cell }}
                              />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );

              case 'code':
                return (
                  <div key={index} className="relative group my-8">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gray-200 dark:bg-navy-800 text-[10px] font-bold text-gray-500 rounded-bl-lg rounded-tr-2xl uppercase tracking-widest">
                      Code
                    </div>
                    <pre className="bg-gray-50 dark:bg-navy-950 p-6 pt-10 rounded-2xl overflow-x-auto border border-gray-100 dark:border-navy-800">
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
                        {block.data.code}
                      </code>
                    </pre>
                  </div>
                );

              case 'raw':
                return (
                  <div
                    key={index}
                    className="my-8 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-800 p-4"
                    dangerouslySetInnerHTML={{ __html: block.data.html }}
                  />
                );

              case 'quote':
                const quoteAlign = block.data.alignment === 'center' ? 'text-center' : alignClass;
                return (
                  <blockquote
                    key={index}
                    className={`border-l-4 border-brand-500 pl-6 my-8 italic ${quoteAlign}`}
                  >
                    <p
                      className="text-xl text-gray-800 dark:text-gray-200 mb-2"
                      dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
                    />
                    {block.data.caption && (
                      <cite className="text-sm font-medium text-gray-500 not-italic">
                        — {block.data.caption}
                      </cite>
                    )}
                  </blockquote>
                );

              case 'delimiter':
                return (
                  <div key={index} className="flex justify-center my-12">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-navy-700"></span>
                      <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                      <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-navy-700"></span>
                    </div>
                  </div>
                );

              case 'image':
                if (!block.data.file?.url) return null;
                return (
                  <figure key={index} className="my-10">
                    <div
                      className={`relative overflow-hidden rounded-3xl shadow-theme-lg ${block.data.withBackground ? 'bg-gray-50 dark:bg-navy-900 p-8' : ''} ${block.data.withBorder ? 'border-4 border-gray-100 dark:border-navy-700' : ''}`}
                    >
                      <img
                        src={block.data.file.url}
                        alt={block.data.caption || ''}
                        className={`mx-auto transition-transform duration-500 hover:scale-[1.02] ${block.data.stretched ? 'w-full' : 'max-w-full rounded-2xl'}`}
                      />
                    </div>
                    {block.data.caption && (
                      <figcaption className="text-center text-sm mt-4 text-gray-500 dark:text-gray-400 italic font-medium">
                        {block.data.caption}
                      </figcaption>
                    )}
                  </figure>
                );

              case 'embed':
                if (!block.data.embed) return null;
                return (
                  <div
                    key={index}
                    className="my-10 rounded-3xl overflow-hidden aspect-video shadow-theme-xl border-4 border-white dark:border-navy-800"
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src={block.data.embed}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={block.data.caption || 'Embed'}
                    />
                  </div>
                );

              case 'spacer':
                return <div key={index} className="h-12" />;

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};
