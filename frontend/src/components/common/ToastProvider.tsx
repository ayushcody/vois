import React, { createContext, useContext, useState, useCallback } from 'react';
import { theme } from '../../styles/theme';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = useCallback((message: string, type: ToastType) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        backgroundColor: toast.type === 'error' ? theme.colors.error : toast.type === 'success' ? theme.colors.success : theme.colors.primary,
                        color: theme.colors.white,
                        padding: '12px 24px',
                        borderRadius: theme.borderRadius.md,
                        boxShadow: theme.shadows.lg,
                        zIndex: 2000,
                        animation: 'fadeIn 0.3s ease-in-out',
                    }}
                >
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
