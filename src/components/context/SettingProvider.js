import React, { createContext, useContext, useState } from 'react'


const SettingContext = createContext()

export const useSettingContext = ()=> {
    return useContext(SettingContext)
}

const SettingProvider = ({children}) => {


    let localShowHint = localStorage.getItem('showHint')==='false'?false:true;
    let localGrammarCheck = localStorage.getItem('grammarCheck')==='false'?false:true;
    console.log(localStorage.getItem('showHint'),localStorage.getItem('grammarCheck'))
    const [showHint, setShowHint] = useState(localShowHint)
    const [grammarCheck, setGrammarCheck] = useState(localGrammarCheck)

    const toggleHint = ()=>{
        localStorage.setItem('showHint',!showHint)
        setShowHint(!showHint);
    }

    const toggleGrammar = ()=>{
        localStorage.setItem('grammarCheck',!grammarCheck)
        setGrammarCheck(!grammarCheck);
    }

    return (
        <SettingContext.Provider value={{showHint, toggleHint,grammarCheck,toggleGrammar}}>
            {children}
        </SettingContext.Provider>
    )
}



export default SettingProvider
