import React from 'react'
import { Block } from '../components/displayBlocks/Blocks'
import Footer from '../components/footer/Footer'

const Example = ({ word, mark, state, children }) => (
    <li className='example'>
        <div className='exampleTiles' aria-hidden>
            {word.split('').map((letter, i) => (
                <Block key={i} index={i} letter={letter} state={i === mark ? state : undefined} />
            ))}
        </div>
        <p>{children}</p>
    </li>
)

const About = () => {
    return (
        <>
        <main className='page'>
        <section className='about'>
            <div className='aboutImg'>
                <img src='/images/words.png' alt='Scrabble tiles spelling CHOOSE YOUR WORDS' />
            </div>
            <div className='aboutContent'>
            <h1>How To Play</h1>
            <p className='aboutLead'>Guess the hidden five-letter word in six tries.</p>
            <ul className='steps'>
                <li>Type with your keyboard or tap the on-screen keys.</li>
                <li>Press <kbd>Enter</kbd> to check your word and <kbd>Backspace</kbd> to delete a letter.</li>
                <li>After each guess, the tiles change color to show how close you were.</li>
            </ul>
            </div>
        </section>
        <section className='about'>
            <div className='aboutImg'>
                <img src='/images/tip.png' alt='A tip jar' />
            </div>
            <div className='aboutContent'>
            <h1>Tips</h1>
            <ul className='tips'>
                <Example word='weary' mark={0} state='correct'><strong>W</strong> is in the word and in the correct spot.</Example>
                <Example word='pills' mark={1} state='present'><strong>I</strong> is in the word but in the wrong spot.</Example>
                <Example word='vague' mark={3} state='absent'><strong>U</strong> is not in the word in any spot.</Example>
            </ul>
            <p className='aboutNote'>
                Stuck? Tap <strong>Show hint</strong> under the board to read a dictionary definition of the answer.
                When the game ends you'll see what the word means, and you can hear it pronounced.
            </p>
            </div>
        </section>
        </main>
        <Footer isMain={false} />
        </>
    )
}

export default About
