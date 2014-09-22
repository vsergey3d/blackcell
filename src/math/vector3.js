
/**
 * @ignore
 * @this B.Math.Vector3
 */
B.Math.Vector3Proto = function () {

    var M = B.Math,
        T = M.Type,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    this._type = function () {

        return T.POINT;
    };

    /**
     * Clones this vector to a new vector.
     *
     * @returns {B.Math.Vector3} this
     */
    this.clone = function () {

        return M.makeVector3(this.x, this.y, this.z);
    };

    /**
     * Copies a given vector into this vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.copy = function (v) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;
    };

    /**
     * Sets this vector from separated components.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Vector3} this
     */
    this.set = function (x, y, z) {

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this.x;
        case 1:
            return this.y;
        case 2:
            return this.z;
        default:
            throw new Error("Vector3 index is out of range");
        }
    };

    /**
     * Sets this vector from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];

        return offset + 3;
    };

    /**
     * Sets this vector to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;

        return offset + 3;
    };

    /**
     * Calculates the length of this vector.
     *
     * @returns {number} length
     */
    this.length = function () {

        var x = this.x, y = this.y, z = this.z;

        return Math.sqrt(x * x + y * y + z * z);
    };

    /**
     * Calculates the squared length of this vector.
     *
     * @returns {number} squared length
     */
    this.lengthSq = function () {

        var x = this.x, y = this.y, z = this.z;

        return x * x + y * y + z * z;
    };

    /**
     * Normalizes this vector.
     *
     * @returns {B.Math.Vector3} this
     */
    this.normalize = function () {

        var sl = this.lengthSq();

        if (sl > 0 && abs(1.0 - sl) > EPSILON) {
            this.mul(1.0 / sqrt(sl));
        }
        return this;
    };

    /**
     * Inverts this vector.
     *
     * @returns {B.Math.Vector3} this
     */
    this.negate = function () {

        this.x *= -1.0;
        this.y *= -1.0;
        this.z *= -1.0;

        return this;
    };

    /**
     * Clamps components of this vector.
     *
     * @param {number} [minVal=0.0]
     * @param {number} [maxVal=1.0]
     * @returns {B.Math.Vector3} this
     */
    this.clamp = function (minVal, maxVal) {

        minVal = minVal || 0.0;
        maxVal = maxVal || 1.0;

        this.x = max(min(this.x, maxVal), minVal);
        this.y = max(min(this.y, maxVal), minVal);
        this.z = max(min(this.z, maxVal), minVal);

        return this;
    };

    /**
     * Adds a vector or a scalar to this vector.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.x += v;
            this.y += v;
            this.z += v;
        }
        else {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    };

    /**
     * Adds two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.addVectors = function (a, b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;
    };

    /**
     * Subtracts a vector or a scalar from this vector.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.x -= v;
            this.y -= v;
            this.z -= v;
        }
        else {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
        return this;
    };

    /**
     * Subtracts two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.subVectors = function (a, b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;
    };

    /**
     * Multiplies this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.x *= v;
            this.y *= v;
            this.z *= v;
        }
        else {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
        }
        return this;
    };

    /**
     * Multiplies two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.mulVectors = function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;
    };

    /**
     * Divides this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.div = function (v) {

        if (typeof v === "number") {
            this.x /= v;
            this.y /= v;
            this.z /= v;
        } else {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
        }
        return this;
    };

    /**
     * Divides two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.divVectors = function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;
        this.z = a.z / b.z;

        return this;
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} dot product
     */
    this.dot = function (v) {

        return this.x * v.x + this.y * v.y + this.z * v.z;
    };

    /**
     * Sets this vector to the cross product of itself and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.cross = function (v) {

        var ax = this.x, bx = v.x,
            ay = this.y, by = v.y,
            az = this.z, bz = v.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    };

    /**
     * Calculates the cross product of two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.crossVectors = function (a, b) {

        var ax = a.x, bx = b.x,
            ay = a.y, by = b.y,
            az = a.z, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    };

    /**
     * Reflects this vector by a normal vector.
     *
     * @function
     * @param {B.Math.Vector3} normal
     * @returns {B.Math.Vector3} this
     */
    this.reflect = (function () {

        var n = null;

        return function (normal) {

            var x = this.x, y = this.y, z = this.z, dot;

            n = (n || M.makeVector3()).copy(normal).normalize();

            dot = x * n.x + y * n.y + z * n.z;

            this.x = x - 2.0 * n.x * dot;
            this.y = y - 2.0 * n.y * dot;
            this.z = z - 2.0 * n.z * dot;

            return this;
        };
    }());

    /**
     * Transforms this vector by a 3x3 matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Vector3} this
     */
    this.transform3 = function (matrix) {

        var m = matrix.m,
            x = this.x, y = this.y, z = this.z;

        this.x = m[0] * x + m[3] * y + m[6] * z;
        this.y = m[1] * x + m[4] * y + m[7] * z;
        this.z = m[2] * x + m[5] * y + m[8] * z;

        return this;
    };

    /**
     * Transforms this vector by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @param {number} [w=1.0] additional vector's component
     * @returns {B.Math.Vector3} this
     */
    this.transform4 = function (matrix, w) {

        var m = matrix.m,
            x = this.x, y = this.y, z = this.z,
            tx = m[12], ty = m[13], tz = m[14];

        if (w !== 1.0 && w !== undefined) {
            tx *= w;
            ty *= w;
            tz *= w;
        }
        this.x = m[0] * x + m[4] * y + m[8] * z + tx;
        this.y = m[1] * x + m[5] * y + m[9] * z + ty;
        this.z = m[2] * x + m[6] * y + m[10] * z + tz;

        return this;
    };

    /**
     * Transforms this vector by any matrix.
     *
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @param {number} [w=1.0] additional vector's component
     * @returns {B.Math.Vector3} this
     */
    this.transform = function (matrix, w) {

        if (matrix instanceof B.Math.Matrix3) {
            return this.transform3(matrix);
        } else {
            return this.transform4(matrix, w);
        }
    };

    /**
     * Rotates this vector by a quaternion or an Euler angles object.
     *
     * @function
     * @param {B.Math.Quaternion | B.Math.Angles} object
     * @returns {B.Math.Vector3} this
     */
    this.rotate = (function () {

        var
            byQuaternion = function (v, q) {

                var vx = v.x, vy = v.y, vz = v.z,
                    qw = q._w, qx = q._x, qy = q._y, qz = q._z,

                    w = -qx * vx - qy * vy - qz * vz,
                    x =  qw * vx + qy * vz - qz * vy,
                    y =  qw * vy + qz * vx - qx * vz,
                    z =  qw * vz + qx * vy - qy * vx;

                v.x = x * qw - w * qx - y * qz + z * qy;
                v.y = y * qw - w * qy - z * qx + x * qz;
                v.z = z * qw - w * qz - x * qy + y * qx;
            },

            byAngles = (function () {

                var q = null;

                return function (v, angles) {

                    q = q || M.makeQuaternion();
                    byQuaternion(v, q.fromAngles(angles));
                };
            }());

        return function (object) {

            if (object instanceof B.Math.Quaternion) {
                byQuaternion(this, object);
            } else {
                byAngles(this, object);
            }
            return this;
        };
    }());

    /**
     * Calculates the angle in radians between this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} angle
     */
    this.angleTo = function (v) {

        var cosAngle = this.dot(v) / (this.length() * v.length());

        return Math.acos(min(max(cosAngle, -1.0), 1.0));
    };

    /**
     * Calculates the distance between this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} distance
     */
    this.distanceTo = function (v) {

        return Math.sqrt(this.distanceToSq(v));
    };

    /**
     * Calculates squared distance between this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} squared distance
     */
    this.distanceToSq = function (v) {

        var x = this.x - v.x,
            y = this.y - v.y,
            z = this.z - v.z;

        return x * x + y * y + z * z;
    };

    /**
     * Checks for strict equality of this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.x, this.x) && equal(v.y, this.y) && equal(v.z, this.z);
    };
};

/**
 * Represents a 3D vector / point.
 *
 * To create the object use [B.Math.makeVector3()]{@link B.Math.makeVector3}.
 *
 * @class
 * @this B.Math.Vector3
 */
