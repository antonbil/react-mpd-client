/* class SearchList*/
import CommonList from "./CommonList";
import {getImagePath, global} from "./Utils";
import React from "react";
import {ContextMenu2} from './ContextMenu.js';
import Img from 'react-image';
import {BasicFloatingMenu} from "./FloatingButton";
import { MyButton } from './Buttons';

class SearchList extends CommonList {
    constructor(props) {
        super(props);
        props.onRef(this);
        this.selection = -1;
        this.totalList = [];
        this.albumsContextmenu = null;
        this.state = {
            items: []
        };
        this.options=[];
        this.items=[];
        this.mpd_client=global.get("mpd_client");
        this.processSearchResults.bind(this);
        this.imgStyle.margin=0;
    }
    setOptions(options){
        this.options=options;
    }
    processSearchResults(data){
        let totalList=[];
        this.items=[];
        let previousItem="";
        data.forEach((item)=>
        {
            let newItem={path:item.getPath(),title:item.getTitle(),album:item.getAlbum(),artist:item.getArtist()};
            //console.log(newItem);


            let addItem=newItem.artist+"-"+newItem.title;
            //this.options=[{name:'artist',value:true},{name:'album',value:false},{name:'title',value:false}];
            let titleSearch=this.options[2].value;
            let artistSearch=this.options[0].value;
            let albumSearch=this.options[1].value;
            let separate=this.options[3].value;
            if (artistSearch&&!separate)
                addItem=newItem.album;
            else
            if (albumSearch&&!separate)
                addItem=newItem.artist+"-"+newItem.album;
            if (addItem !==previousItem) {
                let dirpath=newItem.path;
                dirpath=dirpath.substring(0, dirpath.lastIndexOf("/"));
                if (!(titleSearch||separate))
                    newItem.path=dirpath;
                newItem.dirpath=dirpath;
                totalList=totalList.concat(addItem);
                this.items=this.items.concat(newItem);
            }
            previousItem=addItem;

        });
        this.totalList=totalList;
        //console.log("totalList:",totalList);
        this.setState({
            items: totalList
        });
    }
    getFilePath(index){
        let  str=this.items[index].dirpath;
        str=str.substr(0, str.length);
        return str;
    }

    contextResult(choice){
        let  path=this.getFilePath(this.selection);

        if (choice==="Add"){
            this.mpd_client.addSongToQueueByFile(path);
        }
        if (choice==="Add and Play"){
            let  len=this.mpd_client.getQueue().getSongs().length;
            this.mpd_client.addSongToQueueByFile(path);
            this.mpd_client.play(len);
        }
        if (choice==="Replace and Play"){
            this.mpd_client.clearQueue();
            this.mpd_client.addSongToQueueByFile(path);
            this.mpd_client.play(0);

        }
    }
    contextMenu (e) {
        e.preventDefault();
        this.albumsContextmenu._handleContextMenu(e);
    };
    handleClick(index) {
        let  path=this.items[index].path;
        this.selection=index;
        this.mpd_client.addSongToQueueByFile( path);
    }
    render() {
        return (
            <div><ContextMenu2  onRef={ref => (this.albumsContextmenu = ref)} returnChoice={this.contextResult.bind(this)}
                                options={["Add","Add and Play","Replace and Play"]} /><ul>
                {this.state.items.map((listValue,i)=>{
                    let path=getImagePath("/"+this.items[i].dirpath);
                    return <div  key={i} className="list-item" key={i+500} style={this.listStyle} onClick={() =>
                    { this.handleClick(i);}} onContextMenu={(e) => {this.selection=i; this.contextMenu(e)}} >
                        <Img src={path}  style={this.imgStyle}/><li  style={this.textStyle}>{this.splitHyphen(listValue)}</li></div>;
                })}
            </ul></div>
        )
    }
}
/*SearchForm*/
class SearchForm extends React.Component {
    constructor(props) {
        super(props);
        props.onRef(this);
        this.options=[{name:'artist',value:true},{name:'album',value:false},{name:'title',value:false},{name:'separate tracks',value:false}];
        this.multiSelect=false;
        this.state = {value: '',options:this.options};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.mpd_client=global.get("mpd_client");
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    setSearchList(searchList){
        this.searchList=searchList;
    }

    handleSubmit(event) {
        console.log("searching:");
        //alert('A value was submitted: ' + this.state.value);
        let search={};
        for (let i=0;i<this.options.length-1;i++){
            if (this.options[i].value)
                search[this.options[i].name]=(this.state.value).trim();

        }
        console.log("search for:",search);

        this.searchList.setOptions(this.options);

        this.mpd_client.search(search,this.searchList.processSearchResults.bind(this.searchList));
        event.preventDefault();
    }

    render() {
        //console.log(this.state,this.options);
        return (
            <form >
                <label>
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <MyButton text={"Search"} onClick={this.handleSubmit.bind(this)}/>
                { this.options.map((option, index) => (
                    <div className="checkbox" key={index}>
                        <label>
                            <input type="checkbox"
                                   name={`${name}[${index}]`}
                                   value={option.name}
                                   checked={option.value}
                                   onChange={event => {
                                       let current=0;
                                       for (let i=0;i<this.options.length;i++){
                                           if (this.options[i].name===option.name)
                                               current=i;
                                       }
                                       if (!this.multiSelect && current<this.options.length-1)
                                           for (let i=0;i<this.options.length-1;i++)
                                               this.options[i].value=false;
                                       let prevState=this.state;

                                       this.options[current].value=event.target.checked;
                                       prevState.options=this.options;
                                       this.setState(prevState);
                                       return false;
                                   }}/>
                            {option.name}
                        </label>
                    </div>))
                }
            </form>
        );
    }
}
class SearchTotal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.searchList = null;
        this.searchForm = null;
    }
    componentDidMount() {
        this.searchForm.setSearchList(this.searchList)
    }

    render() {
        return (
            <div>
                <SearchForm  onRef={ref => (this.searchForm = ref)} /><SearchList  onRef={ref => (this.searchList = ref)} />
            <BasicFloatingMenu/></div>
        )
    }
}

export default SearchTotal;