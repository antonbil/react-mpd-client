/*CommonList*/
import React from "react";
import {blend_colors, global} from "./Utils";

class CommonList extends React.Component {
    constructor(props) {
        super(props);
        this.selection=-1;
        this.state = {
            items: []
        };
        this.mpd_client=global.get("mpd_client");
        this.itemHeight=global.get("itemheight");
        this.listStyle = {
            border: '1px solid',
            listStyleType: 'none',
            display: 'block',
            minHeight:this.itemHeight
        };
        let imgsize=this.itemHeight*0.9;
        //margin:imgsize/9.7
        this.imgStyle = {

            height:imgsize,
            float:"left",
            clear: "left",
            width:imgsize,
            margin:2
        };
        this.textStyle = {

            fontSize:this.itemHeight/4,
        verticalAlign: "middle"
        };
        this.aligntextStyle = {

            padding:this.itemHeight/6,
            fontSize:this.itemHeight/4,
            verticalAlign: "middle"
        };
        this.handleClick = this.handleClick.bind(this);
        this.contextMenu = this.contextMenu.bind(this);
        let background = global.get("backgroundColor");
        let foreground = global.get("color");
        this.evenListStyle = {
            backgroundColor: blend_colors(background, foreground, 0.05)
        };
        this.alternateHeadStyle = {
            backgroundColor: blend_colors(background, foreground, 0.2)
        };

    }
    getEvenStyle(i){
        let ls = {};
        Object.assign(ls, this.listStyle);
        if(i % 2 == 0){
            Object.assign(ls, this.evenListStyle)
        }
        return ls;
    }
    getAlternateHeadStyle(i){
        let ls = {};
        Object.assign(ls, this.listStyle);
        Object.assign(ls, this.alternateHeadStyle)
        return ls;
    }
    handleClick(index) {
    };
    contextMenu (e) {
        e.preventDefault();
    };

    splitHyphen2(value){
        let arr = value.split("/");
        let first = arr.pop();
        let second = arr.pop();
        let artist=second==undefined?"":second;
        let arr2=first.split("-");
        if (arr2.length==1){
            let title=arr2[0];
            if (second==undefined) return title;
            return artist+"-"+title;
        }
        let title = arr2.pop();
        second=arr2.join("-");
        let n=parseFloat(second);
        if (!isNaN(n) && Number(n) === n && (n.toString()).length+2>second.length){return artist+"-"+title}
        return second+"-"+title;

        /*//javascript only replaces first occurrence!(lucky...)
        */
    }

    splitHyphen(value) {
        let text=this.splitHyphen2(value);
        text=text.replace("-", 'blahblah');
        let sp=text.split("blahblah");
        return sp.map((e,i)=>{return <div>{e}</div>})
    }

}

export default CommonList ;