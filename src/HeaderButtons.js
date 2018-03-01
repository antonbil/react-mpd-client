/*Timer*/
import {getDimensions, getImagePath, getTime,stringFormat,padDigits} from "./Utils";
import React from "react";
import Sticky from 'react-sticky-el';
import Img from 'react-image';
import ImageButton from 'fdmg-ts-react-image-button';
import ReactScrollbar from 'react-scrollbar-js';

class ShowTime extends React.Component {
    constructor(props) {
        super(props);
        props.onRef(this);
        this.playing="stop";
        this.state = {
            curTime : null,
            curDuration : null
        };
        this.listener = observer.subscribe('StateChanged',(data)=>{
            //console.log('StateChanged is: ',data);
            this.updateState(data.state,data.client);
        });
    }

    updateState(state,client){
        this.playing=state.playstate;

        if (state.playstate==="play"){
            this.state = {
                curDuration : this.state.curDuration,
                curTime : Math.floor(state.current_song.elapsed_time)
            }
        }
    }
    updateStateDuration(duration){

            this.state = {
                curDuration : duration,
                curTime :  this.state.curTime
            }

    }
    componentDidMount() {
        setInterval( () => {

            if (this.playing==="play"){
                let  newTime=this.state.curTime+1;
                this.setState({
                    curTime : newTime
                })
            }
        },1000)
    }
    render() {
        return(
            <div className="header-time">{getTime(this.state.curTime)+" "+getTime(this.state.curDuration)}
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
        this.mpd_client=mpd_client;
        this.artist="";

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.listener = observer.subscribe('StateChanged',(data)=>{
            //console.log('StateChanged is: ',data);
            this.updateState(data.state,data.client);

            //this.state.playing=(data.state.playstate=="play");
        });
    }
    updateState(state,client){
        let  current_song = client.getCurrentSong();
        console.log(current_song);
        this.artist=stringFormat("{0}-{1}",[current_song.getArtist(),current_song.getAlbum()]);
        let duration=current_song.getDuration();
        this.showTime.updateStateDuration(duration);
        let  path=current_song.getPath();
        path=path.substring(0, path.lastIndexOf("/"));
        let  song="";
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

    home() {
        window.scrollTo(0, 0);
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
        let minHeight=200;
        if (window.mpdreactfontlarge)minHeight=400;
        let myScrollbar = {
            margin: 0,

            width: width,
            height: minHeight,
        };
        let  s = {
            background: 'white'
        };
        let imagePath=getImagePath("/"+this.state.path);
        //<Sticky>
        return (
            <ReactScrollbar style={myScrollbar}>
                <header  style={s}>
                    <div><Img src={imagePath}  className="header-image" /><ImageButton
                        src={"img/previous.png"}
                        onClick={this.prev.bind(this)}
                        className="image-btn btn"
                        alt="Special button"
                    /><ImageButton
                        src={this.state.playing ?  "img/play.png":"img/pause.png"}
                        onClick={this.handleClick.bind(this)}
                        className="image-btn btn"
                        alt="Special button"
                    /><ImageButton
                        src={"img/next.png"}
                        onClick={this.next.bind(this)}
                        className="image-btn btn"
                        alt="Special button"
                    /><ImageButton
                        src={"img/home.png"}
                        onClick={this.home.bind(this)}
                        className="image-btn btn"
                        alt="Special button"
                    /><br/><div>{this.state.songName}<ShowTime  onRef={ref => (this.showTime = ref)}/></div></div>
                    <div className="header-artist">{this.artist}</div></header>
            </ReactScrollbar>

        );
    }
}

export default HeaderButtons;