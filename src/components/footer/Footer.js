import React from 'react'
import './Footer.css'

const Footer = ({isMain}) => {
    return (
        <footer className={isMain ? 'footer' : ''}>
            <p>Developed by Lynnze</p>
            <p>Ⓒ2023WORDLE</p>
        </footer>
    )
}

export default Footer
