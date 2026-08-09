import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastType } from '../components/Toast';

interface ToastContextProps {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps>({
    showToast: () => {},
});

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            <View style={styles.container}>
                {children}
                {toast && (
                    <Toast message={toast.message} type={toast.type} onHide={hideToast} />
                )}
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
