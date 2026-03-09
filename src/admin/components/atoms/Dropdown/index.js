import React from 'react';
import { Spinner } from 'react-bootstrap';

function Dropdown({label,children,spinner,required, ...rest}) {
    return (
        <div className="input-wrapper" style={{width:'100%'}}>
                {spinner && 
                <Spinner style={{height:16,width:16}} animation="border" variant="success" />
                }
            <select className="input" {...rest}>
                {children}
            </select>
        </div>
    )
}

export default Dropdown;
