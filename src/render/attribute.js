
/**
 * Vertex attribute type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Attribute = {

    /**
     * Unsigned integer.
     *
     * @constant
     */
    UINT: 1,

    /**
     * Floating-point scalar.
     *
     * @constant
     */
    FLOAT: 2,

    /**
     * Floating-point 2D-vector.
     *
     * @constant
     */
    VECTOR2: 3,

    /**
     * Floating-point 3D-vector.
     *
     * @constant
     */
    VECTOR3: 4,

    /**
     * Floating-point 4D-vector.
     *
     * @constant
     */
    VECTOR4: 5,

    /**
     * Position ([VECTOR3]{@link B.Render.Attribute.VECTOR3} alias).
     *
     * @constant
     */
    POSITION: 6,

    /**
     * Normal ([VECTOR3]{@link B.Render.Attribute.VECTOR3} alias).
     *
     * @constant
     */
    NORMAL: 7,

    /**
     * Tangent ([VECTOR3]{@link B.Render.Attribute.VECTOR3} alias).
     *
     * @constant
     */
    TANGENT: 8,

    /**
     * UV-coordinates ([VECTOR2]{@link B.Render.Attribute.VECTOR2} alias).
     *
     * @constant
     */
    UV: 9,

    /**
     * Color ([UINT]{@link B.Render.Attribute.UINT} alias).
     *
     * @constant
     */
    COLOR: 10
};


/**
 * Returns byte size of attribute type.
 *
 * @param {B.Render.Attribute} type
 * @returns {number}
 */
B.Render.attributeByteSize = function (type) {

    var A = B.Render.Attribute;

    switch (type) {
    case A.UINT:
        return 4;
    case A.FLOAT:
        return 4;
    case A.VECTOR2:
        return 8;
    case A.VECTOR3:
        return 12;
    case A.VECTOR4:
        return 16;
    case A.POSITION:
        return 12;
    case A.NORMAL:
        return 12;
    case A.TANGENT:
        return 12;
    case A.UV:
        return 8;
    case A.COLOR:
        return 4;
    }
    return 0;
};

/**
 * Checks vertex attributes consistency.
 *
 * @param {Object.<string, B.Render.Attribute>} attributes
 * @returns {boolean}
 */
B.Render.checkAttributes = function (attributes) {

    var A = B.Render.Attribute,
        name, type, count = 0, pCount = 0, nCount = 0;

    if (!attributes) {
        return false;
    }
    for (name in attributes) {
        type = attributes[name];
        switch (type) {
        case A.UINT:
        case A.FLOAT:
        case A.VECTOR2:
        case A.VECTOR3:
        case A.VECTOR4:
        case A.TANGENT:
        case A.UV:
        case A.COLOR:
            count += 1;
            break;
        case A.POSITION:
            count += 1;
            pCount += 1;
            break;
        case A.NORMAL:
            count += 1;
            nCount += 1;
            break;
        default:
            return false;
        }
    }
    return (count > 0 && pCount < 2 && nCount < 2);
};

B.Render.resolveAttributeAlias = function (type) {

    var A = B.Render.Attribute;

    switch (type) {
    case A.POSITION:
    case A.NORMAL:
    case A.TANGENT:
        return A.VECTOR3;
    case A.UV:
        return A.VECTOR2;
    case A.COLOR:
        return A.UINT;
    }
    return type;
};

B.Render.fromGLAttributeActiveInfo = function (gl, info) {

    var A = B.Render.Attribute;

    switch (info.type) {
    case gl.UNSIGNED_INT:
        return A.UINT;
    case gl.FLOAT:
        return A.FLOAT;
    case gl.FLOAT_VEC2:
        return A.VECTOR2;
    case gl.FLOAT_VEC3:
        return A.VECTOR3;
    case gl.FLOAT_VEC4:
        return A.VECTOR4;
    }
};