import React from 'react'
import './CheckboxSkewed.css'

const CheckboxSkewed = ({label,checked,clickHandler}) => {
    return (
        <div style={{gap:'1rem'}} className='checkboxSkewed'>
            <div className={'skewCon' + (checked?' active':'')} onClick={clickHandler}>
                
            </div>
            <p>{label}</p>
        </div>
    )
}

export default CheckboxSkewed
