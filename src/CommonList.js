/*CommonList*/
import React from "react";

class CommonList extends React.Component {
    constructor(props) {
        super(props);
        this.selection=-1;
        this.state = {
            items: []
        };
        this.listStyle = {
            border: '3px solid #ddd',
            'list-style-type': 'none',
            display: 'block',
            "min-height":window.mpdjsconfig.itemheight
        };
        let imgsize=window.mpdjsconfig.itemheight*0.9;
        //margin:imgsize/9.7
        this.imgStyle = {

            height:imgsize,
            float:"left",
            clear: "left",
            width:imgsize,
            margin:2
        };
        this.textStyle = {

            "font-size":window.mpdjsconfig.itemheight/4,
        "vertical-align": "middle"
        };
        this.aligntextStyle = {

            padding:window.mpdjsconfig.itemheight/6,
            "font-size":window.mpdjsconfig.itemheight/4,
            "vertical-align": "middle"
        };
        this.handleClick = this.handleClick.bind(this);
        this.contextMenu = this.contextMenu.bind(this);

    }
    handleClick(index) {
    };
    contextMenu (e) {
        e.preventDefault();
    };

    splitHyphen(text){
        //javascript only replaces first occurrence!(lucky...)
        text=text.replace("-", 'blahblah');
        let sp=text.split("blahblah");
        return sp.map((e,i)=>{return <div>{e}</div>})
    }
}

export default CommonList ;