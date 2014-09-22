
/**
 * @ignore
 * @this B.Math.Frustum
 */
B.Math.FrustumProto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        abs = Math.abs;

    /**
     * Clones this frustum to a new frustum.
     *
     * @returns {B.Math.Frustum} this
     */
    this.clone = function () {

        return M.makeFrustum(this.left, this.right, this.top,
            this.bottom, this.near, this.far);
    };

    /**
     * Copies a given frustum into this frustum.
     *
     * @param {B.Math.Frustum} frustum
     * @returns {B.Math.Frustum} this
     */
    this.copy = function (frustum) {

        this.left.copy(frustum.left);
        this.right.copy(frustum.right);
        this.top.copy(frustum.top);
        this.bottom.copy(frustum.bottom);
        this.near.copy(frustum.near);
        this.far.copy(frustum.far);

        return this;
    };

    /**
     * Sets this frustum from planes.
     *
     * @param {B.Math.Plane} left
     * @param {B.Math.Plane} right
     * @param {B.Math.Plane} top
     * @param {B.Math.Plane} bottom
     * @param {B.Math.Plane} near
     * @param {B.Math.Plane} far
     * @returns {B.Math.Frustum} this
     */
    this.set = function (left, right, top, bottom, near, far) {

        this.left.copy(left);
        this.right.copy(right);
        this.top.copy(top);
        this.bottom.copy(bottom);
        this.near.copy(near);
        this.far.copy(far);

        return this;
    };

    /**
     * Sets this frustum from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.left.fromArray(array, offset);
        offset = this.right.fromArray(array, offset);
        offset = this.top.fromArray(array, offset);
        offset = this.bottom.fromArray(array, offset);
        offset = this.near.fromArray(array, offset);
        offset = this.far.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this frustum to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.left.toArray(array, offset);
        offset = this.right.toArray(array, offset);
        offset = this.top.toArray(array, offset);
        offset = this.bottom.toArray(array, offset);
        offset = this.near.toArray(array, offset);
        offset = this.far.toArray(array, offset);

        return offset;
    };

    /**
     * Sets this frustum from a view-projection matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Frustum} this
     */
    this.fromMatrix = (function () {

        var v = M.makeVector3();

        return function (matrix) {

            // explanation: http://www.cs.otago.ac.nz/postgrads/alexis/planeExtraction.pdf

            var m = matrix.m,
                m00 = m[0], m10 = m[1], m20 = m[2], m30 = m[3],
                m01 = m[4], m11 = m[5], m21 = m[6], m31 = m[7],
                m02 = m[8], m12 = m[9], m22 = m[10], m32 = m[11],
                m03 = m[12], m13 = m[13], m23 = m[14], m33 = m[15];

            // distance = -(d)
            this.left.set(v.set(m30 + m00, m31 + m01, m32 + m02), -(m33 + m03)).normalize();
            this.right.set(v.set(m30 - m00, m31 - m01, m32 - m02), -(m33 - m03)).normalize();
            this.top.set(v.set(m30 - m10, m31 - m11, m32 - m12), -(m33 - m13)).normalize();
            this.bottom.set(v.set(m30 + m10, m31 + m11, m32 + m12), -(m33 + m13)).normalize();
            this.near.set(v.set(m30 + m20, m31 + m21, m32 + m22), -(m33 + m23)).normalize();
            this.far.set(v.set(m30 - m20, m31 - m21, m32 - m22), -(m33 - m23)).normalize();

            return this;
        };
    }());

    /**
     * Returns corner points of this frustum.
     *
     * @function
     * @param {Array<B.Math.Vector3>} [result] omit if you want to return newly created array
     * @returns {Array<B.Math.Vector3>}
     * @throws {Error} if frustum has invalid set of planes
     */
    this.cornerPoints = (function () {

        var v = M.makeVector3(),

            intersect = function (p0, p1, p2, array, index) {

                var n0 = p0.normal, d0 = p0.distance,
                    n1 = p1.normal, d1 = p1.distance,
                    n2 = p2.normal, d2 = p2.distance, denom;

                if (!array[index]) {
                    array[index] = M.makeVector3();
                }
                denom = array[index].crossVectors(n1, n2).dot(n0);
                if (abs(denom) < EPSILON) {
                    throw new Error("Frustum has invalid set of planes");
                }
                array[index].mul(d0).
                    add(v.crossVectors(n0, n1).mul(d2)).
                    add(v.crossVectors(n2, n0).mul(d1)).
                    div(denom);
            };

        return function (result) {

            var near = this.near, far = this.far,
                top = this.top, bottom = this.bottom,
                left = this.left, right = this.right;

            result = result || [];

            intersect(near, top, left, result, 0);
            intersect(near, top, right, result, 1);
            intersect(near, bottom, left, result, 2);
            intersect(near, bottom, right, result, 3);
            intersect(far, top, left, result, 4);
            intersect(far, top, right, result, 5);
            intersect(far, bottom, left, result, 6);
            intersect(far, bottom, right, result, 7);

            return result;
        };
    }());

    /**
     * Check if this frustum contains an object.
     *
     * @param {B.Math.Vector3 | B.Math.Segment | B.Math.Triangle | B.Math.AABox
     *  | B.Math.Sphere} object
     * @returns {boolean}
     * @throws {Error} if the object argument has unsupported type
     */
    this.contain = function (object) {

        return this.left.distanceTo(object) >= 0.0 &&
            this.right.distanceTo(object) >= 0.0 &&
            this.top.distanceTo(object) >= 0.0 &&
            this.bottom.distanceTo(object) >= 0 &&
            this.near.distanceTo(object) >= 0 &&
            this.far.distanceTo(object) >= 0;
    };

    /**
     * Checks for strict equality of this frustum and another frustum.
     *
     * @param {B.Math.Frustum} frustum
     * @returns {boolean}
     */
    this.equal = function (frustum) {

        return this.left.equal(frustum.left) &&
            this.right.equal(frustum.right) &&
            this.top.equal(frustum.top) &&
            this.bottom.equal(frustum.bottom) &&
            this.near.equal(frustum.near) &&
            this.far.equal(frustum.far);
    };
};


/**
 * Represents a frustum.
 *
 * To create the object use [B.Math.makeFrustum()]{@link B.Math.makeFrustum}.
 *
 * @class
 * @this B.Math.Frustum
 */
B.Math.Frustum = function (left, right, top, bottom, near, far) {

    var P = B.Math.Plane;

    /**
     * Left plane.
     *
     * @type {B.Math.Plane}
     */
    this.left = left || P.X.clone();

    /**
     * Right plane.
     *
     * @type {B.Math.Plane}
     */
    this.right = right || P.N_X.clone();

    /**
     * Top plane.
     *
     * @type {B.Math.Plane}
     */
    this.top = top || P.N_Y.clone();

    /**
     * Bottom plane.
     *
     * @type {B.Math.Plane}
     */
    this.bottom = bottom || P.Y.clone();

    /**
     * Near plane.
     *
     * @type {B.Math.Plane}
     */
    this.near = near || P.Z.clone();

    /**
     * Far plane.
     *
     * @type {B.Math.Plane}
     */
    this.far = far || P.N_Z.clone();
};

B.Math.Frustum.prototype = new B.Math.FrustumProto();
