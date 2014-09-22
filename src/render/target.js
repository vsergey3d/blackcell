
/**
 * @ignore
 * @this B.Render.Target
 */
B.Render.TargetProto = function () {

    var R = B.Render;

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns multisample coverage mask size.
     *
     * @returns {number}
     */
    this.multisamples = function () {

        return this._multisamples;
    };

    /**
     * Sets color target or multiple color targets.
     *
     * To check maximum color targets count use
     *  [device.caps().colorTargetCount]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Target#color
     * @param {B.Render.Mip | B.Render.Texture | Array<B.Render.Mip | B.Render.Texture>} object
     * @returns {B.Render.Target} this
     * @throws {B.Render.Error} if object's size or format are inappropriate or the object is not
     *  specified.
     *
     * @example
     * target.color(mip);
     * target.color(texture); // equivalent to target.color(texture.mip(0))
     *
     * // multiple color targets
     * target.color([mip0, mip1, texture]);
     */
    /**
     * Gets color target or multiple color targets.
     *
     * @function B.Render.Target#color
     * @param {number} [index]
     * @returns {null | B.Render.Mip | Array<B.Render.Mip>}
     *
     * @example
     * var mip = target.color();
     *
     * // multiple color targets
     * var array = target.color();
     * var mip1 = target.color()[1];
     * var mip1 = target.color(1); // equivalent to above
     */
    this.color = function (object) {

        var objs = Array.isArray(object) ? object : [object], i, l,
            color = this._color;

        if (arguments.length === 0) {
            return (color.length === 1) ? color[0] : color;
        }
        if (arguments.length === 1 && typeof object === "number") {
            return color[object] || null;
        }

        this._bind();
        for (i = 0, l = this._color.length; i < l; i += 1) {
            this._color[i]._detach(i);
        }
        this._color = [];
        for (i = 0, l = objs.length; i < l; i += 1) {
            this._color[i] = (objs[i] instanceof R.Texture) ? objs[i].mip(0) : objs[i];
        }
        this._check();
        for (i = 0, l = this._color.length; i < l; i += 1) {
            this._color[i]._attach(i);
        }
        this._validate();

        this._size.copy(this._color[0].size());
        this._width = this._size.x;
        this._height = this._size.y;
        this._multisamples = this._gl.getParameter(this._gl.SAMPLES);

        return this;
    };

    /**
     * Sets depth-stencil target.
     *
     * @function B.Render.Target#depth
     * @param {null | B.Render.Depth} object
     * @returns {B.Render.Target} this
     * @throws {B.Render.Error} if object's size or format are inappropriate
     */
    /**
     * Gets depth-stencil target.
     *
     * @function B.Render.Target#depth
     * @returns {null | B.Render.Depth}
     */
    this.depth = function (object) {

        if (arguments.length === 0) {
            return this._depth;
        }
        this._bind();
        if (this._depth) {
            this._depth._detach();
        }
        this._depth = object || null;
        this._check();
        if (this._depth) {
            this._depth._attach();
        }
        this._validate();

        return this;
    };

    /**
     * Clones this target to a new target object (it also clones all linked resources).
     *
     * @param {number} [scale=1.0] size scale factor
     * @returns {B.Render.Target} this
     */
    this.clone = function (scale) {

        var i, l, colorFmt = [],
            depthFmt = this._depth ? this._depth.format() : null;

        scale = (scale > 0.0) ? scale : 1.0;

        for (i = 0, l = this._color.length; i < l; i += 1) {
            colorFmt[i] = this._color[i].format();
        }
        return this._device.makeTarget(colorFmt, depthFmt,
            this._width * scale, this._height * scale);
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeTarget(this);

        this._gl.deleteFramebuffer(this._glFramebuffer);

        B.Std.freeObject(this);
    };

    this._make = function (color, depth, width, height) {

        var dev = this._device, i, l,
            colors = Array.isArray(color) ? color.slice() : [color];

        if (width !== undefined && height !== undefined) {
            depth = depth && dev.makeDepth(depth, width, height);
            for (i = 0, l = colors.length; i < l; i += 1) {
                colors[i] = dev.makeTexture(colors[i], width, height, 1).mip(0);
            }
        }
        this._glFramebuffer = dev._gl.createFramebuffer();

        this.color(colors);
        this.depth(depth);
    };

    this._bind = function () {

        var gl = this._device._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._glFramebuffer);
    };

    this._check = function () {

        var dev = this._device, depth = this._depth, colors = this._color,
            i, l = colors.length, color,

            width = depth && depth.width(),
            height = depth && depth.height();

        if (l > dev.caps().colorTargetCount) {
            throw new R.Error("can't assemble Target - unsupported color target count " +
                "(greater than device.caps().colorTargetCount)");
        }
        for (i = 0; i < l; i += 1) {
            color = colors[i];
            if (!color) {
                throw new R.Error("can't assemble Target - unspecified color target [" + i + "]");
            }
            width = width || color.width();
            height = height || color.height();

            if (color.width() !== width || color.height() !== height) {
                throw new R.Error("can't assemble Target - objects must have same size");
            }
            if (!R.checkColorFormat(dev, color.format(), true)) {
                throw new R.Error("can't assemble Target - color format is not renderable");
            }
        }
    };

    this._validate = function () {

        var gl = this._gl;

        R.checkGLFramebufferStatus(gl, "can't assemble Target");
        R.checkGLError(gl, "can't assemble Target");
    };

    this._clear = function (color, depth, stencil) {

        var gl = this._gl,
            bits = gl.COLOR_BUFFER_BIT,
            depthFmt = this._depth && this._depth.format();

        gl.clearColor(color.r, color.g, color.b, color.a);

        if (depthFmt) {
            gl.clearDepth(depth);
            bits |= gl.DEPTH_BUFFER_BIT;
            if (depthFmt === R.Format.DEPTH_STENCIL) {
                gl.clearStencil(stencil);
                bits |= gl.STENCIL_BUFFER_BIT;
            }
        }
        gl.clear(bits);
    };

    this._write = function (color, depth, stencil) {

        var gl = this._gl,
            depthFmt = this._depth && this._depth.format();

        R.applyColorMask(gl, color);

        if (depthFmt) {
            gl.depthMask(depth);
            if (depthFmt === R.Format.DEPTH_STENCIL) {
                gl.stencilMask(stencil);
            }
        }
    };

    this._restore = function () {

        this._make(this._color, this._depth);
    };
};

/**
 * Represents rendering output target.
 *
 * To create the object use [device.makeTarget()]{@link B.Render.Device#makeTarget}.
 *
 * @class
 * @this B.Render.Target
 */
B.Render.Target = function (device, color, depth, width, height) {

    this._device = device;

    this._width = 0;
    this._height = 0;
    this._size = B.Math.makeVector2();
    this._multisamples = 0;
    this._color = [];
    this._depth = null;

    this._gl = device._gl;
    this._glFramebuffer = null;

    this._id = -1;

    this._make(color, depth, width, height);
};

B.Render.Target.prototype = new B.Render.TargetProto();