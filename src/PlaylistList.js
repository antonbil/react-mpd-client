/*PlaylistList*/
import React from "react";
import CommonList from "./CommonList";
import {ContextMenu2} from './ContextMenu.js';
import {BasicFloatingMenu} from "./FloatingButton";
import {global} from "./Utils";

class PlaylistList extends CommonList {
    constructor(props) {
        super(props);
        this.albumsContextmenu=null;
    }
    componentDidMount() {
        let  playlists=this.mpd_client.getPlaylists();
        if(playlists!=null)
            this.updatePlaylists(playlists);

        this.listener = global.get("observer").subscribe('PlaylistsChanged',(data)=>{
            this.updatePlaylists(data);

        });

    }
    componentWillUnmount(){
        this.listener.unsubscribe();
    }
    updatePlaylists(playlists){
        playlists.sort();
        let  mylist=[];
        playlists.forEach((playlist)=>{
            mylist=mylist.concat( playlist);

        });
        this.setState(previousState => ({
            items: mylist
        }));
    }
    contextResult(choice){

        if (choice==="Add"){
            this.mpd_client.appendPlaylistToQueue(this.state.items[this.selection]);
        }
        if (choice==="Add and Play"){
            let  len=this.mpd_client.getQueue().getSongs().length;
            this.mpd_client.appendPlaylistToQueue(this.state.items[this.selection]);
            this.mpd_client.play(len);
        }
        if (choice==="Replace and Play"){
            this.mpd_client.clearQueue();
            this.mpd_client.appendPlaylistToQueue(this.state.items[this.selection]);
            this.mpd_client.play(0);

        }
    }
    contextMenu (e) {
        e.preventDefault();
        this.albumsContextmenu._handleContextMenu(e);
    };
    handleClick(index) {
        this.mpd_client.appendPlaylistToQueue(this.state.items[index]);
    };

    render() {
        return (<div><ContextMenu2 onRef={ref => (this.albumsContextmenu = ref)} returnChoice={this.contextResult.bind(this)}
                                   options={["Add","Add and Play","Replace and Play"]}/>
                <ul>
                    {this.state.items.map((listValue,i)=>{
                        return <li key={i} onClick={() => { this.handleClick(i);}}
                                   onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}}
                                   style={this.listStyle}>{listValue}</li>;
                    })}
                </ul><BasicFloatingMenu/></div>
        )
    }
}

export default PlaylistList;