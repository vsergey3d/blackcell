
/**
 * @ignore
 * @this B.Math.Ray
 */
B.Math.RayProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.RAY;
    };

    /**
     * Clones this ray to a new ray.
     *
     * @returns {B.Math.Ray} this
     */
    this.clone = function () {

        return M.makeRay(this.origin, this.direction);
    };

    /**
     * Copies a given ray into this ray.
     *
     * @param {B.Math.Ray} ray
     * @returns {B.Math.Ray} this
     */
    this.copy = function (ray) {

        this.origin.copy(ray.origin);
        this.direction.copy(ray.direction);

        return this;
    };

    /**
     * Sets this ray from an origin and a direction.
     *
     * @param {B.Math.Vector3} origin
     * @param {B.Math.Vector3} direction
     * @returns {B.Math.Ray} this
     */
    this.set = function (origin, direction) {

        this.origin.copy(origin);
        this.direction.copy(direction);

        return this;
    };

    /**
     * Sets this ray from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.origin.fromArray(array, offset);
        offset = this.direction.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this ray to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.origin.toArray(array, offset);
        offset = this.direction.toArray(array, offset);

        return offset;
    };

    /**
     * Sets this ray from an origin and a target.
     *
     * @param {B.Math.Vector3} origin
     * @param {B.Math.Vector3} target
     * @returns {B.Math.Ray} this
     */
    this.fromOriginTarget = function (origin, target) {

        this.origin.copy(origin);
        this.direction.copy(target).sub(origin).normalize();

        return this;
    };

    /**
     * Translates this ray by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Ray} this
     */
    this.translate = function (offset) {

        this.origin.add(offset);
        return this;
    };

    /**
     * Transforms this ray by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Ray} this
     */
    this.transform = function (matrix) {

        this.direction.add(this.origin).transform(matrix);
        this.origin.transform(matrix);
        this.direction.sub(this.origin);

        return this;
    };

    /**
     * Gets a point at this ray.
     *
     * @param {number} t [0, +Infinity]
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} point
     */
    this.at = function (t, result) {

        var v = result || M.makeVector3();

        return v.copy(this.direction).mul(t).add(this.origin);
    };

    /**
     * Projects a point to this ray.
     *
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} projected point
     */
    this.projectPoint = function (point, result) {

        var v = result || M.makeVector3(),
            orig = this.origin, dir = this.direction,
            dot = v.subVectors(point, orig).dot(dir);

        if (dot <= 0.0) {
            return v.copy(orig);
        }
        return v.copy(dir).mul(dot).add(orig);
    };

    /**
     * Finds the point of intersection between this ray and an object.
     *
     * @function
     * @param {B.Math.Plane | B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @param {B.Math.Vector3} [point] point of intersection
     * @returns {number | null} distance from origin or null if no intersections
     * @throws {Error} if the object argument has unsupported type
     */
    this.trace = (function () {

        var EPSILON = M.EPSILON,

            calls = [];

        calls[T.PLANE] = function (ray, plane) {

            var n = plane.normal, d = plane.distance, o = ray.origin,

                dotND = n.dot(ray.direction), t;

            if (Math.abs(dotND) < EPSILON) {
                if (Math.abs(n.dot(o) - d) < EPSILON) {
                    return 0.0;
                }
            } else {
                t = (d - n.dot(o)) / dotND;
                if (t >= 0.0) {
                    return t;
                }
            }
            return null;
        };

        calls[T.TRIANGLE] = (function () {

            var plane = M.makePlane(),
                p = M.makeVector3(),
                d = M.makeVector3(),
                e = M.makeVector3();

            return function (ray, triangle) {

                var a = triangle.a, b = triangle.b, c = triangle.c,
                    n = triangle.plane(plane).normal,

                    t = ray.trace(plane);

                if (t === null) {
                    return null;
                }
                ray.at(t, p);

                e.subVectors(b, a).cross(d.subVectors(p, a));
                if (n.dot(e) < 0.0) {
                    return null;
                }
                e.subVectors(c, b).cross(d.subVectors(p, b));
                if (n.dot(e) < 0.0) {
                    return null;
                }
                e.subVectors(a, c).cross(d.subVectors(p, c));
                if (n.dot(e) < 0.0) {
                    return null;
                }
                return t;
            };
        }());

        calls[T.AABOX] = function (ray, aabox) {

            var min = aabox.min, max = aabox.max, orig = ray.origin,
                dir = ray.direction, tMin, tMax, tMinY, tMaxY, tMinZ, tMaxZ,
                iDirX = 1.0 / dir.x, iDirY = 1.0 / dir.y, iDirZ = 1.0 / dir.z;

            if (iDirX >= 0.0) {
                tMin = (min.x - orig.x) * iDirX;
                tMax = (max.x - orig.x) * iDirX;
            } else {
                tMin = (max.x - orig.x) * iDirX;
                tMax = (min.x - orig.x) * iDirX;
            }
            if (iDirY >= 0.0) {
                tMinY = (min.y - orig.y) * iDirY;
                tMaxY = (max.y - orig.y) * iDirY;
            } else {
                tMinY = (max.y - orig.y) * iDirY;
                tMaxY = (min.y - orig.y) * iDirY;
            }
            if ((tMin > tMaxY) || (tMinY > tMax)) {
                return null;
            }
            if ((tMinY > tMin) || (tMin !== tMin)) {
                tMin = tMinY;
            }
            if ((tMaxY < tMax) || (tMax !== tMax)) {
                tMax = tMaxY;
            }
            if (iDirZ >= 0.0) {
                tMinZ = (min.z - orig.z) * iDirZ;
                tMaxZ = (max.z - orig.z) * iDirZ;
            } else {
                tMinZ = (max.z - orig.z) * iDirZ;
                tMaxZ = (min.z - orig.z) * iDirZ;
            }
            if ((tMin > tMaxZ) || (tMinZ > tMax)) {
                return null;
            }
            if (tMinZ > tMin || tMin !== tMin ) {
                tMin = tMinZ;
            }
            if (tMaxZ < tMax || tMax !== tMax ) {
                tMax = tMaxZ;
            }
            if (tMax < 0.0) {
                return null;
            }
            return (tMin >= 0.0) ? tMin : tMax;
        };

        calls[T.SPHERE] = (function () {

            var co = B.Math.makeVector3();

            return function (ray, sphere) {

                var r = sphere.radius, dir = ray.direction,
                    b, c, d, t0, t1;

                co.subVectors(ray.origin, sphere.center);

                b = 2.0 * co.dot(dir);
                c = co.dot(co) - r * r;

                d = b * b - 4.0 * c;
                if (d < 0.0) {
                    return null;
                }
                t0 = (Math.sqrt(d) - b) / 2.0;
                t1 = -(b + Math.sqrt(d)) / 2.0;

                if (t0 < 0.0 && t1 < 0.0) {
                    return null;
                }
                if (t0 * t1 < 0.0) {
                    return Math.max(t0, t1);
                }
                return Math.min(t0, t1);
            };
        }());

        return function (object, point) {

            var type = object && object._type,
                func = type && calls[type()], t;

            if (!func) {
                throw new Error("unsupported object type");
            }
            t = func(this, object);

            if (point && t !== null) {
                this.at(t, point);
            }
            return t;
        };
    }());

    /**
     * Calculates the shortest distance between this ray and an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Ray} object
     * @returns {number} distance
     * @throws {Error} if the object argument has unsupported type
     */
    this.distanceTo = (function () {

        var calls = [];

        calls[T.POINT] = (function () {

            var v = B.Math.makeVector3();

            return function (ray, point) {

                return ray.projectPoint(point, v).distanceTo(point);
            };
        }());

        calls[T.RAY] = (function () {

            var M = B.Math,
                EPSILON2 = M.EPSILON * M.EPSILON,

                v0 = M.makeVector3(),
                v1 = M.makeVector3();

            return function (rayA, rayB) {

                var origA = rayA.origin, dirA = rayA.direction,
                    origB = rayB.origin, dirB = rayB.direction,
                    tA, tB, cl2 = v0.crossVectors(dirA, dirB).lengthSq();

                if (cl2 < EPSILON2) {
                    tA = v0.subVectors(origB, origA).dot(dirA) / dirA.length();
                    if (tA < 0.0) {
                        tB = v0.subVectors(origA, origB).dot(dirB) / dirB.length();
                        if (tB < 0.0) {
                            return origA.distanceTo(origB);
                        } else {
                            return origA.distanceTo(v0.copy(dirB).mul(tB).add(origB));
                        }
                    } else {
                        return origB.distanceTo(v0.copy(dirA).mul(tA).add(origA));
                    }
                } else {
                    tA = v1.subVectors(origB, origA).cross(dirB).dot(v0) / cl2;
                    tB = v1.subVectors(origB, origA).cross(dirA).dot(v0) / cl2;
                    if (tA < 0.0) {
                        return origA.distanceTo(rayB.projectPoint(origA, v0));
                    }
                    if (tB < 0.0) {
                        return origB.distanceTo(rayA.projectPoint(origB, v0));
                    }
                    v0.copy(dirA).mul(tA).add(origA);
                    v1.copy(dirB).mul(tB).add(origB);
                    return v0.distanceTo(v1);
                }
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
     * Checks for strict equality of this ray and another ray.
     *
     * @param {B.Math.Ray} ray
     * @returns {boolean}
     */
    this.equal = function (ray) {

        return ray.origin.equal(this.origin) && ray.direction.equal(this.direction);
    };
};

/**
 * Represents a ray.
 *
 * To create the object use [B.Math.makeRay()]{@link B.Math.makeRay}.
 *
 * @class
 * @this B.Math.Ray
 */
B.Math.Ray = function (origin, direction) {

    var V3 = B.Math.Vector3;

    /**
     * Origin of the ray.
     *
     * @type {B.Math.Vector3}
     */
    this.origin = origin || V3.ZERO.clone();

    /**
     * Direction of the ray.
     *
     * @type {B.Math.Vector3}
     */
    this.direction = (direction && direction.normalize()) || V3.Z.clone();
};

B.Math.Ray.prototype = new B.Math.RayProto();
