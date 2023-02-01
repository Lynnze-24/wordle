import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useClickwordContext } from '../components/context/ClickwordProvider';
import KeyBoard from '../components/KeyBoard/KeyBoard';
import Blocks from '../components/displayBlocks/Blocks'
import Footer from '../components/footer/Footer';
import {  FaTimes, } from 'react-icons/fa';
import { useSettingContext } from '../components/context/SettingProvider';

const Main = () => {

  const [answer,setAnswer] = useState('');
  const [inputs, setInputs] = useState(Array(6).fill(''));
  const [currentIndex,setCurrentIndex] = useState(0)
  const [fiveWords, setFiveWords] = useState([])
  const [notExist, setNotExist] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [meaning, setMeaning] = useState('')
  const wordLength = 5;
  const[isGameOver,setIsGameOver] = useState(false);
   const {setClickedWord} = useClickwordContext()
  const firstLoad = useRef(false)
  const ansCheck = useRef(false)
  

  const{showHint,grammarCheck} = useSettingContext()

  
   useEffect(()=>{
     if(!fiveWords.length && !firstLoad.current){
       console.log('firstload')
       firstLoad.current = true
      fetch('/fiveWords.txt')
      .then((r)=> r.text())
      .then(d => {
        let dArr = d.split('\n')
        setFiveWords(dArr)
        setAnswer(dArr[Math.floor(Math.random() *  dArr.length)])
      })
      .catch(e=> console.log(e))
     }
     
   },[fiveWords.length])

  

  useEffect(()=>{
    
    if(answer && showHint && fiveWords.length && !ansCheck.current){
     
      ansCheck.current = true;
      console.log('answer check')
      setMeaning('Loading...')
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${answer}`)
      .then((r)=> {
        
        if(r.ok) return r.json()
        throw new Error('Smth went wrong!')
      })
      .then(d=> {
        console.log(d)
        ansCheck.current = false;
        setMeaning(d[0]?.meanings[0]?.definitions[0]?.definition)
      })
      .catch((e)=> {
        ansCheck.current = false;
        setAnswer(fiveWords[Math.floor(Math.random() *  fiveWords.length)])
      })
    }
      
  },[answer,fiveWords,showHint])

  const resetWordle = useCallback(()=>{
    setInputs(Array(6).fill(''))
    setCurrentIndex(0)
    setIsGameOver(false)
    setAnswer(fiveWords[Math.floor(Math.random() *  fiveWords.length)])
  },[fiveWords])

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
        setNotExist('')
        if((inputs[currentIndex].length !== wordLength) || isFetching)return;
        if(grammarCheck){
          setIsFetching(true);
          fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inputs[currentIndex]}`).then(
          (r)=> {
            console.log(r)
            if(!r.ok) {
              throw new Error('Smth went wrong!')
            }
          setClickedWord(e.key)
          if(isGameOver){
            resetWordle()
          }
          if(currentIndex<6 && inputs[currentIndex].length === wordLength){
            setCurrentIndex((prev)=> prev+1)
            setIsFetching(false)
            if(answer === inputs[currentIndex] || currentIndex===5) setIsGameOver(true);
          }
        }).catch((err)=>{
          setIsFetching(false)
          setNotExist(inputs[currentIndex]);
        })
        }else{
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

    }
    document.addEventListener('keyup', keyupHandler)
    return () => {
      document.removeEventListener('keyup', keyupHandler);
    }
    
  }, [answer,currentIndex,grammarCheck,inputs,isFetching,isGameOver,resetWordle,setClickedWord])

    return (
        <>
         <div className='blockRowCon'>
        {(notExist && grammarCheck) && <p className='notExist'><q>{notExist}</q> does not exist! <span 
                                                                                onClick={()=> setNotExist('') }>
          <FaTimes className='notExistDel' />
          </span></p>}
          {
            inputs.map((input,index)=> (
              <Blocks isFinished={currentIndex>index} answer={answer} key={index} wordLength={wordLength} word={input} />
            ))
          }
        
        </div>
        {showHint && (<p className='meaning'>{meaning ? `Hint : ${meaning}`:'No Hints available.'}</p>)}
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
