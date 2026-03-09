import { Markup } from 'interweave';
import React from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';

const Alert = ({ alertState, onConfirm, onCancel, onEscapeKey, onOutsideClick, showAlert, sessionMessage, successMessage, errorMessageAlert, errorMessageAlertLogout, validationMessage, confirmMessage }) => {
    return (
        <>
        {alertState == "session" ?
        <SweetAlert warning show={showAlert} onConfirm={onConfirm} btnSize="sm">{sessionMessage}</SweetAlert>
        : alertState == "success" ?
        <SweetAlert success show={showAlert} onConfirm={onConfirm} btnSize="sm">{successMessage}</SweetAlert>
        : alertState == "error" ?
        <SweetAlert danger show={showAlert} onConfirm={onConfirm} btnSize="sm">{errorMessageAlert}</SweetAlert>
        : alertState == "logout" ?
        <SweetAlert danger show={showAlert} onConfirm={onConfirm} btnSize="sm">{errorMessageAlertLogout}</SweetAlert>
        : alertState == "validation" ?
        <SweetAlert show={showAlert} onConfirm={onConfirm} onEscapeKey={onEscapeKey} onOutsideClick={onOutsideClick} btnSize="sm">
            {() => (
                <div>
                    <p style={{fontSize:'20px', textAlign:'left'}}><Markup content={validationMessage}/></p>
                </div>
            )}
        </SweetAlert>
        : alertState == "confirm" &&
        <SweetAlert
            warning
            showCancel
            show={showAlert}
            confirmBtnText="Yes, delete it!"
            confirmBtnBsStyle="danger"
            title={confirmMessage}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
        }
        </>
    )
}

export default Alert
