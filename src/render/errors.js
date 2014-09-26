
/**
 * Represents an error of the [Render]{@link B.Render} module.
 *
 * @class
 * @this B.Render.Error
 * @augments Error
 * @param {string} message
 */
B.Render.Error = function (message, name) {

    this.stack = (new Error()).stack;

    /**
     * Error type name.
     *
     * @type {string}
     */
    this.name = name || "B.Render.Error";

    /**
     * Error message.
     *
     * @type {string}
     */
    this.message = message;
};

B.Render.Error.prototype = Error.prototype;


/**
 * @ignore
 * @this B.Render.GLError
 */
B.Render.GLErrorProto = function () {
};

B.Render.GLErrorProto.prototype = B.Render.Error.prototype;

/**
 * Represents an error of WebGL context.
 *
 * @class
 * @this B.Render.GLError
 * @augments B.Render.Error
 * @param {string} message
 * @param {number} code WebGL error code
 */
B.Render.GLError = function (message, code) {

    B.Render.Error.call(this, "Internal WebGL error: " + message, "B.Render.GLError");

    /**
     * WebGL error code.
     *
     * @type {string}
     */
    this.code = code;
};

B.Render.GLError.prototype = new B.Render.GLErrorProto();


B.Render.checkGLError = function (gl, message) {

    var code = gl.getError();

    if (code !== gl.NO_ERROR && code !== gl.CONTEXT_LOST_WEBGL) {
        throw new B.Render.GLError(message, code);
    }
};

B.Render.checkGLFramebufferStatus = function (gl, message) {

    var code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (code !== gl.FRAMEBUFFER_COMPLETE) {
        throw new B.Render.GLError(message, code);
    }
};