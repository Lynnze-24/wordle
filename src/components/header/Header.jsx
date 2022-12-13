import React from 'react'
import './Header.css';
import {  FaChevronLeft, FaCog, FaQuestionCircle } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    
    return (
        <header className="headerCon">
           { location?.pathname==='/' ? (<div 
             className='backIcon'>
            <FaCog
            onClick={()=> navigate('/setting')}
             /></div>):(<div 
                className='backIcon'>
               <FaChevronLeft
               onClick={()=> navigate('/')}
                /></div>)}
             
            <h1>Wordle</h1>
            <div  style={location?.pathname==='/howToPlay' ? {display:'none'}:null} 
             className="aboutIcon">
                <FaQuestionCircle 
                onClick={()=> navigate('/howToPlay')} 
                 />
            </div>
            
        </header>
    )
}

export default Header
