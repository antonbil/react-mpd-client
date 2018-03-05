/* class Playlist*/
import React from "react";
import CommonList from "./CommonList";
import {ContextMenu1} from "./ContextMenu.js";
import Img from 'react-image';
import {getDimensions, getImagePath, getTime, global, padDigits} from "./Utils";
import ReactDOM from 'react-dom';
import {BasicFloatingMenu} from './FloatingButton';

class PlayList extends CommonList {
    constructor(props) {
        super(props);

        this.selection=-1;
        this.totalList=[];
        this.top=300;
        this.playlistContextmenu = null;
        this.state = {
            items: []
        };
        this.mpd_client=global.get("mpd_client");
        this.queueId=-1;
        //this.handleClick = this.handleClick.bind(this,undefined);
    }
    componentDidMount() {
        let rect = ReactDOM.findDOMNode(this)
            .getBoundingClientRect();
        this.top=rect.top;
        let  queue=this.mpd_client.getQueue();
        //console.log("queue:",queue);
        if(queue!=null)
            this.updateQueue(queue);

        this.listener = global.get("observer").subscribe('QueueChanged',(data)=>{
            //console.log('QueueChanged is: ',data);
            this.updateQueue(data);

        });
        this.listenerState = global.get("observer").subscribe('StateChanged',(data)=>{
            this.updateState(data.state,data.client);
        });

    }
    updateState(state,client){
        let id=state.current_song.queue_idx;
        if (this.queueId!=id){
            this.queueId=id;
            this.setState(this.state);
        }
    }
    componentWillUnmount(){
        this.listenerState.unsubscribe();
        this.listener.unsubscribe();
    }
    updateQueue(queue){
        //console.log("update queue:",queue.getSongs());
        let  mylist=[];
        let  totalList=[];
        this.setState(previousState => ({items: []}));
        let  queueList=queue.getSongs();
        //console.log(queueList);
        queueList.forEach((song)=>{
            let  path=song.getPath();
            let  dirpath=path.substring(0, path.lastIndexOf("/"));
            let  item={path:song.getPath(),track:song.getTrack(), title:song.getTitle(), dir:dirpath, album:song.getAlbum(), artist:song.getArtist(), duration:song.getDuration()};
            totalList=totalList.concat(item);
            mylist=mylist.concat( song.getDisplayName())
        });
        this.totalList=totalList;
        //console.log(this.totalList);
        this.setState(previousState => ({
            items: mylist
        }));

    }
    handleClick(index) {
        //console.log("clicked:",index);
        if (!this.playlistContextmenu.state.visible)
            this.mpd_client.play(index);
    };

    contextResult(choice){
        if (choice==="Remove"){
            this.mpd_client.removeSongFromQueueByPosition(this.selection);
        }
        if (choice==="Remove bottom"){
            let  len=this.mpd_client.getQueue().getSongs().length;
            for (let  i=this.selection;i<len;i++)
                this.mpd_client.removeSongFromQueueByPosition(this.selection);
        }
        if (choice==="Remove top"){
            for (let  i=0;i<this.selection;i++)
                this.mpd_client.removeSongFromQueueByPosition(0);
            this.mpd_client.removeSongFromQueueByPosition(this.selection);
        }
        if (choice==="Remove all"){
            this.mpd_client.clearQueue();
        }
        if (choice==="Play")
            this.mpd_client.play(this.selection);
    }

    contextMenu (e) {
        e.preventDefault();
        this.playlistContextmenu.returnChoice=this.contextResult.bind(this);
        this.playlistContextmenu._handleContextMenu(e);
        //setTimeout(()=> { this.playlistContextmenu._handleContextMenu(e);; }, 100);

    };

    render() {
        let {width, height} = getDimensions();
        let myScrollbar = {
            margin: 0,
            //width: width,
            height: height - this.top-20,
        };
        let listPlayingStyle = {
            backgroundColor: global.get("backgroundPlaying")
        };
        let  prevPath="";//<ReactScrollbar className="playlist" style={myScrollbar} speed={90}>
        return (

            <div><ContextMenu1 onRef={ref => (this.playlistContextmenu = ref)}/>
                <BasicFloatingMenu/><ul>
                {this.state.items.map((listValue,i)=>{//<Img src={path}  className="list-image" />
                    let  img=null;
                    let  artist=null;
                    let  path=getImagePath("/"+this.totalList[i].dir);
                    if (prevPath !==path){
                        img=<Img src={path}  style={this.imgStyle}/>;
                        artist=<div className="list-artist" style={this.textStyle}>{this.totalList[i].artist+"-"+this.totalList[i].album}</div>
                    }
                    let ls={};
                    Object.assign(ls, this.listStyle)   ;
                    let current="";
                    if (global.get("currentsong")==i) {
                        current = "list-playing";
                        Object.assign(ls, listPlayingStyle)
                    }
                    let  time=getTime(this.totalList[i].duration);
                    prevPath=path;
                    return <div style={ls} key={i} >{img}<li onClick={() => { this.handleClick(i);}}
                               onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}}
                               >
                        <div className="list-time" style={this.aligntextStyle}>{time}</div><span className={"list-title"}
                                                                                                 style={this.textStyle}>{padDigits(this.totalList[i].track,2)+
                        " "+listValue}</span>{artist}</li></div>;
                })}
            </ul></div>
        )
    }
}
export default PlayList ;