import ReactDOM from 'react-dom';
import React from 'react';
import ReactObserver from 'react-event-observer';
import Tabs from 'react-simpletabs';
import * as Mpd from '../MPD.js/mpd.js';//--> gives MPD-class
import FavsList from './FavsList.js';
import {PopupEditCategories} from './LinksList.js';
import {AlbumList} from './AlbumList.js';
import {LinksList} from './LinksList.js';
import PlayList from './Playlist.js';
import PlaylistList from './PlaylistList.js';
import {SearchTotal} from './SearchTotal.js';
import HeaderButtons from './HeaderButtons';
import SelectServer from './SelectServer';
import {SelectSkin,setColourDefaults} from './SelectSkin';
import VolumeSlider from './VolumeSlider';
import { MyButton } from './Buttons';
import { RecentModel,RecentList } from './RecentModel';

import {global,getDimensions,changeCSSRule} from "./Utils";
import {FloatingPlayButtons} from "./FloatingButton";
import cookie from "react-cookies";
class Main extends React.Component {
    constructor(props) {
        super(props);
        //pictures at: http://192.168.2.8:8081/FamilyMusic/.....

        this.observer = ReactObserver();
        this.connect();
        console.log(this.mpd_client);

        //define global variables
        let {width, height} = getDimensions();
        global.set("itemheight",height / 11);
        global.set("observer",this.observer);
        //create recentModel AFTER creating observer!
        global.set("recentmodel",new RecentModel({observer:this.observer}));
        global.set("fontlarge",window.mpdreactfontlarge);
        //global color-settings for theme
        let skin="day";
        let skincookie=cookie.load("skin");
        if (!(skincookie==undefined))
            skin=skincookie;
        //change to selected color scheme
        setColourDefaults(skin);


        this.renderlistener = this.observer.subscribe('Render',(data)=>{
            //re-render main
            this.setState({});
        });
        this.time=null;
        this.observer.subscribe('ShowTime',(data)=>{
            //ask Object ShowTime for its address,and store it in this.time
            this.time=data.time;
        });
        this.timer = setInterval(this.tick.bind(this), 10000);
    }
    connect(){
        this.mpd_client = new MPD(8800, "ws://" + window.server);
        this.observer.publish('MpdInitialized', this.mpd_client);
        global.set("mpd_client",this.mpd_client);
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

    tick(){
        //sync time every 10 seconds
        let state=global.get("mpd_client").getState();

        if(typeof state === 'number' && isNaN(state)||state===undefined||state===null)this.connect();
        else {
            if (this.time!==null) {
                let time1=this.time.curTime;
                let time2=Math.floor(global.get("mpd_client").getCurrentSongTime());
                if (Math.abs(time1-time2)>5)
                    this.connect()
                else
                    this.time.curTime=time2;
            }
        }
    }

    render() {
        //change colors for tab-header, and main. This is very hairy code!
        //css-classname must be rule!
        //so add the following style to 'main.css'. Otherwise they cannot be found, and nog be changed.
        changeCSSRule('.tabs-menu',"backgroundColor",global.get("backgroundHeader"));
        changeCSSRule('.tabs-menu-item.is-active a',"color",global.get("colorHeader"));
        changeCSSRule('.tabs-menu-item:not(.is-active) a:hover',"color",global.get("colorHeader"));

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
                <Tabs.Panel title='Links'>
                    <div><LinksList /> </div>
                </Tabs.Panel>
                <Tabs.Panel title='Lists'>
                    <PlaylistList/>
                </Tabs.Panel>
                <Tabs.Panel title='Recent'>
                    <RecentList  onRef={ref => (this.PopupEditCategories = ref)}/>
                </Tabs.Panel>
                <Tabs.Panel title='Search'>
                    <SearchTotal/>
                </Tabs.Panel>
                <Tabs.Panel title='Tools'>
                    <div>
                        <VolumeSlider/>
                        < SelectServer/>
                        < SelectSkin />
                        <PopupEditCategories title={"Edit Categories"} onRef={ref => (this.PopupEditCategories = ref)}/>
                        <MyButton text={"Edit Categories"}  onClick={(e)=>{this.PopupEditCategories.openPopup(e)}}/>
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








