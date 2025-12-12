import React from 'react';
import { theme } from '../../styles/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    style,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.white,
                    border: 'none',
                };
            case 'secondary':
                return {
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.white,
                    border: 'none',
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}`,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    color: theme.colors.textSecondary,
                    border: 'none',
                };
            default:
                return {};
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return { padding: '6px 12px', fontSize: '0.875rem' };
            case 'md':
                return { padding: '10px 20px', fontSize: '1rem' };
            case 'lg':
                return { padding: '14px 28px', fontSize: '1.125rem' };
            default:
                return {};
        }
    };

    const baseStyles: React.CSSProperties = {
        cursor: 'pointer',
        borderRadius: theme.borderRadius.md,
        fontWeight: 600,
        transition: 'opacity 0.2s',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
    };

    return (
        <button
            style={baseStyles}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            {...props}
        >
            {children}
        </button>
    );
};
