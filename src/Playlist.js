/* class Playlist*/
import React from "react";
import CommonList from "./CommonList";
import {ContextMenu1} from "./ContextMenu.js";
import Img from 'react-image';
import ReactScrollbar from 'react-scrollbar-js';
import {getDimensions, getImagePath, getTime, padDigits} from "./Utils";
import ReactDOM from 'react-dom';

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
        //this.handleClick = this.handleClick.bind(this,undefined);
    }
    componentDidMount() {
        let rect = ReactDOM.findDOMNode(this)
            .getBoundingClientRect();
        this.top=rect.top;
        let  queue=mpd_client.getQueue();
        //console.log("queue:",queue);
        if(queue!=null)
            this.updateQueue(queue);

        this.listener = observer.subscribe('QueueChanged',(data)=>{
            //console.log('QueueChanged is: ',data);
            this.updateQueue(data);

        });

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
            mpd_client.play(index);
    };

    contextResult(choice){
        if (choice==="Remove"){
            mpd_client.removeSongFromQueueByPosition(this.selection);
        }
        if (choice==="Remove bottom"){
            let  len=mpd_client.getQueue().getSongs().length;
            for (let  i=this.selection;i<len;i++)
                mpd_client.removeSongFromQueueByPosition(this.selection);
        }
        if (choice==="Remove top"){
            for (let  i=0;i<this.selection;i++)
                mpd_client.removeSongFromQueueByPosition(0);
            mpd_client.removeSongFromQueueByPosition(this.selection);
        }
        if (choice==="Remove all"){
            mpd_client.clearQueue();
        }
        if (choice==="Play")
            mpd_client.play(this.selection);
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

        let  prevPath="";
        return (
            <ReactScrollbar style={myScrollbar} speed={90}>
            <div><ContextMenu1 onRef={ref => (this.playlistContextmenu = ref)}/><ul>
                {this.state.items.map((listValue,i)=>{//<Img src={path}  className="list-image" />
                    let  img=null;
                    let  artist=null;
                    let  path=getImagePath("/"+this.totalList[i].dir);
                    if (prevPath !==path){
                        img=<Img src={path}  className="list-image" />;
                        artist=<div className="list-artist">{this.totalList[i].artist+"-"+this.totalList[i].album}</div>
                    }
                    let  time=getTime(this.totalList[i].duration);
                    prevPath=path;
                    return <li key={i} onClick={() => { this.handleClick(i);}}
                               onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}}
                               style={this.listStyle}>{img}
                        <div className="list-time">{time}</div><span className="list-title">{padDigits(this.totalList[i].track,2)+" "+listValue}</span>{artist}</li>;
                })}
            </ul></div>
            </ReactScrollbar>
        )
    }
}
export default PlayList ;