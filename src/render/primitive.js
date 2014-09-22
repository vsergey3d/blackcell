
/**
 * Primitive type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Primitive = {

    /**
     * Isolated point.
     *
     * @constant
     */
    POINT: 1,

    /**
     * Isolated straight line.
     *
     * @constant
     */
    LINE: 2,

    /**
     * Isolated triangle.
     *
     * @constant
     */
    TRIANGLE: 3
};


/**
 * Returns index count per primitive.
 *
 * @param {B.Render.Primitive} primitive
 * @returns {number}
 */
B.Render.indicesPerPrimitive = function (primitive) {

    var P = B.Render.Primitive;

    switch (primitive) {
    case P.POINT:
        return 1;
    case P.LINE:
        return 2;
    case P.TRIANGLE:
        return 3;
    }
    return 0;
};


B.Render.toGLPrimitive = function (gl, primitives) {

    var P = B.Render.Primitive;

    switch (primitives) {
    case P.POINT:
        return gl.POINTS;
    case P.LINE:
        return gl.LINES;
    case P.TRIANGLE:
        return gl.TRIANGLES;
    }
};