import React  from 'react';
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
}
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

let global=new Global();

export{global, padDigits,getTime,getImagePath,getDimensions,stringFormat,goHome}