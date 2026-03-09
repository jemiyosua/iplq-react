import React from 'react'
import './slug.css'

function Slug({title,onClick}) {
    return (
            <label className="slug" onClick={onClick}>{title}</label>
    )
}

export default Slug
