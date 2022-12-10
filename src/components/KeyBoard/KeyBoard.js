import React from 'react'
import KeyBlocks from '../keyBlocks/KeyBlocks'
import './KeyBoard.css'

const list = ['qwertyuiop','asdfghjkl','zxcvbnm']

const KeyBoard = () => {
    return (
        <div className='KeyBoard'>
            {list.map((item,index)=> (<KeyBlocks isLast={index===list.length-1} key={index} keyList={item}/>))}
        </div>
    )
}

export default KeyBoard
