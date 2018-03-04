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
        this.horizontalLevel=props.horizontalLevel ? props.horizontalLevel : 0;
        this.action=props.action;
        this.text=props.text;
        this.level=props.level;
    }

    render() {
        let imgsize=window.mpdjsconfig.itemheight*0.9;
        let bottom=30+this.level*(imgsize+10);
        let right=30+this.horizontalLevel*(imgsize+10);
        let levelStyle = {
            bottom:bottom
        };
        //margin:imgsize/9.7
        this.imgStyle = {

            height:imgsize,
            width:imgsize,
            margin:imgsize/9.7,
            bottom:bottom,
            right:right
        };
        this.textStyle = {

            "font-size":(imgsize/3)*2,
            "vertical-align": "middle",
            position:"relative",
            "margin-top":imgsize/4
        };

        return (
            <div >
                <div  className="floating-button"  style={this.imgStyle} onClick={this.action}>
                    <div className="plus"  style={this.textStyle}>{this.text}</div>
                </div>
            </div>
        )
    }
}

function floatingMenu(menuItems){
    return (<div>{menuItems.map((menuItem, i) => {
        return <FloatingButton  action={menuItem.f} text= {menuItem.text} key={i} level={i+1}/>
    })}</div>)
}

function floatingSubMenu(menuItems,verticalLevel){
    return (<div>{menuItems.map((menuItem, i) => {
        return <FloatingButton  action={menuItem.f} text= {menuItem.text} key={i} level={verticalLevel} horizontalLevel={i+1}/>
    })}</div>)
}
export {FloatingButton,floatingMenu,floatingSubMenu};