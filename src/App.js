import { useState,useEffect } from 'react';
import './App.css';
import Blocks from './components/displayBlocks/Blocks';
import Header from './components/header/Header';
import fiveWords from './wordFive';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import About from './components/About';
import Footer from './components/footer/Footer';

function App() {

  const [answer,setAnswer] = useState('hello');
  const [inputs, setInputs] = useState(Array(6).fill(''));
  const [currentIndex,setCurrentIndex] = useState(0)
  const wordLength = 5;
  const[isGameOver,setIsGameOver] = useState(false);
  

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
      if(e.code.startsWith('Key')){
        setInputs((prev) => prev.map((x,i)=> (i=== currentIndex && x.length< wordLength)? x + e.key:x ))
      }
      if(e.code === 'Backspace'){
        setInputs((prev) => prev.map((x,i)=> (i=== currentIndex && x.length>0)? x.substring(0,x.length-1) :x ))
      }
      if(e.code === 'Enter'){
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
    
  }, [currentIndex,wordLength,inputs,answer,isGameOver])

  return (
    <Router>
    <div className="App">
      <Header />
     
      <Routes>
        <Route exact path='/' element={
         (
            <>
             <div className='blockRowCon'>
              {
                inputs.map((input,index)=> (
                  <Blocks isFinished={currentIndex>index} answer={answer} key={index} wordLength={wordLength} word={input} />
                ))
              }
            
            </div>
            {isGameOver && (<div className='gameOver'>
              <p>{answer === inputs[currentIndex-1]? 'Congratulations. You Won!' : 'Sorry. You Lose!'}</p> 
              <span>The answer was {answer}</span>
              <button onClick={resetWordle} >Play Again</button>
            </div>)}
            </>
          )
        }/>
      
        <Route path='/about' element={<About />} />

        
       
      </Routes>
      <Footer/>
    </div>
    </Router>
  );
}

export default App;
