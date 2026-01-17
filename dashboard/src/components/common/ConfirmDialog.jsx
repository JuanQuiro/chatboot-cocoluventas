import React from 'react';
import './ConfirmDialog.css';
import Modal from './Modal';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning' // warning, danger, info
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const icons = {
        warning: '⚠️',
        danger: '🗑️',
        info: 'ℹ️'
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="small"
            showCloseButton={false}
        >
            <div className="confirm-dialog">
                <div className={`confirm-icon confirm-icon-${type}`}>
                    {icons[type]}
                </div>
                <h3 className="confirm-title">{title}</h3>
                {message && <p className="confirm-message">{message}</p>}

                <div className="confirm-actions">
                    <button onClick={onClose} className="btn-cancel">
                        {cancelText}
                    </button>
                    <button onClick={handleConfirm} className={`btn-confirm btn-confirm-${type}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
