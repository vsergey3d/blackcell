
/**
 * @ignore
 * @this B.Math.Matrix4
 */
B.Math.Matrix4Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        ROWS_COUNT = 4,
        COLS_COUNT = 4,
        ELEMENTS_COUNT = ROWS_COUNT * COLS_COUNT,

        equal = M.equal,
        abs = Math.abs,
        sin = Math.sin,
        cos = Math.cos;

    /**
     * Clones this matrix to a new matrix.
     *
     * @returns {B.Math.Matrix4} this
     */
    this.clone = function () {

        var clone = M.makeMatrix4();
        clone.fromArray(this.m);
        return clone;
    };

    /**
     * Copies a given matrix into this matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Matrix4} this
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
     * @param {number} m03
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m13
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22
     * @param {number} m23
     * @param {number} m30
     * @param {number} m31
     * @param {number} m32
     * @param {number} m33
     * @returns {B.Math.Matrix4} this
     */
    this.set = function (
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33) {

        var m = this.m;

        m[0] = m00;
        m[1] = m10;
        m[2] = m20;
        m[3] = m30;

        m[4] = m01;
        m[5] = m11;
        m[6] = m21;
        m[7] = m31;

        m[8] = m02;
        m[9] = m12;
        m[10] = m22;
        m[11] = m32;

        m[12] = m03;
        m[13] = m13;
        m[14] = m23;
        m[15] = m33;

        return this;
    };

    /**
     * Gets an element by its row and column indices.
     *
     * @param {number} row index [0, 3]
     * @param {number} column index [0, 3]
     * @returns {number}
     * @throws {Error} if the index is out of range.
     */
    this.get = function (row, column) {

        if (column < 0 || column >= COLS_COUNT) {
            throw new Error("Matrix4 column index is out of range");
        }
        if (row < 0 || row >= ROWS_COUNT) {
            throw new Error("Matrix4 row index is out of range");
        }
        return this.m[column * ROWS_COUNT + row];
    };

    /**
     * Sets 3x3 top left part of this matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Matrix4} this
     */
    this.setMatrix3 = function (matrix) {

        var m = this.m, m3 = matrix.m;

        m[0] = m3[0];
        m[1] = m3[1];
        m[2] = m3[2];

        m[4] = m3[3];
        m[5] = m3[4];
        m[6] = m3[5];

        m[8] = m3[6];
        m[9] = m3[7];
        m[10] = m3[8];

        return this;
    };

    /**
     * Returns 3x3 top left part of this matrix.
     *
     * @param {B.Math.Matrix3} [result] omit if you want to return newly created matrix
     * @returns {B.Math.Matrix3}
     */
    this.getMatrix3 = function (result) {

        var m = this.m;

        result = result || M.makeMatrix3();

        return result.set(
            m[0], m[4], m[8],
            m[1], m[5], m[9],
            m[2], m[6], m[10]
        );
    };

    /**
     * Sets the X-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix4} this
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
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix4} this
     */
    this.setAxisY = function (axis) {

        var m = this.m;

        m[4] = axis.x;
        m[5] = axis.y;
        m[6] = axis.z;

        return this;
    };

    /**
     * Returns the Y-axis vector.
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisY = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[4], m[5], m[6]);
    };

    /**
     * Sets the Z-axis vector.
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix4} this
     */
    this.setAxisZ = function (axis) {

        var m = this.m;

        m[8] = axis.x;
        m[9] = axis.y;
        m[10] = axis.z;

        return this;
    };

    /**
     * Returns the Z-axis vector.
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisZ = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[8], m[9], m[10]);
    };

    /**
     * Sets the position vector.
     * @param {B.Math.Vector3} position
     * @returns {B.Math.Matrix4} this
     */
    this.setPosition = function (position) {

        var m = this.m;

        m[12] = position.x;
        m[13] = position.y;
        m[14] = position.z;

        return this;
    };

    /**
     * Returns the position vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getPosition = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[12], m[13], m[14]);
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
     * @function
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Matrix4} this
     */
    this.fromAngles = (function () {

        var m3 = M.makeMatrix3();

        return function (angles) {

            return this.identity().setMatrix3(m3.fromAngles(angles));
        };
    }());

    /**
     * Sets this matrix from a quaternion.
     *
     * @function
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Matrix4} this
     */
    this.fromQuaternion = (function () {

        var m3 = M.makeMatrix3();

        return function (q) {

            return this.identity().setMatrix3(m3.fromQuaternion(q));
        };
    }());

    /**
     * Sets this matrix to the identity.
     *
     * @returns {B.Math.Matrix4} this
     */
    this.identity = function () {

        return this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to translation transform.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Matrix4} this
     */
    this.translation = function (x, y, z) {

        return this.set(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to X-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationX = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to Y-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationY = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to Z-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationZ = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to arbitrary axis rotation transform.
     *
     * @function
     * @param {B.Math.Vector3} axis
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationAxis = (function () {

        var m3 = M.makeMatrix3();

        return function (axis, angle) {

            return this.identity().setMatrix3(m3.rotationAxis(axis, angle));
        };
    }());

    /**
     * Sets this matrix to scale transform.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Matrix4} this
     */
    this.scale = function (x, y, z) {

        return this.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to right-handed view transform.
     *
     * @function
     * @param {B.Math.Vector3} eye
     * @param {B.Math.Vector3} target
     * @param {B.Math.Vector3} up
     * @returns {B.Math.Matrix4} this
     */
    this.lookAt = (function () {

        var xAxis = M.makeVector3(),
            yAxis = M.makeVector3(),
            zAxis = M.makeVector3();

        return function (eye, target, up) {

            zAxis.subVectors(eye, target).normalize();
            xAxis.crossVectors(up, zAxis).normalize();
            if (xAxis.length() < M.EPSILON) {
                zAxis.x += M.EPSILON;
                xAxis.crossVectors(up, zAxis).normalize();
            }
            yAxis.crossVectors(zAxis, xAxis);

            return this.set(
                xAxis.x, xAxis.y, xAxis.z, -xAxis.dot(eye),
                yAxis.x, yAxis.y, yAxis.z, -yAxis.dot(eye),
                zAxis.x, zAxis.y, zAxis.z, -zAxis.dot(eye),
                0, 0, 0, 1
            );
        };
    }());

    /**
     * Sets this matrix to orthographic projection transform.
     *
     * @param {number} width
     * @param {number} height
     * @param {number} zNear
     * @param {number} zFar
     * @returns {B.Math.Matrix4} this
     */
    this.orthographic = function (width, height, zNear, zFar) {

        // explanation: http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho

        var xs = 2.0 / width,
            ys = 2.0 / height,
            d = -1.0 / (zFar - zNear),
            za = 2.0 * d,
            zb = (zFar + zNear) * d;

        return this.set(
            xs, 0, 0, 0,
            0, ys, 0, 0,
            0, 0, za, zb,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to perspective projection transform.
     *
     * @param {number} fov field of view angle
     * @param {number} aspect output surface width to height ratio
     * @param {number} zNear
     * @param {number} zFar
     * @returns {B.Math.Matrix4} this
     */
    this.perspective = function (fov, aspect, zNear, zFar) {

        // explanation: http://www.songho.ca/opengl/gl_projectionmatrix.html#perspective

        var hTan = Math.tan(fov * 0.5),
            xs = 1.0 / (aspect * hTan),
            ys = 1.0 / hTan,
            d = -1.0 / (zFar - zNear),
            za = (zFar + zNear) * d,
            zb = 2.0 * zFar * zNear * d;

        return this.set(
            xs, 0, 0, 0,
            0, ys, 0, 0,
            0, 0, za, zb,
            0, 0, -1, 0
        );
    };

    /**
     * Adds a matrix to this matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Matrix4} this
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
        ma[9] += mb[9];
        ma[10] += mb[10];
        ma[11] += mb[11];

        ma[12] += mb[12];
        ma[13] += mb[13];
        ma[14] += mb[14];
        ma[15] += mb[15];

        return this;
    };

    /**
     * Multiplies this matrix by a given scalar.
     *
     * @param {number} scalar
     * @returns {B.Math.Matrix4} this
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
     * @param {B.Math.Matrix4} a
     * @param {B.Math.Matrix4} b
     * @returns {B.Math.Matrix4} this
     */
    this.mulMatrices = function (a, b) {

        var m = this.m, ma = a.m, mb = b.m,
            a00 = ma[0], a01 = ma[4], a02 = ma[8], a03 = ma[12],
            a10 = ma[1], a11 = ma[5], a12 = ma[9], a13 = ma[13],
            a20 = ma[2], a21 = ma[6], a22 = ma[10], a23 = ma[14],
            a30 = ma[3], a31 = ma[7], a32 = ma[11], a33 = ma[15],
            b00 = mb[0], b01 = mb[4], b02 = mb[8], b03 = mb[12],
            b10 = mb[1], b11 = mb[5], b12 = mb[9], b13 = mb[13],
            b20 = mb[2], b21 = mb[6], b22 = mb[10], b23 = mb[14],
            b30 = mb[3], b31 = mb[7], b32 = mb[11], b33 = mb[15];

        m[0] =  a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
        m[4] =  a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
        m[8] =  a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
        m[12] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

        m[1] =  a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
        m[5] =  a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
        m[9] =  a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
        m[13] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

        m[2] =  a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
        m[6] =  a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
        m[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
        m[14] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

        m[3] =  a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
        m[7] =  a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
        m[11] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
        m[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

        return this;
    };

    /**
     * Multiplies this matrix by a given matrix or a scalar.
     *
     * @param {number | B.Math.Matrix4} value
     * @returns {B.Math.Matrix4} this
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
            m00 = m[0], m01 = m[4], m02 = m[8], m03 = m[12],
            m10 = m[1], m11 = m[5], m12 = m[9], m13 = m[13],
            m20 = m[2], m21 = m[6], m22 = m[10], m23 = m[14],
            m30 = m[3], m31 = m[7], m32 = m[11], m33 = m[15],

            m03m10 = m03 * m10, m03m11 = m03 * m11, m03m12 = m03 * m12,
            m02m10 = m02 * m10, m02m11 = m02 * m11, m02m13 = m02 * m13,
            m01m10 = m01 * m10, m01m12 = m01 * m12, m01m13 = m01 * m13,
            m00m11 = m00 * m11, m00m12 = m00 * m12, m00m13 = m00 * m13;

        return (
            (m03m12 * m21 - m02m13 * m21 - m03m11 * m22 +
                m01m13 * m22 + m02m11 * m23 - m01m12 * m23) * m30 +
            (m02m13 * m20 - m03m12 * m20 + m03m10 * m22 -
                m00m13 * m22 - m02m10 * m23 + m00m12 * m23) * m31 +
            (m03m11 * m20 - m01m13 * m20 - m03m10 * m21 +
                m01m10 * m23 - m00m11 * m23 - m00m13 * m21) * m32 +
            (m02m11 * m20 + m01m12 * m20 + m02m10 * m21 -
                m00m12 * m21 - m01m10 * m22 + m00m11 * m22) * m33
        );
    };

    /**
     * Transposes this matrix.
     *
     * @returns {B.Math.Matrix4} this
     */
    this.transpose = function () {

        var m = this.m;

        return this.set(
            m[0], m[1], m[2], m[3],
            m[4], m[5], m[6], m[7],
            m[8], m[9], m[10], m[11],
            m[12], m[13], m[14], m[15]
        );
    };

    /**
     * Inverts this matrix.
     *
     * @returns {B.Math.Matrix4} this
     * @throws {Error} if determinant is zero.
     */
    this.invert = function () {

        var d, m = this.m,
            m00 = m[0], m01 = m[4], m02 = m[8], m03 = m[12],
            m10 = m[1], m11 = m[5], m12 = m[9], m13 = m[13],
            m20 = m[2], m21 = m[6], m22 = m[10], m23 = m[14],
            m30 = m[3], m31 = m[7], m32 = m[11], m33 = m[15];

        m[0] = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 -
            m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;
        m[4] = m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 +
            m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33;
        m[8] = m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 -
            m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33;
        m[12] = m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 +
            m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23;
        m[1] = m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 +
            m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33;
        m[5] = m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 -
            m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33;
        m[9] = m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 +
            m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33;
        m[13] = m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 -
            m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23;
        m[2] = m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 -
            m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33;
        m[6] = m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 +
            m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33;
        m[10] = m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 -
            m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33;
        m[14] = m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 +
            m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23;
        m[3] = m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 +
            m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32;
        m[7] = m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 -
            m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32;
        m[11] = m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 +
            m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32;
        m[15] = m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 -
            m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22;

        d = m00 * m[0] + m10 * m[4] + m20 * m[8] + m30 * m[12];

        if (abs(d) < EPSILON) {

            throw new Error("can't invert Matrix4 - determinant is zero");
        }
        return this.mulScalar(1.0 / d);
    };

    /**
     * Checks for strict equality of this matrix and another matrix.
     *
     * @param {B.Math.Matrix4} matrix
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
 * Represents a column-major 4x4 matrix.
 *
 * |     make / set:    |   |             representation:           |   |      array accessor:     |
 * |  ------------------|:-:|:-------------------------------------:|:-:| ------------------------:|
 * | m00, m01, m02, m03 |   | axisX.x, axisY.x, axisZ.x, position.x |   | m[0], m[4], m[08], m[12] |
 * | m10, m11, m12, m13 | = | axisX.y, axisY.y, axisZ.y, position.y | = | m[1], m[5], m[09], m[13] |
 * | m20, m21, m22, m23 |   | axisX.z, axisY.z, axisZ.z, position.z |   | m[2], m[6], m[10], m[14] |
 * | m30, m31, m32, m33 |   |    0,       0,       0,        1      |   | m[3], m[7], m[11], m[15] |
 *
 * To create the object use [B.Math.makeMatrix4()]{@link B.Math.makeMatrix4}.
 *
 * *Note: the order of transformations coincides with the order in which the matrices are
 *  multiplied (from left to right).*
  *
 * @class
 * @this B.Math.Matrix4
 */
B.Math.Matrix4 = function (
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {

    /**
     * Matrix element array.
     *
     * @type {Array<number>}
     */
    this.m = (arguments.length !== 0) ? [
        m00, m10, m20, m30,
        m01, m11, m21, m31,
        m02, m12, m22, m32,
        m03, m13, m23, m33
    ] : [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

B.Math.Matrix4.prototype = new B.Math.Matrix4Proto();

/**
 * Zero matrix.
 *
 * @constant
 * @type {B.Math.Matrix4}
 * @default [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
 */
B.Math.Matrix4.ZERO = B.Math.makeMatrix4(
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
);

/**
 * Identity matrix.
 *
 * @constant
 * @type {B.Math.Matrix4}
 * @default [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
 */
B.Math.Matrix4.IDENTITY = B.Math.makeMatrix4();
