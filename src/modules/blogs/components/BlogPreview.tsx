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
                  <Level key={index} dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
                );

              case 'paragraph':
                return (
                  <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
                );

              case 'list':
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                  <ListTag key={index}>
                    {(block.data.items || []).map((item: string, i: number) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ListTag>
                );

              case 'quote':
                return (
                  <blockquote
                    key={index}
                    className={block.data.alignment === 'center' ? 'text-center' : ''}
                  >
                    <p dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
                    {block.data.caption && (
                      <cite className="text-sm opacity-60">— {block.data.caption}</cite>
                    )}
                  </blockquote>
                );

              case 'delimiter':
                return <hr key={index} className="my-10 border-gray-100 dark:border-navy-700" />;

              case 'image':
                if (!block.data.file?.url) return null;
                return (
                  <figure key={index} className="my-8">
                    <div
                      className={`relative overflow-hidden rounded-2xl ${block.data.withBackground ? 'bg-gray-50 p-8' : ''} ${block.data.withBorder ? 'border border-gray-100' : ''}`}
                    >
                      <img
                        src={block.data.file.url}
                        alt={block.data.caption || ''}
                        className={`mx-auto ${block.data.stretched ? 'w-full' : 'max-w-full'}`}
                      />
                    </div>
                    {block.data.caption && (
                      <figcaption className="text-center text-sm mt-3 text-gray-500 italic">
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
                    className="my-8 rounded-2xl overflow-hidden aspect-video shadow-lg"
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

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};
