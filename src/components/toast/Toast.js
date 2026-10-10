import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import './Toast.css'

const ToastContext = createContext(() => {})

export const useToast = () => {
    return useContext(ToastContext)
}

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])
    const nextId = useRef(0)

    const showToast = useCallback((message, duration = 1500) => {
        const id = nextId.current++
        setToasts((prev) => [{ id, message }, ...prev].slice(0, 3))
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
    }, [])

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className='toasts' role='status' aria-live='polite'>
                {toasts.map((t) => (
                    <div key={t.id} className='toast'>{t.message}</div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export default ToastProvider
