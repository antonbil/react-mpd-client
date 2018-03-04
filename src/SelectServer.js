/*SelectServer*/
import SelectOption from "./SelectOption";

class SelectServer extends SelectOption {
    constructor(props) {
        super(props);
        this.submitMessage="Select host";
        this.options=[
            {name:'keuken',value:true, host:"http://192.168.2.16/mpdjs"},
            {name:'kamer',value:false, host:"http://192.168.2.9/mpdjs"},
            {name:'wifiberry',value:false, host:"http://192.168.2.12/mpdjs"}];
    }

    handleSubmit(event) {
        let address=this.getSelectedOption(event).host;
        window.open(address,"_self");
    }
}
export default SelectServer;