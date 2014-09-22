
/**
 * @ignore
 * @this B.Math.Plane
 */
B.Math.PlaneProto = function () {

    var M = B.Math,
        T = M.Type,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    this._type = function () {

        return T.PLANE;
    };

    /**
     * Clones this plane to a new plane.
     *
     * @returns {B.Math.Plane} this
     */
    this.clone = function () {

        return M.makePlane(this.normal.clone(), this.distance);
    };

    /**
     * Copies a given plane into this plane.
     *
     * @param {B.Math.Plane} plane
     * @returns {B.Math.Plane} this
     */
    this.copy = function (plane) {

        this.normal.copy(plane.normal);
        this.distance = plane.distance;

        return this;
    };

    /**
     * Sets this plane from a normal and a distance.
     *
     * @param {B.Math.Vector3} normal
     * @param {number} distance
     * @returns {B.Math.Plane} this
     */
    this.set = function (normal, distance) {

        this.normal.copy(normal);
        this.distance = distance;

        return this;
    };

    /**
     * Sets this plane from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.normal.fromArray(array, offset);
        this.distance = array[offset];

        return offset + 1;
    };

    /**
     * Sets this plane to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.normal.toArray(array, offset);
        array[offset] = this.distance;

        return offset + 1;
    };

    /**
     * Sets this plane from a normal and a point.
     *
     * @param {B.Math.Vector3} normal
     * @param {B.Math.Vector3} point
     * @returns {B.Math.Plane} this
     */
    this.fromNormalPoint = function (normal, point) {

        this.normal.copy(normal).normalize();
        this.distance = point.dot(this.normal);

        return this;
    };

    /**
     * Sets this plane from three coplanar points.
     *
     * @function
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @param {B.Math.Vector3} c
     * @returns {B.Math.Plane} this
     */
    this.fromCoplanarPoints = (function () {

        var v = M.makeVector3();

        return function (a, b, c) {

            this.normal.subVectors(c, b).cross(v.subVectors(a, b)).normalize();
            this.distance = a.dot(this.normal);

            return this;
        };
    }());

    /**
     * Translates this plane by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Plane} this
     */
    this.translate = function (offset) {

        this.distance += offset.dot(this.normal);
        return this;
    };

    /**
     * Transforms this plane by a 4x4 matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Plane} this
     */
    this.transform = (function () {

        var v = M.makeVector4(),
            mx = M.makeMatrix4();

        return function (matrix) {

            var n = this.normal;

            v.set(n.x, n.y, n.z, -this.distance);
            v.transform(mx.copy(matrix).invert().transpose());

            this.normal.set(v.x, v.y, v.z);
            this.distance = -v.w;

            return this;
        };
    }());

    /**
     * Normalizes this plane.
     *
     * @returns {B.Math.Plane} this
     */
    this.normalize = function () {

        var sl = this.normal.lengthSq();

        if (abs(1.0 - sl) > EPSILON) {
            sl = 1.0 / sqrt(sl);
            this.normal.mul(sl);
            this.distance *= sl;
        }
        return this;
    };

    /**
     * Negates this plane.
     *
     * @returns {B.Math.Plane} this
     */
    this.negate = function () {

        this.normal.negate();
        this.distance *= -1.0;

        return this;
    };

    /**
     * Projects a point to this plane.
     *
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} projected point
     */
    this.projectPoint = function (point, result) {

        var v = result || M.makeVector3();

        v.copy(this.normal).mul(this.normal.dot(point) - this.distance);
        return v.sub(point).negate();
    };

    /**
     * Calculates the shortest distance between this plane and an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Plane | B.Math.Ray | B.Math.Segment |
     *     B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @returns {number} distance
     * @throws {Error} if the object argument has unsupported type
     */
    this.distanceTo = (function () {

        var
            distanceToPoint = function (plane, point) {
                return plane.normal.dot(point) - plane.distance;
            },

            calls = [];

        calls[T.POINT] = distanceToPoint;

        calls[T.PLANE] = function (planeA, planeB) {

            var da = planeA.distance, db = planeB.distance,
                dot = planeA.normal.dot(planeB.normal);

            if(abs(1.0 - abs(dot)) > EPSILON) {
                return 0.0;
            }
            return (dot > 0.0) ? (db - da) : -(db + da);
        };

        calls[T.RAY] = function (plane, ray) {

            var d = distanceToPoint(plane, ray.origin), dotND;

            if (d !== 0.0) {
                dotND = plane.normal.dot(ray.direction);
                if (d * dotND < 0.0) {
                    return 0.0;
                }
            }
            return d;
        };

        calls[T.SEGMENT] = function (plane, segment) {

            var ds = distanceToPoint(plane, segment.start),
                de = distanceToPoint(plane, segment.end);

            if (ds * de <= 0.0) {
                return 0.0;
            }
            return (ds > 0.0) ? min(ds, de) : max(ds, de);
        };

        calls[T.TRIANGLE] = function (plane, triangle) {

            var da = plane.distanceTo(triangle.a),
                db = plane.distanceTo(triangle.b),
                dc = plane.distanceTo(triangle.c);

            if (da * db <= 0.0 || da * dc <= 0.0) {
                return 0.0;
            }
            return (da > 0.0) ? min(min(da, db), dc) : max(max(da, db), dc);
        };

        calls[T.AABOX] = (function () {

            var p0 = M.makeVector3(),
                p1 = M.makeVector3();

            return function (plane, aabox) {

                var d0, d1, n = plane.normal,
                    bmin = aabox.min, bmax = aabox.max;

                p0.x = (n.x > 0.0) ? bmin.x : bmax.x;
                p1.x = (n.x > 0.0) ? bmax.x : bmin.x;
                p0.y = (n.y > 0.0) ? bmin.y : bmax.y;
                p1.y = (n.y > 0.0) ? bmax.y : bmin.y;
                p0.z = (n.z > 0.0) ? bmin.z : bmax.z;
                p1.z = (n.z > 0.0) ? bmax.z : bmin.z;

                d0 = distanceToPoint(plane, p0);
                d1 = distanceToPoint(plane, p1);

                if (d0 * d1 <= 0.0) {
                    return 0.0;
                }
                return (d0 > 0.0) ? min(d0, d1) : max(d0, d1);
            };
        }());

        calls[T.SPHERE] = function (plane, sphere) {

            var d = distanceToPoint(plane, sphere.center),
                r = sphere.radius;

            if (abs(d) <= r) {
                return 0.0;
            }
            return (d > 0.0) ? (d - r) : (d + r);
        };

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            return func(this, object);
        };
    }());

    /**
     * Tests relation between this plane and an object.
     *
     * @param {B.Math.Vector3 | B.Math.Plane | B.Math.Ray | B.Math.Segment |
     *     B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @param {B.Math.Relation} relation
     * @returns {boolean}
     * @throws {Error} if the object argument has unsupported type.
     */
    this.test = function (object, relation) {

        return M.testRelationByDistance(this.distanceTo(object), relation);
    };

    /**
     * Checks for strict equality of this plane and another plane.
     *
     * @param {B.Math.Plane} plane
     * @returns {boolean}
     */
    this.equal = function (plane) {

        return plane.normal.equal(this.normal) && equal(plane.distance, this.distance);
    };
};

