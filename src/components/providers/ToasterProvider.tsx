'use client';

import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { X } from 'lucide-react';

export const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 999999,
        top: '90px', // Shift down to appear below the header
      }}
      toastOptions={{
        className:
          'dark:bg-navy-900/90 dark:text-white border border-gray-200 dark:border-navy-700 shadow-2xl backdrop-blur-md',
        duration: 7000,
        style: {
          borderRadius: '16px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToasterProvider;
