
/**
 * Contains linear algebra tools and commonly used geometry objects.
 *
 * @namespace B.Math
 */
B.Math = {};

B.Math.Type = {

    POINT: 1,
    PLANE: 2,
    RAY: 3,
    SEGMENT: 4,
    TRIANGLE: 5,
    AABOX: 6,
    SPHERE: 7
};


/**
 * Negligibly small number.
 *
 * @constant
 * @type {number}
 * @default 0.00000001
 */
B.Math.EPSILON = 10e-8;

/**
 * Checks for strict equality of two numbers.
 *
 * @function
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
B.Math.equal = (function () {

    var EPSILON = B.Math.EPSILON,
        abs = Math.abs;

    return function (a, b) {
        return (abs(a - b) < EPSILON);
    };
}());


/**
 * A type of relation between two geometry objects.
 *
 * @enum {number}
 * @readonly
 */
B.Math.Relation = {

    /**
     * Two objects intersect each other.
     *
     * @constant
     */
    INTERSECT: 1,

    /**
     * The object is located inside another object.
     *
     * @constant
     */
    INSIDE: 2,

    /**
     * The object is located outside another object.
     *
     * @constant
     */
    OUTSIDE: 4
};

B.Math.testRelationByDistance = function (d, relation) {

    var M = B.Math, R = M.Relation;

    relation = relation || R.INTERSECT;

    if (Math.abs(d) < M.EPSILON) {
        return !!(relation & R.INTERSECT);
    }
    return !!(relation & R.OUTSIDE);
};


/**
 * Converts from radians to degrees.
 *
 * @param {number} radians
 * @returns {number} degrees
 */
B.Math.degrees = function (radians) {
    return radians * (180 / Math.PI);
};

/**
 * Converts from degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} radians
 */
B.Math.radians = function (degrees) {
    return degrees * (Math.PI / 180);
};


/**
 * Makes a RGBA color.
 *
 * @param {number} [r=0] red component (value between 0 and 1)
 * @param {number} [g=0] green component (value between 0 and 1)
 * @param {number} [b=0] blue component (value between 0 and 1)
 * @param {number} [a=1] alpha component (value between 0 and 1)
 * @returns {B.Math.Color}
 */
B.Math.makeColor = function (r, g, b, a) {

    return new B.Math.Color(r, g, b, a);
};

/**
 * Makes a 2D vector.
 *
 * @param {number} [x=0] x component
 * @param {number} [y=0] y component
 * @returns {B.Math.Vector2}
 */
B.Math.makeVector2 = function (x, y) {

    return new B.Math.Vector2(x, y);
};

/**
 * Makes a 3D vector.
 *
 * @param {number} [x=0] x component
 * @param {number} [y=0] y component
 * @param {number} [z=0] z component
 * @returns {B.Math.Vector3}
 */
B.Math.makeVector3 = function (x, y, z) {

    return new B.Math.Vector3(x, y, z);
};

/**
 * Makes a 4D vector.
 *
 * @param {number} [x=0] x component
 * @param {number} [y=0] y component
 * @param {number} [z=0] z component
 * @param {number} [w=0] w component
 * @returns {B.Math.Vector4}
 */
B.Math.makeVector4 = function (x, y, z, w) {

    return new B.Math.Vector4(x, y, z, w);
};

/**
 * Makes a column-major 3x3 matrix.
 *
 * @param {number} [m00=1]
 * @param {number} [m01=0]
 * @param {number} [m02=0]
 * @param {number} [m10=0]
 * @param {number} [m11=1]
 * @param {number} [m12=0]
 * @param {number} [m20=0]
 * @param {number} [m21=0]
 * @param {number} [m22=1]
 * @returns {B.Math.Matrix3}
 */
B.Math.makeMatrix3 = function (
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22) {

    return (arguments.length === 0) ?
        new B.Math.Matrix3() :
        new B.Math.Matrix3(
            m00, m01, m02,
            m10, m11, m12,
            m20, m21, m22);
};

