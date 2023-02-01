import React, {  useCallback, useEffect, useState } from 'react'
import { FaArrowLeft, FaLevelDownAlt } from 'react-icons/fa'
import { useClickwordContext } from '../context/ClickwordProvider'
import './KeyBlocks.css'

const KeyBlock = ({keyItem})=> {

    const [isClicking, setIsClicking] = useState(false)
    const {clickedWord, setClickedWord} = useClickwordContext()


    
    
    const keyClickHandler = useCallback(()=> {
        setIsClicking(true)
        setTimeout(()=>{
            setIsClicking(false)
            if(clickedWord)setClickedWord('')
        },100)
    },[clickedWord,setClickedWord])

    const keyBoardVirtualHandler = () => {
            const code =(keyItem ==='Enter' || keyItem === 'Backspace') ? keyItem : `Key${keyItem.toUpperCase()}`
            const event = new KeyboardEvent('keyup', {key: keyItem, code: code,});
            document.dispatchEvent(event);
            keyClickHandler()
    }

    useEffect(()=>{
        if(clickedWord===keyItem && !isClicking){
            keyClickHandler()
        }
    },[clickedWord,isClicking,keyClickHandler,keyItem])

   
    

    return(
        <div onClick={keyBoardVirtualHandler} className={`KeyBlock ${isClicking && 'pressed'}`}>
            {keyItem ==='Enter'? (<FaLevelDownAlt style={{transform:'rotateZ(90deg)'}}/>) :
            keyItem ==='Backspace'?(<FaArrowLeft/>) :keyItem}
        </div>
    )
}

const KeyBlocks = ({keyList,isLast}) => {
    const keyListArr = isLast? ['Backspace',...keyList.split(''),'Enter'] :keyList.split('')

    return (
        <div className='KeyBlocks'>
            {keyListArr.map((keyItem,index)=> (<KeyBlock key={index} keyItem={keyItem} />))}
        </div>
    )
}

export default KeyBlocks
