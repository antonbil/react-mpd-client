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
        console.log(this.text);
        this.image=props.image?props.image:null;

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
        /*
            height:imgsize/4,
    width:imgsize/4,
    "margin-top":imgsize/4,
    "margin-left":imgsize/4
 */
        let margin=imgsize/4;
        if (this.text.type=="img")//not text, image is on button
            margin=imgsize/8;
        this.textStyle = {

            "font-size":(imgsize/3)*2,
            "vertical-align": "middle",
            position:"relative",
            "margin-top":margin
        };
        try {
            this.text.width = imgsize / 4;
            this.text.height = imgsize / 4;
        } catch(e){}
        let content=this.text;
        if (this.image)
            content=this.image;

        return (
            <div >
                <div  className="floating-button"  style={this.imgStyle} onClick={this.action}>
                    <div className="plus"  style={this.textStyle}>{this.props.image}{content}</div>
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