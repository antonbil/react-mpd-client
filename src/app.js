import ReactDOM from 'react-dom';
import React , { Component } from 'react';
import { render } from 'react-dom';
import HelloWorld from './HelloWorld.jsx';
//import MPD from "../MPD.js/mpd.js";
import ReactObserver from 'react-event-observer';
import Tabs from 'react-simpletabs';
import Sticky from 'react-sticky-el';
import Img from 'react-image';
import ImageButton from 'fdmg-ts-react-image-button';


var observer = ReactObserver();
var mpd_client=window.mpd_client;
var playlistContextmenu=null;
var albumsContextmenu=null;
var playlistselection=-1;
var albumsselection=-1;
var albumList=null;
function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
function getTime(n){
    var min=Math.floor(n/60);
    var sec=n % 60;
    return padDigits(min,2)+":"+padDigits(sec,2);
}
function getImagePath(path){
    return "http://192.168.2.8:8081/FamilyMusic"+path+"/folder.jpg"
}
class ContextMenu1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        visible: false,
    };
    this.returnChoice=null;
    this.setMenu();
    this._handleContextMenu = this._handleContextMenu.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
  }
  setMenu(){
      playlistContextmenu=this;
  }
    
    componentDidMount() {
        //document.addEventListener('contextmenu', this._handleContextMenu);
        document.addEventListener('click', this._handleClick);
        document.addEventListener('scroll', this._handleScroll);
    };

    componentWillUnmount() {
      //document.removeEventListener('contextmenu', this._handleContextMenu);
      document.removeEventListener('click', this._handleClick);
      document.removeEventListener('scroll', this._handleScroll);
    }
    
    _handleContextMenu(event) {
        //event.preventDefault();
        
        this.setState({ visible: true });
        const clickX = event.clientX;
        const clickY = event.clientY;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        try{//first time it is displayed no value is assigned to this.app
            var rootW1 = this.app.offsetWidth;

            const rootW=rootW1;

            var rootH1 = this.app.offsetHeight;
            const rootH=rootH1;

            
            const right = (screenW - clickX) > rootW;
            const left = !right;
            const top = (screenH - clickY) > rootH;
            const bottom = !top;
            if (right) {
                this.app.style.left = `${clickX + 5}px`;
            }
            
            if (left) {
                this.app.style.left = `${clickX - rootW - 5}px`;
            }
            
            if (top) {
                this.app.style.top = `${clickY + 5}px`;
            }
            
            if (bottom) {
                this.app.style.top = `${clickY - rootH - 5}px`;
            }
        } catch(e){}
    };

    _handleClick (event) {
       
        const { visible } = this.state;
        const wasOutside = event.target.className.indexOf("contextMenu") == -1;//event.target.className.indexOf("contextMenu") !== -1
        if (visible) {event.preventDefault();this.setState({ visible: false, });}
        if (!wasOutside)
            this.returnChoice(event.path[0].textContent);
    };

    _handleScroll () {
        const { visible } = this.state;
        
        if (visible) this.setState({ visible: false, });
    };
    
    render() {
        const { visible } = this.state;
        
        return(visible || null) && 
            <div ref={ref => {this.app = ref}} className="contextMenu">
                <div className="contextMenu--option">Remove</div>
                <div className="contextMenu--option">Remove top</div>
                <div className="contextMenu--option">Remove bottom</div>
                <div className="contextMenu--option">Remove all</div>
                <div className="contextMenu--separator"></div>
                <div className="contextMenu--option">Play</div>
            </div>
    };
}
/*/*ContextMenu2*/
class ContextMenu2 extends ContextMenu1 {
  setMenu(){
      albumsContextmenu=this;
  }
    render() {
        const { visible } = this.state;
        
        return(visible || null) && 
            <div ref={ref => {this.app = ref}} className="contextMenu">
                <div className="contextMenu--option">Add</div>
                <div className="contextMenu--option">Add and Play</div>
                <div className="contextMenu--option">Replace and Play</div>
            </div>
    };
    
}
/*CommonList*/
class CommonList extends React.Component {
  constructor(props) {
    super(props);
    this.selection=-1;
    this.state = {
    items: []
    };
    this.listStyle = {
            border: '3px solid #ddd',
            'list-style-type': 'none',
            display: 'block',
            padding: '10px'
        };
    this.handleClick = this.handleClick.bind(this);
    this.contextMenu = this.contextMenu.bind(this);

  }
    handleClick(index) {
    };
    contextMenu (e) {
        e.preventDefault();
    };
}
/*PlaylistList*/
class PlaylistList extends CommonList {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var playlists=mpd_client.getPlaylists();
        if(playlists!=null)
            this.updatePlaylists(playlists);

