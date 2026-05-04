'use client';

import React, { useState } from "react";
import { Box, Users } from "lucide-react";

type MetricItem = {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
};

const metrics: MetricItem[] = [
  { label: "TOTAL WEBSITES", value: "11", color: "bg-purple-600", icon: <Box size={18} /> },
  { label: "TOTAL BLOGS", value: "38", color: "bg-yellow-500", icon: <Box size={18} /> },
  { label: "TOTAL EVENTS", value: "18", color: "bg-green-600", icon: <Users size={18} /> },
  { label: "TOTAL SPONSORS", value: "27", color: "bg-red-600", icon: <Box size={18} /> },
  { label: "REGISTRATIONS", value: "2,500", color: "bg-indigo-600", icon: <Users size={18} /> },
  { label: "TOTAL NOMINATORS", value: "5", color: "bg-cyan-600", icon: <Users size={18} /> },
  { label: "TOTAL NOMINEES", value: "10", color: "bg-emerald-600", icon: <Box size={18} /> },
  { label: "ATTENDANCE", value: "1,200", color: "bg-orange-600", icon: <Users size={18} /> },
];

export default function MetricsCards() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="w-full mx-0 px-0 py-4">

      {/* GRID */}
      <div className="w-full max-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6 items-stretch">

        {metrics.map((item, index) => (
          <div key={index} className="col-span-1">
            <Card
              item={item}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(index)}
            />
          </div>
        ))}

      </div>

    </div>
  );
}

/* CARD COMPONENT */
function Card({
  item,
  isActive,
  onClick,
}: {
  item: MetricItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`group w-full h-full min-h-[132px] rounded-2xl border bg-white p-5 flex flex-col justify-between text-left transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] dark:bg-[#0f172a] ${
        isActive
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-lg dark:border-blue-500 dark:ring-blue-900/40'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >

      {/* Icon */}
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${item.color} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
        <div className="text-white transition-transform duration-300 group-hover:rotate-6">
          {item.icon}
        </div>
      </div>
      <br />

      {/* Text */}
      <div>
        <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase dark:text-gray-400">
          {item.label}
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-1 dark:text-white">
          {item.value}
        </h3>
      </div>

    </button>
  );
}