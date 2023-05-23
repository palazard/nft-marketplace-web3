import React from "react";

function Button(props) {
    return (
        <div className="Chip-root makeStyles-chipBlue-108 Chip-clickable">
            <span
                onClick={props.handleClick}
                className="form-Chip-label"
                >
                {props.title}
            </span>
        </div>
    )
}

export default Button;