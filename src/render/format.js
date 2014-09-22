
/**
 * Surface format.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Format = {

    /**
     * 8-bit format (alpha only).
     * @constant
     */
    A: 1,

    /**
     * 24-bit format using 8 bits for the each channel (red, green, blue).
     * @constant
     */
    RGB: 2,

    /**
     * 32-bit format using 8 bits for the each channel (red, green, blue, alpha).
     * @constant
     */
    RGBA: 3,

    /**
     * DXT1 (S3TC) compression format.
     * To check hardware support use [device.caps().textureDXT]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGB_DXT1: 4,

    /**
     * DXT5 (S3TC) compression format.
     * To check hardware support use [device.caps().textureDXT]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGBA_DXT5: 5,

    /**
     * 16-bit floating-point format (alpha only).
     * To check hardware support use
     *  [device.caps().textureFloat16]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    A_F16: 6,

    /**
     * 48-bit floating-point format using 16 bits for the each channel (red, green, blue).
     * To check hardware support use
     *  [device.caps().textureFloat16]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGB_F16: 7,

    /**
     * 64-bit floating-point format using 16 bits for the each channel (red, green, blue, alpha).
     * To check hardware support use
     *  [device.caps().textureFloat16]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGBA_F16: 8,

    /**
     * 32-bit floating-point format (alpha only).
     * To check hardware support use
     *  [device.caps().textureFloat32]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    A_F32: 9,

    /**
     * 96-bit floating-point format using 32 bits for the each channel (red, green, blue).
     * To check hardware support use
     *  [device.caps().textureFloat32]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGB_F32: 10,

    /**
     * 128-bit floating-point format using 32 bits for the each channel (red, green, blue, alpha).
     * To check hardware support use
     *  [device.caps().textureFloat32]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGBA_F32: 11,

    /**
     * 16-bit depth format.
     * @constant
     */
    DEPTH: 12,

    /**
     * 32-bit depth-stencil format using 24 bits for the depth and 8 bits for the stencil.
     * @constant
     */
    DEPTH_STENCIL: 13
};


/**
 * Returns bit size of surface format.
 * @param {B.Render.Format} format
 * @returns {number}
 */
B.Render.formatBitSize = function (format) {

    var R = B.Render, F = R.Format;

    switch (format) {
    case F.A:
        return 8;
    case F.RGB:
        return 24;
    case F.RGBA:
        return 32;
    case F.RGB_DXT1:
        return 4;
    case F.RGBA_DXT5:
        return 8;
    case F.A_F16:
        return 16;
    case F.RGB_F16:
        return 48;
    case F.RGBA_F16:
        return 64;
    case F.A_F32:
        return 32;
    case F.RGB_F32:
        return 96;
    case F.RGBA_F32:
        return 128;
    case F.DEPTH:
        return 16;
    case F.DEPTH_STENCIL:
        return 32;
    }
    return 0;
};

/**
 * Returns byte size of compressed format block.
 * @param {B.Render.Format} format
 * @returns {number}
 */
B.Render.formatBlockByteSize = function (format) {

    var F = B.Render.Format;

    switch (format) {
    case F.RGB_DXT1:
        return 8;
    case F.RGBA_DXT5:
        return 16;
    }
    return 0;
};

/**
 * Returns texel size (one dimension) of compressed format block.
 * @param {B.Render.Format} format
 * @returns {number}
 */
B.Render.formatBlockTexelSize = function (format) {

    var F = B.Render.Format;

    switch (format) {
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        return 4;
    }
    return 0;
};

/**
 * Calculates pitch (in bytes) for arbitrary format and width.
 * @param {B.Render.Format} format
 * @param {number} width
 * @returns {number}
 */
B.Render.imagePitch = function (format, width) {

    var R = B.Render, F = R.Format,
        blockWidth;

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
    case F.DEPTH:
    case F.DEPTH_STENCIL:
        return width * R.formatBitSize(format) / 8;
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        blockWidth = R.formatBlockTexelSize(format);
        return Math.max(blockWidth, width) / blockWidth * R.formatBlockByteSize(format);
    }
    return 0;
};

/**
 * Calculates rows count for arbitrary format and height.
 * @param {B.Render.Format} format
 * @param {number} height
 * @returns {number}
 */
B.Render.imageRows = function (format, height) {

    var R = B.Render, F = R.Format,
        blockHeight;

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
    case F.DEPTH:
    case F.DEPTH_STENCIL:
        return height;
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        blockHeight = R.formatBlockTexelSize(format);
        return Math.max(blockHeight, height) / blockHeight;
    }
    return 0;
};

/**
 * Calculates byte size for arbitrary image.
 * @param {B.Render.Format} format
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
B.Render.imageByteSize = function (format, width, height) {

    return B.Render.imagePitch(format, width) * B.Render.imageRows(format, height);
};

/**
 * Checks color format consistency.
 * @param {B.Render.Device} device
 * @param {B.Render.Format} format
 * @param {boolean} [renderable=false]
 * @returns {boolean}
 */
B.Render.checkColorFormat = function (device, format, renderable) {

    var F = B.Render.Format,
        caps = device.caps();

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
        return true;
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        return !renderable && caps.textureDXT;
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
        return renderable ? caps.colorTargetFloat16 : caps.textureFloat16;
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
        return renderable ? caps.colorTargetFloat32 : caps.textureFloat32;
    }
    return false;
};

/**
 * Checks depth-stencil format consistency.
 * @param {B.Render.Device} device
 * @param {B.Render.Format} format
 * @returns {boolean}
 */
B.Render.checkDepthFormat = function (device, format) {

    var F = B.Render.Format;

    switch (format) {
    case F.DEPTH:
    case F.DEPTH_STENCIL:
        return true;
    }
    return false;
};

B.Render.checkColorFormatDataSource = function (format, source) {

    var F = B.Render.Format;

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        return (source instanceof Uint8Array);
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
        return (source instanceof Float32Array);
    }
    return false;
};

B.Render.toGLColorFormat = function (device, format) {

    var R = B.Render, F = R.Format,
        gl = device._gl,
        extDXT = device._ext("compressed_texture_s3tc");

    switch (format) {
    case F.A:
    case F.A_F16:
    case F.A_F32:
        return gl.ALPHA;
    case F.RGB:
    case F.RGB_F16:
    case F.RGB_F32:
        return gl.RGB;
    case F.RGBA:
    case F.RGBA_F16:
    case F.RGBA_F32:
        return gl.RGBA;
    case F.RGB_DXT1:
        return extDXT && extDXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
    case F.RGBA_DXT5:
        return extDXT && extDXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    }
};

B.Render.toGLDepthFormat = function (device, format, readable) {

    var R = B.Render, F = R.Format,
        gl = device._gl;

    switch (format) {
    case F.DEPTH:
        return readable ? gl.DEPTH_COMPONENT : gl.DEPTH_COMPONENT16;
    case F.DEPTH_STENCIL:
        return gl.DEPTH_STENCIL;
    }
};

B.Render.toGLType = function (device, format) {

    var F = B.Render.Format,
        gl = device._gl,
        extDT = device._ext("depth_texture"),
        extTHF = device._ext("texture_half_float");

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
        return gl.UNSIGNED_BYTE;
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
        return extTHF && extTHF.HALF_FLOAT_OES;
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
        return gl.FLOAT;
    case F.DEPTH:
        return gl.UNSIGNED_SHORT;
    case F.DEPTH_STENCIL:
        return extDT && extDT.UNSIGNED_INT_24_8_WEBGL;
    }
};