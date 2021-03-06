/* class Playlist*/
import React from "react";
import CommonList from "./CommonList";
import {ContextMenu2} from "./ContextMenu.js";
import Img from 'react-image';
import {getDimensions, getImagePath, getTime, global, padDigits,blend_colors, mpd_client} from "./Utils";
import ReactDOM from 'react-dom';
import {BasicFloatingMenu} from './FloatingButton';

const removeAction = "Remove";
const removeTopAction = "Remove top";
const removeBottomAction = "Remove bottom";
const removeAllAction = "Remove all";
const playAction = "Play";

/**
 * display playlist of player
 */
class PlayList extends CommonList {
    constructor(props) {
        super(props);

        this.selection = -1;
        this.totalList = [];
        this.top = 300;
        this.playlistContextmenu = null;
        this.state = {
            items: []
        };

        this.queueId = -1;
    }

    componentDidMount() {
        let rect = ReactDOM.findDOMNode(this)
            .getBoundingClientRect();
        this.top = rect.top;
        let queue = mpd_client().getQueue();

        if (queue != null)
            this.updateQueue(queue);

        this.listener = global.get("observer").subscribe('QueueChanged', (data) => {
            this.updateQueue(data);

        });
        this.listenerState = global.get("observer").subscribe('StateChanged', (data) => {
            this.updateState(data.state);
        });

    }

    updateState(state) {
        let id = state.current_song.queue_idx;
        if (this.queueId != id) {
            this.queueId = id;
            this.setState(this.state);
        }
    }

    componentWillUnmount() {
        this.listenerState.unsubscribe();
        this.listener.unsubscribe();
    }

    /**
     * updates playist based on new queue. Triggered using observer
     * @param queue
     */
    updateQueue(queue) {
        let queueList = queue.getSongs();
        this.totalList = queueList.map((song) => {
            let path = song.getPath();
            let dirpath = path.substring(0, path.lastIndexOf("/"));
            return {
                path: song.getPath(), track: song.getTrack(), title: song.getTitle(), dir: dirpath,
                album: song.getAlbum(), artist: song.getArtist(), duration: song.getDuration()
            };
        });
        let mylist = queueList.map((song) => {
            return song.getDisplayName()
        });
        this.setState(previousState => ({
            items: mylist
        }));

    }

    handleClick(index) {
        if (!this.playlistContextmenu.state.visible)
            mpd_client().play(index);
    };

    /**
     * return function of call to context-menu
     * @param choice: return result of context-menu
     */
    contextResult(choice) {
        if (choice === removeAction) {
            mpd_client().removeSongFromQueueByPosition(this.selection);
        }
        if (choice === removeBottomAction) {
            let len = mpd_client().getQueue().getSongs().length;
            for (let i = this.selection; i < len; i++)
                mpd_client().removeSongFromQueueByPosition(this.selection);
        }
        if (choice === removeTopAction) {
            for (let i = 0; i < this.selection; i++)
                mpd_client().removeSongFromQueueByPosition(0);
            mpd_client().removeSongFromQueueByPosition(this.selection);
        }
        if (choice === removeAllAction) {
            mpd_client().clearQueue();
        }
        if (choice === playAction)
            mpd_client().play(this.selection);
    }

    contextMenu(e) {
        this.playlistContextmenu._handleContextMenu(e);
    };

    render() {
        let {width, height} = getDimensions();
        let myScrollbar = {
            margin: 0,
            //width: width,
            height: height - this.top - 20,
        };
        let listPlayingStyle = {
            backgroundColor: global.get("backgroundPlaying"),
            border:"4px solid"
        };

        let prevPath = "";
        return (

            <div><ContextMenu2 onRef={ref => (this.playlistContextmenu = ref)}
                               returnChoice={this.contextResult.bind(this)}
                               options={[removeAction, removeTopAction, removeBottomAction, removeAllAction, "", playAction]}/>
                <BasicFloatingMenu/>
                <ul>
                    {this.state.items.map((listValue, i) => {
                        let img = null;
                        let artist = null;
                        let path = getImagePath("/" + this.totalList[i].dir);
                        if (prevPath !== path) {
                            img = <Img src={path} style={this.imgStyle}/>;
                            artist = <div className="list-artist"
                                          style={this.textStyle}>{this.totalList[i].artist + "-" + this.totalList[i].album}</div>
                        }
                        let ls = this.getEvenStyle(i);
                        let current = "";
                        if (global.get("currentsong") == i) {
                            current = "list-playing";
                            Object.assign(ls, listPlayingStyle)
                        }
                        let time = getTime(this.totalList[i].duration);
                        prevPath = path;
                        return <div style={ls} key={i}>{img}
                            <li onClick={() => {
                                this.handleClick(i);
                            }}
                                onContextMenu={(e) => {
                                    this.selection = i;
                                    this.contextMenu(e)
                                }}
                            >
                                <div className="list-time" style={this.aligntextStyle}>{time}</div>
                                <span className={"list-title"}
                                      style={this.textStyle}>{padDigits(this.totalList[i].track, 2) +
                                " " + listValue}</span>{artist}</li>
                        </div>;
                    })}
                </ul>
            </div>
        )
    }
}

export default PlayList;