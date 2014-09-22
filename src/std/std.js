
/**
 * Contains standard entities and utilities.
 *
 * @namespace B.Std
 */
B.Std = {};


B.Std.freeObject = function (obj) {

    var name;

    for (name in obj) {
        if (obj.hasOwnProperty(name)) {
            obj[name] = null;
        }
    }
};

B.Std.removeUnordered = function(array, index) {

    var l = array.length,
        elem = array[index];

    if (!l || index >= l) {
        return null;
    }
    if (l > 1) {
        array[index] = array[l - 1];
        array[index]._id = index;
    }
    array.length -= 1;
    return elem;
};