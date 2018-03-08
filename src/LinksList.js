import {AlbumList}from "./AlbumList";
import Modal from 'react-modal';
import ReactScrollbar from 'react-scrollbar-js';

import {getLinks,saveLinks} from './Utils.js';
import React, {Component} from "react";
import Img from 'react-image';
//import cookie from "react-cookies";
import {addLink, getDimensions, getImagePath, global, stringFormat} from "./Utils";


let categories=[
    "Interesting","New","Classical","R&B","Pop","Rock","Progressive Rock","Blues","Jazz","Electronic","Hip Hop","Dance"
];
let CATEGORY="Cat: ";
let NOCATEGORY="No Category";

class PopupCategories extends Component {
    constructor(props) {
        super(props);
        this.closePopup = props.closePopup;
        this.title=props.title;
    }

        render() {
        let listPopupStyle = {
            color: global.get("backgroundColor"),
            backgroundColor: global.get("color")
        };

        let {width, height} = getDimensions();
        let myScrollbar = {
            margin: 10,
            width: width - 150,
            height: height - 150,
        };

        let ls={};
        Object.assign(ls, this.listStyle);
        Object.assign(ls, listPopupStyle);

        return (
            <Modal
                isOpen={true}
                ariaHideApp={false}
                contentLabel="Album Info"
            >

                <ReactScrollbar style={myScrollbar}>
                    <div className="popup" onClick={(e) => {
                        this.closePopup(e, null);
                    }}>
                        {"Category for "+this.title}
                        <Img src={getImagePath("/" + this.album)}
                             className="list-image-large"/>
                        <ul>
                            {categories.map((listValue, i) => {

                                return <div key={i} className="list-item" onClick={(e) => {
                                    this.closePopup(e, listValue);
                                }}>
                                    <li style={ls}>
                                        {listValue}</li>
                                </div>;
                            })}
                        </ul>
                    </div>
                </ReactScrollbar>


            </Modal>
        )
    }
}
/**
 * display contents of favorites in Listview
 */
class LinksList extends AlbumList {
    constructor(props) {
        super(props);
    }
    getPrevDirs() {
        //global variable favsListConfig to store state of AlbumList
        let prevdirs=global.get("linksListConfig");
        if (typeof prevdirs === 'undefined' || prevdirs === null) {
            prevdirs=[];
            global.set("linksListConfig", prevdirs);
        }
        return prevdirs;

    }
    baseDir(){
        return "baselinks";
    }
    savePrevDirs() {
        global.set("linksListConfig", this.prevdirs);
    }

