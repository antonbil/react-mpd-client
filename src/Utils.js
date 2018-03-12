import React  from 'react';
import cookie from "react-cookies";
function padDigits(number, digits) {
    try {
        if (!(number === parseInt(number, 10))) {
            number = number.split("/")[0];
            number = parseInt(number);
        }
    }catch(e){}
    return Array(Math.max(digits - String(number).length + 1, 0)).join("0") + number;
}
function getTime(n){
    let  min=Math.floor(n/60);
    let  sec=n % 60;
    return padDigits(min,2)+":"+padDigits(sec,2);
}
function getImagePath(path){
    return "http://192.168.2.8:8081/FamilyMusic"+path+"/folder.jpg"
}

let goHome = function() {
    window.scrollTo(0, 0);
};
let getDimensions = function () {
    let width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    let height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    return {width, height};
};

function stringFormat(formatString, replacementArray) {
    return formatString.replace(
        /\{(\d+)\}/g, // Matches placeholders, e.g. '{1}'
        function formatStringReplacer(match, placeholderIndex) {
            // Convert String to Number
            placeholderIndex = Number(placeholderIndex);

            // Make sure that index is within replacement array bounds
            if (placeholderIndex < 0 ||
                placeholderIndex > replacementArray.length - 1
            ) {
                return placeholderIndex;
            }

            // Replace placeholder with value from replacement array
            return replacementArray[placeholderIndex];
        }
    );
}
//store in global namespace
if (typeof window.mpdjsconfig === 'undefined' || window.mpdjsconfig === null) {
    window.mpdjsconfig = {}
}

class Global {
    get(prop){
        return window.mpdjsconfig[prop];
    }
    set(prop,value){
        window.mpdjsconfig[prop]=value;
    }
}

function getLinks(){
    let links=[];
    let linkscookie=cookie.load("links");
    if (!(linkscookie==undefined))
        links=linkscookie;
    return links;
}

function saveLinks(links){
    cookie.save("links", links, {path: "/"});
}

function addLink(link){
    saveLinks(getLinks().concat(link))
}

let global=new Global();

/*
change property of css-rule to given value
 */
function changeCSSRule(ruleName,property,value) {
    ruleName = ruleName.toLowerCase();
    let result = null;
    let find = Array.prototype.find;

    find.call(document.styleSheets, styleSheet => {
        try {
            result = find.call(styleSheet.cssRules, cssRule => {
                return cssRule instanceof CSSStyleRule
                    && cssRule.selectorText.toLowerCase() == ruleName;
            });
            result.style[property]=value;
            return result != null;
        }catch(e){}
    });
    return result;
}
/* source: https://coderwall.com/p/z8uxzw/javascript-color-blender
    blend two colors to create the color that is at the percentage away from the first color
    this is a 5 step process
        1: validate input
        2: convert input to 6 char hex
        3: convert hex to rgb
        4: take the percentage to create a ratio between the two colors
        5: convert blend to hex
    @param: color1      => the first color, hex (ie: #000000)
    @param: color2      => the second color, hex (ie: #ffffff)
    @param: percentage  => the distance from the first color, as a decimal between 0 and 1 (ie: 0.5)
    @returns: string    => the third color, hex, represenatation of the blend between color1 and color2 at the given percentage
*/
function blend_colors(color1, color2, percentage)
{
    // check input
    color1 = color1 || '#000000';
    color2 = color2 || '#ffffff';
    percentage = percentage || 0.5;

    // 1: validate input, make sure we have provided a valid hex
    if (color1.length != 4 && color1.length != 7)
        console.log('colors must be provided as hexes');

    if (color2.length != 4 && color2.length != 7)
        console.log('colors must be provided as hexes');

    if (percentage > 1 || percentage < 0)
        console.log('percentage must be between 0 and 1');


    // 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
    //      the three character hex is just a representation of the 6 hex where each character is repeated
    //      ie: #060 => #006600 (green)
    if (color1.length == 4)
        color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    else
        color1 = color1.substring(1);
    if (color2.length == 4)
        color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    else
        color2 = color2.substring(1);

    // 3: we have valid input, convert colors to rgb
    color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
    color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

    // 4: blend
    var color3 = [
        (1 - percentage) * color1[0] + percentage * color2[0],
        (1 - percentage) * color1[1] + percentage * color2[1],
        (1 - percentage) * color1[2] + percentage * color2[2]
    ];

    // 5: convert to hex
    color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);



    // return hex
    return color3;
}

/*
    convert a Number to a two character hex string
    must round, or we will end up with more digits than expected (2)
    note: can also result in single digit, which will need to be padded with a 0 to the left
    @param: num         => the number to conver to hex
    @returns: string    => the hex representation of the provided number
*/
function int_to_hex(num)
{
    var hex = Math.round(num).toString(16);
    if (hex.length == 1)
        hex = '0' + hex;
    return hex;
}

function mpd_client(){
    return global.get("mpd_client");
}
export{global, padDigits,getTime,getImagePath,getDimensions,stringFormat,goHome,getLinks,saveLinks,addLink,changeCSSRule, blend_colors,mpd_client}