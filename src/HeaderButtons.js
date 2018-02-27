/*Timer*/
import {getImagePath, getTime} from "./Utils";
import React from "react";
import Sticky from 'react-sticky-el';
import Img from 'react-image';
import ImageButton from 'fdmg-ts-react-image-button';

class ShowTime extends React.Component {
    constructor() {
        super();
        this.playing="stop";
        this.state = {
            curTime : null
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
                curTime : Math.floor(state.current_song.elapsed_time)
            }
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
            <div className="header-time">{getTime(this.state.curTime)}
            </div>
        );
    }
}
/*Buttons*/
class Buttons extends React.Component {
    constructor(props) {
        super(props);
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
        this.artist=current_song.getArtist()+ "-"+current_song.getAlbum();
        let  path=current_song.getPath();
        path=path.substring(0, path.lastIndexOf("/"));
        let  song="";
        if(current_song){
            song=current_song.getDisplayName();
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


    render() {//<Img src="http://192.168.2.8:8081/FamilyMusic/00tags/newest/03-Marlon%20Williams-Make%20Way%20for%20Love/folder.jpg">
        let  s = {
            background: 'white'
        };
        let imagePath=getImagePath("/"+this.state.path);
        //console.log(imagePath);
        return (<Sticky>
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
                    /><br/><div>{this.state.songName}<ShowTime/></div></div>
                    <div className="header-artist">{this.artist}</div></header>
            </Sticky>
        );
    }
}

export default Buttons;