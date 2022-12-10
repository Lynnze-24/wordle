import React, { useEffect, useState } from 'react'
import { useClickwordContext } from '../components/context/ClickwordProvider';
import KeyBoard from '../components/KeyBoard/KeyBoard';
import Blocks from '../components/displayBlocks/Blocks'
import fiveWords from '../wordFive'
import Footer from '../components/footer/Footer';

const Main = () => {

  const [answer,setAnswer] = useState('');
  const [inputs, setInputs] = useState(Array(6).fill(''));
  const [currentIndex,setCurrentIndex] = useState(0)
  const wordLength = 5;
  const[isGameOver,setIsGameOver] = useState(false);
   const {setClickedWord} = useClickwordContext()
  

  useEffect(()=>{
    setAnswer(fiveWords[Math.floor(Math.random() *  fiveWords.length)])
  },[])

  const resetWordle = ()=>{
    
    setInputs(Array(6).fill(''))
    setCurrentIndex(0)
    setIsGameOver(false)
    setAnswer(fiveWords[Math.floor(Math.random() *  fiveWords.length)])
  }

  useEffect(() => {
    const keyupHandler = (e)=> {
      
      console.log(e)
      if(e.code.startsWith('Key')){
        setClickedWord(e.key)
        setInputs((prev) => prev.map((x,i)=> (i=== currentIndex && x.length< wordLength)? x + e.key:x ))
      }
      if(e.code === 'Backspace'){
        setClickedWord(e.key)
        setInputs((prev) => prev.map((x,i)=> (i=== currentIndex && x.length>0)? x.substring(0,x.length-1) :x ))
      }
      if(e.code === 'Enter'){
        setClickedWord(e.key)
        if(isGameOver){
          resetWordle()
        }
        if(currentIndex<6 && inputs[currentIndex].length === wordLength){
          setCurrentIndex((prev)=> prev+1)
          if(answer === inputs[currentIndex] || currentIndex===5) setIsGameOver(true);
        }
        
      }

    }
    document.addEventListener('keyup', keyupHandler)
    return () => document.removeEventListener('keyup', keyupHandler)
    
  }, [currentIndex,wordLength,inputs,answer,isGameOver,setClickedWord])

    return (
        <>
         <div className='blockRowCon'>
          {
            inputs.map((input,index)=> (
              <Blocks isFinished={currentIndex>index} answer={answer} key={index} wordLength={wordLength} word={input} />
            ))
          }
        
        </div>
        <KeyBoard />
        {isGameOver && (<div className='gameOver'>
          <p>{answer === inputs[currentIndex-1]? 'Congratulations. You Won!' : 'Sorry. You Lose!'}</p> 
          <span>The answer was  <q>{answer}</q> </span>
          <button onClick={resetWordle} >Play Again</button>
        </div>)}
        <Footer isMain={true}/>
        </>
      )
}

export default Main