        this.listener = observer.subscribe('PlaylistsChanged',(data)=>{
            console.log('PlaylistsChanged is: ',data);
            this.updatePlaylists(data);

        });
        
    }
    updatePlaylists(playlists){
        playlists.sort();
        var mylist=[];
        playlists.forEach((playlist)=>{
            mylist=mylist.concat( playlist);
            
        });
        this.setState(previousState => ({
            items: mylist
        }));
    }
    handleClick(index) {
	console.log("clicked:",index);//.loadPlaylistIntoQueue(element.val());-->replace
        mpd_client.appendPlaylistToQueue(this.state.items[index]);
    };
    contextMenu (e) {
        e.preventDefault();
    };
    render() {
      return (
        <ul>
          {this.state.items.map((listValue,i)=>{
            return <li key={i} onClick={() => { this.handleClick(i);}} onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}} style={this.listStyle}>{listValue}</li>;
          })}
        </ul>
      )
    }
}
/*AlbumList*/
class AlbumList extends CommonList {
  constructor(props) {
    super(props);
    this.selection=-1;
    this.totalList=[];
    this.prevdirs=[];
    albumList=this;
    this.state = {
      items: []
    };
    this.getDirectoryContents("/");
        this.backClick = this.backClick.bind(this);
  }
  getDirectoryContents(dir){mpd_client.getDirectoryContents(dir, (directory_contents)=> {
        var myTotalList=[];
        var mylist=[];
        console.log(directory_contents);
        directory_contents.forEach((content)=>{
            var element=this.makeFileListElement(content);
            try{
            myTotalList=myTotalList.concat( element);
            var path=element.MPD_file_path_name;
            path=path.substr(path.lastIndexOf('/') + 1);
            mylist=mylist.concat( path)
                    //console.log(element);
            } catch(e){}
        });
        this.totalList=myTotalList;
        if (mylist.length>0){
            this.prevdirs=this.prevdirs.concat( dir);
            this.setState(previousState => ({
                items: mylist
            }));
        } else{
            //var path=this.getFilePath(this.selection);
            console.log("add dir:",dir);
            mpd_client.addSongToQueueByFile(dir);
            //no items, display context menu
        }
        })

  }


    makeFileListElement(content){
        var item={};
        item.mpd_file_path=content.getPath().replace(/(.*[^\/])\/?/, '$1/');
        if(typeof content.getMetadata().directory !== 'undefined'){
            item.MPD_file_path_name=content.getPath();
        }
        else{
            item.MPD_file_title=content.getDisplayName();
            item.MPD_file_album=content.getAlbum();
            item.MPD_file_artist=content.getArtist();
            item.MPD_file_file=content.getPath();
        }

        return item;
    }
    
    getFilePath(index){
        var str=this.totalList[index].mpd_file_path;
        str=str.substr(0, str.length - 1);
        return str;
    }
  
