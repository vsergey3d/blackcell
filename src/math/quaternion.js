
/**
 * @ignore
 * @this B.Math.Quaternion
 */
B.Math.QuaternionProto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        equal = M.equal,
        cos = Math.cos,
        sin = Math.sin,
        atan2 = Math.atan2,
        sqrt = Math.sqrt,
        abs = Math.abs;

    /**
     * Clones this quaternion to a new quaternion object.
     *
     * @returns {B.Math.Quaternion} this
     */
    this.clone = function () {

        return M.makeQuaternion(this._w, this._x, this._y, this._z);
    };

    /**
     * Copies a given quaternion object into this quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Quaternion} this
     */
    this.copy = function (q) {

        this._w = q._w;
        this._x = q._x;
        this._y = q._y;
        this._z = q._z;

        return this;
    };

    /**
     * Sets all elements and performs normalization.
     *
     * @param {number} w
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Quaternion} this
     */
    this.set = function (w, x, y, z) {

        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;

        return this._normalize();
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
            return this._w;
        case 1:
            return this._x;
        case 2:
            return this._y;
        case 3:
            return this._z;
        default:
            throw new Error("Quaternion index is out of range");
        }
    };

    /**
     * Sets this quaternion from a part of array and performs normalization.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this._w = array[offset];
        this._x = array[offset + 1];
        this._y = array[offset + 2];
        this._z = array[offset + 3];
        this._normalize();

        return offset + 4;
    };

    /**
     * Sets this quaternion to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this._w;
        array[offset + 1] = this._x;
        array[offset + 2] = this._y;
        array[offset + 3] = this._z;

        return offset + 4;
    };

    /**
     * Sets this quaternion from an axis vector and an angle.
     *
     * @function
     * @param {B.Math.Vector3} axis
     * @param {number} angle
     * @returns {B.Math.Quaternion} this
     */
    this.fromAxisAngle = (function () {

        var v = M.makeVector3();

        return function (axis, angle) {

            var ha = angle * 0.5,
                hs = sin(ha);

            v.copy(axis).normalize();

            return this.set(cos(ha), v.x * hs, v.y * hs, v.z * hs);
        };
    }());

    /**
     * Sets this quaternion from any rotation matrix.
     *
     * @function
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Math.Quaternion} this
     */
    this.fromRotationMatrix = (function () {

        var mx3 = M.makeMatrix3();

        return function (matrix) {

            var m = (matrix instanceof M.Matrix4) ?
                    matrix.getMatrix3(mx3).m : matrix.m,

                m00 = m[0], m01 = m[3], m02 = m[6],
                m10 = m[1], m11 = m[4], m12 = m[7],
                m20 = m[2], m21 = m[5], m22 = m[8],

                tw = m00 + m11 + m22,
                tx = m00 - m11 - m22,
                ty = m11 - m00 - m22,
                tz = m22 - m00 - m11,

                max = tw, i = 0, s;

            if (tx > max) {
                max = tx;
                i = 1;
            } else if (ty > max) {
                max = ty;
                i = 2;
            } else if (tz > max) {
                max = tz;
                i = 3;
            }
            max = sqrt(1.0 + max) * 0.5;
            s = 0.25 / max;

            switch (i) {
            case 0:
                return this.set(max, (m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s);
            case 1:
                return this.set((m21 - m12) * s, max, (m01 + m10) * s, (m02 + m20) * s);
            case 2:
                return this.set((m02 - m20) * s, (m01 + m10) * s, max, (m12 + m21) * s);
            case 3:
                return this.set((m10 - m01) * s, (m02 + m20) * s, (m12 + m21) * s, max);
            }
        };
    }());

    /**
     * Sets this quaternion from Euler angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Quaternion} this
     */
    this.fromAngles = function (angles) {

        var hx = angles.pitch() * 0.5,
            hy = angles.yaw() * 0.5,
            hz = angles.roll() * 0.5,

            cx = cos(hx), cy = cos(hy), cz = cos(hz),
            sx = sin(hx), sy = sin(hy), sz = sin(hz);

        return this.set(
            cy * cx * cz - sy * sx * sz,
            cy * sx * cz + sy * cx * sz,
            sy * cx * cz - cy * sx * sz,
            cy * cx * sz - sy * sx * cz
        ); 
    };

    /**
     * Returns the axis vector (or zero-vector for identity quaternion).
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector.
     * @returns {B.Math.Vector3}
     */
    this.axis = function (result) {

        var w = this._w,
            s = sqrt(1.0 - w * w),
            v = result || M.makeVector3();

        if (s < EPSILON) {
            return v.set(0.0, 0.0, 0.0);
        }
        return v.set(this._x, this._y, this._z).mul(1.0 / s).normalize();
    };

    /**
     * Returns the angle.
     *
     * @returns {number}
     */
    this.angle = function () {

        var w = this._w, x = this._x, y = this._y, z = this._z;

        return 2.0 * atan2(sqrt(x * x + y * y + z * z), abs(w));
    };

    /**
     * Multiplies two given quaternions and sets the result to this.
     *
     * @param {B.Math.Quaternion} a
     * @param {B.Math.Quaternion} b
     * @returns {B.Math.Quaternion} this
     */
    this.mulQuaternions = function (a, b) {

        var aw = a._w, ax = a._x, ay = a._y, az = a._z,
            bw = b._w, bx = b._x, by = b._y, bz = b._z;

        this._w = bw * aw - bx * ax - by * ay - bz * az;
        this._x = bx * aw + bw * ax + by * az - bz * ay;
        this._y = by * aw + bw * ay + bz * ax - bx * az;
        this._z = bz * aw + bw * az + bx * ay - by * ax;

        return this;
    };

    /**
     * Multiplies this quaternion by a given quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Quaternion} this
     */
    this.mul = function (q) {

        return this.mulQuaternions(this, q);
    };

    /**
     * Calculates the dot product of this quaternion and another quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {number} this
     */
    this.dot = function (q) {

        var aw = this._w, ax = this._x, ay = this._y, az = this._z,
            bw = q._w, bx = q._x, by = q._y, bz = q._z;

        return aw * bw + ax * bx + ay * by + az * bz;
    };

    /**
     * Inverts this quaternion.
     *
     * @returns {B.Math.Quaternion} this
     */
    this.invert = function () {

        this._x *= -1.0;
        this._y *= -1.0;
        this._z *= -1.0;

        return this;
    };

    /**
     * Spherically interpolates between this quaternion and another quaternion by t.
     *
     * @param {B.Math.Quaternion} q
     * @param {number} t [0.0, 1.0]
     * @param {B.Math.Quaternion} [result] omit if you want to return newly created quaternion.
     * @returns {B.Math.Quaternion} this
     */
    this.slerp = function (q, t, result) {

        var aw = this._w, ax = this._x, ay = this._y, az = this._z,
            bw = q._w, bx = q._x, by = q._y, bz = q._z, t0, t1, ha,
            sinHA, cosHA = aw * bw + ax * bx + ay * by + az * bz;

        result = result || M.makeQuaternion();

        if (cosHA < EPSILON) {
            bw = -bw;
            bx = -bx;
            by = -by;
            bz = -bz;
            cosHA = -cosHA;
        }
        if (cosHA > (1.0 - EPSILON)) {
            return result.set(aw, ax, ay, az);
        }

        sinHA = sqrt(1.0 - cosHA * cosHA);
        ha = atan2(sinHA, cosHA);

        t0 = sin((1.0 - t) * ha) / sinHA;
        t1 = sin(t * ha) / sinHA;

        return result.set(
            aw * t0 + bw * t1,
            ax * t0 + bx * t1,
            ay * t0 + by * t1,
            az * t0 + bz * t1
        );
    };

    /**
     * Checks for strict equality of this quaternion and another quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {boolean}
     */
    this.equal = function (q) {

        return equal(q._w, this._w) &&
            equal(q._x, this._x) &&
            equal(q._y, this._y) &&
            equal(q._z, this._z);
    };

    this._normalize = function () {

        var w = this._w, x = this._x, y = this._y, z = this._z,
            sl = w * w + x * x + y * y + z * z;

        if (sl < EPSILON) {
            this._w = 1.0;
            this._x = 0.0;
            this._y = 0.0;
            this._z = 0.0;

        } else {
            sl = 1.0 / sqrt(sl);
            this._w *= sl;
            this._x *= sl;
            this._y *= sl;
            this._z *= sl;
        }
        return this;
    };
};

/**
 * Represents a unit quaternion.
 *
 * To create the object use [B.Math.makeQuaternion()]{@link B.Math.makeQuaternion}.
 *
 * *Note: the order of transformations coincides with the order in which the quaternions are
 *  multiplied (from left to right).*
 *
 * @class
 * @this B.Math.Quaternion
 */
B.Math.Quaternion = function (w, x, y, z) {

    this._w = (w !== undefined) ? w : 1.0;
    this._x = x || 0.0;
    this._y = y || 0.0;
    this._z = z || 0.0;

    this._normalize();
};

B.Math.Quaternion.prototype = new B.Math.QuaternionProto();

/**
 * Identity quaternion.
 *
 * @constant
 * @type {B.Math.Quaternion}
 * @default {w: 1.0, x: 0.0, y: 0.0, z: 0.0}
 */
B.Math.Quaternion.IDENTITY = B.Math.makeQuaternion();
