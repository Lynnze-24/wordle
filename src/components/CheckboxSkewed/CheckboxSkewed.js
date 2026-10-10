import React, { useId } from 'react'
import './CheckboxSkewed.css'

const CheckboxSkewed = ({ label, description, checked, clickHandler, disabled = false }) => {
    const id = useId()

    return (
        <div className={'checkboxSkewed' + (disabled ? ' disabled' : '')}>
            <div className='checkboxText'>
                <p id={`${id}-label`} className='checkboxLabel'>{label}</p>
                {description && <p id={`${id}-desc`} className='checkboxDesc'>{description}</p>}
            </div>
            <button
                type='button'
                role='switch'
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
                aria-describedby={description ? `${id}-desc` : undefined}
                disabled={disabled}
                className={'skewCon' + (checked ? ' active' : '')}
                onClick={clickHandler}
            />
        </div>
    )
}

export default CheckboxSkewed
