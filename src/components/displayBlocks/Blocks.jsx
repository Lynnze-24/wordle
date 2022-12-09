import React from 'react'
import './Blocks.css'


const Block = ({letter='',answer,index,isFinished})=> {

    const isCorrect = letter === answer[index];
    const isIncluded = answer.includes(letter)
    const dynamicClass =letter===''?'':isCorrect?'correct':isIncluded?'included':'wrong';

    return(
        <div className={isFinished ? `block ${dynamicClass}`: 'block'} >
            {letter}
        </div>
    )
}

const Blocks = ({answer,wordLength,word,isFinished}) => {
    const blockArr = word.split('').concat(Array(wordLength - word.length).fill(''));
   
    return (
        <div className='blocksCon'>
            {
             blockArr.map((item,index)=> (
                 <Block isFinished={isFinished} index={index} answer={answer} key={index} letter={item} />
             ))
            }
        </div>
    )
}

export default Blocks
