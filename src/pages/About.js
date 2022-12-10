import React from 'react'
import Footer from '../components/footer/Footer'

const About = () => {


    return (
        <>
        
        <div className='about'>
            <div className='aboutImg'>
                <img src='/words.png' alt='words' />
            </div>
            <div className='aboutContent'>
            <h1>How To Play</h1>
            <ul>
                <li>Press your keyboard keys to input word.</li>
                <li>Press Backspace to delete previous letter.</li>
                <li>Press Enter to confirm your word</li>
            </ul>
            </div>
            
        </div>
        <Footer isMain={false} />
        </>
    )
}

export default About
