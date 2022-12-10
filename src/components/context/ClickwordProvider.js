import React, { createContext, useContext, useState } from 'react'


const ClickwordContext = createContext()

export const useClickwordContext = ()=> {
    return useContext(ClickwordContext)
}

const ClickwordProvider = ({children}) => {

    const [clickedWord, setClickedWord] = useState('')
    

    return (
        <ClickwordContext.Provider value={{clickedWord, setClickedWord}}>
            {children}
        </ClickwordContext.Provider>
    )
}



export default ClickwordProvider
