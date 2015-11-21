/**
 * Created by Lionel on 19/11/2015.
 */
//Seems to be used nowhere...

// EXTRA FUNCTIONS

// Unique Array
function array_unique(array) {
    var seen = {};
    var out = [];
    var lengthArray = array.length;
    var j = 0;
    for (var i=0; i<lengthArray; i++) {
        var item = array[i];
        if (seen[item]!==1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}