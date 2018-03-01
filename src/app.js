import ReactDOM from 'react-dom';
import React , { Component } from 'react';
import ReactObserver from 'react-event-observer';
import Tabs from 'react-simpletabs';
import * as Mpd from '../MPD.js/mpd.js';
import AlbumList from './AlbumList.js';
import PlayList from './Playlist.js';
import PlaylistList from './PlaylistList.js';
import SearchTotal from './SearchTotal.js';
import HeaderButtons from './HeaderButtons';
import SelectServer from './SelectServer';
import VolumeSlider from './VolumeSlider';
import ReactScrollbar from 'react-scrollbar-js';
import {getDimensions} from "./Utils";

//pictures at: http://192.168.2.8:8081/FamilyMusic/.....
//define global variables
window.mpd_client = new MPD(8800,"ws://"+window.server);
console.log("mpd client:",window.mpd_client);
window.observer = ReactObserver();
//main display, combine all defined elements
let {width, height} = getDimensions();
let myScrollbar = {
    margin: 0,
    width: width,
    height: height
};
let totalDivStyle = {
};

//,
//"right-margin":10

ReactDOM.render(
    <ReactScrollbar style={myScrollbar}>
    <div className="buttons"  style={totalDivStyle}><HeaderButtons />
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
    </ReactScrollbar>
  ,
  document.getElementById('app')
  //
);

/*connect observer to mpd-client*/
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




