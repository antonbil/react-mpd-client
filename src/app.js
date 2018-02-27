import ReactDOM from 'react-dom';
import React , { Component } from 'react';
import ReactObserver from 'react-event-observer';
import Tabs from 'react-simpletabs';
import Sticky from 'react-sticky-el';
import Img from 'react-image';
import ImageButton from 'fdmg-ts-react-image-button';
import Slider, { Range } from 'rc-slider';
import * as Mpd from '../MPD.js/mpd.js';
import Modal from 'react-modal';
import ReactScrollbar from 'react-scrollbar-js';
import CommonList from './CommonList.js';
import AlbumList from './AlbumList.js';
import PlayList from './Playlist.js';
import PlaylistList from './PlaylistList.js';
import {ContextMenu1,ContextMenu2} from './ContextMenu.js';
import{padDigits,getTime,getImagePath}from './Utils.js';

console.log("server:",window.server);
console.log(Mpd);
window.mpd_client = new MPD(8800,"ws://"+window.server);
console.log("mpd client:",window.mpd_client);

window.observer = ReactObserver();
//let  mpd_client=window.mpd_client;


/* class SearchList*/
class SearchList extends CommonList {
    constructor(props) {
        super(props);
        props.onRef(this);
        this.selection = -1;
        this.totalList = [];
        this.albumsContextmenu = null;
        this.state = {
            items: []
        };
        this.options=[];
        this.items=[];
        this.processSearchResults.bind(this);
        //this.handleClick = this.handleClick.bind(this,undefined);
    }
    setOptions(options){
        this.options=options;
    }
    processSearchResults(data){
        let totalList=[];
        this.items=[];
        let previousItem="";
        data.forEach((item)=>
        {
            let newItem={path:item.getPath(),title:item.getTitle(),album:item.getAlbum(),artist:item.getArtist()};
            //console.log(newItem);


            let addItem=newItem.artist+"-"+newItem.title;
            //this.options=[{name:'artist',value:true},{name:'album',value:false},{name:'title',value:false}];
            let titleSearch=this.options[2].value;
            let artistSearch=this.options[0].value;
            let albumSearch=this.options[1].value;
            let separate=this.options[3].value;
            if (artistSearch&&!separate)
                addItem=newItem.album;
            else
                if (albumSearch&&!separate)
                    addItem=newItem.artist+"-"+newItem.album;
            if (addItem !==previousItem) {
                let dirpath=newItem.path;
                dirpath=dirpath.substring(0, dirpath.lastIndexOf("/"));
                if (!(titleSearch||separate))
                    newItem.path=dirpath;
                newItem.dirpath=dirpath;
                totalList=totalList.concat(addItem);
                this.items=this.items.concat(newItem);

                //console.log("processSearchResults", newItem.title);
                //console.log(newItem);
            }
            previousItem=addItem;

        });
        this.totalList=totalList;
        //console.log("totalList:",totalList);
        this.setState({
            items: totalList
        });
    }
    getFilePath(index){
        let  str=this.items[index].dirpath;
        str=str.substr(0, str.length);
        return str;
    }

    contextResult(choice){
        let  path=this.getFilePath(this.selection);

        if (choice==="Add"){
            mpd_client.addSongToQueueByFile(path);
        }
        if (choice==="Add and Play"){
            let  len=mpd_client.getQueue().getSongs().length;
            mpd_client.addSongToQueueByFile(path);
            mpd_client.play(len);
        }
        if (choice==="Replace and Play"){
            mpd_client.clearQueue();
            mpd_client.addSongToQueueByFile(path);
            mpd_client.play(0);

        }
    }
    contextMenu (e) {
        e.preventDefault();

        this.albumsContextmenu.returnChoice=this.contextResult.bind(this);
        this.albumsContextmenu._handleContextMenu(e);
    };    handleClick(index) {
        //console.log("clicked:",index);
            let  path=this.items[index].path;
            this.selection=index;
            //console.log("add file:",path);
            mpd_client.addSongToQueueByFile( path);
        }
    render() {
        return (
            <div><ContextMenu2  onRef={ref => (this.albumsContextmenu = ref)} /><ul>
                {this.state.items.map((listValue,i)=>{
                    let path=getImagePath("/"+this.items[i].dirpath);
                    return <div className="list-item" key={i+500} onClick={() =>
                    { this.handleClick(i);}} onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}} >
                        <Img src={path}  className="list-image-small" /><li key={i}  style={this.listStyle}>{listValue}</li></div>;
                })}
            </ul></div>
        )
    }}
