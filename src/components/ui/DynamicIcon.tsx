'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { HelpCircle, LucideIcon } from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size = 20 }) => {
  // Get the icon component from the Lucide library
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[name];

  if (!IconComponent) {
    return <HelpCircle className={`text-gray-300 ${className}`} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon;
