function padDigits(number, digits) {
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

export{padDigits,getTime,getImagePath,getDimensions,stringFormat}