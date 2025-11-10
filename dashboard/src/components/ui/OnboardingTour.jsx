import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const OnboardingTour = ({ steps, onComplete, storageKey = 'onboarding-completed' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has completed onboarding
        const completed = localStorage.getItem(storageKey);
        if (!completed) {
            setIsVisible(true);
        }
    }, [storageKey]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, 'skipped');
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, 'completed');
        onComplete?.();
    };

    const step = steps[currentStep];

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleSkip}
                />

                {/* Spotlight */}
                {step.target && (
                    <div 
                        className="absolute pointer-events-none"
                        style={{
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                        }}
                    />
                )}

                {/* Tour Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        {/* Icon or Image */}
                        {step.icon && (
                            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 text-blue-600">
                                {step.icon}
                            </div>
                        )}

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-6">
                            {step.description}
                        </p>

                        {/* Progress */}
                        <div className="flex items-center gap-1 mb-6">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 flex-1 rounded-full transition-colors ${
                                        index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleSkip}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Saltar tour
                            </button>

                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrev}
                                        icon={<ChevronLeft size={16} />}
                                    >
                                        Anterior
                                    </Button>
                                )}

                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    icon={currentStep === steps.length - 1 ? null : <ChevronRight size={16} />}
                                >
                                    {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
                                </Button>
                            </div>
                        </div>

                        {/* Step counter */}
                        <div className="text-center mt-4 text-sm text-gray-500">
                            Paso {currentStep + 1} de {steps.length}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OnboardingTour;
