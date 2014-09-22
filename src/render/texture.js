
/**
 * Cubemap face.
 *
 * @enum {number}
 * @readonly
 */
B.Render.CubeFace = {

    /**
     * Positive X-face.
     *
     * @constant
     */
    POSITIVE_X: 0,

    /**
     * Negative X-face.
     *
     * @constant
     */
    NEGATIVE_X: 1,

    /**
     * Positive Y-face.
     *
     * @constant
     */
    POSITIVE_Y: 2,

    /**
     * Negative Y-face.
     *
     * @constant
     */
    NEGATIVE_Y: 3,

    /**
     * Positive Z-face.
     *
     * @constant
     */
    POSITIVE_Z: 4,

    /**
     * Negative Z-face.
     *
     * @constant
     */
    NEGATIVE_Z: 5,

    /**
     * Face count.
     *
     * @constant
     */
    COUNT: 6
};


/**
 * @ignore
 * @this B.Render.Texture
 */
B.Render.TextureProto = function () {

    var R = B.Render,
        CF = R.CubeFace,

        toGLTarget = function (gl, faceCount, faceIndex) {

            if (faceCount === 1) {
                return gl.TEXTURE_2D;
            }
            if (faceIndex === undefined) {
                return gl.TEXTURE_CUBE_MAP;
            }
            switch (faceIndex) {
            case CF.POSITIVE_X:
                return gl.TEXTURE_CUBE_MAP_POSITIVE_X;
            case CF.NEGATIVE_X:
                return gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
            case CF.POSITIVE_Y:
                return gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
            case CF.NEGATIVE_Y:
                return gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
            case CF.POSITIVE_Z:
                return gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
            case CF.NEGATIVE_Z:
                return gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
            }
        },

        forEachMip = function (that, action) {

            var iF, lF, iM, lM, res, face, mips = that._mips;

            for (iF = 0, lF = that._faceCount; iF < lF; iF += 1) {
                face = mips[iF];
                for (iM = 0, lM = that._mipCount; iM < lM; iM += 1) {
                    res = action(face[iM], iF, iM);
                    if (res) {
                        face[iM] = res;
                    }
                }
            }
        },

        buildMipChain = function (that, mipCount) {

            var dev = that._device;

            that._mipCount = mipCount || R.Mip.calcMaxCount(Math.max(that._width, that._height));

            forEachMip(that, function (mip, iFace, iMip) {
                if (!mip) {
                    return new R.Mip(dev, that, iMip, iFace);
                }
            });
        },

        extractSourceSize = function (source, size) {

            size.set(
                source.videoWidth || source.naturalWidth || source.width,
                source.videoHeight || source.naturalHeight || source.height
            );
        };

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
     * Returns mip levels count.
     *
     * @returns {number}
     */
    this.mipCount = function () {

        return this._mipCount;
    };

    /**
     * Returns cubemap faces count.
     *
     * @returns {number}
     */
    this.faceCount = function () {

        return this._faceCount;
    };

    /**
     * Returns mip level.
     *
     * @param {number} [mipIndex=0]
     * @param {B.Render.CubeFace} [faceIndex=0] omit for 2D-textures
     * @returns {B.Render.Mip | null}
     */
    this.mip = function (mipIndex, faceIndex) {

        var face = this._mips[faceIndex || 0];

        return (face && face[mipIndex || 0]) || null;
    };

    /**
     * Builds mip levels chain.
     *
     * @returns {B.Render.Texture} this
     */
    this.buildMips = function () {

        var gl = this._gl;

        buildMipChain(this);

        gl.bindTexture(this._glTarget, this._glTexture);
        gl.generateMipmap(this._glTarget);

        R.checkGLError(gl, "can't build Texture mips");
        this._built = true;

        return this;
    };

    /**
     * Flush all mip data sources.
     *
     * *Note: the data won't be restored after device lost.*
     *
     * @returns {B.Render.Texture} this
     */
    this.flush = function () {

        forEachMip(this, function (mip) {
            mip.flush();
        });
        return this;
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeTexture(this);

        this._gl.deleteTexture(this._glTexture);

        forEachMip(this, function (mip) {
            B.Std.freeObject(mip);
        });
        B.Std.freeObject(this);
    };

    this._make = (function () {

        var F = R.Format,

            fromParams = function (that, format, width, height, mipCount, faceCount) {

                that._size.set(width, height);
                that._width = width;
                that._height = height;
                that._format = format;
                that._faceCount = faceCount || 1;
                that._mipCount = mipCount || 0;
            },

            fromSource = function (that, source, faceCount) {

                if (!source) {
                    throw new R.Error("can't make Texture - invalid source object");
                }
                extractSourceSize(source, that._size);
                that._width = that._size.x;
                that._height = that._size.y;
                that._format = R.Format.RGBA;
                that._faceCount = faceCount;
                that._mipCount = 1;
            },

            check = function (that) {

                var caps = that._device.caps(),
                    width = that._width,
                    height = that._height,
                    maxSize = Math.max(width, height),
                    minSize = Math.min(width, height),
                    format = that._format,
                    faceCount = that._faceCount,
                    mipCount = that._mipCount;

                if (!R.checkColorFormat(that._device, format)) {
                    throw new R.Error("can't make Texture - unsupported format");
                }
                if (!width || !height) {
                    throw new R.Error("can't make Texture - invalid size");
                }
                if ((format === F.RGB_DXT1 || format === F.RGBA_DXT5) && minSize < 4) {
                    throw new R.Error("can't make Texture - size is less than one block");
                }
                if (!R.isPowerOfTwo(width) || !R.isPowerOfTwo(height)) {
                    throw new R.Error("can't make Texture - size is not power of 2");
                }
                if (faceCount !== 1 && faceCount !== CF.COUNT) {
                    throw new R.Error("can't make Texture - invalid face count");
                }
                if (mipCount > R.Mip.calcMaxCount(maxSize)) {
                    throw new R.Error("can't make Texture - invalid mip count");
                }
                if (faceCount === 1 && maxSize > caps.textureMaxSize) {
                    throw new R.Error("can't make Texture - " +
                        "unsupported size (greater then device.caps().texturesMaxSize)");
                }
                if (faceCount === CF.COUNT && maxSize > caps.cubemapMaxSize) {
                    throw new R.Error("can't make Texture - " +
                        "unsupported size (greater then device.caps().cubemapMaxSize)");
                }
            };

        return function (format, width, height, mipCount, faceCount) {

            var source = format, i, l,
                gl = this._gl;

            if (typeof format === "number") {
                source = null;
                fromParams(this, format, width, height, mipCount, faceCount);
            } else {
                source = Array.isArray(source) ? source : [source];
                fromSource(this, source[0], source.length);
            }
            check(this);

            for (i = 0, l = this._faceCount; i < l; i += 1) {
                this._mips[i] = [];
            }
            this._glTarget = toGLTarget(gl, this._faceCount);
            this._glFormat = R.toGLColorFormat(this._device, this._format);
            this._glType = R.toGLType(this._device, this._format);

            this._adjust();

            buildMipChain(this, this._mipCount);

            forEachMip(this, function (mip, iFace) {
                mip.source(source && source[iFace]);
            });
        };
    }());

    this._adjust = function () {

        var gl = this._gl, glTarget = this._glTarget;

        this._glTexture = gl.createTexture();

        gl.bindTexture(glTarget, this._glTexture);
        gl.texParameteri(glTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(glTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_T, gl.REPEAT);

        R.checkGLError(gl, "can't adjust Texture");
    };

    this._upload = (function () {

        var
            compressedFormat = function (format) {

                var F = R.Format;

                switch (format) {
                case F.RGB_DXT1:
                case F.RGBA_DXT5:
                    return true;
                }
                return false;
            },

            uploadNull = function (that, target, mip) {

                var gl = that._gl,
                    mipIndex = mip.index(),
                    format = that._glFormat,
                    type = that._glType;

                switch (that._format) {
                case R.Format.RGB_DXT1:
                    format = gl.RGB;
                    type = gl.UNSIGNED_BYTE;
                    break;
                case R.Format.RGBA_DXT5:
                    format = gl.RGBA;
                    type = gl.UNSIGNED_BYTE;
                    break;
                }
                gl.texImage2D(target, mipIndex, format, mip.width(),
                    mip.height(), 0, format, type, null);
            },

            uploadArray = function (that, target, mip, source) {

                var gl = that._gl,
                    mipIndex = mip.index();

                if (!R.checkColorFormatDataSource(that._format, source)) {
                    throw new R.Error("can't upload Mip data - invalid source type");
                }
                if (source.byteLength !== mip.byteSize()) {
                    throw new R.Error("can't upload Mip data - invalid source byte size");
                }
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

                if (compressedFormat(that._format)) {
                    gl.compressedTexImage2D(target, mipIndex, that._glFormat,
                        mip.width(), mip.height(), 0, source);
                } else {
                    gl.texImage2D(target, mipIndex, that._glFormat, mip.width(),
                        mip.height(), 0, that._glFormat, that._glType, source);
                }
            },

            uploadObject = (function () {

                var size = B.Math.makeVector2();

                return function (that, target, mip, source) {

                    var gl = that._gl,
                        mipIndex = mip.index();

                    extractSourceSize(source, size);
                    if (size.x !== mip.width() || size.y !== mip.height()) {
                        throw new R.Error("can't upload Texture mip data - " +
                            "inappropriate source size");
                    }
                    if (compressedFormat(that._format)) {
                        throw new R.Error("can't upload Texture mip data - " +
                            "only compressed data allowed");
                    } else {
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, (that._faceCount !== CF.COUNT));
                        gl.texImage2D(target, mipIndex, that._glFormat, that._glFormat,
                            that._glType, source);
                    }
                };
            }());

        return function (faceIndex, mipIndex, source) {

            var gl = this._gl,
                mip = this.mip(mipIndex, faceIndex),
                target = toGLTarget(gl, this._faceCount, faceIndex);

            gl.bindTexture(this._glTarget, this._glTexture);
            if (!source) {
                uploadNull(this, target, mip);
            } else if (source instanceof Uint8Array || source instanceof Float32Array) {
                uploadArray(this, target, mip, source);
            } else {
                uploadObject(this, target, mip, source);
            }
            R.checkGLError(gl, "can't upload Texture mip data");
        };
    }());

    this._attach = function (targetIndex, faceIndex, mipIndex) {

        var gl = this._gl;

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + targetIndex,
            toGLTarget(gl, this._faceCount, faceIndex), this._glTexture, mipIndex);
    };

    this._detach = function (targetIndex) {

        var gl = this._gl;

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + targetIndex,
            gl.TEXTURE_2D, null, 0);
    };

    this._restore = function () {

        var built = this._built;

        this._adjust();

        forEachMip(this, function (mip, iFace, iMip) {
            if (!built || iMip === 0) {
                mip._restore();
            }
        });
        if (built) {
            this.buildMips();
        }
    };
};

/**
 * Represents a 2D-texture or cubemap.
 *
 * To create the object use [device.makeTexture()]{@link B.Render.Device#makeTexture}.
 *
 * @class
 * @this B.Render.Texture
 */
B.Render.Texture = function (device, format, width, height, mipCount, faceCount) {

    this._device = device;

    this._width = 0;
    this._height = 0;
    this._size = B.Math.makeVector2();
    this._format = 0;
    this._faceCount = 0;
    this._mipCount = 0;
    this._mips = [];

    this._gl = device._gl;
    this._glTexture = null;
    this._glTarget = 0;
    this._glFormat = 0;
    this._glType = 0;

    this._built = false;
    this._id = -1;

    this._make(format, width, height, mipCount, faceCount);
};

B.Render.Texture.prototype = new B.Render.TextureProto();