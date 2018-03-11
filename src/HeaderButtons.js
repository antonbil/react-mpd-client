/*Timer*/
import {global,getDimensions, getImagePath, getTime,stringFormat,padDigits} from "./Utils";
import React from "react";
import Sticky from 'react-sticky-el';
import Img from 'react-image';
import ReactScrollbar from 'react-scrollbar-js';

class ShowTime extends React.Component {
    constructor(props) {
        super(props);
        props.onRef(this);
        this.playing="stop";
        this.updatingState=false;
        this.curDuration=null;
        this.curTime=null;
        this.state = {
            curTime : null,

        };
    }

    updateState(state){
        this.playing=state.playstate;


        if (state.playstate==="play"){
            this.curTime=Math.floor(state.current_song.elapsed_time);
        }
    }
    updateStateDuration(duration){

        this.curDuration=duration;
            /*this.state = {

                curTime :  this.state.curTime
            }*/

    }
    componentDidMount() {
        this.listener = global.get("observer").subscribe('StateChanged',(data)=>{
            //console.log('StateChanged is: ',data);
            this.updateState(data.state);
        });
        setInterval( () => {

            if (this.playing==="play"){
                this.curTime++;
                this.setState({
                    curTime : this.curTime
                });
            }
        },1000);
        global.get("observer").publish('ShowTime', {time:this});
    }
    render() {
        return(
            <div className="header-time">{getTime(this.curTime)+" "+getTime(this.curDuration)}
            </div>
        );
    }
}
/*HeaderButtons*/
class HeaderButtons extends React.Component {
    constructor(props) {
        super(props);
        this.showTime = null;
        this.state = {playing: true, songName:"", path:""};
        this.mpd_client=global.get("mpd_client");
        this.artist="";

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
    }
    componentDidMount() {
        this.listener = global.get("observer").subscribe('StateChanged',(data)=>{
            this.updateState(data.state);
        });
        this.listenerInit = global.get("observer").subscribe('MpdInitialized',(data)=>{
            this.mpd_client=data;
        });
    }
    componentWillUnmount() {
        this.listener.unsubscribe();
        this.listenerInit.unsubscribe();
    }

    updateState(state){
        let  current_song = this.mpd_client.getCurrentSong();
        this.artist=stringFormat("{0}-{1}",[current_song.getArtist(),current_song.getAlbum()]);
        let duration=current_song.getDuration();
        this.showTime.updateStateDuration(duration);
        let  path=current_song.getPath();
        path=path.substring(0, path.lastIndexOf("/"));
        let  song="";
        global.set("playstate",state.playstate);
        try {
            global.set("currentsong",state.current_song.queue_idx);
        }catch(e){}
        if(current_song){
            song=stringFormat("({0}){1}",[padDigits(current_song.getTrack(),2),current_song.getDisplayName()]);
        }
        this.setState(prevState => ({
            playing: state.playstate==="play",songName:song,path:path
        }));
    }
    next() {
        this.mpd_client.next();
        this.mpd_client.play();
    }

    prev() {
        this.mpd_client.previous();
        this.mpd_client.play();
    }

    handleClick() {
        this.setState(prevState => ({
            playing: !prevState.playing
        }));
        if (!this.state.playing){
            this.mpd_client.play();
            //console.log("play");
        } else{
            this.mpd_client.pause();
            //console.log("pause");
        }
    }


    render() {
        let {width, height} = getDimensions();
        let minHeight=130;
        if (global.get("fontlarge"))minHeight=280;
        let myScrollbar = {
            margin: 0,
            backgroundColor: global.get("backgroundColor"),
            color: global.get("color"),

            height: minHeight,
            zIndex:100

        };
        let  s = {
            backgroundColor: global.get("backgroundColor")
        };
        /*let myScrollbar = {
            margin: 0,
            backgroundColor: '#212529',
            color: "#white",

            height: minHeight,
        };
        let  s = {
            backgroundColor: '#212529'
        };  */
        let imagePath=getImagePath("/"+this.state.path);
        //<Sticky>
        return (<Sticky>
            <ReactScrollbar style={myScrollbar}>
                <header  style={s}>
                    <div><Img src={imagePath}  className="header-image" /><ShowTime  onRef={ref => (this.showTime = ref)}/>
                        <div>{this.state.songName}</div></div>
                    <div className="header-artist">{this.artist}</div></header>
            </ReactScrollbar>
            </Sticky>

        );
    }
}

export default HeaderButtons;