/*Timer*/
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
/*SearchForm*/
class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
      this.options=[{name:'artist',value:true},{name:'album',value:false},{name:'title',value:false},{name:'separate tracks',value:false}];
    this.multiSelect=false;
    this.state = {value: '',options:this.options};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  setSearchList(searchList){
      this.searchList=searchList;
  }

  handleSubmit(event) {
    //alert('A value was submitted: ' + this.state.value);
      let search={};
      for (let i=0;i<this.options.length-1;i++){
          if (this.options[i].value)
          search[this.options[i].name]=(this.state.value).trim();

      }
      //console.log("search for:",search);

      this.searchList.setOptions(this.options);

      mpd_client.search(search,this.searchList.processSearchResults.bind(this.searchList));
    event.preventDefault();
  }

  render() {
      //console.log(this.state,this.options);
    return (
      <form onSubmit={this.handleSubmit}>
          <label>
              <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Search" />
          { this.options.map((option, index) => (
              <div className="checkbox" key={index}>
                  <label>
                      <input type="checkbox"
                             name={`${name}[${index}]`}
                             value={option.name}
                             checked={option.value}
                             onChange={event => {
                                 let current=0;
                                 for (let i=0;i<this.options.length;i++){
                                     if (this.options[i].name===option.name)
                                         current=i;
                                 }
                                 if (!this.multiSelect && current<this.options.length-1)
                                     for (let i=0;i<this.options.length-1;i++)
                                        this.options[i].value=false;
                                 let prevState=this.state;

                                 this.options[current].value=event.target.checked;
                                 prevState.options=this.options;
                                 this.setState(prevState);
                                 return false;
                             }}/>
                      {option.name}
                  </label>
              </div>))
          }
      </form>
    );
  }
}

/**
 * select option; displays list of radio-buttons
 * descendant must at least define in constructor:
 *         this.options=[
 {name:'keuken',value:true},
 {name:'wifiberry',value:false}];
 }
 
 this defines two options, with properties name and value.

 */
class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.options=[];
        this.state = {value: '',options:this.options};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.submitMessage="Select";
    }

    getSelectedOption(event){
        event.preventDefault();
        for (let i=0;i<this.options.length;i++){
            if (this.options[i].value)
                return this.options[i];
        }

    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                { this.options.map((option, index) => (
                    <div className="checkbox" key={index}>
                        <label>
                            <input type="checkbox"
                                   name={`${name}[${index}]`}
                                   value={option.name}
                                   checked={option.value}
                                   onChange={event => {
                                       let current=0;
                                       for (let i=0;i<this.options.length;i++){
                                           if (this.options[i].name===option.name)
                                               current=i;
                                       }
                                       for (let i=0;i<this.options.length;i++)
                                           this.options[i].value=false;
                                       let prevState=this.state;

                                       this.options[current].value=event.target.checked;
                                       prevState.options=this.options;
                                       this.setState(prevState);
                                       return false;
                                   }}/>
                            {option.name}
                        </label>
                    </div>))
                }
                <input type="submit" value={this.submitMessage} />
            </form>
        );
    }
}
/*SelectServer*/
class SelectServer extends SelectOption {
    constructor(props) {
        super(props);
        this.submitMessage="Select host";
        this.options=[
            {name:'keuken',value:true, host:"http://192.168.2.16/mpdjs"},
            {name:'wifiberry',value:false, host:"http://192.168.2.12/mpdjs"}];
    }

    handleSubmit(event) {
        let address=this.getSelectedOption(event).host;
        window.open(address,"_self");
    }
}
/*VolumeSlider*/
class VolumeSlider extends Component {
  constructor(props, context) {
    super(props, context);
    let  volume=Math.round(mpd_client.getVolume()*100);
    this.state = {
        volume: volume
    }
  }
 
  handleOnChange  (value)  {
      value=Math.round(value);
      mpd_client.setVolume(value/100);
      this.setState({
          volume: value
      })
  }
 
  render() {
    let { volume } = this.state;
    return (
        <div>
        Volume:{volume}<br/>
      <Slider
        value={volume}
        orientation="horizontal"
        onChange={ this.handleOnChange.bind(this)}
      /></div>
    )
  }
}

class SearchTotal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.searchList = null;
        this.searchForm = null;
    }
    componentDidMount() {
        this.searchForm.setSearchList(this.searchList)
    }

    render() {
        return (
            <div>
            <SearchForm  onRef={ref => (this.searchForm = ref)} /><SearchList  onRef={ref => (this.searchList = ref)} /></div>
        )
    }
}

ReactDOM.render(
    <div className="buttons"><Buttons />
          <Tabs>
        <Tabs.Panel title='Playlist'>
          <div><PlayList /></div>
        </Tabs.Panel>
        <Tabs.Panel title='Albums'>
          <div><AlbumList /></div>
        </Tabs.Panel>
        <Tabs.Panel title='Playlists'>
          <PlaylistList />
        </Tabs.Panel>
              <Tabs.Panel title='Search'>
                  <SearchTotal />
              </Tabs.Panel>
        <Tabs.Panel title='Tools'>
        <div>
          <VolumeSlider />
            < SelectServer />
          </div>
        </Tabs.Panel>
      </Tabs>
      </div>
  ,
  document.getElementById('app')
  //
);

//pictures at: http://192.168.2.8:8081/FamilyMusic/.....
/*connect observer to mpd-client*/
//console.log("started mpd-client1");
mpd_client.on('StateChanged',(state, client)=>{
    //console.log("state changed:",state, client);
    observer.publish('StateChanged', {state:state, client:client});
});
mpd_client.on('QueueChanged',(queue)=>{
    //console.log("queue changed:",queue);
    observer.publish('QueueChanged', queue);
});
mpd_client.on('PlaylistsChanged',(playlists, client)=>{
    //console.log("Playlists Changed:",playlists);
    observer.publish('PlaylistsChanged', playlists);
});
//PlaylistsChanged
//let  mpd=new MyMPD();
//console.log("started mpd-client2");



