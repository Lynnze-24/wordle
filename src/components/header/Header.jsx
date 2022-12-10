import React from 'react'
import './Header.css';
import {  FaChevronLeft, FaQuestionCircle } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    
    return (
        <header className="headerCon">
            <FaChevronLeft
            className='backIcon'
            onClick={()=> navigate('/')}
             style={location?.pathname==='/' && {display:'none'}} 
             />
            <h1>Wordle</h1>
            <FaQuestionCircle 
            style={location?.pathname==='/howToPlay' && {display:'none'}} 
            onClick={()=> navigate('/howToPlay')} 
            className='aboutIcon' />
        </header>
    )
}

export default Header
