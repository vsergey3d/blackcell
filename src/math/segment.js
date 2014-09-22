
/**
 * @ignore
 * @this B.Math.Segment
 */
B.Math.SegmentProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.SEGMENT;
    };

    /**
     * Clones this segment to a new segment.
     *
     * @returns {B.Math.Segment} this
     */
    this.clone = function () {

        return M.makeSegment(this.start, this.end);
    };

    /**
     * Copies a given segment into this segment.
     *
     * @param {B.Math.Segment} segment
     * @returns {B.Math.Segment} this
     */
    this.copy = function (segment) {

        this.start.copy(segment.start);
        this.end.copy(segment.end);

        return this;
    };

    /**
     * Sets this segment from a start and a end points.
     *
     * @param {B.Math.Vector3} start
     * @param {B.Math.Vector3} end
     * @returns {B.Math.Segment} this
     */
    this.set = function (start, end) {

        this.start.copy(start);
        this.end.copy(end);

        return this;
    };

    /**
     * Sets this segment from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.start.fromArray(array, offset);
        offset = this.end.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this segment to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.start.toArray(array, offset);
        offset = this.end.toArray(array, offset);

        return offset;
    };

    /**
     * Translates this segment by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Segment} this
     */
    this.translate = function (offset) {

        this.start.add(offset);
        this.end.add(offset);

        return this;
    };

    /**
     * Transforms this segment by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Segment} this
     */
    this.transform = function (matrix) {

        this.start.transform(matrix);
        this.end.transform(matrix);

        return this;
    };

    /**
     * Gets the center point of this segment.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.center = function (result) {

        var v = result || M.makeVector3();

        return v.addVectors(this.start, this.end).mul(0.5);
    };

    /**
     * Gets the vector from start to end.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.delta = function (result) {

        var v = result || M.makeVector3();

        return v.subVectors(this.end, this.start);
    };

    /**
     * Gets the length of this segment.
     *
     * @returns {number}
     */
    this.length = function () {

        return this.start.distanceTo(this.end);
    };

    /**
     * Gets a point at this segment.
     *
     * @param {number} t [0, 1]
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} point
     */
    this.at = function (t, result) {

        var v = result || M.makeVector3();

        return this.delta(v).mul(t).add(this.start);
    };

    /**
     * Projects a point to this segment.
     *
     * @function
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} projected point
     */
    this.projectPoint = (function () {

        var v0 = M.makeVector3();

        return function (point, result) {

            var v1 = result || M.makeVector3(),
                start = this.start, end = this.end,
                l2 = v0.subVectors(end, start).dot(v0),
                dot = v1.subVectors(point, start).dot(v0);

            if (dot <= 0.0) {
                return v1.copy(start);
            }
            if (dot >= l2) {
                return v1.copy(end);
            }
            return v1.copy(v0).mul(dot / l2).add(start);
        };
    }());

    /**
     * Finds the point of intersection between this segment and an object.
     *
     * @function
     * @param {B.Math.Plane | B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @param {B.Math.Vector3} [point] point of intersection.
     * @returns {number | null} distance from start or null if no intersections.
     * @throws {Error} if the object argument has unsupported type
     */
    this.trace = (function () {

        var ray = M.makeRay();

        return function (object, point) {

            var t = ray.fromOriginTarget(this.start, this.end).trace(object);

            if (t !== null && t <= this.length()) {
                if (point) {
                    ray.at(t, point);
                }
                return t;
            }
            return null;
        };
    }());

    /**
     * Calculates the shortest distance between this segment and an object.
     *
     * @function
     * @param {B.Math.Vector3} object
     * @returns {number} distance
     * @throws {Error} if the object argument has unsupported type
     */
    this.distanceTo = (function () {

        var calls = [];

        calls[T.POINT] = (function () {

            var v = M.makeVector3();

            return function (segment, point) {

                return segment.projectPoint(point, v).distanceTo(point);
            };
        }());

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
     * Checks for strict equality of this segment and another segment.
     *
     * @param {B.Math.Segment} segment
     * @returns {boolean}
     */
    this.equal = function (segment) {

        return segment.start.equal(this.start) && segment.end.equal(this.end);
    };
};

/**
 * Represents a segment.
 *
 * To create the object use [B.Math.makeSegment()]{@link B.Math.makeSegment}.
 *
 * @class
 * @this B.Math.Segment
 */
B.Math.Segment = function (start, end) {

    var V3 = B.Math.Vector3;

    /**
     * Start of the segment.
     *
     * @type {B.Math.Vector3}
     */
    this.start = start || V3.ZERO.clone();

    /**
     * End of the segment.
     *
     * @type {B.Math.Vector3}
     */
    this.end = end || V3.ZERO.clone();
};

B.Math.Segment.prototype = new B.Math.SegmentProto();
