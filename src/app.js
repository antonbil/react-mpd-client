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
import {SelectSkin,setColourDefaults} from './SelectSkin';
import VolumeSlider from './VolumeSlider';

import {global,getDimensions} from "./Utils";
import {FloatingPlayButtons} from "./FloatingButton";
import cookie from "react-cookies";

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
        //global color-settings for theme
        let skin="day";
        let skincookie=cookie.load("skin");
        if (!(skincookie==undefined))
            skin=skincookie;
        console.log("skincookie",skincookie);
        //
        setColourDefaults(skin);
        //global.set("backgroundColor",'#212529');
        //global.set("color","white");
        //global.set("backgroundPlaying","#454540");

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
        this.renderlistener = this.observer.subscribe('Render',(data)=>{
            //console.log('StateChanged is: ',data);
            console.log("re-render main");
            this.setState({});
        });
    }

    render() {
        //main display, combine all defined elements
        document.body.style.backgroundColor=global.get("backgroundColor");
        document.body.style.color=global.get("color");
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
                        < SelectSkin />
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








