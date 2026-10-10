import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { loadFlag, saveFlag } from '../../lib/storage'

const SettingContext = createContext()

export const useSettingContext = () => {
    return useContext(SettingContext)
}

// Storage keys predate the rename of "Grammar Check" to "Word Check"; keep them so saved choices survive.
const SETTINGS = {
    hardMode: { key: 'hardMode', fallback: false },
    showHint: { key: 'showHint', fallback: true },
    wordCheck: { key: 'grammarCheck', fallback: true },
    colorBlind: { key: 'colorBlind', fallback: false },
}

const loadSettings = () =>
    Object.fromEntries(Object.entries(SETTINGS).map(([name, { key, fallback }]) => [name, loadFlag(key, fallback)]))

const SettingProvider = ({ children }) => {
    const [settings, setSettings] = useState(loadSettings)

    const setSetting = useCallback((name, value) => {
        saveFlag(SETTINGS[name].key, value)
        setSettings((prev) => ({ ...prev, [name]: value }))
    }, [])

    const value = useMemo(() => ({ ...settings, setSetting }), [settings, setSetting])

    return (
        <SettingContext.Provider value={value}>
            {children}
        </SettingContext.Provider>
    )
}

export default SettingProvider
