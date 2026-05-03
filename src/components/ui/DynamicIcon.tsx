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
  // Convert kebab-case or snake_case to PascalCase for Lucide icons
  const pascalName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  // Get the icon component from the Lucide library
  const IconComponent =
    (Icons as unknown as Record<string, LucideIcon>)[pascalName] ||
    (Icons as unknown as Record<string, LucideIcon>)[name];

  if (!IconComponent) {
    return <HelpCircle className={`text-gray-300 ${className}`} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon;
