'use client';

import React, { createContext, useState, ReactNode, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'auto';
export type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

export interface ModalConfig {
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  onCloseCallback?: () => void;
  className?: string; // Allow custom styling for the modal container
}

export interface ConfirmConfig {
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  size?: ModalSize;
}

interface ModalState extends ModalConfig {
  isOpen: boolean;
  confirmConfig?: ConfirmConfig;
  isConfirmLoading?: boolean;
}

interface ModalContextType {
  modalState: ModalState;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
  confirm: (config: ConfirmConfig) => void;
  setConfirmLoading: (loading: boolean) => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

const defaultState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  content: null,
  actions: null,
  size: 'md',
  showCloseButton: true,
  hideHeader: false,
  hideFooter: false,
  confirmConfig: undefined,
  isConfirmLoading: false,
  className: '',
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>(defaultState);

  const openModal = useCallback((config: ModalConfig) => {
    setModalState({
      ...defaultState,
      ...config,
      isOpen: true,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => {
      if (prev.onCloseCallback) {
        prev.onCloseCallback();
      }
      return { ...prev, isOpen: false };
    });

    // Clear content after animation
    setTimeout(() => {
      setModalState(defaultState);
    }, 300);
  }, []);

  const confirm = useCallback((config: ConfirmConfig) => {
    setModalState({
      ...defaultState,
      isOpen: true,
      size: config.size || 'md',
      confirmConfig: config,
    });
  }, []);

  const setConfirmLoading = useCallback((loading: boolean) => {
    setModalState((prev) => ({ ...prev, isConfirmLoading: loading }));
  }, []);

  return (
    <ModalContext.Provider
      value={{ modalState, openModal, closeModal, confirm, setConfirmLoading }}
    >
      {children}
    </ModalContext.Provider>
  );
};
