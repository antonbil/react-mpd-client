import React from "react";

class ContextMenu1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        };
        this.returnChoice=null;
        this.setMenu();
        this._handleContextMenu = this._handleContextMenu.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
    }
    setMenu(){
        //playlistContextmenu=this;
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
        //event.preventDefault();

        this.setState({ visible: true });
        const clickX = event.clientX;
        const clickY = event.clientY;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        try{//first time it is displayed no value is assigned to this.app
            let  rootW1 = this.app.offsetWidth;

            const rootW=rootW1;

            let  rootH1 = this.app.offsetHeight;
            const rootH=rootH1;


            const right = (screenW - clickX) > rootW;
            const left = !right;
            const top = (screenH - clickY) > rootH;
            const bottom = !top;
            if (right) {
                this.app.style.left = `${clickX + 5}px`;
            }

            if (left) {
                this.app.style.left = `${clickX - rootW - 5}px`;
            }

            if (top) {
                this.app.style.top = `${clickY + 5}px`;
            }

            if (bottom) {
                this.app.style.top = `${clickY - rootH - 5}px`;
            }
        } catch(e){}
    };

    _handleClick (event) {

        const { visible } = this.state;
        const wasOutside = event.target.className.indexOf("contextMenu") === -1;//event.target.className.indexOf("contextMenu") !== -1
        if (visible) {event.preventDefault();this.setState({ visible: false, });}
        if (!wasOutside)
            this.returnChoice(event.path[0].textContent);
    };

    _handleScroll () {
        const { visible } = this.state;

        if (visible) this.setState({ visible: false, });
    };

    render() {
        const { visible } = this.state;

        return(visible || null) &&
            <div ref={ref => {this.app = ref}} className="contextMenu">
                <div className="contextMenu--option">Remove</div>
                <div className="contextMenu--option">Remove top</div>
                <div className="contextMenu--option">Remove bottom</div>
                <div className="contextMenu--option">Remove all</div>
                <div className="contextMenu--separator"></div>
                <div className="contextMenu--option">Play</div>
            </div>
    };
}
/*/*ContextMenu2*/
class ContextMenu2 extends ContextMenu1 {
    setMenu(){
        //albumsContextmenu=this;
    }
    render() {
        const { visible } = this.state;

        return(visible || null) &&
            <div ref={ref => {this.app = ref}} className="contextMenu">
                <div className="contextMenu--option">Add</div>
                <div className="contextMenu--option">Add and Play</div>
                <div className="contextMenu--option">Replace and Play</div>
                <div className="contextMenu--option">Info Album</div>
                <div className="contextMenu--option">Link</div>
            </div>
    };

}

export {ContextMenu1,
 ContextMenu2}