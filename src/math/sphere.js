
/**
 * @ignore
 * @this B.Math.Sphere
 */
B.Math.SphereProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.SPHERE;
    };

    /**
     * Clones this sphere to a new sphere.
     *
     * @returns {B.Math.Sphere} this
     */
    this.clone = function () {

        return M.makeSphere(this.center, this.radius);
    };

    /**
     * Copies a given sphere into this sphere.
     *
     * @param {B.Math.Sphere} sphere
     * @returns {B.Math.Sphere} this
     */
    this.copy = function (sphere) {

        this.center.copy(sphere.center);
        this.radius = sphere.radius;

        return this;
    };

    /**
     * Sets this sphere from a center and a radius.
     *
     * @param {B.Math.Vector3} center
     * @param {number} radius
     * @returns {B.Math.Sphere} this
     */
    this.set = function (center, radius) {

        this.center.copy(center);
        this.radius = radius;

        return this;
    };

    /**
     * Sets this shere from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.center.fromArray(array, offset);
        this.radius = array[offset];

        return offset + 1;
    };

    /**
     * Sets this sphere to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.center.toArray(array, offset);
        array[offset] = this.radius;

        return offset + 1;
    };

    /**
     * Sets this sphere from an array of points.
     *
     * @function
     * @param {Array<B.Math.Vector3>} points
     * @returns {B.Math.Sphere} this
     */
    this.fromPoints = (function () {

        var min = Math.min, max = Math.max,
            vMin = M.makeVector3(),
            vMax = M.makeVector3();

        return function (points) {

            var p, i, l = points.length;

            if (l > 0) {

                vMin.copy(M.Vector3.INF);
                vMax.copy(M.Vector3.N_INF);

                for (i = 0; i < l; i += 1) {

                    p = points[i];

                    vMax.x = max(vMax.x, p.x);
                    vMax.y = max(vMax.y, p.y);
                    vMax.z = max(vMax.z, p.z);

                    vMin.x = min(vMin.x, p.x);
                    vMin.y = min(vMin.y, p.y);
                    vMin.z = min(vMin.z, p.z);
                }

                this.center.copy(vMax).sub(vMin).mul(0.5);
                this.radius = this.center.length();
                this.center.add(vMin);
            }
            return this;
        };
    }());

    /**
     * Sets this sphere from an axis-aligned box.
     *
     * @param {B.Math.AABox} aabox
     * @returns {B.Math.Sphere} this
     */
    this.fromAABox = function (aabox) {

        this.radius = aabox.size(this.center).length() * 0.5;
        aabox.center(this.center);

        return this;
    };

    /**
     * Resets this sphere to the initial state.
     *
     * @returns {B.Math.Sphere} this
     */
    this.reset = function () {

        this.center.copy(M.Vector3.ZERO);
        this.radius = 0.0;

        return this;
    };

    /**
     * Check this sphere for zero volume.
     *
     * @returns {boolean}
     */
    this.empty = function () {

        return (this.radius <= 0.0);
    };

    /**
     * Translates this sphere by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Sphere} this
     */
    this.translate = function (offset) {

        this.center.add(offset);

        return this;
    };

    /**
     * Transforms this sphere by a 4x4 matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Sphere} this
     */
    this.transform = (function () {

        var v = M.makeVector3();

        return function (matrix) {

            this.center.transform(matrix);

            this.radius *= Math.max(Math.max(
                matrix.getAxisX(v).length(),
                matrix.getAxisY(v).length()),
                matrix.getAxisZ(v).length());

            return this;
        };
    }());

    /**
     * Merges this sphere with an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Segment | B.Math.Triangle | B.Math.AABox
     *  | B.Math.Sphere} object
     * @returns {B.Math.Sphere} this
     * @throws {Error} if the object argument has unsupported type
     */
    this.merge = (function () {

        var calls = [],

            v0 = M.makeVector3(),
            v1 = M.makeVector3();

        calls[T.POINT] = function (point) {

            var d = v0.copy(point).sub(this.center).length();

            if (d > this.radius) {
                this.center.add(v0.mul(0.5));
                this.radius += (d * 0.5);
            }
        };

        calls[T.SEGMENT] = function (segment) {

            var c = this.center, r = this.radius;

            this.fromPoints([
                v0.copy(c).add(r),
                v1.copy(c).sub(r),
                segment.start,
                segment.end
            ]);
        };

        calls[T.TRIANGLE] = function (triangle) {

            var c = this.center, r = this.radius;

            this.fromPoints([
                v0.copy(c).add(r),
                v1.copy(c).sub(r),
                triangle.a,
                triangle.b,
                triangle.c
            ]);
        };

        calls[T.AABOX] = (function () {

            var points = [];

            return function (aabox) {

                var c = this.center, r = this.radius;

                aabox.cornerPoints(points);

                points.push(v0.copy(c).add(r));
                points.push(v1.copy(c).sub(r));

                this.fromPoints(points);
            };
        }());

        calls[T.SPHERE] = (function () {

            var v = M.makeVector3(),
                p0 = M.makeVector3(),
                p1 = M.makeVector3();

            return function (sphere) {

                var c0 = this.center, c1 = sphere.center,
                    r0 = this.radius, r1 = sphere.radius,
                    d = v.copy(c1).sub(c0).length();

                if (d + r0 <= r1) {
                    this.copy(sphere);

                } else if (d + r1 > r0) {
                    v.mul(1.0 / d);

                    p0.copy(v).mul(r1).add(c1);
                    p1.copy(v).negate().mul(r0).add(c0);

                    c0.copy(p1).sub(p0).mul(0.5);
                    this.radius = c0.length();
                    c0.add(p0);
                }
            };
        }());

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            func.call(this, object);
            return this;
        };
    }());

    /**
     * Checks for strict equality of this sphere and another sphere.
     *
     * @param {B.Math.Sphere} sphere
     * @returns {boolean}
     */
    this.equal = function (sphere) {

        return sphere.center.equal(this.center) && (sphere.radius === this.radius);
    };
};

/**
 * Represents a sphere.
 *
 * To create the object use [B.Math.makeSphere()]{@link B.Math.makeSphere}.
 *
 * @class
 * @this B.Math.Sphere
 */
B.Math.Sphere = function (center, radius) {

    /**
     * Center point of the sphere.
     *
     * @type {B.Math.Vector3}
     */
    this.center = center || B.Math.Vector3.ZERO.clone();

    /**
     * Radius of the sphere.
     *
     * @type {number}
     */
    this.radius = radius || 0.0;
};

B.Math.Sphere.prototype = new B.Math.SphereProto();
