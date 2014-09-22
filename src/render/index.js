
/**
 * Index type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Index = {

    /**
     * 16-bit index.
     *
     * @constant
     */
    USHORT: 1,

    /**
     * 32-bit index (to check hardware support use
     *  [device.caps().indexUInt]{@link B.Render.Device~Caps} flag).
     *
     @constant
     */
    UINT: 2
};


/**
 * Returns byte size of index type.
 *
 * @param {B.Render.Index} type
 * @returns {number}
 */
B.Render.indexByteSize = function (type) {

    var I = B.Render.Index;

    switch (type) {
    case I.USHORT:
        return 2;
    case I.UINT:
        return 4;
    }
    return 0;
};


B.Render.toGLIndex = function (gl, index) {

    var I = B.Render.Index;

    switch (index) {
    case I.USHORT:
        return gl.UNSIGNED_SHORT;
    case I.UINT:
        return gl.UNSIGNED_INT;
    }
};