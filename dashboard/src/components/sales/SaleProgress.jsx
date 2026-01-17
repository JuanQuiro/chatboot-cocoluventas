// SaleProgress.jsx - Visual progress indicator
import React from 'react';
import { motion } from 'framer-motion';
import { User, Package, CreditCard, Check } from 'lucide-react';
import './SaleProgress.css';

const steps = [
    { id: 'client', label: 'Cliente', icon: User },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'payment', label: 'Pago', icon: CreditCard }
];

const SaleProgress = ({ client, cartItems = [], paymentType }) => {
    const stepStatus = {
        client: !!client,
        products: cartItems.length > 0,
        payment: !!paymentType
    };

    const completedCount = Object.values(stepStatus).filter(Boolean).length;

    return (
        <div className="sale-progress">
            <div className="sp-steps">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isComplete = stepStatus[step.id];
                    const isCurrent = !isComplete && (index === 0 || stepStatus[steps[index - 1]?.id]);

                    return (
                        <React.Fragment key={step.id}>
                            {index > 0 && (
                                <div className={`sp-connector ${stepStatus[steps[index - 1]?.id] ? 'complete' : ''}`}>
                                    <motion.div
                                        className="sp-connector-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: stepStatus[steps[index - 1]?.id] ? '100%' : '0%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            )}

                            <motion.div
                                className={`sp-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="sp-step-icon">
                                    {isComplete ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <Check size={16} />
                                        </motion.div>
                                    ) : (
                                        <Icon size={16} />
                                    )}
                                </div>
                                <span className="sp-step-label">{step.label}</span>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="sp-summary">
                <span className="sp-completed">{completedCount}/{steps.length}</span>
                <span className="sp-text">pasos completados</span>
            </div>
        </div>
    );
};

export default SaleProgress;
