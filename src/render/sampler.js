
/**
 * Texture addressing mode.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Address = {

    /**
     * Tile the texture at every integer junction.
     *
     * @constant
     */
    WRAP: 1,

    /**
     * Similar to WRAP, except that the texture is flipped at every integer junction.
     *
     * @constant
     */
    MIRROR: 2,

    /**
     * Texture coordinates outside the range [0.0, 1.0] are set to the texture color
     *  at 0.0 or 1.0 respectively.
     *
     * @constant
     */
    CLAMP: 3
};


/**
 * Texture filtering mode.
 *
 * To check floating-point texture filtering hardware support use
 *  [device.caps().textureFloat16Filter]{@link B.Render.Device~Caps} and
 *  [device.caps().textureFloat32Filter]{@link B.Render.Device~Caps} flags.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Filter = {

    /**
     * Filtering disabled.
     *
     * @constant
     */
    NONE: 1,

    /**
     * Bilinear filtering.
     *
     * @constant
     */
    BILINEAR: 2,

    /**
     * Trilinear filtering.
     *
     * @constant
     */
    TRILINEAR: 3
};


/**
 * @ignore
 * @this B.Render.Sampler
 */
B.Render.SamplerProto = function () {

    var R = B.Render,
        F = R.Filter,
        A = R.Address,

        toGLWrap = function (gl, address) {

            switch (address) {
            case A.WRAP:
                return gl.REPEAT;
            case A.MIRROR:
                return gl.MIRRORED_REPEAT;
            case A.CLAMP:
                return gl.CLAMP_TO_EDGE;
            }
        };

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.Sampler} this
     *
     * @example
     * // equivalent to
     * sampler.address(B.Render.Address.WRAP);
     * sampler.filter(B.Render.Filter.BILINEAR);
     */
    this.default = function () {

        this.address(A.WRAP);
        this.filter(F.BILINEAR);

        return this;
    };

    /**
     * Describes texture addressing modes.
     *
     * @typedef B.Render.Sampler~AddressModes
     * @type {Object}
     * @property {B.Render.Address} u texture addressing mode for the U-coordinate
     * @property {B.Render.Address} v texture addressing mode for the V-coordinate
     */

    /**
     * Sets texture addressing mode.
     *
     * @function B.Render.Sampler#address
     * @param {B.Render.Sampler~AddressModes} modes
     * @returns {B.Render.Sampler} this
     */
    /**
     * Sets texture addressing mode separately.
     *
     * @function B.Render.Sampler#address
     * @param {B.Render.Address} u mode for the U-coordinate (for both UV if v-argument is omitted)
     * @param {B.Render.Address} [v] mode for the V-coordinate
     * @returns {B.Render.Sampler} this
     *
     * @example
     * sampler.address(modeU, modeV);
     * sampler.address(modeUV);
     */
    /**
     * Gets texture addressing mode.
     *
     * @function B.Render.Sampler#address
     * @returns {B.Render.Sampler~AddressModes}
     */
    this.address = function (u, v) {

        var gl = this._gl,
            address = this._address;

        if (arguments.length === 0) {
            return address;
        }
        address.u = u;
        address.v = (arguments.length === 1) ? u : v;

        this._glWrapS = toGLWrap(gl, address.u);
        this._glWrapT = toGLWrap(gl, address.v);

        return this;
    };

    /**
     * Sets texture filtering mode.
     *
     * @function B.Render.Sampler#filter
     * @param {B.Render.Filter} mode
     * @returns {B.Render.Sampler} this
     */
    /**
     * Gets texture filtering mode.
     *
     * @function B.Render.Sampler#filter
     * @returns {B.Render.Filter}
     */
    this.filter = function (mode) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._filter;
        }
        this._filter = mode;

        switch (this._filter) {
        case F.NONE:
            this._glMagFilter = gl.NEAREST;
            this._glMinFilter[0] = gl.NEAREST;
            this._glMinFilter[1] = gl.NEAREST;
            break;
        case F.BILINEAR:
            this._glMagFilter = gl.LINEAR;
            this._glMinFilter[0] = gl.LINEAR;
            this._glMinFilter[1] = gl.LINEAR_MIPMAP_NEAREST;
            break;
        case F.TRILINEAR:
            this._glMagFilter = gl.LINEAR;
            this._glMinFilter[0] = gl.LINEAR;
            this._glMinFilter[1] = gl.LINEAR_MIPMAP_LINEAR;
            break;
        }
        return this;
    };

    /**
     * Sets texture anisotropy level.
     *
     * To check hardware supports of texture anisotropy use
     *  [device.caps().samplerAnisotropy]{@link B.Render.Device~Caps}.
     *
     * To check maximum anisotropy level use
     *  [device.caps().samplerMaxAnisotropy]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Sampler#anisotropy
     * @param {number} level
     * @returns {B.Render.Sampler} this
     */
    /**
     * Gets texture anisotropy level.
     *
     * @function B.Render.Sampler#anisotropy
     * @returns {number}
     */
    this.anisotropy = function (level) {

        var caps = this._device.caps();

        if (arguments.length === 0) {
            return this._anisotropy;
        }
        this._anisotropy = Math.max(1, Math.min(level,
            caps.samplerAnisotropy ? caps.samplerMaxAnisotropy : 1));

        return this;
    };

    this._apply = function (target, location, unit, value) {

        var gl = this._gl, ext = this._device._ext("texture_filter_anisotropic"),
            handle = null, hasMips = 0;

        if (value instanceof R.Texture) {
            handle = value._glTexture;
            hasMips = (value.mipCount() > 1) ? 1 : 0;

        } else if (value instanceof R.Mip) {
            value = value.texture();
            handle = value._glTexture;
            hasMips = (value.mipCount() > 1) ? 1 : 0;

        } else if (value instanceof R.Depth) {
            if (!this._device.caps().readableDepth) {
                throw new R.Error("reading from the depth buffer is not supported " +
                    "(check device.caps().readableDepth)");
            }
            if (!value.readable()) {
                throw new R.Error("depth buffer wasn't created readable");
            }
            handle = value._glHandle;
        }
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(target, handle);

        if (handle) {
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, this._glMagFilter);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, this._glMinFilter[hasMips]);
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, this._glWrapS);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, this._glWrapT);
            if (ext) {
                gl.texParameteri(target, ext.TEXTURE_MAX_ANISOTROPY_EXT, this._anisotropy);
            }
        }
        gl.uniform1i(location, unit);
    };
};

/**
 * Represent a texture sampler.
 *
 * To get the object use [pass.sampler()]{@link B.Render.Pass#sampler}.
 *
 * @class
 * @this B.Render.Sampler
 */
B.Render.Sampler = function (pass) {

    this._pass = pass;
    this._device = pass.device();
    this._filter = 0;
    this._anisotropy = 1;
    this._address = {
        u: 0,
        v: 0
    };
    this._gl = pass.device()._gl;
    this._glWrapS = 0;
    this._glWrapT = 0;
    this._glMagFilter = 0;
    this._glMinFilter = [0, 0];

    this.default();
};

B.Render.Sampler.prototype = new B.Render.SamplerProto();