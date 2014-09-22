
/**
 * @ignore
 * @this B.Math.AABox
 */
B.Math.AABoxProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.AABOX;
    };

    /**
     * Clones this box to a new box.
     *
     * @returns {B.Math.AABox} this
     */
    this.clone = function () {

        return M.makeAABox(this.min, this.max);
    };

    /**
     * Copies a given box into this box.
     *
     * @param {B.Math.AABox} aabox
     * @returns {B.Math.AABox} this
     */
    this.copy = function (aabox) {

        this.min.copy(aabox.min);
        this.max.copy(aabox.max);

        return this;
    };

    /**
     * Sets this box from minimum and maximum points.
     *
     * @param {B.Math.Vector3} min
     * @param {B.Math.Vector3} max
     * @returns {B.Math.AABox} this
     */
    this.set = function (min, max) {

        this.min.copy(min);
        this.max.copy(max);

        return this;
    };

    /**
     * Sets this box from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.min.fromArray(array, offset);
        offset = this.max.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this box to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.min.toArray(array, offset);
        offset = this.max.toArray(array, offset);

        return offset;
    };

    /**
     * Sets this box from a center and a size.
     *
     * @function
     * @param {B.Math.Vector3} center
     * @param {B.Math.Vector3} size
     * @returns {B.Math.AABox} this
     */
    this.fromCenterSize = (function () {

        var halfSize = M.makeVector3();

        return function (center, size) {

            halfSize.copy(size).mul(0.5);

            this.min.copy(center).sub(halfSize);
            this.max.copy(center).add(halfSize);

            return this;
        };
    }());

    /**
     * Sets this box from an array of points.
     *
     * @param {Array<B.Math.Vector3>} points
     * @returns {B.Math.AABox} this
     */
    this.fromPoints = function (points) {

        var i, l;

        this.reset();

        for (i = 0, l = points.length; i < l; i += 1) {
            this.merge(points[i]);
        }
        return this;
    };

    /**
     * Sets this box from a sphere.
     *
     * @param {B.Math.Sphere} sphere
     * @returns {B.Math.AABox} this
     */
    this.fromSphere = function (sphere) {

        var c = sphere.center, r = sphere.radius;

        this.min.copy(c).sub(r);
        this.max.copy(c).add(r);

        return this;
    };

    /**
     * Resets this box to the initial state.
     *
     * @returns {B.Math.AABox} this
     */
    this.reset = function () {

        var V3 = M.Vector3;

        this.min.copy(V3.INF);
        this.max.copy(V3.N_INF);

        return this;
    };

    /**
     * Check this box for zero volume.
     *
     * @returns {boolean}
     */
    this.empty = function () {

        var min = this.min, max = this.max;

        return (max.x <= min.x) || (max.y <= min.y) || (max.z <= min.z);
    };

    /**
     * Returns the center of this box.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.center = function (result) {

        var v = result || M.makeVector3();

        return v.copy(this.min).add(this.max).mul(0.5);
    };

    /**
     * Returns the size of this box.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.size = function (result) {

        var v = result || M.makeVector3();

        return v.copy(this.max).sub(this.min);
    };

    /**
     * Returns corner points of this box.
     *
     * @function
     * @param {Array<B.Math.Vector3>} [result] omit if you want to return newly created array
     * @returns {Array<B.Math.Vector3>}
     */
    this.cornerPoints = (function () {

        var
            assign = function (array, index, x, y, z) {

                if (!array[index]) {
                    array[index] = M.makeVector3();
                }
                array[index].set(x, y, z);
                return index + 1;
            };

        return function (result) {

            var min = this.min, max = this.max,
                minX = min.x, minY = min.y, minZ = min.z,
                maxX = max.x, maxY = max.y, maxZ = max.z,
                i = 0;

            result = result || [];

            i = assign(result, i, minX, minY, minZ);
            i = assign(result, i, minX, minY, maxZ);
            i = assign(result, i, minX, maxY, minZ);
            i = assign(result, i, minX, maxY, maxZ);
            i = assign(result, i, maxX, minY, minZ);
            i = assign(result, i, maxX, minY, maxZ);
            i = assign(result, i, maxX, maxY, minZ);
            i = assign(result, i, maxX, maxY, maxZ);

            result.length = i;

            return result;
        };
    }());

    /**
     * Translates this box by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.AABox} this
     */
    this.translate = function (offset) {

        this.min.add(offset);
        this.max.add(offset);

        return this;
    };

    /**
     * Transforms this box by a 4x4 matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.AABox} this
     */
    this.transform = (function () {

        var points = [];

        return function (matrix) {

            var i, l;

            this.cornerPoints(points);

            for (i = 0, l = points.length; i < l; i += 1) {
                points[i].transform(matrix);
            }
            return this.fromPoints(points);
        };
    }());

    /**
     * Merges this box with an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Segment | B.Math.Triangle | B.Math.AABox
     *  | B.Math.Sphere} object
     * @returns {B.Math.AABox} this
     * @throws {Error} if the object argument has unsupported type.
     */
    this.merge = (function () {

        var calls = [],

            mergePoint = function (aabox, point) {

                var min = aabox.min, max = aabox.max,
                    px = point.x, py = point.y, pz = point.z;

                if (min.x > px) {
                    min.x = px;
                }
                if (min.y > py) {
                    min.y = py;
                }
                if (min.z > pz) {
                    min.z = pz;
                }
                if (max.x < px) {
                    max.x = px;
                }
                if (max.y < py) {
                    max.y = py;
                }
                if (max.z < pz) {
                    max.z = pz;
                }
            };

        calls[T.POINT] = function (point) {

            mergePoint(this, point);
        };

        calls[T.SEGMENT] = function (segment) {

            mergePoint(this, segment.start);
            mergePoint(this, segment.end);
        };

        calls[T.TRIANGLE] = function (triangle) {

            mergePoint(this, triangle.a);
            mergePoint(this, triangle.b);
            mergePoint(this, triangle.c);
        };

        calls[T.AABOX] = function (aabox) {

            mergePoint(this, aabox.min);
            mergePoint(this, aabox.max);
        };

        calls[T.SPHERE] = (function () {

            var p = M.makeVector3();

            return function (sphere) {

                var c = sphere.center, r = sphere.radius;

                mergePoint(this, p.copy(c).add(r));
                mergePoint(this, p.copy(c).sub(r));
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
     * Checks for strict equality of this box and another box.
     *
     * @param {B.Math.AABox} aabox
     * @returns {boolean}
     */
    this.equal = function (aabox) {

        return aabox.min.equal(this.min) && aabox.max.equal(this.max);
    };
};

/**
 * Represents an axis-aligned box.
 *
 * To create the object use [B.Math.makeAABox()]{@link B.Math.makeAABox}.
 *
 * @class
 * @this B.Math.AABox
 */
B.Math.AABox = function (min, max) {

    var V3 = B.Math.Vector3;

    /**
     * Minimum point.
     *
     * @type {B.Math.Vector3}
     */
    this.min = min ? min.clone() : V3.INF.clone();

    /**
     * Maximum point.
     *
     * @type {B.Math.Vector3}
     */
    this.max = max ? max.clone() : V3.N_INF.clone();
};

B.Math.AABox.prototype = new B.Math.AABoxProto();
