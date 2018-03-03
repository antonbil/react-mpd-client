import {AlbumList,notifyMessage,lastPart}from "./AlbumList";
import parser from 'react-dom-parser';
import {getImagePath} from "./Utils";
//http://192.168.2.8:8081/TotalMusic/
/**
 * display contents of directory in Listview
 */

// Changes XML to JSON
function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};
class FavsList extends AlbumList {
    constructor(props) {
        super(props);
        this.getHTML.bind(this);
        console.log("Favslist this.prevdirs",this.prevdirs);
    }

    getImagePath(path){
        //console.log(path+"folder.jpg");
        return path.substring(1)+"folder.jpg";
    }
    getPrevDirs(){
        //global variable window.favsListConfig to store state of AlbumList
        if (typeof window.favsListConfig === 'undefined' || window.favsListConfig === null) {
            window.favsListConfig = {prevdirs: []}
        }
        console.log("window.favsListConfig.prevdirs:",window.favsListConfig.prevdirs);
        return window.favsListConfig.prevdirs;

    }
    baseDir(){
        let curdir="http://192.168.2.8:8081/TotalMusic";
        //if (this.prevdirs.length > 0) curdir = this.prevdirs.pop();
        console.log("curdir in favs:",curdir);
        return curdir;
    }

    getDirectoryContents(dir) {
        //fetch(dir).then((resp)=>{ return resp.text() }).then((text)=>{ console.log(text) })
        this.getHTML(dir,(data)=>{console.log(data);
            data=xmlToJson(data).HTML.BODY.DIV[0].TABLE.TBODY.TR;
            let fileList = data.map((element) => element.TD[0].A["#text"]);
            fileList.shift();
            let extList=[];
            for (let i=0;i<fileList.length;i++){
                let element=fileList[i];
                if (element.includes(".")){
                    let fileExt = element.split('.').pop();
                    console.log(fileExt);
                    if (['flac', 'mp3', 'm4a'].includes(fileExt)) extList.push(element)
                }
            }
            console.log("extList",extList);
            if (extList.length>0)fileList=[];
            let elementList=fileList.map((element) => {return {MPD_file_path_name:(dir+"/"+element),mpd_file_path:dir+"/"+element+"/"}});
            console.log(fileList,elementList);
            if (fileList.length > 0) {
                this.totalList = elementList;
                this.prevdirs = this.prevdirs.concat(dir);
                //save state to global variable
                window.favsListConfig.prevdirs = this.prevdirs;

                this.setState({
                    items: fileList, showPopup: false
                });
            } else {
                //mp3info.txt
                fetch(dir+"/mp3info.txt").then((resp)=>{ return resp.text() }).then((text)=>{
                    let dirToAdd=(text.split("\n")[0]).replace("/home/wieneke/FamilyLibrary/FamilyMusic/","");
                    console.log(text);
                    console.log(dirToAdd);
                    mpd_client.addSongToQueueByFile(dirToAdd);
                    notifyMessage("add dir:" + lastPart(dirToAdd));
                    //no items, display context menu

                })
                //mpd_client.addSongToQueueByFile(dirToAdd);
                //notifyMessage("add dir:" + lastPart(dirToAdd));
                //no items, display context menu
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