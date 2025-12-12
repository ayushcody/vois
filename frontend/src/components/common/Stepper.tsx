import React from 'react';
import { theme } from '../../styles/theme';
import { Check } from 'lucide-react';

interface StepperProps {
    steps: string[];
    currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isCompleted ? theme.colors.success : isCurrent ? theme.colors.primary : theme.colors.gray300,
                                color: theme.colors.white,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                marginBottom: theme.spacing.sm,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {isCompleted ? <Check size={16} /> : index + 1}
                        </div>
                        <span
                            style={{
                                fontSize: theme.typography.caption,
                                color: isCurrent ? theme.colors.text : theme.colors.textSecondary,
                                fontWeight: isCurrent ? 600 : 400,
                                textAlign: 'center',
                            }}
                        >
                            {step}
                        </span>
                        {index < steps.length - 1 && (
                            <div
                                style={{
                                    height: '2px',
                                    backgroundColor: theme.colors.gray300,
                                    flex: 1,
                                    position: 'absolute',
                                    zIndex: -1,
                                    display: 'none' // Simplified, drawing connecting lines in stepper is complex in inline CSS
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
