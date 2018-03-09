import { Button, FlatButton, IconButton, HamburgerButton, FloatingButton } from 'react-buttons';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from "react";
import {global,blend_colors} from "./Utils";
class MyButton extends React.Component {
    constructor(props) {
        super(props);
        this.text = props.text;
        this.onClick = props.onClick;
    }

    render() {
        let buttonStyle = {
            color: global.get("backgroundColor"),
            backgroundColor: global.get("color"),
            borderColor:blend_colors(global.get("backgroundColor"),global.get("color"),0.5)
        };
        return (
            <FlatButton color="primary" className="myButton"
                        ripple={true} style={buttonStyle}  onClick={this.onClick}>{this.text}</FlatButton>)


    }
}

export {MyButton};