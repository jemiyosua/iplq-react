import { Markup } from 'interweave';
import React from 'react';
import './popup-image-preview.css';

const PopupImagePreview = ({ isPopupOpen, togglePopup, image }) => {
    return (
        <>
            {isPopupOpen && (
            <div className="popup">
                <div className="popup-content">
                    <img src={image} />
                </div>
                <div className="popup-overlay" onClick={togglePopup} />
            </div>
            )}
        </>
    )
}

export default PopupImagePreview