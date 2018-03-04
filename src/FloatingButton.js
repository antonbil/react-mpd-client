/*VolumeSlider*/
import React , { Component } from 'react';
import {goHome} from "./Utils";


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
function getImg(location){
    return <img src={location} width={window.mpdjsconfig.itemheight/2} height={window.mpdjsconfig.itemheight/2}/>
}


class FloatingPlayButtons extends Component {
    constructor(props) {
        super(props);
        this.level=props.level;
        this.state={subMenu:false};
        this.floatToggle.bind(this);
    }
    floatToggle(){
        this.setState({subMenu:!this.state.subMenu})
    }
    render() {
        let subMenu=this.state.subMenu?floatingSubMenu([{
            text: getImg('img/next.png'), f: () => {
                this.floatToggle();
                mpd_client.next();
            }
        },{
            text:getImg('img/play.png'), f: () => {
                this.floatToggle();

                if (window.mpdjsconfig.playstate=="play")
                    mpd_client.pause();
                else
                    mpd_client.play();
            }
        }, {
            text: getImg('img/previous.png'), f: () => {
                this.floatToggle();
                mpd_client.previous();
            }
        }],this.level):null;
        return (
            <div >
                <FloatingButton  action={()=>this.floatToggle()} text= {"P"} level={this.level}/>{subMenu}
            </div>
        )
    }
}
class  BasicFloatingMenu extends Component {
    constructor(props) {
        super(props);
        this.state={subMenu:false};
    }
    toggleSubMenu(){
        this.setState({subMenu:!this.state.subMenu})
    }

    render() {
        let subMenu=this.state.subMenu?<div>
            <FloatingPlayButtons  level={1}/>
            <FloatingButton  action={()=>{goHome()}} text= {getImg('img/home2.png')} level={2}/>
        </div>:null;
        return <div><FloatingButton  action={()=>{this.toggleSubMenu()}} text="+" level={0}/>{subMenu}</div>
    }
}

export {FloatingButton,floatingMenu,floatingSubMenu,FloatingPlayButtons,BasicFloatingMenu};