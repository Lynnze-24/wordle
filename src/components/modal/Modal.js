import React, { useEffect, useRef } from 'react'
import { FaTimes } from 'react-icons/fa'
import './Modal.css'

// Native <dialog>: focus trapping, Escape to close and the top layer come for free.
const Modal = ({ open, onClose, labelledBy, children }) => {
    const ref = useRef(null)

    useEffect(() => {
        const dialog = ref.current
        if (!dialog || typeof dialog.showModal !== 'function') return
        if (open && !dialog.open) {
            dialog.showModal()
            const preferred = dialog.querySelector('[data-autofocus]')
            if (preferred) preferred.focus()
        } else if (!open && dialog.open) {
            dialog.close()
        }
    }, [open])

    return (
        <dialog
            ref={ref}
            className='modal'
            aria-labelledby={labelledBy}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && onClose()}
        >
            {open && (
                <div className='modalBody'>
                    <button type='button' className='modalClose' aria-label='Close' onClick={onClose}>
                        <FaTimes aria-hidden />
                    </button>
                    {children}
                </div>
            )}
        </dialog>
    )
}

export default Modal
