
/**
 * @ignore
 * @this B.Math.Angles
 */
B.Math.AnglesProto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        ONE_MINUS_EPSILON = 1.0 - EPSILON,

        equal = M.equal,
        min = Math.min,
        max = Math.max,
        abs = Math.abs,
        asin = Math.asin,
        atan2 = Math.atan2,

        clamp = function (v) {
            return min(max(v, -1.0), 1.0);
        };

    /**
     * Clones this angles to a new angles object.
     *
     * @returns {B.Math.Angles} this
     */
    this.clone = function () {

        return M.makeAngles(this._yaw, this._pitch, this._roll);
    };

    /**
     * Copies a given angles object into this angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Angles} this
     */
    this.copy = function (angles) {

        this._yaw = angles._yaw;
        this._pitch = angles._pitch;
        this._roll = angles._roll;

        return this;
    };

    /**
     * Sets all elements and performs canonization.
     *
     * @param {number} yaw
     * @param {number} pitch
     * @param {number} roll
     * @returns {B.Math.Angles} this
     */
    this.set = function (yaw, pitch, roll) {

        this._yaw = yaw;
        this._pitch = pitch;
        this._roll = roll;

        return this._canonize();
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
            return this._yaw;
        case 1:
            return this._pitch;
        case 2:
            return this._roll;
        default:
            throw new Error("Angles the index is out of range");
        }
    };

    /**
     * Sets yaw angle (rotation around global Y-axis) and performs canonization.
     * Range: [-PI, PI].
     *
     * @function B.Math.Angles#yaw
     * @param {number} angle
     * @returns {B.Math.Angles} this
     */
    /**
     * Gets yaw angle (rotation around global Y-axis).
     * Range: [-PI, PI].
     *
     * @function B.Math.Angles#yaw
     * @returns {number}
     */
    this.yaw = function (angle) {

        if (arguments.length === 0) {
            return this._yaw;
        }
        this._yaw = angle;
        return this._canonize();
    };

    /**
     * Sets pitch angle (rotation around local X-axis) and performs canonization.
     * Range: [-PI/2, PI/2].
     *
     * @function B.Math.Angles#pitch
     * @param {number} angle
     * @returns {B.Math.Angles} this
     */
    /**
     * Gets pitch angle (rotation around local X-axis).
     *
     * @function B.Math.Angles#pitch
     * @returns {number}
     */
    this.pitch = function (angle) {

        if (arguments.length === 0) {
            return this._pitch;
        }
        this._pitch = angle;
        return this._canonize();
    };

    /**
     * Sets roll angle (rotation around local Z-axis) and performs canonization.
     * Range: [-PI, PI].
     *
     * @function B.Math.Angles#roll
     * @param {number} angle
     * @returns {B.Math.Angles} this
     */
    /**
     * Gets roll angle (rotation around local Z-axis).
     *
     * @function B.Math.Angles#roll
     * @returns {number}
     */
    this.roll = function (angle) {

        if (arguments.length === 0) {
            return this._roll;
        }
        this._roll = angle;
        return this._canonize();
    };

    /**
     * Sets this angles from a part of array and performs canonization.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this._yaw = array[offset];
        this._pitch = array[offset + 1];
        this._roll = array[offset + 2];
        this._canonize();

        return offset + 3;
    };

    /**
     * Sets this angles to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this._yaw;
        array[offset + 1] = this._pitch;
        array[offset + 2] = this._roll;

        return offset + 3;
    };

    /**
     * Sets this angles from any rotation matrix.
     *
     * @function
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Math.Angles} this
     */
    this.fromRotationMatrix = (function () {

        var mx3 = M.makeMatrix3();

        return function (matrix) {

            // deriving angles from the Angles->Matrix3 conversion matrix

            var m = (matrix instanceof M.Matrix4) ?
                    matrix.getMatrix3(mx3).m : matrix.m,
                m7 = clamp(m[7]);

            this._pitch = asin(-m7);

            if (abs(m7) < ONE_MINUS_EPSILON) {
                this._yaw = atan2(m[6], m[8]);
                this._roll = atan2(m[1], m[4]);
            } else {
                this._yaw = atan2((m7 < 0.0) ? m[3] : -m[3], m[0]);
                this._roll = 0.0;
            }
            return this;
        };
    }());

    /**
     * Sets this angles from a quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Angles} this
     */
    this.fromQuaternion = function (q) {

        // deriving angles from the Angles->Matrix3 and Quaternion->Matrix3 conversion matrices

        var x = q._x, y = q._y, z = q._z, w = q._w,
            x2 = x * 2.0, y2 = y * 2.0, z2 = z * 2.0,
            m7 = clamp(y * z2 - w * x2);

        this._pitch = asin(-m7);

        if (abs(m7) < ONE_MINUS_EPSILON) {
            this._yaw = atan2(x * z2 + w * y2, 1.0 - x * x2 - y * y2);
            this._roll = atan2(x * y2 + w * z2, 1.0 - x * x2 - z * z2);
        } else {
            this._yaw = atan2((m7 < 0.0) ? (x * y2 - w * z2) : (w * z2 - x * y2),
                1.0 - y * y2 - z * z2);
            this._roll = 0.0;
        }
        return this;
    };

    /**
     * Checks for strict equality of this angles and another angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {boolean}
     */
    this.equal = function (angles) {

        return equal(angles._yaw, this._yaw) &&
            equal(angles._pitch, this._pitch) &&
            equal(angles._roll, this._roll);
    };

    this._canonize = (function () {

        var PI = Math.PI,
            HALF_PI = PI * 0.5,
            TWO_PI = PI * 2.0,
            ONE_OVER_TWO_PI = 1.0 / TWO_PI,

            floor = Math.floor,

            wrap = function (a) {

                if (a < -PI || a > PI) {
                    a += PI;
                    a -= floor(a * ONE_OVER_TWO_PI) * TWO_PI;
                    a -= PI;
                }
                return a;
            };

        return function () {

            var yaw = this._yaw, pitch = this._pitch, roll = this._roll;

            pitch = wrap(pitch);

            if (pitch < -HALF_PI) {
                pitch = -PI - pitch;
                yaw += PI;
                roll += PI;
            } else if (pitch > HALF_PI) {
                pitch = PI - pitch;
                yaw += PI;
                roll += PI;
            }
            if (abs(HALF_PI - abs(pitch)) < EPSILON) {
                yaw = (pitch < 0.0) ? yaw + roll : yaw - roll;
                roll = 0.0;
            } else {
                roll = wrap(roll);
            }
            yaw = wrap(yaw);

            this._yaw = yaw;
            this._pitch = pitch;
            this._roll = roll;

            return this;
        };
    }());
};

/**
 * Represents canonical Euler angles.
 *
 * To create the object use [B.Math.makeAngles()]{@link B.Math.makeAngles}.
 *
 * @class
 * @this B.Math.Angles
 */
B.Math.Angles = function (yaw, pitch, roll) {

    this._yaw = yaw || 0.0;
    this._pitch = pitch || 0.0;
    this._roll = roll || 0.0;

    this._canonize();
};

B.Math.Angles.prototype = new B.Math.AnglesProto();
