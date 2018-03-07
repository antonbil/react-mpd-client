import React from "react";
import {global} from "./Utils";

class ContextMenu1 extends React.Component {
    constructor(props) {
        super(props);
        this.returnChoice = props.returnChoice;
        this.state = {
            visible: false,
        };
        this.style = {};
        this._handleContextMenu = this._handleContextMenu.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
    }

    componentDidMount() {
        //document.addEventListener('contextmenu', this._handleContextMenu);
        document.addEventListener('click', this._handleClick);
        document.addEventListener('scroll', this._handleScroll);
        this.props.onRef(this);
    };

    componentWillUnmount() {
        //document.removeEventListener('contextmenu', this._handleContextMenu);
        document.removeEventListener('click', this._handleClick);
        document.removeEventListener('scroll', this._handleScroll);
        this.props.onRef(undefined)
    }

    _handleContextMenu(event) {
        event.preventDefault();

        const clickX = event.clientX;
        const clickY = event.clientY;

        const screenW = window.innerWidth;

        const screenH = window.innerHeight;
        try {//first time it is displayed no value is assigned to this.app
            let rootW1 = this.app.offsetWidth;

            const rootW = rootW1;

            let rootH1 = this.app.offsetHeight;
            const rootH = rootH1;

            Object.assign(this.style, this.style);

            const right = (screenW - clickX) > rootW;
            const left = !right;
            const top = (screenH - clickY) > rootH;
            const bottom = !top;
            if (right) {
                //this.app.style.left = `${clickX + 5}px`;
                this.style.left = `${clickX + 5}px`;
            }

            if (left) {
                this.style.left = `${clickX - rootW - 5}px`;
            }

            if (top) {
                this.style.top = `${clickY + 5}px`;
            }

            if (bottom) {
                this.style.top = `${clickY - rootH - 5}px`;
            }
        } catch (e) {
        }
        this.setState({visible: true});
    };

    _handleClick(event) {

        const {visible} = this.state;
        const wasOutside = event.target.className.indexOf("contextMenu") === -1;//event.target.className.indexOf("contextMenu") !== -1
        if (visible) {
            event.preventDefault();
            this.setState({visible: false,});
        }
        if (!wasOutside)
            this.returnChoice(event.path[0].textContent);
    };

    _handleScroll() {
        const {visible} = this.state;

        if (visible) this.setState({visible: false,});
    };

    render() {
        const {visible} = this.state;

        return <div ref={ref => {
            this.app = ref;
        }} className="contextMenu" style={this.style}>
            {visible ? <div>
                <div className="contextMenu--option">Remove</div>
                <div className="contextMenu--option">Remove top</div>
                <div className="contextMenu--option">Remove bottom</div>
                <div className="contextMenu--option">Remove all</div>
                <div className="contextMenu--separator"></div>
                <div className="contextMenu--option">Play</div>
            </div> : null
            }
        </div>
    };
}

/*/*ContextMenu2*/
class ContextMenu2 extends ContextMenu1 {
    constructor(props) {
        super(props);
        this.options = props.options;
    }

    render() {
        const {visible} = this.state;
        let myStyle = {};
        Object.assign(myStyle, this.style);

        return <div ref={ref => {
            this.app = ref
        }} className="contextMenu" style={myStyle}>
            {visible ? this.options.map((el, i) => {
                return <div key={i}
                            className={el.length > 0 ? "contextMenu--option" : "contextMenu--separator"}>
                    {el.length > 0 ? el : ""}</div>
            }) : ""}
        </div>
    };

}

/*/*ContextMenu2*/
class ContextMenu3 extends ContextMenu1 {

    render() {
        //global.set("contextOptions",["Add","Add and Play","Replace and Play","Info Album","Link"])
        let options = global.get("contextOptions");
        const {visible} = this.state;
        let myStyle = {};
        Object.assign(myStyle, this.style);

        return <div ref={ref => {
            this.app = ref
        }} className="contextMenu" style={myStyle}>
            {visible ? options.map((el, i) => {
                return <div key={i}
                            className={el.length > 0 ? "contextMenu--option" : "contextMenu--separator"}>
                    {el.length > 0 ? el : ""}</div>
            }) : ""}
        </div>
    };

}

export {
    ContextMenu1,
    ContextMenu2, ContextMenu3
}