    contextResult(choice) {
        //inheritance difficult to implement, use wrapper for the parent-funrion to be called
        if (choice === "Remove Link") {
            //remove link from list
            let el=this.state.items;
            let index=this.selection;
            let links=getLinks();
            links.splice(index, 1);
            el.splice(index, 1);
            this.totalList.splice(index, 1);
            //save result
            saveLinks(links);
            this.setState({
                items: el, showPopup: false
            });
        } else
        if (choice === "Change Category") {
            this.state.modalIsOpen=true;
            this.setState(this.state);
        }else
            if (choice.startsWith(CATEGORY)){
                let el=this.state.items;
                let index=this.selection;
                //let links=getLinks();
                let newCategory=choice.replace(CATEGORY,"");
                let link=this.totalList[index].MPD_file_path_name.split(";")[0]+";"+newCategory;
                this.totalList[index].MPD_file_path_name=link;
                let links=this.totalList.filter((el)=>{return !el.isCategory}).map((el)=>{return el.MPD_file_path_name});
                console.log("new category:",link);

                this.totalList[index].MPD_file_path_name=link;
                this.totalList[index].category=newCategory;
                saveLinks(links);
                //use this if you wnat to update the list after chaning category
                //this.getDirectoryContents(this.baseDir());
                this.setState({
                    items: el, showPopup: false
                });
            } else
                this.contextAlbumResult(choice);
    }//clickCategory
    clickCategory(i) {
        console.log("category click");
        let cat=this.totalList[i].name;
        if (cat===NOCATEGORY)cat="";
        let visible=!this.totalList[i].visible;
        this.totalList[i].visible=visible;
        for (let j=0;j<this.totalList.length;j++){
            if(this.totalList[j].category===cat)this.totalList[j].visible=visible;
        }
        this.setState(this.state);


    };
    closePopup(e,choice){
        e.preventDefault();
        if (choice===null)return;
        let el=this.state.items;
        let index=this.selection;
        //let links=getLinks();
        let newCategory=choice;//.replace(CATEGORY,"");
        let link=this.totalList[index].MPD_file_path_name.split(";")[0]+";"+newCategory;
        this.totalList[index].MPD_file_path_name=link;
        let links=this.totalList.filter((el)=>{return !el.isCategory}).map((el)=>{return el.MPD_file_path_name});
        console.log("new category:",link);

        this.totalList[index].MPD_file_path_name=link;
        this.totalList[index].category=newCategory;
        saveLinks(links);
        //use this if you wnat to update the list after chaning category
        //this.getDirectoryContents(this.baseDir());
        this.setState({
            items: el, showPopup: false,modalIsOpen:false
        });
    }
    contextMenuCategory(e) {
        e.preventDefault();
        console.log("category context");

    };
    contextMenu(e) {
        e.preventDefault();
        let extra="Add Link";
        //links can only be removed on first level; otherwise it is no link but a real location
        if (this.prevdirs.length<2) {
            extra = ["Remove Link", "Change Category"];
            //categories.map((element)=>{extra=extra.concat(CATEGORY+element)})
        }
        global.set("contextOptions",["Add","Add and Play","Replace and Play","Info Album"].concat(extra));
        this.albumsContextmenu._handleContextMenu(e);
    };
    getDirectoryContents(dir) {
        //inheritance difficult to implement, use wrapper for the parent-funrion to be called
        if (dir===this.baseDir()){
            //create fileList, and elementList
            let fileList=getLinks();
            console.log("links read:",fileList);
            let elementList=fileList.map((el,i)=>{
                let el1=el;
                let spl=el.split(";");
                let name=spl[0];
                fileList[i]=name;
                let category="";
                if (spl.length>1)
                    category=spl[1];
                try {
                    el1 =el1.replace(/(.*[^\/])\/?/, '$1/');
                } catch (e) {
                }
                return {MPD_file_path_name:el,mpd_file_path:name+"/",category:category,visible:true,name:name,isCategory:false}
            });
            elementList.sort(function(a, b) {
                let x=a.category+" "+a.mpd_file_path;
                let y=b.category+" "+b.mpd_file_path;
                return x < y ? -1 : x > y ? 1 : 0;
            });
            let newList=[];
            let prevCat=NOCATEGORY;
            for (let i=0;i<elementList.length;i++){
                let el=elementList[i];

                if(el.category!==prevCat){
                    let category=el.category.length===0?prevCat:el.category;
                    newList.push({MPD_file_path_name:"",mpd_file_path:category,category:category,visible:true,name:category,isCategory:true})
                }
                prevCat=el.category;
                newList.push(el);

            }
            this.totalList = newList;
            fileList=newList.map((el)=>{return el.name});
            this.prevdirs = this.prevdirs.concat(dir);
            this.setState({
                items: fileList, showPopup: false
            });
        } else this.getAlbumDirectoryContents(dir);
    }
    displayModal(){
        return this.state.modalIsOpen ?
            <PopupCategories
                closePopup={this.closePopup.bind(this)} title={this.totalList[this.selection].name}/>
            : null
    }

    listItemFunction(listValue, i) {
        console.log("final:",listValue);
        let context=this.contextMenu;
        let click=this.addDirectoryContentsToQueue.bind(this);
        let path ="";
        let toPrint=this.splitHyphen(listValue);
        let catimg = "";

            let listElement = {MPD_file_path_name:"",mpd_file_path:"",category:"",visible:true,name:name,isCategory:false};
            Object.assign(listElement,     this.totalList[i]);
            if (listElement.isCategory) {
                context = this.contextMenuCategory.bind(this);
                click = this.clickCategory.bind(this);
                //toPrint=(listElement.visible?"":"> ")+listValue;
                catimg = <Img src={listElement.visible ? "img/down.png" : "img/right.png"} className="list-image-small"
                              style={this.imgStyle}/>
            }
            path = this.getImagePath("/" + listElement.mpd_file_path);
            if (!(listElement.visible || listElement.isCategory)) return "";

        return (<div style={this.listStyle} onClick={() => {
            click(i);
        }} onContextMenu={(e) => {
            this.selection = i;
            context(e)
        }} key={i}>
            <Img src={path} className="list-image-small" style={this.imgStyle}/>{catimg}
            <li style={this.textStyle}>
                {toPrint}</li>
        </div>);
    }


}
export {LinksList};