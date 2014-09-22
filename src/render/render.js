
/**
 * Contains a set of primitives that provide staging graphics core architecture.
 *
 * @namespace B.Render
 */
B.Render = {};


/**
 * Color mask.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Mask = {

    /**
     * Red component.
     *
     * @constant
     */
    R: 1,

    /**
     * Green component.
     *
     * @constant
     */
    G: 2,

    /**
     * Blue component.
     *
     * @constant
     */
    B: 4,

    /**
     * Alpha component.
     *
     * @constant
     */
    A: 8,

    /**
     * Red, Green, Blue components.
     *
     * @constant
     */
    RGB: 7,

    /**
     * Red, Green, Blue, Alpha components.
     *
     * @constant
     */
    RGBA: 15
};

B.Render.applyColorMask = function (gl, mask) {

    var M = B.Render.Mask,
        r = mask & M.R,
        g = mask & M.G,
        b = mask & M.B,
        a = mask & M.A;

    gl.colorMask(r, g, b, a);
};


/**
 * Describea webgl-context settings.
 *
 * See: http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2
 *
 * @typedef B.Render~WebglSettings
 * @type {Object}
 * @property {boolean} [antialias=true]
 * @property {boolean} [premultipliedAlpha=true]
 * @property {boolean} [preserveDrawingBuffer=true]
 * @property {boolean} [preferLowPowerToHighPerformance=true]
 * @property {boolean} [failIfMajorPerformanceCaveat=true]
 */

/**
 * Makes a rendering device.
 *
 * @param {HTMLCanvasElement} canvas rendering output
 * @param {B.Render.Format} [colorFormat={@link B.Render.Format.RGB}]
 *  color target format (supported formats are {@link B.Render.Format.RGB}
 *  and {@link B.Render.Format.RGBA})
 * @param {B.Render.Format | false} [depthFormat={@link B.Render.Format.DEPTH}]
 *  depth-stencil target format (supported formats are
 *  {@link B.Render.Format.DEPTH} and
 *  {@link B.Render.Format.DEPTH_STENCIL}) or **false** to disable depth
 * @param {B.Render~WebglSettings} [settings] webgl-context settings
 * @returns {B.Render.Device}
 * @throws {B.Render.Error} if WebGL is not supported or target parameters are incorrect
 *
 * @example
 * var device = B.Render.makeDevice(canvas);
 *
 * var device = B.Render.makeDevice(canvas, B.Render.Format.RGB, false);
 *
 * var device = B.Render.makeDevice(canvas, B.Render.Format.RGB, B.Render.Format.DEPTH_STENCIL,
 *     {
 *         antialias: false,
 *         premultipliedAlpha: false
 *     }
 * );
 */
B.Render.makeDevice = function (canvas, colorFormat, depthFormat, settings) {

    return new B.Render.Device(canvas, colorFormat, depthFormat, settings);
};


/**
 * Returns true if numeric value is power of two, false otherwise.
 *
 * @param {number} value
 * @returns {boolean}
 */
B.Render.isPowerOfTwo = function (value) {

    var log2 = Math.log(value) / Math.LN2;

    return (log2 - Math.floor(log2) === 0);
};

/**
 * Converts numeric value to closest power of two.
 *
 * @param {number} value
 * @returns {number}
 */
B.Render.toPowerOfTwo = function (value) {

    var log2 = Math.log(value) / Math.LN2;

    return Math.pow(2, Math.ceil(log2));
};
