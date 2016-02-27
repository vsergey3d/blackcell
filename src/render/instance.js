
/**
 * @ignore
 * @this B.Render.Instance
 */
B.Render.InstanceProto = function () {

    var M = B.Math,
        R = B.Render,

        TRANSFORM = R.Instance.TRANSFORM,
        NORMAL_TRANSFORM = R.Instance.NORMAL_TRANSFORM;

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns mesh.
     *
     * @returns {B.Render.Mesh}
     */
    this.mesh = function () {

        return this._mesh;
    };

    /**
     * Returns material.
     *
     * @returns {B.Render.Material}
     */
    this.material = function () {

        return this._material;
    };

    /**
     * Returns bounds.
     *
     * @returns {B.Math.AABox}
     */
    this.bounds = function () {

        return this._bounds;
    };

    /**
     * Sets frustum culling enable.
     *
     * @function B.Render.Instance#culling
     * @param {boolean} enable
     * @returns {B.Render.Instance} this
     */
    /**
     * Gets frustum culling enable.
     *
     * @function B.Render.Instance#culling
     * @returns {boolean}
     */
    this.culling = function (enable) {

        if (arguments.length === 0) {
            return this._culling;
        }
        this._culling = enable;

        return this;
    };

    /**
     * Returns array of uniforms names.
     *
     * @returns {Array.<string>}
     */
    this.uniforms = function () {

        return Object.keys(this._uniforms);
    };

    /**
     * Sets a uniform value.
     *
     * @function B.Render.Instance#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @returns {B.Render.Instance} this
     *
     * @example
     * instance.
     *     uniform("someNumber", 1.5).
     *     uniform("someVector2", B.Math.makeVector2(1, 2)).
     *     uniform("someVector3", B.Math.makeVector3(1, 2, 3)).
     *     uniform("someVector4", B.Math.makeVector4(1, 2, 3, 4)).
     *     uniform("someColor", B.Math.makeColor(1, 0, 0, 0.5)).
     *     uniform("someMatrix3", B.Math.makeMatrix3().setRotationX(Math.PI)).
     *     uniform("someMatrix4", B.Math.makeMatrix4().setTranslation(1, 2, 3)).
     *     uniform("someTexture", dev.makeTexture(image)).
     *     uniform("someTexture", dev.stage("someStage").output().color()).
     *     uniform("someDepth", dev.stage("someStage").output().depth());
     *
     * instance.uniform("someTexture", null); // removing
     */
    /**
     * Gets a uniform value.
     *
     * @function B.Render.Instance#uniform
     * @param {string} name
     * @returns {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth}
     */
    this.uniform = function (name, value) {

        if (arguments.length === 1) {
            return this._uniforms[name] || null;
        } else if (value === null) {
            delete this._uniforms[name];
        } else {
            this._uniforms[name] = value;
        }
        return this;
    };

    /**
     * Sets the instance transformation.
     *
     * @param {B.Math.Matrix3 | B.Math.Matrix4} [matrix={@link B.Math.Matrix4.IDENTITY}]
     * @returns {B.Render.Instance} this
     */
    this.setTransform = function (matrix) {

        return this._setTransform(matrix || M.Matrix4.IDENTITY);
    };

    /**
     * Add a given transformation to the instance transformation.
     *
     * @function B.Render.Instance#transform
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Render.Instance} this
     */
    /**
     * Gets the instance transformation.
     *
     * @function B.Render.Instance#transform
     * @returns {B.Math.Matrix4}
     */
    this.transform = (function () {

        var mx4 = M.makeMatrix4();

        return function (matrix) {

            if (arguments.length === 0) {
                return this._transform;
            } else {
                this._transform.mul(matrix instanceof M.Matrix3 ?
                    mx4.identity().setMatrix3(matrix) : matrix);
                return this._setTransform();
            }
        };
    }());

    /**
     * Moves the instance by a given offset vector.
     *
     * @function B.Render.Instance#move
     * @param {B.Math.Vector3} offset
     * @returns {B.Render.Instance} this
     */
    /**
     * Moves the instance by given offsets.
     *
     * @function B.Render.Instance#move
     * @param {number} ox offset along X-axis
     * @param {number} oy offset along Y-axis
     * @param {number} oz offset along Z-axis
     * @returns {B.Render.Instance} this
     */
    this.move = (function () {

        var mx = M.makeMatrix4();

        return function (ox, oy, oz) {

            if (arguments.length === 1) {
                mx.translation(ox.x, ox.y, ox.z);
            } else {
                mx.translation(ox, oy, oz);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Rotates the instance around an arbitrary axis.
     *
     * @function B.Render.Instance#rotate
     * @param {B.Math.Vector3} axis
     * @param {number} angle in radians
     * @returns {B.Render.Instance} this
     */
    /**
     * Rotates instance by a quaternion or canonized euler angles.
     *
     * @function B.Render.Instance#rotate
     * @param {B.Math.Quaternion | B.Math.Angles} object
     * @returns {B.Render.Instance} this
     */
    this.rotate = (function () {

        var mx = M.makeMatrix4();

        return function (axis, angle) {

            if (arguments.length === 1) {
                if (axis instanceof M.Angles) {
                    mx.fromAngles(axis);
                }
                if (axis instanceof M.Quaternion) {
                    mx.fromQuaternion(axis);
                }
            } else {
                mx.rotationAxis(axis, angle);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Scales the instance by a given coefficient vector.
     *
     * @function B.Render.Instance#scale
     * @param {B.Math.Vector3} coeffs
     * @returns {B.Render.Instance} this
     */
    /**
     * Scales instance by given coefficients.
     *
     * @function B.Render.Instance#scale
     * @param {number} cx scale along X-axis
     * @param {number} cy scale along Y-axis
     * @param {number} cz scale along Z-axis
     * @returns {B.Render.Instance} this
     */
    /**
     * Scales (uniformly) instance by a given coefficient.
     *
     * @function B.Render.Instance#scale
     * @param {number} c scale along all axis uniformly
     * @returns {B.Render.Instance} this
     */
    this.scale = (function () {

        var mx = M.makeMatrix4();

        return function (cx, cy, cz) {

            if (arguments.length === 1) {
                if (typeof cx === "number") {
                    mx.scale(cx, cx, cx);
                } else {
                    mx.scale(cx.x, cx.y, cx.z);
                }
            } else {
                mx.scale(cx, cy, cz);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeInstance(this);

        B.Std.freeObject(this);
    };

    this._bindUniforms = function (pass) {

        var name, value, values = this._uniforms;

        for (name in values) {
            value = values[name];

            if (value === TRANSFORM) {
                value = this._transform;
            } else if (value === NORMAL_TRANSFORM) {
                value = this._normalTransform;
            }
            pass._uniform(name, value);
        }
    };

    this._setTransform = function (transform) {

        if (transform) {
            if (transform instanceof M.Matrix3) {
                this._transform.identity().setMatrix3(transform);
            } else {
                this._transform.copy(transform);
            }
        }
        this._transform.getMatrix3(this._normalTransform).invert().transpose();
        this._bounds.copy(this._mesh.bounds()).transform(this._transform);
        return this;
    };
};

/**
 * Represents a renderable instance.
 * The instance is the elementary unit of rendering (transformed [mesh]{@link B.Render.Mesh} +
 *  [material]{@link B.Render.Material}).
 *
 * To create the object use [device.instance()]{@link B.Render.Device#instance}.
 *
 * @class
 * @this B.Render.Instance
 */
B.Render.Instance = function (device, material, mesh, transform, culling) {

    var M = B.Math;

    this._device = device;

    this._material = material;
    this._mesh = mesh;
    this._transform = transform || M.makeMatrix4();
    this._normalTransform = this._transform.getMatrix3().invert().transpose();
    this._bounds = mesh.bounds().clone().transform(this._transform);
    this._culling = (culling !== undefined) ? culling : true;
    this._uniforms = {};

    this._id = -1;
};

/**
 * Instance transformation uniform placeholder.
 * It allows to set instance transformation matrix to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * instance.uniform("mxTransform", B.Render.Instance.TRANSFORM);
 */
B.Render.Instance.TRANSFORM = {};

/**
 * Instance inverse transpose transformation uniform placeholder.
 * It allows to set instance inverse transpose transformation matrix to
 * a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * instance.uniform("mxNormalTransform", B.Render.Instance.NORMAL_TRANSFORM);
 */
B.Render.Instance.NORMAL_TRANSFORM = {};

B.Render.Instance.prototype = new B.Render.InstanceProto();