import React from 'react';
import './input.css';

function Input({label,required,labelSejajar, ...rest}) {
    return (
        <div className="input-wrapper" style={{width:'100%'}}>
            <input className="input" {...rest}/>
        </div>
        //  <div className="input-wrapper">
        //     <label className="label" style={{paddingRight:10}}>{label}{required && <span style={{color:'red'}}> *</span>}</label>
        //     {!labelSejajar && <br/>}
        //     <input className="input" {...rest}/>
        // </div>
    )
}

export default Input;
