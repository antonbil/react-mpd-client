/*SelectServer*/
import SelectOption from "./SelectOption";
import {global} from "./Utils";
import cookie from "react-cookies";

let currentTheme = "day";
let themes = {
    night: [["backgroundColor", '#212529'],
        ["color", "#FFFFFF"],
        ["backgroundPlaying", "#454540"],
        ["backgroundFloat", "#b8b894"],
        ["backgroundHeader", "#454540"],
        ["colorHeader", "#AAAAAA"]],
    day: [["backgroundColor", '#FFFFFF'],
        ["color", "#212529"],
        ["backgroundPlaying", "#f5f5f0"],
        ["backgroundHeader", "#f0f0f0"],
        ["colorHeader", "#3498DB"]],
    warm: [["backgroundColor", '#27474E'],
        ["color", "#E1D89F"],
        ["backgroundPlaying", "#47676E"],
        ["backgroundFloat", "#CD8B76"],
        ["backgroundHeader", "#713E5A"],
        ["colorHeader", "white"]],
    fancy: [["backgroundColor", '#330F0A'],
        ["color", "#F4FDAF"],
        ["backgroundPlaying", "#394F49"],
        ["backgroundFloat", "#65743A"],
        ["backgroundHeader", "#787844"],
        ["colorHeader", "#000000"]]
};

function setColourDefaults(newTheme) {
    //set colours of new theme to global namespace
    themes[newTheme].map((element) => {
        global.set(element[0], element[1]);
    });
    //rerender Main
    display();
    //save new settings
    cookie.save("skin", newTheme, {path: "/"});
    currentTheme = newTheme;
}

/**
 * set document overall colours, and trigger Main class
 */
function display() {
    document.body.style.backgroundColor = global.get("backgroundColor");
    document.body.style.color = global.get("color");
    global.get("observer").publish('Render', true);

}

/**
 * select new skin from list of themes
 */
class SelectSkin extends SelectOption {
    constructor(props) {
        super(props);
        this.submitMessage = "Select skin";
        //display all themes-names as choices
        let options = [];
        for (var key in themes) {
            if (themes.hasOwnProperty(key)) {
                options.push({name: key, value: key === currentTheme, opt: key});
            }
        }
        this.options = options;
        this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        let chosen = this.getSelectedOption(event).opt;
        setColourDefaults(chosen);
    }

}

export {SelectSkin, setColourDefaults};