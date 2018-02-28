import React from "react";
import Modal from 'react-modal';
import ReactScrollbar from 'react-scrollbar-js';
import CommonList from './CommonList';
import {ContextMenu2} from './ContextMenu.js';
import{getImagePath,getDimensions}from './Utils.js';
import Img from 'react-image';
import { ToastContainer, toast } from 'react-toastify';

function makeFileListElement(content){

    let  item={};
    item.mpd_file_path=content.getPath();
    try {
        item.mpd_file_path = item.mpd_file_path.replace(/(.*[^\/])\/?/, '$1/');
    } catch(e){}
    if(typeof content.getMetadata().directory !== 'undefined'){
        item.MPD_file_path_name=content.getPath();
    }
    else{
        item.MPD_file_title=content.getDisplayName();
        item.MPD_file_album=content.getAlbum();
        item.MPD_file_artist=content.getArtist();
        item.MPD_file_file=content.getPath();
        item.MPD_file_track=content.getTrack();
    }

    return item;
}

let notifyMessage = function (message) {
    let mytoastId = null;
    let notify = () => {
        mytoastId = toast(message, {
            position: toast.POSITION.BOTTOM_CENTER, autoClose: 4000, closeButton: false
        });
    };
    notify();
    setTimeout(function () {
        toast.dismiss(mytoastId);

    }, 4500);
};

class PopupAlbum extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal=props.closeModal;
        this.album=props.album;
        this.itemChosen=false;
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

    handleItemClick(e,i) {
        e.preventDefault();
        this.itemChosen=true;
        let path=this.state.items[i].MPD_file_file;
        let message="add file:"+path;
        try {
            notifyMessage(message);
        } catch(e){}
        mpd_client.addSongToQueueByFile(path);
    }

    render(){
        let {width, height} = getDimensions();
        let myScrollbar = {
            margin:10,
            width: width-50,
            height: height-50,
        };
        let customStyles = {
            content : {
                top                   : '50%',
                left                  : '50%',
                right                 : 'auto',
                bottom                : 'auto',
                marginRight           : '-50%',
                transform             : 'translate(-50%, -50%)'
            }
        };
        return (
            <Modal
                   isOpen={true}
                   ariaHideApp={false}

                   onRequestClose={this.closeModal}
                   
                   contentLabel="Album Info"
            >

                <ReactScrollbar style={myScrollbar}>
                    <div  className="popup"  onClick={(e) => {if (!this.itemChosen)this.closeModal(e);this.itemChosen=false;}}>
                        <ToastContainer autoClose={2000} />
                        <Img src={getImagePath("/" + this.album)}
                             className="list-image-large"/>{this.album}
                        <ul>
                            {this.state.items.map((listValue, i) => {

                                return <div  className="list-item" onClick={(e) => {
                                    this.handleItemClick(e,i);
                                }}><li key={i} style={this.listStyle}>
                                    {listValue.MPD_file_title}</li></div>;
                            })}
                        </ul>
                    </div>
                </ReactScrollbar>


            </Modal>
        )
    }
}
/*AlbumList*/
class AlbumList extends CommonList {
    constructor(props) {
        super(props);
        this.selection = -1;
        this.totalList = [];
        this.prevdirs = [];
        //this.popupAlbum = null;
        this.albumsContextmenu = null;
        this.state = {
            items: [],
            modalIsOpen: false
        };
        this.getDirectoryContents("/");
        this.backClick = this.backClick.bind(this);
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
                    path = path.substr(path.lastIndexOf('/') + 1);
                    mylist = mylist.concat(path)
                } catch (e) {
                }
            });

            if (mylist.length > 0) {
                this.totalList = myTotalList;
                this.prevdirs = this.prevdirs.concat(dir);
                this.setState(previousState => ({
                    items: mylist, showPopup: false
                }));
            } else {
                //let  path=this.getFilePath(this.selection);
                mpd_client.addSongToQueueByFile(dir);
                notifyMessage("add dir:"+dir);
                //no items, display context menu
            }
        })

    }


    getFilePath(index) {
        let str = this.totalList[index].mpd_file_path;
        str = str.substr(0, str.length - 1);
        return str;
    }

    handleClick(index) {
        if (!this.albumsContextmenu.state.visible) {
            let path = this.getFilePath(index);
            this.selection = index;
            this.getDirectoryContents(path);
        }
        //mpd_client.play(index);
    };

    contextResult(choice) {
        let path = this.getFilePath(this.selection);

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

            this.setState({
                items: this.state.items,
                modalIsOpen: true
            });
        }
    }


    closeModal(e) {
        this.setState({
            items: this.state.items,
            modalIsOpen: false
        });
    }

    contextMenu(e) {
        e.preventDefault();

        this.albumsContextmenu.returnChoice = this.contextResult.bind(this);
        this.albumsContextmenu._handleContextMenu(e);
    };

    backClick() {//this.prevdirs=this.prevdirs.splice(-1,1);
        if (this.prevdirs.length > 1) {
            this.prevdirs.pop();
            let dir = this.prevdirs[this.prevdirs.length - 1];
            this.prevdirs.pop();
            this.getDirectoryContents(dir);
        }
    }


    render() {
        return (
            <div><ContextMenu2 onRef={ref => (this.albumsContextmenu = ref)}/><br/>
                <button onClick={this.backClick}>Back</button><ToastContainer />
                <ul>
                    {this.state.items.map((listValue, i) => {
                        let path = getImagePath("/" + this.totalList[i].mpd_file_path);
                        return <div className="list-item" onClick={() => {
                            this.handleClick(i);
                        }} onContextMenu={(e) => {
                            this.selection = i;
                            this.contextMenu(e)
                        }}>
                            <Img src={path} className="list-image-small"/>
                            <li key={i} style={this.listStyle}>
                                {listValue}</li>
                        </div>;
                    })}
                </ul>
                {this.state.modalIsOpen ?
                    <PopupAlbum album={this.getFilePath(this.selection)}
                                closeModal={this.closeModal.bind(this)}/>
                    : null
                }
            </div>
        )
    }
}

export default AlbumList ;