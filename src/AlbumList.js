import React from "react";
import Modal from 'react-modal';
import ReactScrollbar from 'react-scrollbar-js';
import CommonList from './CommonList';
import {ContextMenu2} from './ContextMenu.js';
import{getImagePath}from './Utils.js';
import Img from 'react-image';

function makeFileListElement(content){

    let  item={};
    item.mpd_file_path=content.getPath();
    try {
        item.mpd_file_path = item.mpd_file_path.replace(/(.*[^\/])\/?/, '$1/');
    } catch(e){}
    if(typeof content.getMetadata().directory !== 'undefined'){
        item.MPD_file_path_name=content.getPath();
        //console.log(content.getMetadata());
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

class PopupAlbum extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal=props.closeModal;
        this.album=props.album;
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

    render(){
        let width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        let height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;
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
            <Modal onClick={this.closeModal}
                   isOpen={true}
                   ariaHideApp={false}

                   onRequestClose={this.closeModal}
                   style={customStyles}
                   contentLabel="Album Info"
            >

                <ReactScrollbar style={myScrollbar}>
                    <div  className="popup"  onClick={this.closeModal}>
                        <Img src={getImagePath("/" + this.album)}
                             className="list-image-large"/>
                        <ul>
                            {this.state.items.map((listValue, i) => {

                                return <div  className="list-item" ><li key={i} style={this.listStyle}>
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
            //console.log(directory_contents);
            directory_contents.forEach((content) => {
                let element = makeFileListElement(content);
                try {
                    myTotalList = myTotalList.concat(element);
                    let path = element.MPD_file_path_name;
                    path = path.substr(path.lastIndexOf('/') + 1);
                    mylist = mylist.concat(path)
                    //console.log(element);
                } catch (e) {
                }
            });
            this.totalList = myTotalList;
            if (mylist.length > 0) {
                this.prevdirs = this.prevdirs.concat(dir);
                this.setState(previousState => ({
                    items: mylist, showPopup: false
                }));
            } else {
                //let  path=this.getFilePath(this.selection);
                //console.log("add dir:",dir);
                mpd_client.addSongToQueueByFile(dir);
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
        //console.log("clicked:",index);
        if (!this.albumsContextmenu.state.visible) {
            let path = this.getFilePath(index);
            this.selection = index;
            this.getDirectoryContents(path);
        }
        //mpd_client.play(index);
    };

    contextResult(choice) {
        //console.log("albums choice:",choice);
        //console.log("action with:",albumList.selection);
        console.log("this.selection:", this.selection);
        let path = this.getFilePath(this.selection);
        console.log("path:", path);

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


    closeModal() {
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
            //console.log("back1",this.prevdirs);
            //this.prevdirs=this.prevdirs.splice(-1,1);
            this.prevdirs.pop();
            //console.log("back2",this.prevdirs);
            let dir = this.prevdirs[this.prevdirs.length - 1];
            //console.log("back3",dir);
            //this.prevdirs=this.prevdirs.splice(-1,1);
            this.prevdirs.pop();
            this.getDirectoryContents(dir);
        }
        //console.log("back");
    }


    render() {
        return (
            <div><ContextMenu2 onRef={ref => (this.albumsContextmenu = ref)}/><br/>
                <button onClick={this.backClick}>Back</button>
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