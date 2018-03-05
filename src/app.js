import ReactDOM from 'react-dom';
import React from 'react';
import ReactObserver from 'react-event-observer';
import Tabs from 'react-simpletabs';
import * as Mpd from '../MPD.js/mpd.js';//--> gives MPD-class
import FavsList from './FavsList.js';
import {AlbumList} from './AlbumList.js';
import PlayList from './Playlist.js';
import PlaylistList from './PlaylistList.js';
import SearchTotal from './SearchTotal.js';
import HeaderButtons from './HeaderButtons';
import SelectServer from './SelectServer';
import VolumeSlider from './VolumeSlider';

import {global,getDimensions} from "./Utils";
import {FloatingPlayButtons} from "./FloatingButton";

class Main extends React.Component {
    constructor(props) {
        super(props);
        //pictures at: http://192.168.2.8:8081/FamilyMusic/.....

        this.mpd_client = new MPD(8800, "ws://" + window.server);
        this.observer = ReactObserver();

        //define global variables
        let {width, height} = getDimensions();
        global.set("mpd_client",this.mpd_client);
        global.set("itemheight",height / 11);
        global.set("observer",this.observer);
        global.set("fontlarge",window.mpdreactfontlarge);

        /*connect observer to mpd-client*/
        this.mpd_client.on('StateChanged', (state, client) => {
            //console.log("state changed:",state, client);
            this.observer.publish('StateChanged', {state: state, client: client});
        });
        this.mpd_client.on('QueueChanged', (queue) => {
            //console.log("queue changed:",queue);
            this.observer.publish('QueueChanged', queue);
        });
        this.mpd_client.on('PlaylistsChanged', (playlists, client) => {
            //console.log("Playlists Changed:",playlists);
            this.observer.publish('PlaylistsChanged', playlists);
        });
    }


    render() {
        //main display, combine all defined elements
        return <div className="header-total">

            <HeaderButtons/>
            <Tabs>
                <Tabs.Panel title='Play'>
                    <div><PlayList/></div>
                </Tabs.Panel>
                <Tabs.Panel title='Favs'>
                    <div><FavsList/></div>
                </Tabs.Panel>
                <Tabs.Panel title='Albums'>
                    <div><AlbumList/></div>
                </Tabs.Panel>
                <Tabs.Panel title='Lists'>
                    <PlaylistList/>
                </Tabs.Panel>
                <Tabs.Panel title='Search'>
                    <SearchTotal/>
                </Tabs.Panel>
                <Tabs.Panel title='Tools'>
                    <div>
                        <VolumeSlider/>
                        < SelectServer/>
                        <FloatingPlayButtons level={0}/>
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    }
}


ReactDOM.render(
    <Main/>
    ,
    document.getElementById('app')
    //
);








