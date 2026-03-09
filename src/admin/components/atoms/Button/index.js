import React from 'react';
import { Spinner } from 'react-bootstrap';
import './button.css';

const Button = ({ title, spinner, children, btnVoucher, ...rest }) => {
    return (

        <button disabled={spinner} className={btnVoucher ? "buttonVoucher" : "button"} {...rest} >{spinner ?
            <span>
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
                Loading ...
            </span>
            : title}{!spinner && children}</button>
    )
}

export default Button;
