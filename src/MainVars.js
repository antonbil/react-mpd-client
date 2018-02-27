import ReactObserver from "react-event-observer";
import * as Mpd from "../MPD.js/mpd";
console.log("server:",window.server);
console.log(Mpd);
window.mpd_client = new MPD(8800,"ws://"+window.server);
console.log("mpd client:",window.mpd_client);
let  observer = ReactObserver();
let  mpd_client=window.mpd_client;

export{observer,mpd_client}