'use client';

import React from 'react';
import { VariablesManagement } from '@/modules/communications/components/VariablesManagement';

export default function VariablesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">
          Template Variables
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
          Define display labels, dot-notation data paths, types, and classification categories for
          dynamic template tags.
        </p>
      </div>

      {/* Variables Management Component */}
      <VariablesManagement />
    </div>
  );
}
