import { useContext } from 'react';
import { ModalContext } from '../context/ModalContext';

export const useGlobalModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useGlobalModal must be used within a ModalProvider');
  }
  return context;
};
