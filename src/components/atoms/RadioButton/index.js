

import React from 'react'
import './Radiobutton.css'

function RadioButton({
    opsi1,opsi2,
    value1,value2,
    checked1,checked2,
    name,name2,
    onChange1,onChange2,
    children,
    ...rest
}) {
    return (
        <div className="wrapper">
        <input type="radio" 
            name="select" 
            id="option-1" 
            value={value1}
            checked={checked1} 
            // name={name} 
            onChange={onChange1} 
        />
        <input type="radio" 
        name="select" 
        id="option-2"
            value={value2}
            checked={checked2} 
            // name={name} 
            onChange={onChange2} />
          <label htmlFor="option-1" className="option option-1">
            <div className="dot"></div>
             <span>{opsi1}</span>
             </label>
          <label htmlFor="option-2" className="option option-2">
            <div className="dot"></div>
             <span>{opsi2}</span>
          </label>
       </div>
    )
}

export default RadioButton
