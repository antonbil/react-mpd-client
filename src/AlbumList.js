import React, {Component} from "react";
import Modal from 'react-modal';
import ReactScrollbar from 'react-scrollbar-js';
import CommonList from './CommonList';
import {ContextMenu2} from './ContextMenu.js';
import {padDigits, getTime, getImagePath, getDimensions, stringFormat, goHome} from './Utils.js';
import Img from 'react-image';
import {ToastContainer, toast} from 'react-toastify';
import ReactDOM from "react-dom";
import {FloatingButton, floatingMenu,floatingSubMenu} from './FloatingButton';

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
        mpd_client.getDirectoryContents(this.album, this.getDir.bind(this));
    }

    getDir(directory_contents) {
        let myTotalList = [];
        directory_contents.forEach((content) => {
            try {
                myTotalList = myTotalList.concat(makeFileListElement(content));
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
        mpd_client.addSongToQueueByFile(path);
    }

    render() {
        let {width, height} = getDimensions();
        let myScrollbar = {
            margin: 10,
            width: width - 150,
            height: height - 150,
        };
        /*let customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)'
            }
        };*/
        let album = this.album;
        try {
            let song = this.state.items[0];
            album = stringFormat("{0}-{1}", [song.MPD_file_artist, song.MPD_file_album]);
        } catch (e) {
        }
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
                             className="list-image-large"/>{album}
                        <ul>
                            {this.state.items.map((listValue, i) => {

                                return <div key={i} className="list-item" onClick={(e) => {
                                    this.addFileToQueue(e, i);
                                }}>
                                    <li style={this.listStyle}>
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
        this.openPath="";
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

    getPrevDirs(){
        //global variable window.favsListConfig to store state of AlbumList
        if (typeof window.albumListConfig === 'undefined' || window.albumListConfig === null) {
            window.albumListConfig = {prevdirs: []}
        }
        return window.albumListConfig.prevdirs;

    }
    baseDir(){
        let curdir= "/";
        //if (this.prevdirs.length > 0) curdir = this.prevdirs.pop();
        return curdir;
    }


    getDirectoryContents(dir) {
        mpd_client.getDirectoryContents(dir, (directory_contents) => {
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
                window.albumListConfig.prevdirs = this.prevdirs;

                this.setState({
                    items: mylist, showPopup: false
                });
            } else {
                mpd_client.addSongToQueueByFile(dir);

                notifyMessage("add dir:" + lastPart(dir));
                //no items, display context menu
            }
        })

    }

    getFilePathCallback(index,doAction) {
        let path = this.getFilePath(this.selection);
        doAction(path);
    }

    getFilePath(index) {
        let str = this.totalList[index].mpd_file_path;
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
        this.getFilePathCallback(this.selection,
            (path)=> {
                if (choice === "Add") {
                    mpd_client.addSongToQueueByFile(path);
                }
                if (choice === "Add and Play") {
                    let len = mpd_client.getQueue().getSongs().length;
                    mpd_client.addSongToQueueByFile(path);
                    mpd_client.play(len);
                }
                if (choice === "Replace and Play") {
                    mpd_client.clearQueue();
                    mpd_client.addSongToQueueByFile(path);
                    mpd_client.play(0);

                }
                if (choice === "Info Album") {
                    this.openPath=path;
                    this.setState({
                        items: this.state.items,
                        modalIsOpen: true,
                        floatingIsOpen: this.state.floatingIsOpen
                    });
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
        e.preventDefault();

        this.albumsContextmenu.returnChoice = this.contextResult.bind(this);
        this.albumsContextmenu._handleContextMenu(e);
    };

    /**
     * display contents of one directory up
     */
    getUpOneDirectory() {
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
        this.subMenu=!this.subMenu;
        this.setState({
            items: this.state.items,
            modalIsOpen: this.state.modalIsOpen,
            floatingIsOpen: this.state.floatingIsOpen
        });

    }
    getImagePath(path){
        return getImagePath(path);
    }

    render() {

        let subMenu=this.subMenu?floatingSubMenu([{
            img: 'img/next.png', f: () => {
                this.floatToggle();
                mpd_client.next();
            }
        },{
            img: 'img/play.png', f: () => {
                this.floatToggle();

                if (window.mpdjsconfig.playstate=="play")
                    mpd_client.pause();
                else
                    mpd_client.play();
            }
        }, {
            img: 'img/previous.png', f: () => {
                this.floatToggle();
                mpd_client.previous();
            }
        }],1):null;

        let floatMenu = <div>{floatingMenu([{
            text: "P", f: () => {
                this.floatSubToggle();
            }
        },{
            img: 'img/back.png', f: () => {
                this.floatToggle();
                this.getUpOneDirectory()
            }
        }, {
            img: 'img/home2.png', f: () => {
                this.floatToggle();
                goHome()
            }
        }])}{subMenu}</div>;

        return (
            <div><ContextMenu2 onRef={ref => (this.albumsContextmenu = ref)}/>
                {this.state.floatingIsOpen ? floatMenu : null}
                <FloatingButton key="3" action={this.floatToggle.bind(this)} text="+" level={0}/>
                <ToastContainer/>
                <ul>
                    {this.state.items.map((listValue, i) => {
                        let path = this.getImagePath("/" + this.totalList[i].mpd_file_path);
                        return <div key={i} style={this.listStyle} onClick={() => {
                            this.addDirectoryContentsToQueue(i);
                        }} onContextMenu={(e) => {
                            this.selection = i;
                            this.contextMenu(e)
                        }}>
                            <Img src={path} className="list-image-small"  style={this.imgStyle}/>
                            <li  style={this.textStyle}>
                                {this.splitHyphen(listValue)}</li>
                        </div>;
                    })}
                </ul>
                {this.state.modalIsOpen ?
                    <PopupAlbum album={this.openPath}
                                closeAlbumPopup={this.closeAlbumPopup.bind(this)}/>
                    : null
                }
            </div>
        )
    }
}

export {AlbumList,notifyMessage,lastPart};