/**
 * Represents a plane.
 *
 * To create the object use [B.Math.makePlane()]{@link B.Math.makePlane}.
 *
 * @class
 * @this B.Math.Plane
 */
B.Math.Plane = function (normal, distance) {

    /**
     * Normal of the plane.
     *
     * @type {B.Math.Vector3}
     */
    this.normal = normal || B.Math.Vector3.Y.clone();

    /**
     * Distance to the plane along the normal.
     *
     * @type {number}
     */
    this.distance = distance || 0.0;
};

B.Math.Plane.prototype = new B.Math.PlaneProto();

/**
 * Positive direction along X-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.X}, distance: 0}
 */
B.Math.Plane.X = B.Math.makePlane(B.Math.Vector3.X);

/**
 * Positive direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.Y}, distance: 0}
 */
B.Math.Plane.Y = B.Math.makePlane(B.Math.Vector3.Y);

/**
 * Positive direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.Z}, distance: 0}
 */
B.Math.Plane.Z = B.Math.makePlane(B.Math.Vector3.Z);

/**
 * Negative direction along X-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.N_X}, distance: 0}
 */
B.Math.Plane.N_X = B.Math.makePlane(B.Math.Vector3.N_X);

/**
 * Negative direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.N_Y}, distance: 0}
 */
B.Math.Plane.N_Y = B.Math.makePlane(B.Math.Vector3.N_Y);

/**
 * Negative direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.N_Z}, distance: 0}
 */
B.Math.Plane.N_Z = B.Math.makePlane(B.Math.Vector3.N_Z);
