# react-mpd-client

creates an mpd-client based on the react-js framework

I am planning to port this to react-native, to use it as an android-client
But first make it work as an ordinary web-client!

dependencies:
uses MPD.js, available on https://github.com/bobboau/MPD.js
MPD.js is dependent on [Websockify](https://github.com/kanaka/websockify) and Websockify's [websock](https://github.com/kanaka/websockify/wiki/websock.js) library

uses the following react-tools (to be installed using npm):
    "fdmg-ts-react-image-button": "^1.0.23",
    "react-event-observer": "^0.5.11",
    "react-image": "^1.3.1",
    "react-simpletabs": "^0.7.0",
    "react-sticky-el": "^1.0.16",


This implementation of mpd-client is based on the following assumptions:
- organize the files as albums in directories.
- only play albums, no playlists or separate songs.
- make it easy to add or remove albums from queue

Album-art can be displayed. But because it is not native supported in mpd, I have used a workaround:
- every directory with an album contains the file folder.jpg, with the album-art for the album involved.
- this is avaliable using a webserver, in my case on port 8081