    handleClick(index) {
	console.log("clicked:",index);
        if (!albumsContextmenu.state.visible){
            var path=this.getFilePath(index);
            this.selection=index;
            this.getDirectoryContents( path);
        }
        //mpd_client.play(index);
    };
    contextResult(choice){
        console.log("albums choice:",choice);
        console.log("action with:",albumList.selection);
        var path=albumList.getFilePath(albumList.selection);
        console.log("albumsselection:",path);

        if (choice=="Add"){
            mpd_client.addSongToQueueByFile(path);
        }
        if (choice=="Add and Play"){
            var len=mpd_client.getQueue().getSongs().length;
            mpd_client.addSongToQueueByFile(path);
            mpd_client.play(len);
        }
        if (choice=="Replace and Play"){
            mpd_client.clearQueue();
            mpd_client.play(0);
            
        }
    }
    contextMenu (e) {
        e.preventDefault();
        albumsselection=this.selection;

        albumsContextmenu.returnChoice=this.contextResult;
        albumsContextmenu._handleContextMenu(e);
    };
      backClick() {//this.prevdirs=this.prevdirs.splice(-1,1);
          if (this.prevdirs.length>1){
              console.log("back1",this.prevdirs);
              //this.prevdirs=this.prevdirs.splice(-1,1);
              this.prevdirs.pop();
              console.log("back2",this.prevdirs);
              var dir=this.prevdirs[this.prevdirs.length-1];
              console.log("back3",dir);
              //this.prevdirs=this.prevdirs.splice(-1,1);
              this.prevdirs.pop();
              this.getDirectoryContents(dir);
          }
          console.log("back");
      }

    
    render() {
      return (
        <div><ContextMenu2 /><br/><button onClick={this.backClick}>Back</button><ul>
          {this.state.items.map((listValue,i)=>{
              var path=getImagePath("/"+this.totalList[i].mpd_file_path);
            return <div className="list-item"><li key={i} onClick={() => { this.handleClick(i);}} onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}} style={this.listStyle}><Img src={path}  className="list-image" />{listValue}</li></div>;
          })}
        </ul></div>
      )
    }
}
/* class Playlist*/
class PlayList extends CommonList {
  constructor(props) {
    super(props);
    this.selection=-1; 
    this.totalList=[];
    this.state = {
      items: []
    };
    //this.handleClick = this.handleClick.bind(this,undefined);
  }
   componentDidMount() {
    var queue=mpd_client.getQueue();
    console.log("queue:",queue);
    if(queue!=null)
        this.updateQueue(queue);

    this.listener = observer.subscribe('QueueChanged',(data)=>{
        console.log('QueueChanged is: ',data);
        this.updateQueue(data);

    });
    
  }
  updateQueue(queue){
      console.log("update queue:",queue.getSongs());
      var mylist=[];
      var totalList=[];
      this.setState(previousState => ({items: []}));
      var queueList=queue.getSongs();
      //console.log(queueList);
      queueList.forEach((song)=>{
          var path=song.getPath();
          var dirpath=path.substring(0, path.lastIndexOf("/"));
          var item={path:song.getPath(),track:song.getTrack(), title:song.getTitle(), dir:dirpath, album:song.getAlbum(), artist:song.getArtist(), duration:song.getDuration()};
          totalList=totalList.concat(item);
          mylist=mylist.concat( song.getDisplayName())
      });
      this.totalList=totalList;
      console.log(this.totalList);
      this.setState(previousState => ({
            items: mylist
      }));

    }
    handleClick(index) {
	console.log("clicked:",index);
        if (!playlistContextmenu.state.visible)
        mpd_client.play(index);
    };
    
    contextResult(choice){
        console.log("choice:",choice);
        console.log("action with:",playlistselection);
        if (choice=="Remove"){
            mpd_client.removeSongFromQueueByPosition(playlistselection);
        }
        if (choice=="Remove bottom"){
            var len=mpd_client.getQueue().getSongs().length;
            for (var i=playlistselection;i<len;i++)
                mpd_client.removeSongFromQueueByPosition(playlistselection);
        }
        if (choice=="Remove top"){
            for (var i=0;i<playlistselection;i++)
                mpd_client.removeSongFromQueueByPosition(0);
            mpd_client.removeSongFromQueueByPosition(playlistselection);
        }
        if (choice=="Remove all"){
            mpd_client.clearQueue();
        }
        if (choice=="Play")
            mpd_client.play(playlistselection);
    }
    
