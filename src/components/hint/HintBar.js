import React from 'react'
import { FaLightbulb, FaRedo, FaRegLightbulb } from 'react-icons/fa'
import { maskWord } from '../../lib/dictionary'
import useWordInfo from '../../lib/useWordInfo'
import './HintBar.css'

// Hints are opt-in per game: nothing is shown until the player asks.
const HintBar = ({ answer, hintsShown, onReveal }) => {
    const { status, info, retry } = useWordInfo(answer)

    if (hintsShown === 0) {
        return (
            <button type='button' className='hintButton' onClick={onReveal}>
                <FaRegLightbulb aria-hidden /> Show hint
            </button>
        )
    }

    if (status === 'loading') {
        return <p className='hintStatus'><span className='spinner' aria-hidden /> Looking up a hint…</p>
    }

    if (status === 'missing') {
        return <p className='hintStatus'>No dictionary entry for this word. You're on your own!</p>
    }

    if (status === 'error') {
        return (
            <p className='hintStatus'>
                Couldn't reach the dictionary.{' '}
                <button type='button' className='linkButton' onClick={retry}>Try again</button>
            </p>
        )
    }

    const definitions = info.definitions
    const index = (hintsShown - 1) % definitions.length
    const { partOfSpeech, text } = definitions[index]

    return (
        <div className='hintCard'>
            <FaLightbulb className='hintIcon' aria-hidden />
            <p className='hintText'>
                {partOfSpeech && <span className='hintPos'>{partOfSpeech}</span>}
                {maskWord(text, answer)}
            </p>
            {definitions.length > 1 && (
                <button
                    type='button'
                    className='hintNext'
                    onClick={onReveal}
                    aria-label={`Another hint (${index + 1} of ${definitions.length})`}
                    title='Another hint'
                >
                    <FaRedo aria-hidden />
                    <span>{index + 1}/{definitions.length}</span>
                </button>
            )}
        </div>
    )
}

export default HintBar
