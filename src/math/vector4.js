
/**
 * @ignore
 * @this B.Math.Vector4
 */
B.Math.Vector4Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    /**
     * Clones this vector to a new vector.
     *
     * @returns {B.Math.Vector4} this
     */
    this.clone = function () {

        return M.makeVector4(this.x, this.y, this.z, this.w);
    };

    /**
     * Copies a given vector into this vector.
     *
     * @param {B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.copy = function (v) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;

        return this;
    };

    /**
     * Sets this vector from separated components.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {B.Math.Vector4} this
     */
    this.set = function (x, y, z, w) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this.x;
        case 1:
            return this.y;
        case 2:
            return this.z;
        case 3:
            return this.w;
        default:
            throw new Error("Vector4 index is out of range");
        }
    };

    /**
     * Sets this vector from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];

        return offset + 4;
    };

    /**
     * Sets this vector to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;
        array[offset + 3] = this.w;

        return offset + 4;
    };

    /**
     * Calculates the length of this vector.
     *
     * @returns {number} length
     */
    this.length = function () {

        var x = this.x, y = this.y, z = this.z, w = this.w;

        return Math.sqrt(x * x + y * y + z * z + w * w);
    };

    /**
     * Calculates the squared length of this vector.
     *
     * @returns {number} squared length
     */
    this.lengthSq = function () {

        var x = this.x, y = this.y, z = this.z, w = this.w;

        return x * x + y * y + z * z + w * w;
    };

    /**
     * Normalizes this vector.
     *
     * @returns {B.Math.Vector4} this
     */
    this.normalize = function () {

        var sl = this.lengthSq();

        if (sl > 0 && abs(1.0 - sl) > EPSILON) {
            this.mul(1.0 / sqrt(sl));
        }
        return this;
    };

    /**
     * Inverts this vector.
     *
     * @returns {B.Math.Vector4} this
     */
    this.negate = function () {

        this.x *= -1.0;
        this.y *= -1.0;
        this.z *= -1.0;
        this.w *= -1.0;

        return this;
    };

    /**
     * Clamps components of this vector.
     *
     * @param {number} [minVal=0.0]
     * @param {number} [maxVal=1.0]
     * @returns {B.Math.Vector4} this
     */
    this.clamp = function (minVal, maxVal) {

        minVal = minVal || 0.0;
        maxVal = maxVal || 1.0;

        this.x = max(min(this.x, maxVal), minVal);
        this.y = max(min(this.y, maxVal), minVal);
        this.z = max(min(this.z, maxVal), minVal);
        this.w = max(min(this.w, maxVal), minVal);

        return this;
    };

    /**
     * Adds a vector or a scalar to this vector.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.x += v;
            this.y += v;
            this.z += v;
            this.w += v;
        }
        else {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            this.w += v.w;
        }
        return this;
    };

    /**
     * Adds two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.addVectors = function (a, b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        this.w = a.w + b.w;

        return this;
    };

    /**
     * Subtracts a vector or a scalar from this vector.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.x -= v;
            this.y -= v;
            this.z -= v;
            this.w -= v;
        }
        else {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
            this.w -= v.w;
        }
        return this;
    };

    /**
     * Subtracts two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.subVectors = function (a, b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        this.w = a.w - b.w;

        return this;
    };

    /**
     * Multiplies this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.x *= v;
            this.y *= v;
            this.z *= v;
            this.w *= v;
        }
        else {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
            this.w *= v.w;
        }
        return this;
    };

    /**
     * Multiplies two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.mulVectors = function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        this.w = a.w * b.w;

        return this;
    };

    /**
     * Divides this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.div = function (v) {

        if (typeof v === "number") {
            this.x /= v;
            this.y /= v;
            this.z /= v;
            this.w /= v;
        } else {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
            this.w /= v.w;
        }
        return this;
    };

    /**
     * Divides two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.divVectors = function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;
        this.z = a.z / b.z;
        this.w = a.w / b.w;

        return this;
    };

    /**
     * Transforms this vector by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Vector4} this
     */
    this.transform = function (matrix) {

        var m = matrix.m,
            x = this.x, y = this.y, z = this.z, w = this.w;

        this.x = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        this.y = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        this.z = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        this.w = m[3] * x + m[7] * y + m[11] * z + m[15] * w;

        return this;
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {B.Math.Vector4} v
     * @returns {number} dot product
     */
    this.dot = function (v) {

        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    };

    /**
     * Checks for strict equality of this vector and another vector.
     *
     * @param {B.Math.Vector4} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.x, this.x) && equal(v.y, this.y) &&
            equal(v.z, this.z) && equal(v.w, this.w);
    };
};

/**
 * Represents a 4D vector.
 *
 * To create the object use [B.Math.makeVector4()]{@link B.Math.makeVector4}.
 *
 * @class
 * @this B.Math.Vector4
 */
B.Math.Vector4 = function (x, y, z, w) {

    /**
     * X component.
     *
     * @type {number}
     */
    this.x = x || 0.0;

    /**
     * Y component.
     *
     * @type {number}
     */
    this.y = y || 0.0;

    /**
     * Z component.
     *
     * @type {number}
     */
    this.z = z || 0.0;

    /**
     * W component.
     *
     * @type {number}
     */
    this.w = w || 0.0;
};

B.Math.Vector4.prototype = new B.Math.Vector4Proto();

/**
 * Zero vector.
 *
 * @constant
 * @type {B.Math.Vector4}
 * @default {x: 0.0, y: 0.0, z: 0.0, w: 0.0}
 */
B.Math.Vector4.ZERO = B.Math.makeVector4(0.0, 0.0, 0.0, 0.0);
