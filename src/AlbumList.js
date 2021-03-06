import React, {Component} from "react";
import Modal from 'react-modal';
import ReactScrollbar from 'react-scrollbar-js';
import CommonList from './CommonList';
import {ContextMenu3} from './ContextMenu.js';
import {padDigits, getTime, getImagePath, getDimensions, stringFormat, goHome,addLink} from './Utils.js';
import Img from 'react-image';
import {ToastContainer, toast} from 'react-toastify';
import ReactDOM from "react-dom";
import {AlbumFloatingMenu} from './FloatingButton';
import {global,mpd_client} from "./Utils";

/**
 * returns object with properties of content
 * @param content
 * @returns {{}}
 */
function makeFileListElement(content) {

    let item = {};
    item.mpd_file_path = content.getPath();
    try {
        item.mpd_file_path = item.mpd_file_path.replace(/(.*[^\/])\/?/, '$1/');
    } catch (e) {
    }
    if (typeof content.getMetadata().directory !== 'undefined') {
        item.MPD_file_path_name = content.getPath();
    }
    else {
        item.MPD_file_title = content.getDisplayName();
        item.MPD_file_album = content.getAlbum();
        item.MPD_file_artist = content.getArtist();
        item.MPD_file_file = content.getPath();
        item.MPD_file_track = content.getTrack();
        item.MPD_file_duration = content.getDuration();
        //getDuration
    }

    return item;
}

/**
 * display message on bottom of screen
 * @param message
 */
let notifyMessage = function (message) {
    //display 4 seconds
    let seconds = 4;
    let millis = seconds * 1000;
    let mytoastId = null;
    let notify = () => {
        mytoastId = toast(message, {
            position: toast.POSITION.BOTTOM_CENTER, autoClose: millis, closeButton: false
        });
    };
    notify();
    setTimeout(function () {
        toast.dismiss(mytoastId);

    }, millis + 500);
};

/**
 * Popup the contents of an album on a Modal View
 */
class PopupAlbum extends Component {
    constructor(props) {
        super(props);
        this.closeAlbumPopup = props.closeAlbumPopup;
        this.album = props.album;
        this.itemChosen = false;
        this.state = {
            items: []
        };
        mpd_client().getDirectoryContents(this.album, this.getDir.bind(this));
    }
    
    getDir(directory_contents) {
        let myTotalList = directory_contents.map((content) => {
            try {
                return makeFileListElement(content);
            } catch (e) {
            }
        });

        this.setState({
            items: myTotalList
        });
    }

    createTitleLine(song) {
        return stringFormat("{0} {1} ({2})", [padDigits(song.MPD_file_track, 2), song.MPD_file_title,
            getTime(song.MPD_file_duration)]);

    }

    addFileToQueue(e, i) {
        e.preventDefault();
        this.itemChosen = true;
        let path = this.state.items[i].MPD_file_file;
        let message = "add file:" + lastPart(path);
        try {
            notifyMessage(message);
        } catch (e) {
        }
        mpd_client().addSongToQueueByFile(path);
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

        let album = this.album;
        try {
            let song = this.state.items[0];
            album = stringFormat("{0}-{1}", [song.MPD_file_artist, song.MPD_file_album]);
        } catch (e) {
        }
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
                        if (!this.itemChosen) this.closeAlbumPopup(e);
                        this.itemChosen = false;
                    }}>
                        <Img src={getImagePath("/" + this.album)}
                             className="list-image-large"/><div className={"header-text"}>{album}</div>
                        <ul>
                            {this.state.items.map((listValue, i) => {

                                return <div key={i} className="list-item" onClick={(e) => {
                                    this.addFileToQueue(e, i);
                                }}>
                                    <li style={ls}>
                                        {this.createTitleLine(listValue)}</li>
                                </div>;
                            })}
                        </ul>
                    </div>
                </ReactScrollbar>


            </Modal>
        )
    }
}

let lastPart = function (path) {
    path = path.substr(path.lastIndexOf('/') + 1);
    return path;
};

/**
 * display contents of directory in Listview
 */
class AlbumList extends CommonList {
    constructor(props) {
        super(props);
        this.selection = -1;
        this.totalList = [];
        this.openPath = "";
        this.top = 300;
        this.albumsContextmenu = null;
        this.state = {
            items: [],
            modalIsOpen: false,
            floatingIsOpen: false
        };
    }

    componentDidMount() {
        this.prevdirs = this.getPrevDirs();

        let curdir = this.baseDir();
        if (this.prevdirs.length > 0) curdir = this.prevdirs.pop();
        this.getDirectoryContents(curdir);
        this.getUpOneDirectory = this.getUpOneDirectory.bind(this);
        let rect = ReactDOM.findDOMNode(this)
            .getBoundingClientRect();
        this.top = rect.top;
    }

    getPrevDirs() {
        //global variable favsListConfig to store state of AlbumList
        let prevdirs=global.get("albumListConfig");
        if (typeof prevdirs === 'undefined' || prevdirs === null) {
            prevdirs=[];
            global.set("albumListConfig", prevdirs);
        }
        return prevdirs;

    }

    baseDir() {
        let curdir = "/";
        //if (this.prevdirs.length > 0) curdir = this.prevdirs.pop();
        return curdir;
    }

    getDirectoryContents(dir) {
        this.getAlbumDirectoryContents(dir);
    }

