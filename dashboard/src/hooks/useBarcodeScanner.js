// useBarcodeScanner.js - Hook para escaneo de código de barras
import { useState, useEffect, useCallback } from 'react';

export const useBarcodeScanner = (onScan) => {
    const [barcode, setBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let buffer = '';
        let timeout;

        const handleKeyPress = (e) => {
            // Detectar escaneo de barcode (entrada rápida)
            if (timeout) clearTimeout(timeout);

            if (e.key === 'Enter') {
                if (buffer.length > 3) {
                    setBarcode(buffer);
                    if (onScan) {
                        onScan(buffer);
                    }
                    setIsScanning(false);
                }
                buffer = '';
            } else {
                buffer += e.key;
                setIsScanning(true);

                timeout = setTimeout(() => {
                    buffer = '';
                    setIsScanning(false);
                }, 100);
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            if (timeout) clearTimeout(timeout);
        };
    }, [onScan]);

    const clearBarcode = useCallback(() => {
        setBarcode('');
    }, []);

    return {
        barcode,
        isScanning,
        clearBarcode
    };
};

export default useBarcodeScanner;