    contextMenu (e) {
        e.preventDefault();
        playlistContextmenu.returnChoice=this.contextResult;
        playlistContextmenu._handleContextMenu(e);
        //setTimeout(()=> { playlistContextmenu._handleContextMenu(e);; }, 100);
        
    };
    
    render() {
        var prevPath="";
      return (
        <div><ContextMenu1 /><ul>
          {this.state.items.map((listValue,i)=>{//<Img src={path}  className="list-image" />
          var img=null;
          var artist=null;
            var path=getImagePath("/"+this.totalList[i].dir);
            if (prevPath !=path){
                img=<Img src={path}  className="list-image" />;
                artist=<div className="list-artist">{this.totalList[i].artist+"-"+this.totalList[i].album}</div>
            }
            var time=getTime(this.totalList[i].duration);
            prevPath=path;
            return <li key={i} onClick={() => { this.handleClick(i);}} onContextMenu={(e) => {playlistselection=i;this.selection=i; this.contextMenu(e)}} style={this.listStyle}>{img}
            <div className="list-time">{time}</div><span className="list-title">{padDigits(this.totalList[i].track,2)+" "+listValue}</span>{artist}</li>;
          })}
        </ul></div>
      )
    }
}
/*Timer*/
class ShowTime extends React.Component {
   constructor() {
        super();
        this.playing="stop";
        this.state = {
            curTime : null
        }
        this.listener = observer.subscribe('StateChanged',(data)=>{
            console.log('StateChanged is: ',data);
            this.updateState(data.state,data.client);
        });
    }
    updateState(state,client){
        this.playing=state.playstate;
        
        if (state.playstate=="play"){
                    this.state = {
                    curTime : Math.floor(state.current_song.elapsed_time)
                }
        }
    }
    componentDidMount() {
      setInterval( () => {
          
          if (this.playing=="play"){
              var newTime=this.state.curTime+1;
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
        console.log('StateChanged is: ',data);
        this.updateState(data.state,data.client);

        //this.state.playing=(data.state.playstate=="play");
    });
  }
  updateState(state,client){
      var current_song = client.getCurrentSong();
      this.artist=current_song.getArtist()+ "-"+current_song.getAlbum();
      var path=current_song.getPath();
      path=path.substring(0, path.lastIndexOf("/"));
      var song="";
        if(current_song){
            song=current_song.getDisplayName();
        }
      this.setState(prevState => ({
      playing: state.playstate=="play",songName:song,path:path
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
        console.log("play");
    } else{
        this.mpd_client.pause();
        console.log("pause");
    }
  }
  

  render() {//<Img src="http://192.168.2.8:8081/FamilyMusic/00tags/newest/03-Marlon%20Williams-Make%20Way%20for%20Love/folder.jpg">
        var s = {
            background: 'white'
        };
        var image = {
            height: "65px",
    width: "65px",
    float:"right"
        };
        var imagePath=getImagePath("/"+this.state.path);
        console.log(imagePath);
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
            /><br/><div>{this.state.songName}<ShowTime/></div></div>
            <div className="header-artist">{this.artist}</div></header>
        </Sticky>
    );
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
      </Tabs>
      </div>
  ,
  document.getElementById('app')
  //
);

//pictures at: http://192.168.2.8:8081/FamilyMusic/.....
/*connect observer to mpd-client*/
console.log("started mpd-client1");
mpd_client.on('StateChanged',(state, client)=>{
    console.log("state changed:",state, client);
    observer.publish('StateChanged', {state:state, client:client});
});
mpd_client.on('QueueChanged',(queue)=>{
    console.log("queue changed:",queue);
    observer.publish('QueueChanged', queue);
});
mpd_client.on('PlaylistsChanged',(playlists, client)=>{
    console.log("Playlists Changed:",playlists);
    observer.publish('PlaylistsChanged', playlists);
});
//PlaylistsChanged
//var mpd=new MyMPD();
console.log("started mpd-client2");



