import {AlbumList}from "./AlbumList";
import {getLinks,saveLinks} from './Utils.js';

import cookie from "react-cookies";
import {addLink, global} from "./Utils";

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
            this.contextAlbumResult(choice);
    }
    contextMenu(e) {
        e.preventDefault();
        let extra="Add Link";
        //links can only be removed on first level; otherwise it is no link but a real location
        if (this.prevdirs.length<2)
            extra="Remove Link";
        global.set("contextOptions",["Add","Add and Play","Replace and Play","Info Album",extra]);
        this.albumsContextmenu._handleContextMenu(e);
    };
    getDirectoryContents(dir) {
        //inheritance difficult to implement, use wrapper for the parent-funrion to be called
        if (dir==this.baseDir()){
            //create fileList, and elementList
            let fileList=getLinks();
            let elementList=fileList.map((el,i)=>{
                let el1=el;
                try {
                    el1 =el1.replace(/(.*[^\/])\/?/, '$1/');
                } catch (e) {
                }
                return {MPD_file_path_name:el,mpd_file_path:el1}
            });
            this.totalList = elementList;
            this.prevdirs = this.prevdirs.concat(dir);
            this.setState({
                items: fileList, showPopup: false
            });
        } else this.getAlbumDirectoryContents(dir);
    }

}
export {LinksList};