    getAlbumDirectoryContents(dir) {
        mpd_client().getDirectoryContents(dir, (directory_contents) => {
            if (directory_contents.length===0){
                //always display somthing!!
                console.log("empty result, display main directory!");
                getAlbumDirectoryContents(this.baseDir());
                return;
            }
            let myTotalList = [];
            let mylist = [];
            directory_contents.forEach((content) => {
                let element = makeFileListElement(content);
                try {
                    myTotalList = myTotalList.concat(element);
                    let path = element.MPD_file_path_name;
                    path = lastPart(path);
                    mylist = mylist.concat(path)
                } catch (e) {
                }
            });

            if (mylist.length > 0) {
                this.totalList = myTotalList;
                this.prevdirs = this.prevdirs.concat(dir);
                //save state to global variable
                this.savePrevDirs();

                this.setState({
                    items: mylist, showPopup: false
                });
            } else {
                mpd_client().addSongToQueueByFile(dir);
                global.get("observer").publish('AddRecent', {recentElement:dir});

                notifyMessage("add dir:" + lastPart(dir));
                //no items, display context menu
            }
        })

    }
    savePrevDirs() {
        global.set("albumListConfig", this.prevdirs);
    }


    getFilePathCallback(index, doAction) {
        let path = this.getFilePath(this.selection);
        doAction(path);
    }

    getFilePath(index) {
        let str = this.totalList[index].mpd_file_path;
        if (str.endsWith("/"))
            str = str.substr(0, str.length - 1);
        return str;
    }

    /**
     * add directory contents of item[index] to queue
     * @param index
     */
    addDirectoryContentsToQueue(index) {
        if (!this.albumsContextmenu.state.visible) {
            let path = this.getFilePath(index);
            this.selection = index;
            this.getDirectoryContents(path);
        }
    };

    contextResult(choice) {
        this.contextAlbumResult(choice);
    }

    contextAlbumResult(choice) {

        this.getFilePathCallback(this.selection,
            (path) => {
                if (choice === "Add") {
                    global.get("observer").publish('AddRecent', {recentElement:path});
                    mpd_client().addSongToQueueByFile(path);
                }
                if (choice === "Add and Play") {
                    global.get("observer").publish('AddRecent', {recentElement:path});
                    let len = mpd_client().getQueue().getSongs().length;
                    mpd_client().addSongToQueueByFile(path);
                    mpd_client().play(len);
                }
                if (choice === "Replace and Play") {
                    global.get("observer").publish('AddRecent', {recentElement:path});
                    mpd_client().clearQueue();
                    mpd_client().addSongToQueueByFile(path);
                    mpd_client().play(0);

                }
                if (choice === "Info Album") {
                    this.openPath = path;
                    this.setState({
                        items: this.state.items,
                        modalIsOpen: true,
                        floatingIsOpen: this.state.floatingIsOpen
                    });
                }
                if (choice === "Add Link") {
                    addLink(path);
                }
            });
    }

    /**
     * closes modal display of contents of an album
     * @param e
     */
    closeAlbumPopup(e) {
        this.setState({
            items: this.state.items,
            modalIsOpen: false,
            floatingIsOpen: this.state.floatingIsOpen
        });
    }

    contextMenu(e) {
        global.set("contextOptions",["Add","Add and Play","Replace and Play","Info Album","","Add Link"]);
        this.albumsContextmenu._handleContextMenu(e);
    };

    /**
     * display contents of one directory up
     */
    getUpOneDirectory() {
        console.log("get back");
        if (this.prevdirs.length > 1) {
            goHome();
            this.prevdirs.pop();
            let dir = this.prevdirs[this.prevdirs.length - 1];
            this.prevdirs.pop();
            this.getDirectoryContents(dir);
        }
    }


    /**
     * display float-menu yes or no
     */
    floatToggle() {
        this.setState({
            items: this.state.items,
            modalIsOpen: this.state.modalIsOpen,
            floatingIsOpen: !this.state.floatingIsOpen
        });

    }

    floatSubToggle() {
        this.subMenu = !this.subMenu;
        this.setState({
            items: this.state.items,
            modalIsOpen: this.state.modalIsOpen,
            floatingIsOpen: this.state.floatingIsOpen
        });

    }

    listItemFunction(listValue, i) {
        let path = this.getImagePath("/" + this.totalList[i].mpd_file_path);
        return (<div style={this.getEvenStyle(i)} key={i} onClick={() => {
            this.addDirectoryContentsToQueue(i);
        }} onContextMenu={(e) => {
            this.selection = i;
            this.contextMenu(e)
        }}>
            <Img src={path} className="list-image-small" style={this.imgStyle}/>
            <li style={this.textStyle} >
                {this.splitHyphen(listValue)}</li>
        </div>);
    }
    getImagePath(path) {
        return getImagePath(path);
    }
    displayModal(){
        return this.state.modalIsOpen ?
            <PopupAlbum album={this.openPath}
                        closeAlbumPopup={this.closeAlbumPopup.bind(this)}/>
            : null
    }

    render() {

        return (
            <div><ContextMenu3 onRef={ref => (this.albumsContextmenu = ref)}
                               returnChoice={this.contextResult.bind(this)}/>
                <AlbumFloatingMenu back={this.getUpOneDirectory.bind(this)}/>
                <ToastContainer/>
                <ul>
                    {this.state.items.map(this.listItemFunction.bind(this))}
                </ul>
                {this.displayModal()}
            </div>
        )
    }
}

export {AlbumList, notifyMessage, lastPart};