/**
 * Makes a column-major 4x4 matrix.
 *
 * @param {number} [m00=1]
 * @param {number} [m01=0]
 * @param {number} [m02=0]
 * @param {number} [m03=0]
 * @param {number} [m10=0]
 * @param {number} [m11=1]
 * @param {number} [m12=0]
 * @param {number} [m13=0]
 * @param {number} [m20=0]
 * @param {number} [m21=0]
 * @param {number} [m22=1]
 * @param {number} [m23=0]
 * @param {number} [m30=0]
 * @param {number} [m31=0]
 * @param {number} [m32=0]
 * @param {number} [m33=1]
 * @returns {B.Math.Matrix4}
 */
B.Math.makeMatrix4 = function (
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {

    return (arguments.length === 0) ?
        new B.Math.Matrix4() :
        new B.Math.Matrix4(
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33);
};

/**
 * Makes a quaternion.
 *
 * @param {number} [w=1] w component (cos(angle/2))
 * @param {number} [x=0] x component (sin(angle/2)*axis.x)
 * @param {number} [y=0] y component (sin(angle/2)*axis.y)
 * @param {number} [z=0] z component (sin(angle/2)*axis.z)
 * @returns {B.Math.Quaternion}
 */
B.Math.makeQuaternion = function (w, x, y, z) {

    return new B.Math.Quaternion(w, x, y, z);
};

/**
 * Makes canonical Euler angles (yaw-pitch-roll order).
 *
 * @param {number} [yaw=0] global Y-axis rotation [-PI, PI].
 * @param {number} [pitch=0] local X-axis rotation [-PI/2, PI/2].
 * @param {number} [roll=0] local Z-axis rotation [-PI, PI].
 * @returns {B.Math.Angles}
 */
B.Math.makeAngles = function (yaw, pitch, roll) {

    return new B.Math.Angles(yaw, pitch, roll);
};

/**
 * Makes a plane.
 *
 * @param {B.Math.Vector3} [normal={@link B.Math.Vector3.Y}]
 * @param {number} [distance=0]
 * @returns {B.Math.Plane}
 */
B.Math.makePlane = function (normal, distance) {

    return new B.Math.Plane(normal, distance);
};

/**
 * Makes a ray.
 *
 * @param {B.Math.Vector3} [origin={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [direction={@link B.Math.Vector3.Z}]
 * @returns {B.Math.Ray}
 */
B.Math.makeRay = function (origin, direction) {

    return new B.Math.Ray(origin, direction);
};

/**
 * Makes a segment.
 *
 * @param {B.Math.Vector3} [start={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [end={@link B.Math.Vector3.ZERO}]
 * @returns {B.Math.Segment}
 */
B.Math.makeSegment = function (start, end) {

    return new B.Math.Segment(start, end);
};

/**
 * Makes a triangle.
 *
 * @param {B.Math.Vector3} [a={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [b={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [c={@link B.Math.Vector3.ZERO}]
 * @returns {B.Math.Triangle}
 */
B.Math.makeTriangle = function (a, b, c) {

    return new B.Math.Triangle(a, b, c);
};

/**
 * Makes an axis-aligned box.
 *
 * @param {B.Math.Vector3} [min={@link B.Math.Vector3.INF}]
 * @param {B.Math.Vector3} [max={@link B.Math.Vector3.N_INF}]
 * @returns {B.Math.AABox}
 */
B.Math.makeAABox = function (min, max) {

    return new B.Math.AABox(min, max);
};

/**
 * Makes a sphere.
 *
 * @param {B.Math.Vector3} [center={@link B.Math.Vector3.ZERO}]
 * @param {number} [radius=0]
 * @returns {B.Math.Sphere}
 */
B.Math.makeSphere = function (center, radius) {

    return new B.Math.Sphere(center, radius);
};

/**
 * Makes a frustum.
 *
 * @param {B.Math.Plane} [left={@link B.Math.Plane.X}]
 * @param {B.Math.Plane} [right={@link B.Math.Plane.N_X}]
 * @param {B.Math.Plane} [top={@link B.Math.Plane.N_Y}]
 * @param {B.Math.Plane} [bottom={@link B.Math.Plane.Y}]
 * @param {B.Math.Plane} [near={@link B.Math.Plane.N_Z}]
 * @param {B.Math.Plane} [far={@link B.Math.Plane.Z}]
 * @returns {B.Math.Frustum}
 */
B.Math.makeFrustum = function (left, right, top, bottom, near, far) {

    return new B.Math.Frustum(left, right, top, bottom, near, far);
};
