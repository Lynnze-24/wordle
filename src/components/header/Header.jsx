import React from 'react'
import './Header.css'
import { FaChartBar, FaChevronLeft, FaCog, FaQuestionCircle } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGameContext } from '../context/GameProvider'

// Mouse clicks shouldn't leave focus on header buttons, or the next physical
// Enter would press the button again instead of submitting the guess.
const keepFocus = (e) => e.preventDefault()

const IconButton = ({ label, onClick, children }) => (
    <button type='button' className='iconButton' aria-label={label} title={label} onMouseDown={keepFocus} onClick={onClick}>
        {children}
    </button>
)

const Header = () => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { openStats } = useGameContext()

    return (
        <header className='headerCon'>
            <div className='headerSide'>
                {pathname === '/' ? (
                    <IconButton label='Settings' onClick={() => navigate('/setting')}>
                        <FaCog className='cogIcon' aria-hidden />
                    </IconButton>
                ) : (
                    <IconButton label='Back to game' onClick={() => navigate('/')}>
                        <FaChevronLeft aria-hidden />
                    </IconButton>
                )}
            </div>

            <h1>Wordle</h1>

            <div className='headerSide right'>
                <IconButton label='Statistics' onClick={openStats}>
                    <FaChartBar aria-hidden />
                </IconButton>
                {pathname !== '/howToPlay' && (
                    <IconButton label='How to play' onClick={() => navigate('/howToPlay')}>
                        <FaQuestionCircle aria-hidden />
                    </IconButton>
                )}
            </div>
        </header>
    )
}

export default Header
