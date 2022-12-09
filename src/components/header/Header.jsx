import React from 'react'
import './Header.css';
import {  FaChevronLeft, FaQuestionCircle } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    console.log(location)
    return (
        <header className="headerCon">
            <FaChevronLeft
            className='backIcon'
            onClick={()=> navigate('/')}
             style={location?.pathname==='/' && {display:'none'}} 
             />
            <h1>Wordle</h1>
            <FaQuestionCircle 
            style={location?.pathname==='/about' && {display:'none'}} 
            onClick={()=> navigate('/about')} 
            className='aboutIcon' />
        </header>
    )
}

export default Header
