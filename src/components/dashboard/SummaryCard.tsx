import React from 'react';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgIllustration?: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  bgIllustration,
  iconBgColor,
  iconTextColor,
  onClick,
  isActive = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden flex items-center p-5 bg-white border rounded-xl shadow-theme-xs transition-all duration-300 dark:bg-navy-800 ${
        onClick ? 'cursor-pointer hover:shadow-theme-md hover:-translate-y-1' : ''
      } ${
        isActive ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-100 dark:border-navy-700'
      }`}
    >
      {/* Background Illustration Watermark */}
      {bgIllustration && (
        <div
          className={`absolute -right-4 -bottom-4 opacity-[0.07] dark:opacity-[0.05] pointer-events-none transform -rotate-12 ${iconTextColor}`}
        >
          {bgIllustration}
        </div>
      )}

      <div
        className={`relative z-10 flex shrink-0 items-center justify-center w-14 h-14 rounded-2xl mr-4 ${iconBgColor} ${iconTextColor}`}
      >
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400 mb-1.5 tracking-wider">
          {title}
        </h3>
        <p className="text-[26px] leading-none font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};
