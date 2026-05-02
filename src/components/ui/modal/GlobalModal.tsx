'use client';
import React from 'react';
import { Modal } from './index';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import Button from '@/components/ui/button/Button';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full m-4',
  auto: 'max-w-fit w-auto',
};

export const GlobalModal: React.FC = () => {
  const { modalState, closeModal, setConfirmLoading } = useGlobalModal();
  const {
    isOpen,
    title,
    description,
    content,
    actions,
    size = 'md',
    showCloseButton,
    hideHeader,
    hideFooter,
    confirmConfig,
    isConfirmLoading,
    className,
  } = modalState;

  if (!isOpen) return null;

  // Handle standard confirmation if confirmConfig is present
  const isConfirm = !!confirmConfig;
  const cTitle = isConfirm ? confirmConfig.title : title;
  const cDesc = isConfirm ? confirmConfig.message : description;
  const cType = isConfirm ? confirmConfig.type || 'warning' : 'info';
  const cSize = isConfirm ? confirmConfig.size || 'md' : size;

  const handleConfirm = async () => {
    if (!confirmConfig) return;
    try {
      setConfirmLoading(true);
      await confirmConfig.onConfirm();
      closeModal();
    } catch (error) {
      // Error handled silently or could be passed to a toast
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirmConfig?.onCancel) {
      confirmConfig.onCancel();
    }
    closeModal();
  };

  const renderIcon = () => {
    if (!isConfirm) return null;
    switch (cType) {
      case 'danger':
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <AlertTriangle size={28} />
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/10">
            <AlertCircle size={28} />
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600 dark:bg-success-500/10">
            <CheckCircle size={28} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <Info size={28} />
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      showCloseButton={showCloseButton !== undefined ? showCloseButton : !isConfirm}
      className={`p-0 overflow-hidden w-full transition-all duration-300 ${sizeClasses[cSize]} ${className || ''}`}
    >
      {isConfirm ? (
        <div className="p-8 sm:p-10 text-center">
          {renderIcon()}
          <h3 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">{cTitle}</h3>
          <div className="mt-3 text-base text-gray-500 dark:text-gray-400">{cDesc}</div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isConfirmLoading}
              className="w-full sm:w-auto px-8"
            >
              {confirmConfig.cancelText || 'Cancel'}
            </Button>
            <Button
              variant={cType === 'danger' ? 'primary' : 'primary'}
              onClick={handleConfirm}
              disabled={isConfirmLoading}
              className={`w-full sm:w-auto px-8 shadow-lg ${cType === 'danger' ? 'bg-error-600 hover:bg-error-700 shadow-error-500/20' : 'shadow-brand-500/20'}`}
            >
              {isConfirmLoading ? 'Processing...' : confirmConfig.confirmText || 'Confirm'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col max-h-[90vh]">
          {!hideHeader && (title || description) && (
            <div className="border-b border-gray-100 px-8 py-6 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              {title && (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              )}
              {description && (
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>
          )}

          <div className="overflow-y-auto px-8 py-6">{content}</div>

          {!hideFooter && actions && (
            <div className="border-t border-gray-100 px-8 py-5 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
              {actions}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
