import React from 'react';
import { useRouter } from 'next/navigation';
import { MoveRight, Search } from 'lucide-react';
import Image from 'next/image';
import { ImageLinks } from '@/modules/websites/types/website.types';
import { getImageUrl } from '@/lib/utils';

export interface WebsiteCardProps {
  id: string;
  logo?: string | ImageLinks;
  title: string;
  status: 'ACTIVE' | 'INACTIVE';
  blogsCount: number;
  eventsCount: number;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  id,
  logo,
  title,
  status,
  blogsCount,
  eventsCount,
}) => {
  const router = useRouter();
  const resolvedLogoUrl = getImageUrl(logo);

  return (
    <div className="group relative flex flex-col p-5 bg-white border border-gray-100 rounded-2xl shadow-theme-sm hover:shadow-theme-lg hover:-translate-y-1 transition-all duration-300 dark:bg-navy-800 dark:border-navy-700">
      {/* Top Right Navigation Button */}
      <button
        onClick={() => router.push(`/websites/dashboard/${id}`)}
        className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all opacity-0 group-hover:opacity-100"
        title="View Dashboard"
      >
        <MoveRight size={18} />
      </button>

      {/* Top Header Section */}
      <div className="flex items-center gap-4 mb-2 pr-8">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-50 dark:bg-brand-500/5 flex items-center justify-center border border-brand-100/50 dark:border-brand-500/10 shrink-0">
          {resolvedLogoUrl ? (
            <Image
              src={resolvedLogoUrl}
              alt={title}
              fill
              sizes="56px"
              className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-50 dark:bg-brand-500/10 text-brand-500">
              <Search className="w-6 h-6" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-success-500 animate-pulse' : 'bg-gray-400'}`}
            ></span>
            <span
              className={`text-[11px] font-bold tracking-wider ${status === 'ACTIVE' ? 'text-success-600 dark:text-success-500' : 'text-gray-500'} uppercase`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Stats Section */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-navy-700/50">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
              Blogs
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
              {blogsCount}
            </p>
          </div>
          <div className="w-px h-6 bg-gray-100 dark:bg-navy-700 mx-1"></div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
              Events
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
              {eventsCount}
            </p>
          </div>
        </div>

        <div className="text-[10px] font-bold text-brand-600/50 dark:text-brand-400/50 uppercase tracking-widest group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          Active
        </div>
      </div>
    </div>
  );
};
