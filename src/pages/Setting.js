import React from 'react'
import CheckboxSkewed from '../components/CheckboxSkewed/CheckboxSkewed'
import { useSettingContext } from '../components/context/SettingProvider'
import Footer from '../components/footer/Footer'

const Setting = () => {

    const {showHint, toggleHint,grammarCheck,toggleGrammar} = useSettingContext()

    return (
        <>
        <div className='setting'>
            <div className='settingImg'>
                <img src='/images/cog.png' alt='cog' />
            </div>
            <div className='settingContent'>
            <h1>Settings</h1>
            <ul className='settingList'>
                <li>
                   <CheckboxSkewed clickHandler={toggleGrammar} checked={grammarCheck} label='Grammar Check' />
               </li>
               <li>
                   <CheckboxSkewed clickHandler={toggleHint} checked={showHint} label='Show Hint' />
               </li>
               
            </ul>
         </div>
         </div>
        <Footer isMain={false} /></>
    )
}

export default Setting
