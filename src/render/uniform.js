
/**
 * Uniform type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Uniform = {

    /**
     * Floating-point scalar.
     *
     * @constant
     */
    FLOAT: 1,

    /**
     * Floating-point 2D-vector.
     *
     * @constant
     */
    VECTOR2: 2,

    /**
     * Floating-point 3D-vector.
     *
     * @constant
     */
    VECTOR3: 3,

    /**
     * Floating-point 4D-vector.
     *
     * @constant
     */
    VECTOR4: 4,

    /**
     * Floating-point 3x3-matrix.
     *
     * @constant
     */
    MATRIX3: 5,

    /**
     * Floating-point 4x4-matrix.
     *
     * @constant
     */
    MATRIX4: 6,

    /**
     * 2D-sampler.
     *
     * @constant
     */
    SAMPLER_2D: 7,

    /**
     * Cube-sampler.
     *
     * @constant
     */
    SAMPLER_CUBE: 8
};


/**
 * Returns byte size of uniform type.
 *
 * @param {B.Render.Uniform} type
 * @returns {number}
 */
B.Render.uniformByteSize = function (type) {

    var U = B.Render.Uniform;

    switch (type) {
    case U.FLOAT:
        return 4;
    case U.VECTOR2:
        return 8;
    case U.VECTOR3:
        return 12;
    case U.VECTOR4:
        return 16;
    case U.MATRIX3:
        return 36;
    case U.MATRIX4:
        return 64;
    }
    return 0;
};

B.Render.fromGLUniformActiveInfo = function (gl, info) {

    var U = B.Render.Uniform;

    switch (info.type) {
    case gl.FLOAT:
        return U.FLOAT;
    case gl.FLOAT_VEC2:
        return U.VECTOR2;
    case gl.FLOAT_VEC3:
        return U.VECTOR3;
    case gl.FLOAT_VEC4:
        return U.VECTOR4;
    case gl.FLOAT_MAT3:
        return U.MATRIX3;
    case gl.FLOAT_MAT4:
        return U.MATRIX4;
    case gl.SAMPLER_2D:
        return U.SAMPLER_2D;
    case gl.SAMPLER_CUBE:
        return U.SAMPLER_CUBE;
    }
};