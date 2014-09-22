
/**
 * @ignore
 * @this B.Math.Color
 */
B.Math.ColorProto = function () {

    var M = B.Math,

        equal = M.equal,
        min = Math.min,
        max = Math.max;

    /**
     * Copies a given color into this color.
     *
     * @param {B.Math.Color} color
     * @returns {B.Math.Color} this
     */
    this.copy = function (color) {

        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;

        return this;
    };

    /**
     * Clones this color to a new color.
     *
     * @returns {B.Math.Color} this
     */
    this.clone = function () {

        return new M.Color(this.r, this.g, this.b, this.a);
    };

    /**
     * Sets this color from separated components.
     *
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     * @returns {B.Math.Color} this
     */
    this.set = function (r, g, b, a) {

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

        return this.clamp();
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
            return this.r;
        case 1:
            return this.g;
        case 2:
            return this.b;
        case 3:
            return this.a;
        default:
            throw new Error("Color index is out of range");
        }
    };

    /**
     * Sets RGB-components of this color from a hexadecimal value.
     *
     * @param {number} hex
     * @returns {B.Math.Color} this
     */
    this.setHex = function (hex) {

        var num = Math.floor(hex);

        this.r = (num >> 16 & 255 ) / 255;
        this.g = (num >> 8 & 255 ) / 255;
        this.b = (num & 255 ) / 255;

        return this;
    };

    /**
     * Returns the hexadecimal value of this color (RGB-components).
     *
     * @returns {number}
     */
    this.getHex = function () {

        return (
            (this.r * 255) << 16 ^
            (this.g * 255) << 8 ^
            (this.b * 255)
        );
    };

    /**
     * Sets this color from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.r = array[offset];
        this.g = array[offset + 1];
        this.b = array[offset + 2];
        this.a = array[offset + 3];

        this.clamp();

        return offset + 4;
    };

    /**
     * Sets this color components to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.r;
        array[offset + 1] = this.g;
        array[offset + 2] = this.b;
        array[offset + 3] = this.a;

        return offset + 4;
    };

    /**
     * Clamps components of this color to the range [0.0, 1.0].
     *
     * @returns {B.Math.Color} this
     */
    this.clamp = function () {

        this.r = max(min(this.r, 1.0), 0.0);
        this.g = max(min(this.g, 1.0), 0.0);
        this.b = max(min(this.b, 1.0), 0.0);
        this.a = max(min(this.a, 1.0), 0.0);

        return this;
    };

    /**
     * Adds a color or a scalar to this color.
     *
     * @param {number | B.Math.Color} v
     * @returns {B.Math.Color} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.r += v;
            this.g += v;
            this.b += v;
            this.a += v;
        }
        else {
            this.r += v.r;
            this.g += v.g;
            this.b += v.b;
            this.a += v.a;
        }
        return this.clamp();
    };

    /**
     * Adds two given colors and sets the result to this.
     *
     * @param {B.Math.Color} a
     * @param {B.Math.Color} b
     * @returns {B.Math.Color} this
     */
    this.addColors = function (a, b) {

        this.r = a.r + b.r;
        this.g = a.g + b.g;
        this.b = a.b + b.b;
        this.a = a.a + b.a;

        return this.clamp();
    };

    /**
     * Subtracts a color or a scalar from this color.
     *
     * @param {number | B.Math.Color} v
     * @returns {B.Math.Color} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.r -= v;
            this.g -= v;
            this.b -= v;
            this.a -= v;
        }
        else {
            this.r -= v.r;
            this.g -= v.g;
            this.b -= v.b;
            this.a -= v.a;
        }
        return this.clamp();
    };

    /**
     * Subtracts two given colors and sets the result to this.
     *
     * @param {B.Math.Color} a
     * @param {B.Math.Color} b
     * @returns {B.Math.Color} this
     */
    this.subColors = function (a, b) {

        this.r = a.r - b.r;
        this.g = a.g - b.g;
        this.b = a.b - b.b;
        this.a = a.a - b.a;

        return this.clamp();
    };

    /**
     * Multiplies this color by a given color or a scalar.
     *
     * @param {number | B.Math.Color} v
     * @returns {B.Math.Color} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.r *= v;
            this.g *= v;
            this.b *= v;
            this.a *= v;
        }
        else {
            this.r *= v.r;
            this.g *= v.g;
            this.b *= v.b;
            this.a *= v.a;
        }
        return this.clamp();
    };

    /**
     * Multiplies two given colors and sets the result to this.
     *
     * @param {B.Math.Color} a
     * @param {B.Math.Color} b
     * @returns {B.Math.Color} this
     */
    this.mulColors = function (a, b) {

        this.r = a.r * b.r;
        this.g = a.g * b.g;
        this.b = a.b * b.b;
        this.a = a.a * b.a;

        return this.clamp();
    };

    /**
     * Checks for strict equality of this color and another color.
     *
     * @param {B.Math.Color} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.r, this.r) && equal(v.g, this.g) &&
            equal(v.b, this.b) && equal(v.a, this.a);
    };
};

/**
 * Represents a RGBA color.
 *
 * To create the object use [B.Math.makeColor()]{@link B.Math.makeColor}.
 *
 * @class
 * @this B.Math.Color
 */
B.Math.Color = function (r, g, b, a) {

    /**
     * Red component.
     *
     * @type {number}
     */
    this.r = r || 0.0;

    /**
     * Green component.
     *
     * @type {number}
     */
    this.g = g || 0.0;

    /**
     * Blue component.
     *
     * @type {number}
     */
    this.b = b || 0.0;

    /**
     * Alpha component.
     *
     * @type {number}
     */
    this.a = (a === undefined) ? 1.0 : a;

    this.clamp();
};

B.Math.Color.prototype = new B.Math.ColorProto();

/**
 * White color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 1.0, g: 1.0, b: 1.0, a: 1.0}
 */
B.Math.Color.WHITE = B.Math.makeColor(1.0, 1.0, 1.0, 1.0);

/**
 * Gray color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.5, g: 0.5, b: 0.5, a: 1.0}
 */
B.Math.Color.GRAY = B.Math.makeColor(0.5, 0.5, 0.5, 1.0);

/**
 * Black color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.0, g: 0.0, b: 0.0, a: 1.0}
 */
B.Math.Color.BLACK = B.Math.makeColor(0.0, 0.0, 0.0, 1.0);

/**
 * Red color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 1.0, g: 0.0, b: 0.0, a: 1.0}
 */
B.Math.Color.RED = B.Math.makeColor(1.0, 0.0, 0.0, 1.0);

/**
 * Green color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.0, g: 1.0, b: 0.0, a: 1.0}
 */
B.Math.Color.GREEN = B.Math.makeColor(0.0, 1.0, 0.0, 1.0);

/**
 * Blue color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.0, g: 0.0, b: 1.0, a: 1.0}
 */
B.Math.Color.BLUE = B.Math.makeColor(0.0, 0.0, 1.0, 1.0);