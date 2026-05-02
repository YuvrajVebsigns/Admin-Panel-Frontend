'use client';

import { Toaster } from 'react-hot-toast';

export const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 999999, // Extra high z-index
      }}
      toastOptions={{
        className:
          'dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xl',
        duration: 10000,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        },
      }}
    />
  );
};

export default ToasterProvider;
