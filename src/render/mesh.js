
/**
 * Specifies the usage pattern of the data store.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Usage = {

    /**
     * The data store contents will be modified once.
     *
     * @constant
     */
    STATIC: 1,

    /**
     * The data store contents will be modified repeatedly.
     *
     * @constant
     */
    DYNAMIC: 2
};


/**
 * @ignore
 * @this B.Render.Mesh
 */
B.Render.MeshProto = function () {

    var M = B.Math,
        R = B.Render,
        U = R.Usage,
        I = R.Index,

        toGLUsage = function (gl, usage) {

            var U = B.Render.Usage;

            switch (usage) {
            case U.STATIC:
                return gl.STATIC_DRAW;
            case U.DYNAMIC:
                return gl.DYNAMIC_DRAW;
            }
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
     * Returns array of vertex attributes names.
     *
     * @returns {Array.<string>}
     */
    this.attributes = function () {

        return this._attributesNames;
    };

    /**
     * Sets vertex attribute.
     *
     * @function B.Render.Mesh#attribute
     * @param {string} name if the name is not found a new attribute will be pushed
     * @param {B.Render.Attribute | null} type use the null value to remove existing attribute
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if attributes configuration is incorrect
     *
     * @example
     * mesh.
     *     attribute("position", B.Render.Attribute.POSITION).
     *     attribute("normal", B.Render.Attribute.NORMAL).
     *     attribute("uv", B.Render.Attribute.VECTOR2);
     *
     * mesh.attribute("uv", B.Render.Attribute.UV); // changing
     *
     * mesh.attribute("uv", null); // removing
     */
    /**
     * Gets vertex attribute.
     *
     * @function B.Render.Mesh#attribute
     * @param {string} name if the name is not found the null value will be returned
     * @returns {B.Render.Attribute | null}
     */
    /**
     * Renames vertex attribute.
     *
     * @function B.Render.Mesh#attribute
     * @param {string} name
     * @param {string} newName
     * @returns {B.Render.Mesh} this
     *
     * @example
     * mesh.attribute("uv", "uv0");
     */
    this.attribute = function (name, arg) {

        var i, found, attrs = this._attributes,
            names = this._attributesNames;

        if (arguments.length === 1) {
            return this._attributes[name] || null;
        }
        i = names.indexOf(name);
        found = (i !== -1);

        if (typeof arg === "string") {
            if (found) {
                names.splice(i, 1, arg);
                attrs[arg] = attrs[name];
                delete attrs[name];
            }
        } else if (arg === null) {
            if (found) {
                names.splice(i, 1);
                delete attrs[name];
            }
        } else {
            if (!found) {
                names.push(name);
            }
            attrs[name] = arg;
        }
        this._adjustAttributes();

        return this;
    };

    /**
     * Returns vertex count.
     *
     * @returns {number}
     */
    this.vertexCount = function () {

        return this._vertexCount;
    };

    /**
     * Sets vertex data.
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * @function B.Render.Mesh#vertices
     * @param {Array.<number> | Float32Array} source
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the data source is incorrect
     */
    /**
     * Allocates specified vertex count (the data will be initialized to 0).
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * @function B.Render.Mesh#vertices
     * @param {number} vertexCount
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the vertex count is incorrect
     */
    /**
     * Gets the vertex data source.
     *
     * @function B.Render.Mesh#vertices
     * @returns {Float32Array | null}
     */
    this.vertices = function (source, usage) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._vertexSource;
        }
        if (typeof source === "number") {
            if(source < 1) {
                throw new R.Error("can't set Mesh vertex data - vertex count is 0");
            }
            this._vertexSource = null;
            this._vertexCount = source;
        } else if (Array.isArray(source)) {
            this._vertexSource = new Float32Array(source);
        } else if (source instanceof Float32Array) {
            this._vertexSource = source;
        } else {
            throw new R.Error("can't set Mesh vertex data - invalid source type");
        }
        this._vertexUsage = usage || U.STATIC;

        this._adjustAttributes();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertexSource ||
            (this._glStride * this._vertexCount), toGLUsage(gl, this._vertexUsage));
        R.checkGLError(gl, "can't set Mesh vertices");

        if (this._vertexUsage === U.DYNAMIC) {
            this._vertexSource = null;
        }
        return this;
    };

    /**
     * Updates vertices from a new or existent data source.
     *
     * *Note: if you repeatedly updates vertices it's highly recommended to use
     *  {@link B.Render.Usage.DYNAMIC} to avoid performance penalty.*
     *
     * @param {Array.<number> | Float32Array} [source] omit if you want to use existent data source
     * @param {number} [offset=0] elements offset where data replacement will begin
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if vertices are not initialized or the source has invalid type
     *  or the source data is out of range
     */
    this.updateVertices = function (source, offset) {

        var gl = this._gl,
            byteOffset = offset ? offset * Float32Array.BYTES_PER_ELEMENT : 0,
            byteSize = this._glStride * this._vertexCount;

        if (!byteSize) {
            throw new R.Error("can't update Mesh vertex data - vertices must be set before update");
        }
        if (source) {
            if (Array.isArray(source)) {
                source = new Float32Array(source);
            } else if (!(source instanceof Float32Array)) {
                throw new R.Error("can't update Mesh vertex data - invalid source type");
            }
            if (byteOffset + source.byteLength > byteSize) {
                throw new R.Error("can't update Mesh vertex data - source data is out of range");
            }
            if (this._vertexSource && this._vertexUsage !== U.DYNAMIC) {
                this._vertexSource.set(source, offset);
            }
        } else {
            source = this._vertexSource;
        }
        if (source) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, byteOffset, source);
            R.checkGLError(gl, "can't update Mesh vertices");
        }
        return this;
    };

    /**
     * Flush linked vertex data source.
     *
     * *Note: the vertex data won't be restored after device lost.*
     *
     * @returns {B.Render.Mesh} this
     */
    this.flushVertices = function () {

        this._vertexSource = null;

        return this;
    };

    /**
     * Returns index type.
     *
     * @returns {B.Render.Index}
     */
    this.index = function () {

        return this._index;
    };

    /**
     * Returns index count.
     *
     * @returns {number}
     */
    this.indexCount = function () {

        return this._indexCount;
    };

    /**
     * Sets index data.
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * Some hardware supports 32-bit indices. To check it use
     *  [device.caps().indexUInt]{@link B.Render.Device~Caps} flag.
     *
     * @function B.Render.Mesh#indices
     * @param {Array.<number> | Uint16Array | Uint32Array} source
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the data source is incorrect
     */
    /**
     * Allocate specified index count (the data will be initialized to 0).
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * Some hardware supports 32-bit indices. To check it use
     *  [device.caps().indexUInt]{@link B.Render.Device~Caps} flag.
     *
     * @function B.Render.Mesh#indices
     * @param {number} indexCount
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the index count is incorrect
     */
    /**
     * Gets the index data source.
     *
     * @function B.Render.Mesh#indices
     * @returns {Uint16Array | Uint32Array | null}
     */
    this.indices = function (source, usage) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._indexSource;
        }
        this._index = I.USHORT;

        if (typeof source === "number") {
            if(source < 1) {
                throw new R.Error("can't set Mesh index data - index count is 0");
            }
            this._indexSource = null;
        } else if (Array.isArray(source)) {
            this._indexSource = new Uint16Array(source);
        } else if (source instanceof Uint16Array) {
            this._indexSource = source;
        } else if (source instanceof Uint32Array) {
            this._indexSource = source;
            this._index = I.UINT;
        } else {
            throw new R.Error("can't set Mesh index data - invalid source type");
        }
        if (this._index === I.UINT && !this._device.caps().indexUInt) {
            throw new R.Error("can't set Mesh index data - 32-bit indices are not supported");
        }
        this._glIndex = R.toGLIndex(gl, this._index);
        this._indexCount = source.length || source;
        this._indexUsage = usage || U.STATIC;

        this._adjustPrimitives();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexSource ||
            (R.indexByteSize(this._index) * this._indexCount), toGLUsage(gl, this._indexUsage));
        R.checkGLError(gl, "can't set Mesh indices");

        if (this._indexUsage === U.DYNAMIC) {
            this._indexSource = null;
        }
        return this;
    };

    /**
     * Updates indices from a new or existent data source.
     *
     * *Note: if you repeatedly updates indices it's highly recommended to use
     *  {@link B.Render.Usage.DYNAMIC} to avoid performance penalty.*
     *
     * @param {Array.<number> | Uint16Array | Uint32Array} [source] omit if you want to use
     *  existent data source
     * @param {number} [offset=0] elements offset where data replacement will begin
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if indices are not initialized or the source has invalid type
     *  or the source data is out of range
     */
    this.updateIndices = function (source, offset) {

        var gl = this._gl,
            index = this._index,
            byteStride = R.indexByteSize(index),
            byteSize = byteStride * this._indexCount,
            byteOffset = offset ? offset * byteStride : 0;

        if (!byteSize) {
            throw new R.Error("can't update Mesh index data - indices must be set before update");
        }
        if (source) {
            if (Array.isArray(source)) {
                source = (index === I.USHORT) ? new Uint16Array(source) : new Uint32Array(source);
            } else if ((index === I.USHORT && !(source instanceof Uint16Array)) ||
                (index === I.UINT && !(source instanceof Uint32Array))) {
                throw new R.Error("can't update Mesh index data - invalid source type");
            }
            if (byteOffset + source.byteLength > byteSize) {
                throw new R.Error("can't update Mesh index data - source data is out of range");
            }
            if (this._indexSource && this._indexUsage !== U.DYNAMIC) {
                this._indexSource.set(source, offset);
            }
        } else {
            source = this._indexSource;
        }
        if (source) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, byteOffset, this._indexSource);
            R.checkGLError(gl, "can't update Mesh indices");
        }
        return this;
    };

    /**
     * Flush linked index data source.
     *
     * *Note: the index data won't be restored after device lost.*
     *
     * @returns {B.Render.Mesh} this
     */
    this.flushIndices = function () {

        this._indexSource = null;

        return this;
    };

    /**
     * Sets primitive type.
     *
     * @function B.Render.Mesh#primitive
     * @param {B.Render.Primitive} type
     * @returns {B.Render.Mesh} this
     */
    /**
     * Gets primitive type.
     *
     * @function B.Render.Mesh#primitive
     * @returns {B.Render.Primitive}
     */
    this.primitive = function (type) {

        if (arguments.length === 0) {
            return this._primitive;
        }
        this._primitive = type;
        this._adjustPrimitives();
        return this;
    };

    /**
     * Returns primitive count.
     *
     * @returns {number}
     */
    this.primitiveCount = function () {

        return this._primitiveCount;
    };

    /**
     * Sets bounds.
     *
     * @function B.Render.Mesh#bounds
     * @param {B.Math.AABox} box
     * @returns {B.Render.Mesh} this
     */
    /**
     * Gets bounds.
     *
     * @function B.Render.Mesh#bounds
     * @returns {B.Math.AABox}
     */
    this.bounds = function (box) {

        if (arguments.length === 0) {
            return this._bounds;
        }
        this._bounds.copy(box);
        return this;
    };

    /**
     * Computes bounds from vertex positions.
     *
     * @function
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if a vertex data source is not linked
     *  or the {@link B.Render.Attribute.POSITION} attribute is not found
     */
    this.computeBounds = (function () {

        var point = M.makeVector3();

        return function () {

            var name, attrs = this._attributes, posAttr = 0,
                bounds = this._bounds, data = this._vertexSource,
                i, l, index = 0, stride, offset;

            if (!data) {
                throw new R.Error("can't compute Mesh bounds - vertex data source is not linked");
            }
            for (name in attrs) {
                if (attrs[name] === R.Attribute.POSITION) {
                    posAttr = name;
                    break;
                }
            }
            if (!posAttr) {
                throw new R.Error("can't compute Mesh bounds - POSITION attribute is not found");
            }
            bounds.reset();

            stride = this._glStride / Float32Array.BYTES_PER_ELEMENT;
            offset = this._glOffsets[posAttr] / Float32Array.BYTES_PER_ELEMENT;

            for (i = 0, l = this._vertexCount; i < l; i += 1) {
                index = i * stride + offset;
                point.set(data[index], data[index + 1], data[index + 2]);
                bounds.merge(point);
            }
            return this;
        };
    }());

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        var gl = this._gl;

        this._device._removeMesh(this);

        gl.deleteBuffer(this._glVertexBuffer);
        gl.deleteBuffer(this._glIndexBuffer);

        B.Std.freeObject(this);
    };

    this._make = function () {

        var gl = this._gl;

        this._glVertexBuffer = gl.createBuffer();
        this._glIndexBuffer = gl.createBuffer();

        R.checkGLError(gl, "can't make Mesh buffers");
    };

    this._bind = (function () {

        var A = R.Attribute,
            attribPtr = [],
            attribStub = [];

        attribPtr[A.UINT] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 4, gl.UNSIGNED_BYTE, true, stride, offset);
        };
        attribPtr[A.FLOAT] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, stride, offset);
        };
        attribPtr[A.VECTOR2] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, stride, offset);
        };
        attribPtr[A.VECTOR3] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, stride, offset);
        };
        attribPtr[A.VECTOR4] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, stride, offset);
        };

        attribStub[A.FLOAT] = function (gl, loc) {
            gl.vertexAttrib1f(loc, 0);
        };
        attribStub[A.VECTOR2] = function (gl, loc) {
            gl.vertexAttrib2f(loc, 0, 0);
        };
        attribStub[A.VECTOR3] = function (gl, loc) {
            gl.vertexAttrib3f(loc, 0, 0, 0);
        };
        attribStub[A.VECTOR4] = function (gl, loc) {
            gl.vertexAttrib4f(loc, 0, 0, 0, 0);
        };

        return function (passAttribs) {

            var gl = this._gl,
                attribs = this._attributes, offsets = this._glOffsets,
                stride = this._glStride, boundCount = 0,
                name, passAttrib, passType, meshType, location;

            gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);

            for (name in passAttribs) {
                passAttrib = passAttribs[name];

                meshType = R.resolveAttributeAlias(attribs[name]);
                passType = passAttrib.type;
                location = passAttrib.location;

                if (meshType === passType || (meshType === A.UINT && passType === A.VECTOR4)) {
                    attribPtr[meshType](gl, location, stride, offsets[name]);
                    boundCount += 1;
                } else {
                    attribStub[passType](gl, location);
                }
            }
            if (!boundCount) {
                throw new R.Error("can't bind Mesh - neither attributes matched");
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
        };
    }());

    this._draw = function () {

        this._gl.drawElements(this._glPrimitive, this._indexCount, this._glIndex, 0);
    };

    this._restore = function () {

        var vCount = this._vertexCount,
            iCount = this._indexCount;

        this._make();

        if (vCount) {
            this.vertices(this._vertexSource || vCount, this._vertexUsage);
        }
        if (iCount) {
            this.indices(this._indexSource || iCount, this._indexUsage);
        }
    };

    this._adjustAttributes = function () {

        var attribs = this._attributes, names = this._attributesNames,
            i, l, name, offset = 0;

        if (!R.checkAttributes(attribs)) {
            throw new R.Error("can't adjust Mesh - invalid vertex attributes");
        }
        this._glOffsets = {};

        for (i = 0, l = names.length; i < l; i += 1) {
            name = names[i];
            this._glOffsets[name] = offset;
            offset += R.attributeByteSize(attribs[name]);
        }
        this._glStride = offset;

        if (this._vertexSource) {
            this._vertexCount = this._vertexSource.byteLength / this._glStride;
        }
    };

    this._adjustPrimitives = function () {

        this._primitiveCount = this._indexCount / R.indicesPerPrimitive(this._primitive);
        this._glPrimitive = R.toGLPrimitive(this._gl, this._primitive);
    };
};

/**
 * Represents a mesh, contains vertices and indexed primitives.
 *
 * To create the object use [device.makeMesh()]{@link B.Render.Device#makeMesh}.
 *
 * @class
 * @this B.Render.Mesh
 */
B.Render.Mesh = function (device) {

    this._device = device;

    this._attributes = {};
    this._attributesNames = [];
    this._vertexUsage = 0;
    this._vertexCount = 0;
    this._vertexSource = null;
    this._index = 0;
    this._indexUsage = 0;
    this._indexCount = 0;
    this._indexSource = null;
    this._primitive = B.Render.Primitive.TRIANGLE;
    this._primitiveCount = 0;
    this._bounds = B.Math.makeAABox();

    this._gl = device._gl;
    this._glOffsets = {};
    this._glStride = 0;
    this._glPrimitive = 0;
    this._glIndex = 0;
    this._glVertexBuffer = null;
    this._glIndexBuffer = null;

    this._id = -1;

    this._make();
};

B.Render.Mesh.prototype = new B.Render.MeshProto();