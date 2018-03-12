/*VolumeSlider*/
import React , { Component } from 'react';
import {global,goHome,mpd_client} from "./Utils";


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

        if (props.img){
            this.text=getImg(props.img);
        } else
            this.text=props.text;
        this.level=props.level;
    }

    render() {
        let imgsize=global.get("itemheight")*0.9;
        let bottom=30+this.level*(imgsize+10);
        let right=30+this.horizontalLevel*(imgsize+10);
        let levelStyle = {
            bottom:bottom
        };
        //margin:imgsize/9.7
        this.imgStyle = {
            backgroundColor:global.get("backgroundFloat"),
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
        try {
            if (this.text.type == "img")//not text, image is on button
                margin = imgsize / 8;
        }catch(e){}
        this.textStyle = {
            fontSize:(imgsize/3)*2,
            verticalAlign: "middle",
            position:"relative",
            marginTop:margin
        };
        try {
            this.text.width = imgsize / 4;
            this.text.height = imgsize / 4;
        } catch(e){}

        return (
            <div >
                <div  className="floating-button"  style={this.imgStyle} onClick={this.action}>
                    <div className="plus"  style={this.textStyle}>{this.props.image}{this.text}</div>
                </div>
            </div>
        )
    }
}

function floatingMenu(menuItems){
    return (<div>{menuItems.map((menuItem, i) => {
        return <FloatingButton  action={menuItem.f} text= {menuItem.text} img= {menuItem.img} key={i} level={i+1}/>
    })}</div>)
}

function floatingSubMenu(menuItems,verticalLevel){
    return (<div>{menuItems.map((menuItem, i) => {
        return <FloatingButton  action={menuItem.f} text= {menuItem.text} img= {menuItem.img} key={i} level={verticalLevel} horizontalLevel={i+1}/>
    })}</div>)
}
function getImg(location){
    let itemheight=global.get("itemheight");
    return <img src={location} width={itemheight/2} height={itemheight/2}/>
}

function homeButton(level){
    return <FloatingButton action={() => {
        goHome()
    }} img={'img/home2.png'} level={level}/>
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
                mpd_client().next();
            }
        },{
            text:getImg('img/play.png'), f: () => {
                this.floatToggle();

                if (global.get("playstate")=="play")
                    mpd_client().pause();
                else
                    mpd_client().play();
            }
        }, {
            text: getImg('img/previous.png'), f: () => {
                this.floatToggle();
                mpd_client().previous();
            }
        }],this.level):null;
        return (
            <div >
                <FloatingButton  action={()=>this.floatToggle()} img="img/playmenu.png" level={this.level}/>{subMenu}
            </div>
        )
    }
}
function startButton(f){
    return <FloatingButton action={() => {
        goHome()
    }} level={0} action={f} img="img/startmenu.png"/>
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
            {homeButton(2)}
        </div>:null;
        //
        return <div>{startButton(this.toggleSubMenu.bind(this))}{subMenu}</div>
    }
}

class AlbumFloatingMenu extends Component {
    constructor(props) {
        super(props);
        this.back = props.back;
        this.state = {subMenu: false};
    }

    toggleSubMenu() {
        this.setState({subMenu: !this.state.subMenu})
    }

    render() {
        let subMenu = this.state.subMenu ?
            <div>
                <FloatingPlayButtons level={2}/>
                <FloatingButton action={this.back} img='img/back.png' level={1} key="back" />
                {homeButton(3)}
            </div> : null;
        return <div>{startButton(this.toggleSubMenu.bind(this))}{subMenu}</div>
    }
}

export {AlbumFloatingMenu,FloatingPlayButtons,BasicFloatingMenu};