B.Math.Vector3 = function (x, y, z) {

    /**
     * X component.
     *
     * @type {number}
     */
    this.x = x || 0.0;

    /**
     * Y component.
     *
     * @type {number}
     */
    this.y = y || 0.0;

    /**
     * Z component.
     *
     * @type {number}
     */
    this.z = z || 0.0;
};

B.Math.Vector3.prototype = new B.Math.Vector3Proto();

/**
 * Zero vector.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 0.0, z: 0.0}
 */
B.Math.Vector3.ZERO = B.Math.makeVector3(0.0, 0.0, 0.0);

/**
 * Positive infinity point.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: Infinity, y: Infinity, z: Infinity}
 */
B.Math.Vector3.INF = B.Math.makeVector3(Infinity, Infinity, Infinity);

/**
 * Negative infinity point.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: -Infinity, y: -Infinity, z: -Infinity}
 */
B.Math.Vector3.N_INF = B.Math.makeVector3(-Infinity, -Infinity, -Infinity);

/**
 * Positive direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 1.0, y: 0.0, z: 0.0}
 */
B.Math.Vector3.X = B.Math.makeVector3(1.0, 0.0, 0.0);

/**
 * Positive direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 1.0, z: 0.0}
 */
B.Math.Vector3.Y = B.Math.makeVector3(0.0, 1.0, 0.0);

/**
 * Positive direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 0.0, z: 1.0}
 */
B.Math.Vector3.Z = B.Math.makeVector3(0.0, 0.0, 1.0);

/**
 * Negative direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: -1.0, y: 0.0, z: 0.0}
 */
B.Math.Vector3.N_X = B.Math.makeVector3(-1.0, 0.0, 0.0);

/**
 * Negative direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: -1.0, z: 0.0}
 */
B.Math.Vector3.N_Y = B.Math.makeVector3(0.0, -1.0, 0.0);

/**
 * Negative direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 0.0, z: -1.0}
 */
B.Math.Vector3.N_Z = B.Math.makeVector3(0.0, 0.0, -1.0);
