
/**
 * Reporting that the locator has been transformed.
 *
 * @event B.Graph.Locator#transformed
 * @type {B.Std.Event}
 */

/**
 * @ignore
 * @this B.Graph.Locator
 */
B.Graph.LocatorProto = function () {

    var M = B.Math,
        G = B.Graph;

    /**
     * Moves the locator by a given offset vector.
     *
     * @function B.Graph.Locator#move
     * @param {B.Math.Vector3} offset
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Moves the locator by given offsets.
     *
     * @function B.Graph.Locator#move
     * @param {number} ox offset along X-axis
     * @param {number} oy offset along Y-axis
     * @param {number} oz offset along Z-axis
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
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
     * Rotates the locator around an arbitrary axis.
     *
     * @function B.Graph.Locator#rotate
     * @param {B.Math.Vector3} axis
     * @param {number} angle in radians
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Rotates the locator by a quaternion or canonized euler angles.
     *
     * @function B.Graph.Locator#rotate
     * @param {B.Math.Quaternion | B.Math.Angles} object
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
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
     * Scales the locator by a given coefficient vector.
     *
     * @function B.Graph.Locator#scale
     * @param {B.Math.Vector3} coeffs
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Scales the locator by given coefficients.
     *
     * @function B.Graph.Locator#scale
     * @param {number} cx scale along X-axis
     * @param {number} cy scale along Y-axis
     * @param {number} cz scale along Z-axis
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Scales the locator uniformly by a given coefficient.
     *
     * @function B.Graph.Locator#scale
     * @param {number} c scale along all axis uniformly
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
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
     * Add a given transformation to the locator transformation.
     *
     * @function B.Graph.Locator#transform
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Gets the locator transformation.
     *
     * @function B.Graph.Locator#transform
     * @returns {B.Math.Matrix4}
     * @fires B.Graph.Locator#transformed
     */
    this.transform = (function () {

        var mx4 = M.makeMatrix4();

        return function (matrix) {

            if (arguments.length === 0) {
                return this._transform;
            } else {
                this._transform.mul(matrix instanceof M.Matrix3 ?
                    mx4.identity().setMatrix3(matrix) : matrix);
                this._rebuild();
                return this;
            }
        };
    }());

    /**
     * Sets the locator transformation (overwrites the current).
     *
     * @param {B.Math.Matrix3 | B.Math.Matrix4} [matrix={@link B.Math.Matrix4.IDENTITY}]
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    this.setTransform = function (matrix) {

        if (matrix === undefined) {
            this._transform.identity();
        } else if (matrix instanceof M.Matrix3) {
            this._transform.identity().setMatrix3(matrix);
        } else {
            this._transform.copy(matrix);
        }
        this._rebuild();
        return this;
    };

    /**
     * Gets locator's final (world) transformation.
     *
     * @returns {B.Math.Matrix4}
     */
    this.finalTransform = function () {

        return this._finalTransform;
    };

    this._clone = function () {

        return new G.Locator();
    };

    this._assign = function (other) {

        G.Node.prototype._assign.call(this, other);

        this.transform(other._transform);
    };

    this._rebuild = function () {

        var parent = this.parent();

        if (parent && parent.finalTransform) {
            this._finalTransform.copy(parent.finalTransform()).mul(this._transform);
        } else {
            this._finalTransform.copy(this._transform);
        }
        if (this._transformed) {
            this._transformed();
        }
        this.trigger("transformed");
        this._callDeep("_rebuild");
    };

    this._attached = function () {

        this._rebuild();
    };

    this._detached = function () {

        this._rebuild();
    };
};

B.Graph.LocatorProto.prototype = new B.Graph.NodeProto();

/**
 * Represents a locator (transformed location in 3D-space).
 *
 * To create the object use [B.Graph.makeLocator()]{@link B.Graph.makeLocator}.
 *
 * @class
 * @this B.Graph.Locator
 * @augments B.Graph.Node
 */
B.Graph.Locator = function () {

    B.Graph.Node.call(this);

    this._transform = B.Math.makeMatrix4();
    this._finalTransform = B.Math.makeMatrix4();
};

B.Graph.Locator.prototype = new B.Graph.LocatorProto();
