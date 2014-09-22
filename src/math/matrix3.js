
/**
 * @ignore
 * @this B.Math.Matrix3
 */
B.Math.Matrix3Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        ROWS_COUNT = 3,
        COLS_COUNT = 3,
        ELEMENTS_COUNT = ROWS_COUNT * COLS_COUNT,

        equal = M.equal,
        abs = Math.abs,
        sin = Math.sin,
        cos = Math.cos;

    /**
     * Clones this matrix to a new matrix.
     *
     * @returns {B.Math.Matrix3} this
     */
    this.clone = function () {

        var clone = M.makeMatrix3();
        clone.fromArray(this.m);
        return clone;
    };

    /**
     * Copies a given matrix into this matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Matrix3} this
     */
    this.copy = function (matrix) {

        this.fromArray(matrix.m);
        return this;
    };

    /**
     * Sets all elements of this matrix.
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22
     * @returns {B.Math.Matrix3} this
     */
    this.set = function (
        m00, m01, m02,
        m10, m11, m12,
        m20, m21, m22) {

        var m = this.m;

        m[0] = m00;
        m[1] = m10;
        m[2] = m20;

        m[3] = m01;
        m[4] = m11;
        m[5] = m21;

        m[6] = m02;
        m[7] = m12;
        m[8] = m22;

        return this;
    };

    /**
     * Gets an element by its row and column indices.
     *
     * @param {number} row index [0, 2]
     * @param {number} column index [0, 2]
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (row, column) {

        if (column < 0 || column >= COLS_COUNT) {
            throw new Error("Matrix3 column index is out of range");
        }
        if (row < 0 || row >= ROWS_COUNT) {
            throw new Error("Matrix3 row index is out of range");
        }
        return this.m[column * ROWS_COUNT + row];
    };

    /**
     * Sets the X-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix3} this
     */
    this.setAxisX = function (axis) {

        var m = this.m;

        m[0] = axis.x;
        m[1] = axis.y;
        m[2] = axis.z;

        return this;
    };

    /**
     * Returns the X-axis vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisX = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[0], m[1], m[2]);
    };

    /**
     * Sets the Y-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix3} this
     */
    this.setAxisY = function (axis) {

        var m = this.m;

        m[3] = axis.x;
        m[4] = axis.y;
        m[5] = axis.z;

        return this;
    };

    /**
     * Returns the Y-axis vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisY = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[3], m[4], m[5]);
    };

    /**
     * Sets the Z-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix3} this
     */
    this.setAxisZ = function (axis) {

        var m = this.m;

        m[6] = axis.x;
        m[7] = axis.y;
        m[8] = axis.z;

        return this;
    };

    /**
     * Returns the Z-axis vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisZ = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[6], m[7], m[8]);
    };

    /**
     * Extracts scale factors.
     *
     * @function
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.extractScale = (function () {

        var v = M.makeVector3();

        return function (result) {

            result = result || M.makeVector3();

            return result.set(
                this.getAxisX(v).length(),
                this.getAxisY(v).length(),
                this.getAxisZ(v).length()
            );
        };
    }());

    /**
     * Sets this matrix elements from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        var i, m = this.m;

        offset = offset || 0;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            m[i] = array[i + offset];
        }

        return offset + ELEMENTS_COUNT;
    };

    /**
     * Sets this matrix elements to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        var i, m = this.m;

        offset = offset || 0;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            array[i + offset] = m[i];
        }

        return offset + ELEMENTS_COUNT;
    };

    /**
     * Sets this matrix from Euler angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Matrix3} this
     */
    this.fromAngles = function (angles) {

        var x = angles.pitch(), y = angles.yaw(), z = angles.roll(),
            cx = cos(x), cy = cos(y), cz = cos(z),
            sx = sin(x), sy = sin(y), sz = sin(z),
            cycz = cy * cz, cysz = cy * sz,
            sycz = sy * cz, sysz = sy * sz;

        // rotationZ(roll) * rotationX(pitch) * rotationY(yaw)

        return this.set(
            cycz + sysz * sx, sycz * sx - cysz, cx * sy,
            cx * sz, cx * cz, -sx,
            cysz * sx - sycz, sysz + cycz * sx, cx * cy
        );
    };

    /**
     * Sets this matrix from a quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Matrix3} this
     */
    this.fromQuaternion = function (q) {

        var x = q._x, y = q._y, z = q._z, w = q._w,
            x2 = x * 2.0, y2 = y * 2.0, z2 = z * 2.0,
            xx2 = x * x2, xy2 = x * y2, xz2 = x * z2,
            yy2 = y * y2, yz2 = y * z2, zz2 = z * z2,
            wx2 = w * x2, wy2 = w * y2, wz2 = w * z2;

        // rotationAxis(q.axis(), q.angle())

        return this.set(
            1 - yy2 - zz2, xy2 - wz2, xz2 + wy2,
            xy2 + wz2, 1 - xx2 - zz2, yz2 - wx2,
            xz2 - wy2, yz2 + wx2, 1 - xx2 - yy2
        );
    };

    /**
     * Sets this matrix to the identity.
     *
     * @returns {B.Math.Matrix3} this
     */
    this.identity = function () {

        return this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    };

    /**
     * Sets this matrix to X-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationX = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            1, 0, 0,
            0, c, -s,
            0, s, c
        );
    };

    /**
     * Sets this matrix to Y-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationY = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, 0, s,
            0, 1, 0,
            -s, 0, c
        );
    };

    /**
     * Sets this matrix to Z-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationZ = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        );
    };

    /**
     * Sets this matrix to arbitrary axis rotation transform.
     *
     * @function
     * @param {B.Math.Vector3} axis
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationAxis = (function () {

        var v = M.makeVector3();

        return function (axis, angle) {

            // explanation: http://ami.ektf.hu/uploads/papers/finalpdf/AMI_40_from175to186.pdf

            var x = v.copy(axis).normalize().x, y = v.y, z = v.z,
                c = cos(angle),
                s = sin(angle),
                t = 1.0 - c,
                tx = t * x,
                ty = t * y;

            return this.set(
                tx * x + c, tx * y - s * z, tx * z + s * y,
                tx * y + s * z, ty * y + c, ty * z - s * x,
                tx * z - s * y, ty * z + s * x, t * z * z + c
            );
        };
    }());

    /**
     * Sets this matrix to scale transform.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Matrix3} this
     */
    this.scale = function (x, y, z) {

        return this.set(
            x, 0, 0,
            0, y, 0,
            0, 0, z
        );
    };

    /**
     * Adds a matrix to this matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Matrix3} this
     */
    this.add = function (matrix) {

        var ma = this.m, mb = matrix.m;

        ma[0] += mb[0];
        ma[1] += mb[1];
        ma[2] += mb[2];

        ma[3] += mb[3];
        ma[4] += mb[4];
        ma[5] += mb[5];

        ma[6] += mb[6];
        ma[7] += mb[7];
        ma[8] += mb[8];

        return this;
    };

    /**
     * Multiplies this matrix by a given scalar.
     *
     * @param {number} scalar
     * @returns {B.Math.Matrix3} this
     */
    this.mulScalar = function (scalar) {

        var i, m = this.m;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            m[i] *= scalar;
        }

        return this;
    };

    /**
     * Multiplies two given matrices and sets the result to this.
     *
     * @param {B.Math.Matrix3} a
     * @param {B.Math.Matrix3} b
     * @returns {B.Math.Matrix3} this
     */
    this.mulMatrices = function (a, b) {

        var m = this.m, ma = a.m, mb = b.m,
            a00 = ma[0], a01 = ma[3], a02 = ma[6],
            a10 = ma[1], a11 = ma[4], a12 = ma[7],
            a20 = ma[2], a21 = ma[5], a22 = ma[8],
            b00 = mb[0], b01 = mb[3], b02 = mb[6],
            b10 = mb[1], b11 = mb[4], b12 = mb[7],
            b20 = mb[2], b21 = mb[5], b22 = mb[8];

        m[0] = a00 * b00 + a10 * b01 + a20 * b02;
        m[3] = a01 * b00 + a11 * b01 + a21 * b02;
        m[6] = a02 * b00 + a12 * b01 + a22 * b02;

        m[1] = a00 * b10 + a10 * b11 + a20 * b12;
        m[4] = a01 * b10 + a11 * b11 + a21 * b12;
        m[7] = a02 * b10 + a12 * b11 + a22 * b12;

        m[2] = a00 * b20 + a10 * b21 + a20 * b22;
        m[5] = a01 * b20 + a11 * b21 + a21 * b22;
        m[8] = a02 * b20 + a12 * b21 + a22 * b22;

        return this;
    };

    /**
     * Multiplies this matrix by a given matrix or a scalar.
     *
     * @param {number | B.Math.Matrix3} value
     * @returns {B.Math.Matrix3} this
     */
    this.mul = function (value) {

        if (typeof value === "number") {
            return this.mulScalar(value);
        } else {
            return this.mulMatrices(this, value);
        }
    };

    /**
     * Calculates the determinant of this matrix.
     *
     * @returns {number}
     */
    this.determinant = function () {

        var m = this.m,
            m00 = m[0], m01 = m[3], m02 = m[6],
            m10 = m[1], m11 = m[4], m12 = m[7],
            m20 = m[2], m21 = m[5], m22 = m[8];

        return (
            (m11 * m22 - m12 * m21) * m00 +
            (m02 * m21 - m01 * m22) * m10 +
            (m01 * m12 - m02 * m11) * m20
        );
    };

    /**
     * Transposes this matrix.
     *
     * @returns {B.Math.Matrix3} this
     */
    this.transpose = function () {

        var m = this.m;

        return this.set(
            m[0], m[1], m[2],
            m[3], m[4], m[5],
            m[6], m[7], m[8]
        );
    };

    /**
     * Inverts this matrix.
     *
     * @returns {B.Math.Matrix3} this
     * @throws {Error} if determinant is zero.
     */
    this.invert = function () {

        var d, m = this.m,
            m00 = m[0], m01 = m[3], m02 = m[6],
            m10 = m[1], m11 = m[4], m12 = m[7],
            m20 = m[2], m21 = m[5], m22 = m[8];

        m[0] = m11 * m22 - m12 * m21;
        m[3] = m02 * m21 - m01 * m22;
        m[6] = m01 * m12 - m02 * m11;
        m[1] = m12 * m20 - m10 * m22;
        m[4] = m00 * m22 - m02 * m20;
        m[7] = m02 * m10 - m00 * m12;
        m[2] = m10 * m21 - m11 * m20;
        m[5] = m01 * m20 - m00 * m21;
        m[8] = m00 * m11 - m01 * m10;

        d = m00 * m[0] + m10 * m[3] + m20 * m[6];

        if (abs(d) < EPSILON) {
            throw new Error("can't invert Matrix3 - determinant is zero");
        }
        return this.mulScalar(1.0 / d);
    };

    /**
     * Checks for strict equality of this matrix and another matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {boolean}
     */
    this.equal = function (matrix) {

        var i, ma = this.m, mb = matrix.m;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            if (!equal(ma[i], mb[i])) {
                return false;
            }
        }
        return true;
    };
};

