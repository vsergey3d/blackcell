
/**
 * @ignore
 * @this B.Math.Triangle
 */
B.Math.TriangleProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.TRIANGLE;
    };

    /**
     * Clones this triangle to a new triangle.
     *
     * @returns {B.Math.Triangle} this
     */
    this.clone = function () {

        return M.makeTriangle(this.a, this.b, this.c);
    };

    /**
     * Copies a given triangle into this triangle.
     *
     * @param {B.Math.Triangle} triangle
     * @returns {B.Math.Triangle} this
     */
    this.copy = function (triangle) {

        this.a.copy(triangle.a);
        this.b.copy(triangle.b);
        this.c.copy(triangle.c);

        return this;
    };

    /**
     * Sets this triangle from three points.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @param {B.Math.Vector3} c
     * @returns {B.Math.Triangle} this
     */
    this.set = function (a, b, c) {

        this.a.copy(a);
        this.b.copy(b);
        this.c.copy(c);

        return this;
    };

    /**
     * Sets this triangle from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.a.fromArray(array, offset);
        offset = this.b.fromArray(array, offset);
        offset = this.c.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this triangle to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.a.toArray(array, offset);
        offset = this.b.toArray(array, offset);
        offset = this.c.toArray(array, offset);

        return offset;
    };

    /**
     * Translates this triangle by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Triangle} this
     */
    this.translate = function (offset) {

        this.a.add(offset);
        this.b.add(offset);
        this.c.add(offset);

        return this;
    };

    /**
     * Transforms this triangle by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Triangle} this
     */
    this.transform = function (matrix) {

        this.a.transform(matrix);
        this.b.transform(matrix);
        this.c.transform(matrix);

        return this;
    };

    /**
     * Gets the normal of this triangle.
     *
     * @function
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.normal = (function () {

        var ab = M.makeVector3();

        return function (result) {

            var a = this.a, b = this.b, c = this.c,
                v = result || M.makeVector3();

            return v.subVectors(c, b).cross(ab.subVectors(a, b)).normalize();
        };
    }());

    /**
     * Gets the plane of this triangle.
     *
     * @param {B.Math.Plane} [result] omit if you want to return newly created plane
     * @returns {B.Math.Plane}
     */
    this.plane = function (result) {

        var v = result || M.makePlane();

        return v.fromCoplanarPoints(this.a, this.b, this.c);
    };

    /**
     * Gets the area of this triangle.
     *
     * @function
     * @returns {number}
     */
    this.area = (function () {

        var v0 = M.makeVector3();
        var v1 = M.makeVector3();

        return function () {

            v0.subVectors(this.c, this.b);
            v1.subVectors(this.a, this.b);

            return v0.cross(v1).length() * 0.5;
        };
    }());

    /**
     * Gets the perimeter of this triangle.
     *
     * @returns {number}
     */
    this.perimeter = function () {

        var a = this.a, b = this.b, c = this.c;

        return a.distanceTo(b) + b.distanceTo(c) + c.distanceTo(a);
    };

    /**
     * Gets the centroid of this triangle.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.centroid = function (result) {

        var v = result || M.makeVector3();

        return v.addVectors(this.a, this.b).add(this.c).div(3.0);
    };

    /**
     * Computes barycentric coordinates of point for this triangle.
     *
     * @function
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     * @throws {Error} if triangle is collinear or singular
     */
    this.barycentric = (function () {

        // explanation: http://www.blackpawn.com/texts/pointinpoly/default.html

        var v0 = M.makeVector3();
        var v1 = M.makeVector3();
        var v2 = M.makeVector3();

        return function (point, result) {

            var out = result || M.makeVector3(),
                a = this.a, b = this.b, c = this.c,
                d00, d01, d02, d11, d12, denom, invDenom, u, v;

            v0.subVectors(c, a);
            v1.subVectors(b, a);
            v2.subVectors(point, a);

            d00 = v0.dot(v0);
            d01 = v0.dot(v1);
            d02 = v0.dot(v2);
            d11 = v1.dot(v1);
            d12 = v1.dot(v2);

            denom = d00 * d11 - d01 * d01;

            if (denom === 0.0) {
                throw new Error("can't compute barycentric coordinates - " +
                    "triangle is collinear or singular");
            }
            invDenom = 1.0 / denom;

            u = (d11 * d02 - d01 * d12) * invDenom;
            v = (d00 * d12 - d01 * d02) * invDenom;

            return out.set(1.0 - u - v, v, u);
        };
    }());

    /**
     * Checks for strict equality of this triangle and another triangle.
     *
     * @param {B.Math.Triangle} triangle
     * @returns {boolean}
     */
    this.equal = function (triangle) {

        return triangle.a.equal(this.a) &&
            triangle.b.equal(this.b) &&
            triangle.c.equal(this.c);
    };
};

/**
 * Represents a triangle.
 *
 * To create the object use [B.Math.makeTriangle()]{@link B.Math.makeTriangle}.
 *
 * @class
 * @this B.Math.Triangle
 */
B.Math.Triangle = function (a, b, c) {

    var V3 = B.Math.Vector3;

    /**
     * The first point.
     *
     * @type {B.Math.Vector3}
     */
    this.a = a || V3.ZERO.clone();

    /**
     * The second point.
     *
     * @type {B.Math.Vector3}
     */
    this.b = b || V3.ZERO.clone();

    /**
     * The third point.
     *
     * @type {B.Math.Vector3}
     */
    this.c = c || V3.ZERO.clone();
};

B.Math.Triangle.prototype = new B.Math.TriangleProto();
