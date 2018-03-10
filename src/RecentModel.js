import {global,getDimensions,changeCSSRule} from "./Utils";
import cookie from "react-cookies";
import {SearchList} from './SearchTotal.js';
import CommonList from "./CommonList";
class RecentModel {
    constructor(properties) {
        this.maxElements=50;
        this.properties = properties;
        this.observer=properties.observer;
        this.listener = this.observer.subscribe('AddRecent',(data)=>{
            console.log('AddRecent: ',data);
            //call with global.get("observer").publish('AddRecent', {recentElement:.....});
            this.addRecent(data.recentElement);
        });
        this.setRecent.bind(this);
        this.getRecent.bind(this);
        this.addRecent.bind(this);
        console.log("create recentModel");
    }

    getRecent() {
        let recent = null;
        try {
            recent = cookie.load("recent");
        } catch (e) {
        }
        recent = recent || [];
        return recent;
    }

    setRecent(recent){
        cookie.save("recent", recent, {path: "/"});
        this.observer.publish('AddedRecent', {recent:recent});
    }

    addRecent(newRecentElement){
        let recent=this.getRecent();
        recent=recent.filter((el)=>el!==newRecentElement);
        recent.unshift(newRecentElement);
        recent=recent.filter((el,i)=>i<this.maxElements);
        this.setRecent(recent);
    }

    toObject() {
        return this.properties;
    }
}
class RecentList extends SearchList {
    constructor(props) {
        super(props);
        this.processSearchResults();
    }
    componentDidMount() {
        this.listener = global.get("observer").subscribe('AddedRecent',(data)=>{
            this.processRecent(data.recent);
            this.setState({
                items: data.recent
            });
        });
    }
    componentWillUnmount() {
        this.listener.unsubscribe();
    }
    processRecent(totalList){
        this.items = totalList.map((el,i)=>{return {path:el,title:el,album:"",artist:"", dirpath:el}});
        this.state={items: totalList}
    }
    processSearchResults(data) {
        let totalList = global.get("recentmodel").getRecent();
        this.processRecent(totalList);
    }

    }
export {RecentModel,RecentList}