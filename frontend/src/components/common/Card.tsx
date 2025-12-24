import React from 'react';
import { theme } from '../../styles/theme';

interface CardProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, header, footer, style, className }) => {
    return (
        <div
            className={className}
            style={{
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                overflow: 'hidden',
                border: `1px solid ${theme.colors.gray200}`,
                ...style,
            }}
        >
            {header && (
                <div
                    style={{
                        padding: theme.spacing.lg,
                        borderBottom: `1px solid ${theme.colors.gray200}`,
                        fontWeight: 600,
                        fontSize: theme.typography.h3,
                    }}
                >
                    {header}
                </div>
            )}
            <div style={{ padding: theme.spacing.lg }}>{children}</div>
            {footer && (
                <div
                    style={{
                        padding: theme.spacing.md,
                        backgroundColor: theme.colors.gray100,
                        borderTop: `1px solid ${theme.colors.gray200}`,
                    }}
                >
                    {footer}
                </div>
            )}
        </div>
    );
};
