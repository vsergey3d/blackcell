
/**
 * @ignore
 * @this B.Render.Depth
 */
B.Render.DepthProto = function () {

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
     * Returns surface format.
     *
     * @returns {B.Render.Format}
     */
    this.format = function () {

        return this._format;
    };

    /**
     * Returns readable flag.
     *
     * @returns {boolean}
     */
    this.readable = function () {

        return this._readable;
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeDepth(this);

        if (this._readable) {
            this._gl.deleteTexture(this._glHandle);
        } else {
            this._gl.deleteRenderbuffer(this._glHandle);
        }
        B.Std.freeObject(this);
    };

    this._make = (function () {

        var F = R.Format,

            toGLAttachmnet = function (gl, format) {

                switch (format) {
                case F.DEPTH:
                    return gl.DEPTH_ATTACHMENT;
                case F.DEPTH_STENCIL:
                    return gl.DEPTH_STENCIL_ATTACHMENT;
                }
            };

        return function () {

            var dev = this._device, gl = dev._gl,
                format = this._format, width = this._width, height = this._height;

            if (this._readable && !this._device.caps().readableDepth) {
                throw new R.Error("readable Depth buffers are not supported " +
                    "(check device.caps().readableDepth)");
            }
            if (!R.checkDepthFormat(dev, format)) {
                throw new R.Error("can't make Depth - unsupported format");
            }
            if (!width || !height) {
                throw new R.Error("can't make Depth - invalid size argument");
            }
            if (!R.isPowerOfTwo(width) || !R.isPowerOfTwo(height)) {
                throw new R.Error("can't make Depth - size is not power of 2");
            }
            if (Math.max(width, height) > dev.caps().depthMaxSize) {
                throw new R.Error("can't make Depth - " +
                    "unsupported size (greater then device.caps().depthMaxSize)");
            }
            this._glAttachment = toGLAttachmnet(gl, this._format);

            this._adjust();
        };
    }());

    this._adjust = function () {

        var gl = this._gl,
            width = this._width, height = this._height,
            format = R.toGLDepthFormat(this._device, this._format, this._readable),
            type = R.toGLType(this._device, this._format), target;

        if (this._readable) {
            target = gl.TEXTURE_2D;
            this._glHandle = gl.createTexture();
            gl.bindTexture(target, this._glHandle);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texImage2D(target, 0, format, width, height, 0, format, type, null);

        } else {
            target = gl.RENDERBUFFER;
            this._glHandle = gl.createRenderbuffer();
            gl.bindRenderbuffer(target, this._glHandle);
            gl.renderbufferStorage(target, format, width, height);
        }
        R.checkGLError(gl, "can't adjust Depth");
    };

    this._attach = function () {

        var gl = this._gl;

        if (this._readable) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, this._glAttachment,
                gl.TEXTURE_2D, this._glHandle, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, this._glAttachment,
                gl.RENDERBUFFER, this._glHandle);
        }
    };

    this._detach = function () {

        var gl = this._gl;

        if (this._readable) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, this._glAttachment,
                gl.TEXTURE_2D, null, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, this._glAttachment,
                gl.RENDERBUFFER, null);
        }
    };

    this._restore = function () {

        this._adjust();
    };
};

/**
 * Represents a depth-stencil buffer.
 *
 * To create the object use [device.makeDepth()]{@link B.Render.Device#makeDepth}.
 *
 * @class
 * @this B.Render.Depth
 */
B.Render.Depth = function (device, format, width, height, readable) {

    this._device = device;

    this._width = width;
    this._height = height;
    this._size = B.Math.makeVector2(width, height);
    this._format = format;
    this._readable = readable || false;

    this._gl = device._gl;
    this._glAttachment = 0;
    this._glHandle = null;

    this._id = -1;

    this._make();
};

B.Render.Depth.prototype = new B.Render.DepthProto();