/**
 * Represents a column-major 3x3 matrix.
 *
 * |  make / set:  |   |      representation:      |   |  array accessor: |
 * | ------------- |:-:|:-------------------------:|:-:| ----------------:|
 * | m00, m01, m02 |   | axisX.x, axisY.x, axisZ.x |   | m[0], m[3], m[6] |
 * | m10, m11, m12 | = | axisX.y, axisY.y, axisZ.y | = | m[1], m[4], m[7] |
 * | m20, m21, m22 |   | axisX.z, axisY.z, axisZ.z |   | m[2], m[5], m[8] |
 *
 * To create the object use [B.Math.makeMatrix3()]{@link B.Math.makeMatrix3}.
 *
 * *Note: the order of transformations coincides with the order in which the matrices are
 *  multiplied (from left to right).*
 *
 * @class
 * @this B.Math.Matrix3
 */
B.Math.Matrix3 = function (
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22) {

    /**
     * Matrix element array.
     *
     * @type {Array<number>}
     */
    this.m = (arguments.length !== 0) ? [
        m00, m10, m20,
        m01, m11, m21,
        m02, m12, m22
    ] : [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
};

B.Math.Matrix3.prototype = new B.Math.Matrix3Proto();

/**
 * Zero matrix.
 *
 * @constant
 * @type {B.Math.Matrix3}
 * @default [0,0,0, 0,0,0, 0,0,0]
 */
B.Math.Matrix3.ZERO = B.Math.makeMatrix3(
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
);

/**
 * Identity matrix.
 *
 * @constant
 * @type {B.Math.Matrix3}
 * @default [1,0,0, 0,1,0, 0,0,1]
 */
B.Math.Matrix3.IDENTITY = B.Math.makeMatrix3();
