import React from 'react'
import './link.css'

function Link({title,onClick}) {
    return (
            <p className="link" onClick={onClick}>{title}</p>
    )
}

export default Link
