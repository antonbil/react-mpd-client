/*VolumeSlider*/
import React , { Component } from 'react';


/**
 * display simple floating button at right-bottom of screen
 * parameters
 * action: reference to action-function
 * text: text to be displayed on button
 * level: 0..n, indicated position of button bottom-up
 */
class FloatingButton extends Component {
    constructor(props) {
        super(props);
        this.action=props.action;
        this.text=props.text;
        this.level=props.level;
    }

    render() {
        let bottom=30+this.level*(window.mpdreactfontlarge?120:60);
        let levelStyle = {
            bottom:bottom
        };
        return (
            <div >
                <div style={levelStyle}  className="floating-button" onClick={this.action}>
                    <div className="plus">{this.text}</div>
                </div>
            </div>
        )
    }
}

export default FloatingButton;