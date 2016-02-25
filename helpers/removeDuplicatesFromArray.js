/**
 * Created by Lionel on 16/12/2015.
 * Removes duplicated items from array (starting from the end of the array)
 * Used in models/asawoo
 */
(function(module) {
    module.exports = function (array) {
        if (array && array.length > 0) {
            var placeholder = array.length,
                index;
            while (index = --placeholder)
                while (index--)
                    array[placeholder] !== array[index] || array.splice(index,1);
        }
        return array
    }
})(module);