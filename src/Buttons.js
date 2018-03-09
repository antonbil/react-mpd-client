import { Button, FlatButton, IconButton, HamburgerButton, FloatingButton } from 'react-buttons';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from "react";
import {global} from "./Utils";
class MyButton extends React.Component {
    constructor(props) {
        super(props);
        this.text = props.text;
        this.onClick = props.onClick;
    }

    render() {
        let buttonStyle = {
            color: global.get("backgroundColor"),
            backgroundColor: global.get("color")
        };
        return (
            <FlatButton color="primary"
                        ripple={true} style={buttonStyle}  onClick={this.onClick}>{this.text}</FlatButton>)


    }
}

export {MyButton};