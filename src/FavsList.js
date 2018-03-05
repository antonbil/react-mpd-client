import {AlbumList,notifyMessage,lastPart}from "./AlbumList";
import parser from 'react-dom-parser';
import {global} from "./Utils";


// Changes XML to JSON
//copied from:https://davidwalsh.name/convert-xml-json
function xmlToJson(xml) {

    // Create the return object
    let obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                let attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for(let i = 0; i < xml.childNodes.length; i++) {
            let item = xml.childNodes.item(i);
            let nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    let old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

/**
 * display contents of favorites in Listview
 */
class FavsList extends AlbumList {
    constructor(props) {
        super(props);
        this.getHTML.bind(this);
    }

    getImagePath(path){
        return path.substring(1)+"folder.jpg";
    }
    getPrevDirs(){
        //global variable favsListConfig to store state of FavList
        let prevdirs=global.get("favsListConfig");
        if (typeof prevdirs === 'undefined' || prevdirs === null) {
            prevdirs= [];
            global.set("favsListConfig",prevdirs)
        }
        return prevdirs;

    }
    baseDir(){
        return "http://192.168.2.8:8081/TotalMusic";
    }

    /**
     * very specific function to retrieve album-directory
     * On my file-system I have added lots of soft-links to album-directories that are part of the mpd-collection.
     * First line in the file 'mp3info.txt' contains the absolute path of the directory.
     * @param index
     * @param doAction
     */
    getFilePathCallback(index,doAction) {
        fetch(this.totalList[index].mpd_file_path+"/mp3info.txt").then((resp)=>{ return resp.text() }).then((text)=>{
            //get first line of file, and remove first part of dirname that is the root of the music-directory for MPDS
            let dirToAdd=(text.split("\n")[0]).replace("/home/wieneke/FamilyLibrary/FamilyMusic/","");
            doAction(dirToAdd);
        })
    }


    getDirectoryContents(dir) {
        //get directory-listing from url
        this.getHTML(dir,(data)=>{
            //directory-listing is in html-table
            data=xmlToJson(data).HTML.BODY.DIV[0].TABLE.TBODY.TR;
            //names in first cell in row
            let fileList = data.map((element) => element.TD[0].A["#text"]);
            //first one is directory-up, remove it
            fileList.shift();
            let extList=[];
            let newList=[];
            //checck if list contains music-files
            for (let i=0;i<fileList.length;i++){
                let element=fileList[i];
                if (element.includes(".")){
                    let fileExt = element.split('.').pop();
                    if (['flac', 'mp3', 'm4a'].includes(fileExt)) extList.push(element);
                    else
                        if (!['txt', 'jpg', 'png'].includes(fileExt)) newList.push(element)
                } else newList.push(element)
            }
            //if so, do not display it, but process it
            if (extList.length>0)fileList=[]; else fileList=newList;
            //turn fileList into list of elements
            let elementList=fileList.map((element) => {return {MPD_file_path_name:(dir+"/"+element),mpd_file_path:dir+"/"+element+"/"}});
            if (fileList.length > 0) {
                this.totalList = elementList;
                this.prevdirs = this.prevdirs.concat(dir);
                //save state to global variable
                global.set("favsListConfig",this.prevdirs);

                this.setState({
                    items: fileList, showPopup: false
                });
            } else {
                this.getFilePathCallback(this.selection,(dirToAdd)=>{
                    this.mpd_client.addSongToQueueByFile(dirToAdd);
                    notifyMessage("add dir:" + lastPart(dirToAdd));});
            }
        });
    }
    /**
     * Get HTML asynchronously
     * @param  {String}   url      The URL to get HTML from
     * @param  {Function} callback A callback funtion. Pass in "response" variable to use returned HTML.
     */
    getHTML( url, callback ) {

        // Feature detection
        if ( !window.XMLHttpRequest ) return;

        // Create new request
        let xhr = new XMLHttpRequest();

        // Setup callback
        xhr.onload = function() {
            if ( callback && typeof( callback ) === 'function' ) {
                callback( this.responseXML );
            }
        };

        // Get the HTML
        xhr.open( 'GET', url );
        xhr.responseType = 'document';
        xhr.send();

    };
}
export default FavsList;