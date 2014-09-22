
/**
 * @ignore
 * @this B.Render.Mip
 */
B.Render.MipProto = function () {

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns linked texture.
     *
     * @returns {B.Render.Texture}
     */
    this.texture = function () {

        return this._texture;
    };

    /**
     * Returns index of this mip level.
     *
     * @returns {number}
     */
    this.index = function () {

        return this._index;
    };

    /**
     * Returns mip levels count of linked texture.
     *
     * @returns {number}
     */
    this.count = function () {

        return this._count;
    };

    /**
     * Returns cubemap face of this mip level (always 0 for 2D-textures).
     *
     * @returns {B.Render.CubeFace}
     */
    this.face = function () {

        return this._face;
    };

    /**
     * Returns cubemap face count of linked texture.
     *
     * @returns {number}
     */
    this.faceCount = function () {

        return this._faceCount;
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
     * Sets texel data source.
     *
     * @function B.Render.Mip#source
     * @param {null | Uint8Array | Float32Array | ImageData | HTMLImageElement |
     *  HTMLCanvasElement | HTMLVideoElement} source
     * @returns {B.Render.Mip} this
     * @throws {B.Render.Error} if source is inappropriate or has invalid size
     * */
    /**
     * Gets texel data source.
     *
     * @function B.Render.Mip#source
     * @returns {null | Uint8Array | Float32Array | ImageData | HTMLImageElement |
     *  HTMLCanvasElement | HTMLVideoElement}
     */
    this.source = function (source) {

        if (arguments.length === 0) {
            return this._source;
        }
        this._texture._upload(this._face, this._index, source);
        this._source = source || null;
        return this;
    };

    /**
     * Flush linked data source.
     *
     * *Note: the data won't be restored after device lost.*
     *
     * @returns {B.Render.Mip} this
     */
    this.flush = function () {

        this._source = null;
    };

    /**
     * Returns data pitch (in bytes).
     *
     * @returns {number}
     */
    this.pitch = function () {

        return this._pitch;
    };

    /**
     * Returns data rows count.
     *
     * @returns {number}
     */
    this.rows = function () {

        return this._rows;
    };

    /**
     * Returns data size (in bytes).
     *
     * @returns {number}
     */
    this.byteSize = function () {

        return this._byteSize;
    };

    this._attach = function (targetIndex) {

        this._texture._attach(targetIndex, this._face, this._index);
    };

    this._detach = function (targetIndex) {

        this._texture._detach(targetIndex);
    };

    this._restore = function () {

        this._texture._upload(this._face, this._index, this._source);
    };
};

/**
 * Represents a texture mip level.
 *
 * To get the object use [texture.mip()]{@link B.Render.Texture#mip}.
 *
 * @class
 * @this B.Render.Mip
 */
B.Render.Mip = function (device, texture, index, face) {

    var R = B.Render;

    this._device = device;

    this._texture = texture;
    this._index = index;
    this._count = texture.mipCount();
    this._face = face;
    this._faceCount = texture.faceCount();
    this._width = R.Mip.calcSize(texture.width(), index);
    this._height = R.Mip.calcSize(texture.height(), index);
    this._size = B.Math.makeVector2(this._width, this._height);
    this._format = texture.format();
    this._pitch = R.imagePitch(this._format, this._width);
    this._rows = R.imageRows(this._format, this._height);
    this._byteSize = this._pitch * this._rows;

    this._source = null;
};

B.Render.Mip.prototype = new B.Render.MipProto();

/**
 * Calculates maximum mip levels count of given texture size.
 *
 * @param {number} textureSize
 * @returns {number}
 */
B.Render.Mip.calcMaxCount = function (textureSize) {

    return Math.max(0, Math.log(textureSize)) / Math.LN2 + 1;
};

/**
 * Calculates size of specified mip level from given texture size.
 *
 * @param {number} textureSize
 * @param {number} mipIndex
 * @returns {number}
 */
B.Render.Mip.calcSize = function (textureSize, mipIndex) {

    return Math.pow(2, Math.max(0, Math.log(textureSize) / Math.LN2 - mipIndex));
};