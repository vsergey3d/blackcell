
/**
 * @ignore
 * @this B.Math.Vector2
 */
B.Math.Vector2Proto = function () {

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
     * @returns {B.Math.Vector2} this
     */
    this.clone = function () {

        return M.makeVector2(this.x, this.y);
    };

    /**
     * Copies a given vector into this vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.copy = function (v) {

        this.x = v.x;
        this.y = v.y;

        return this;
    };

    /**
     * Sets this vector from separated components.
     *
     * @param {number} x
     * @param {number} y
     * @returns {B.Math.Vector2} this
     */
    this.set = function (x, y) {

        this.x = x;
        this.y = y;

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
        default:
            throw new Error("Vector2 index is out of range");
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

        return offset + 2;
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

        return offset + 2;
    };

    /**
     * Calculates the length of this vector.
     *
     * @returns {number} length
     */
    this.length = function () {

        var x = this.x, y = this.y;

        return Math.sqrt(x * x + y * y);
    };

    /**
     * Calculates the squared length of this vector.
     *
     * @returns {number} squared length
     */
    this.lengthSq = function () {

        var x = this.x, y = this.y;

        return x * x + y * y;
    };

    /**
     * Normalizes this vector.
     *
     * @returns {B.Math.Vector2} this
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
     * @returns {B.Math.Vector2} this
     */
    this.negate = function () {

        this.x *= -1.0;
        this.y *= -1.0;

        return this;
    };

    /**
     * Clamps components of this vector.
     *
     * @param {number} [minVal=0.0]
     * @param {number} [maxVal=1.0]
     * @returns {B.Math.Vector2} this
     */
    this.clamp = function (minVal, maxVal) {

        minVal = minVal || 0.0;
        maxVal = maxVal || 1.0;

        this.x = max(min(this.x, maxVal), minVal);
        this.y = max(min(this.y, maxVal), minVal);

        return this;
    };

    /**
     * Adds a vector or a scalar to this vector.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.x += v;
            this.y += v;
        } else {
            this.x += v.x;
            this.y += v.y;
        }
        return this;
    };

    /**
     * Adds two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.addVectors = function (a, b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;

        return this;
    };

    /**
     * Subtracts a vector or a scalar from this vector.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.x -= v;
            this.y -= v;
        } else {
            this.x -= v.x;
            this.y -= v.y;
        }
        return this;
    };

    /**
     * Subtracts two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.subVectors = function (a, b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;

        return this;
    };

    /**
     * Multiplies this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.x *= v;
            this.y *= v;
        } else {
            this.x *= v.x;
            this.y *= v.y;
        }
        return this;
    };

    /**
     * Multiplies two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.mulVectors = function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;

        return this;
    };

    /**
     * Divides this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.div = function (v) {

        if (typeof v === "number") {
            this.x /= v;
            this.y /= v;
        } else {
            this.x /= v.x;
            this.y /= v.y;
        }
        return this;
    };

    /**
     * Divides two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.divVectors = function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;

        return this;
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} dot product
     */
    this.dot = function (v) {

        return this.x * v.x + this.y * v.y;
    };

    /**
     * Calculates the angle in radians between this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} angle
     */
    this.angleTo = function (v) {

        var cosAngle = this.dot(v) / (this.length() * v.length());

        return Math.acos(min(max(cosAngle, -1.0), 1.0));
    };

    /**
     * Calculates the distance between this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} distance
     */
    this.distanceTo = function (v) {

        return Math.sqrt(this.distanceToSq(v));
    };

    /**
     * Calculates the squared distance between this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} squared distance
     */
    this.distanceToSq = function (v) {

        var x = this.x - v.x,
            y = this.y - v.y;

        return x * x + y * y;
    };

    /**
     * Checks for strict equality of this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.x, this.x) && equal(v.y, this.y);
    };
};

/**
 * Represents a 2D vector.
 *
 * To create the object use [B.Math.makeVector2()]{@link B.Math.makeVector2}.
 *
 * @class
 * @this B.Math.Vector2
 */
B.Math.Vector2 = function (x, y) {

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
};

B.Math.Vector2.prototype = new B.Math.Vector2Proto();

/**
 * Zero vector.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 0.0, y: 0.0}
 */
B.Math.Vector2.ZERO = B.Math.makeVector2(0.0, 0.0);

/**
 * Positive infinity point.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: Infinity, y: Infinity}
 */
B.Math.Vector2.INF = B.Math.makeVector2(Infinity, Infinity);

/**
 * Negative infinity point.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: -Infinity, y: -Infinity}
 */
B.Math.Vector2.N_INF = B.Math.makeVector2(-Infinity, -Infinity);

/**
 * Positive direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 1.0, y: 0.0}
 */
B.Math.Vector2.X = B.Math.makeVector2(1.0, 0.0);

/**
 * Positive direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 0.0, y: 1.0}
 */
B.Math.Vector2.Y = B.Math.makeVector2(0.0, 1.0);

/**
 * Negative direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: -1.0, y: 0.0}
 */
B.Math.Vector2.N_X = B.Math.makeVector2(-1.0, 0.0);

/**
 * Negative direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 0.0, y: -1.0}
 */
B.Math.Vector2.N_Y = B.Math.makeVector2(0.0, -1.0);