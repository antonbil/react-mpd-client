/*PlaylistList*/
import React from "react";
import CommonList from "./CommonList";
import {ContextMenu2} from './ContextMenu.js';

class PlaylistList extends CommonList {
    constructor(props) {
        super(props);
        this.albumsContextmenu=null;
    }
    componentDidMount() {
        let  playlists=mpd_client.getPlaylists();
        if(playlists!=null)
            this.updatePlaylists(playlists);

        this.listener = observer.subscribe('PlaylistsChanged',(data)=>{
            //console.log('PlaylistsChanged is: ',data);
            this.updatePlaylists(data);

        });

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
        //console.log("albums choice:",choice);
        //console.log("action with:",this.selection);
        //console.log("playlistsselection:",this.state.items[this.selection]);

        if (choice==="Add"){
            mpd_client.appendPlaylistToQueue(this.state.items[this.selection]);
        }
        if (choice==="Add and Play"){
            let  len=mpd_client.getQueue().getSongs().length;
            mpd_client.appendPlaylistToQueue(this.state.items[this.selection]);
            mpd_client.play(len);
        }
        if (choice==="Replace and Play"){
            mpd_client.clearQueue();
            mpd_client.appendPlaylistToQueue(this.state.items[this.selection]);
            mpd_client.play(0);

        }
    }
    contextMenu (e) {
        e.preventDefault();

        this.albumsContextmenu.returnChoice=this.contextResult.bind(this);
        this.albumsContextmenu._handleContextMenu(e);
    };
    handleClick(index) {
        mpd_client.appendPlaylistToQueue(this.state.items[index]);
    };

    render() {
        return (<div><ContextMenu2 onRef={ref => (this.albumsContextmenu = ref)} />
                <ul>
                    {this.state.items.map((listValue,i)=>{
                        return <li key={i} onClick={() => { this.handleClick(i);}} onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}} style={this.listStyle}>{listValue}</li>;
                    })}
                </ul></div>
        )
    }
}

export default PlaylistList;