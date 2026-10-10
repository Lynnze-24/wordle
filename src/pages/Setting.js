import React from 'react'
import CheckboxSkewed from '../components/CheckboxSkewed/CheckboxSkewed'
import { useGameContext } from '../components/context/GameProvider'
import { useSettingContext } from '../components/context/SettingProvider'
import Footer from '../components/footer/Footer'

const Setting = () => {

    const { hardMode, showHint, wordCheck, colorBlind, setSetting } = useSettingContext()
    const { game } = useGameContext()

    // Like the original Wordle, hard mode can't be switched on halfway through a game.
    const midGame = game.status === 'playing' && game.guesses.length > 0
    const hardModeLocked = midGame && !hardMode

    return (
        <>
        <main className='setting page'>
            <div className='settingImg' aria-hidden>
                <img src='/images/cog.png' alt='' />
                <img src='/images/cog.png' alt='' />
                <img src='/images/cog.png' alt='' />
            </div>
            <div className='settingContent'>
            <h1>Settings</h1>
            <ul className='settingList'>
                <li>
                    <CheckboxSkewed
                        label='Hard Mode'
                        description={hardModeLocked
                            ? 'Can only be turned on at the start of a game.'
                            : 'Any revealed hints must be used in later guesses.'}
                        checked={hardMode}
                        disabled={hardModeLocked}
                        clickHandler={() => setSetting('hardMode', !hardMode)}
                    />
                </li>
                <li>
                    <CheckboxSkewed
                        label='Show Hint'
                        description='Adds a hint button that reveals a dictionary definition of the answer.'
                        checked={showHint}
                        clickHandler={() => setSetting('showHint', !showHint)}
                    />
                </li>
                <li>
                    <CheckboxSkewed
                        label='Word Check'
                        description='Only accept guesses that are real English words.'
                        checked={wordCheck}
                        clickHandler={() => setSetting('wordCheck', !wordCheck)}
                    />
                </li>
                <li>
                    <CheckboxSkewed
                        label='High Contrast Colors'
                        description='Orange and blue tiles for color vision deficiency.'
                        checked={colorBlind}
                        clickHandler={() => setSetting('colorBlind', !colorBlind)}
                    />
                </li>
            </ul>
         </div>
         </main>
        <Footer isMain={false} /></>
    )
}

export default Setting
