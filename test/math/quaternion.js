
describe("B.Math.Quaternion", function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        PI = Math.PI,
        HALF_PI = PI * 0.5,

        makeVector3 = M.makeVector3,
        makeVector4 = M.makeVector4,
        makeMatrix3 = M.makeMatrix3,
        makeMatrix4 = M.makeMatrix4,
        makeQuaternion = M.makeQuaternion,
        makeAngles = M.makeAngles;

    it("should exist", function () {
        expect(M.Quaternion).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized a quaternion with default values if no params passed", function () {

            var q = new M.Quaternion();

            expect(q).to.be.closeByComponents(1, 0, 0, 0);
        });

        it("should set passed params", function () {

            var v = makeVector4(2, 3, 4, 5).normalize(),
                q = new M.Quaternion(v.w, v.x, v.y, v.z);

            expect(q).to.be.closeByComponents(v.w, v.x, v.y, v.z);
        });

        it("should normalize passed params", function () {

            var v = makeVector4(2, 3, 4, 5),
                q = new M.Quaternion(v.w, v.x, v.y, v.z);

            v.normalize();

            expect(q).to.be.closeByComponents(v.w, v.x, v.y, v.z);
        });

        it("should make unit-quaternion from zero params", function () {

            var q = new M.Quaternion(0, 0, 0, 0);

            expect(q).to.be.closeByComponents(1, 0, 0, 0);
        });
    });

    describe("#clone", function () {

        it("should clone a quaternion", function () {

            var q = makeQuaternion(2, 3, 4, 5),
                clone = q.clone();

            expect(clone).to.be.closeByComponents(q);
        });

        it("should return a new object", function () {

            var q = makeQuaternion(),
                clone = q.clone();

            expect(clone).to.not.equal(q);
        });
    });

    describe("#copy", function () {

        it("should copy a quaternion", function () {

            var q1 = makeQuaternion(2, 3, 4, 5),
                q2 = makeQuaternion();

            q2.copy(q1);
            expect(q2).to.be.closeByComponents(q1);
        });

        it("should not create a new object", function () {

            var q1 = makeQuaternion(2, 3, 4, 5),
                q2 = makeQuaternion();

            expect(q2.copy(q1)).to.equal(q2);
        });
    });

    describe("#set", function () {

        it("should set elements of a quaternion", function () {

            var v = makeVector4(2, 3, 4, 5).normalize(),
                q = makeQuaternion();

            q.set(v.w, v.x, v.y, v.z);

            expect(q).to.be.closeByComponents(v.w, v.x, v.y, v.z);
        });

        it("should set elements of a quaternion and normalize it", function () {

            var v = makeVector4(2, 3, 4, 5),
                q = makeQuaternion();

            v.normalize();
            q.set(v.w, v.x, v.y, v.z);

            expect(q).to.be.closeByComponents(v.w, v.x, v.y, v.z);
        });

        it("should not create a new object", function () {

            var q = makeQuaternion();

            expect(q.set(2, 3, 4, 5)).to.equal(q);
        });
    });

    describe("#get", function () {

        it("should return quaternion elements by an index", function () {

            var v = makeVector4(2, 3, 4, 5).normalize(),
                q = makeQuaternion(v.w, v.x, v.y, v.z);

            expect(q.get(0), "w").to.be.a("number").and.to.be.closeTo(v.w, EPSILON);
            expect(q.get(1), "x").to.be.a("number").and.to.be.closeTo(v.x, EPSILON);
            expect(q.get(2), "y").to.be.a("number").and.to.be.closeTo(v.y, EPSILON);
            expect(q.get(3), "z").to.be.a("number").and.to.be.closeTo(v.z, EPSILON);
        });

        it("should throw if the index is out of range", function () {

            var q = makeQuaternion(2, 3, 4, 5);

            expect(function () {
                q.get(4);
            }, "index > 3").to.throw();

            expect(function () {
                q.get(-1);
            }, "negative index").to.throw();
        });
    });

    describe("#fromArray", function () {

        var q = makeQuaternion(),
            v = makeVector4(2, 3, 4, 5).normalize(),
            arr = [v.w, v.x, v.y, v.z, 1, v.w, v.x, v.y, v.z, 2, 3, 4, 5],
            offset0 = 5, offset1 = 9;

        it("should set a quaternion from an array", function () {

            q.fromArray(arr);

            expect(q).to.be.closeByComponents(arr);
        });

        it("should set a quaternion from array with a given offset", function () {

            q.fromArray(arr, offset0);

            expect(q).to.be.closeByComponents(arr.slice(offset0));
        });

        it("should set a quaternion from array with a given offset and performs normalization",
            function () {

                q.fromArray(arr, offset1);

                expect(q).to.be.closeByComponents(v.x, v.y, v.z, v.w);
            }
        );

        it("should return 4 if the offset is not passed", function () {

            expect(q.fromArray(arr)).to.equal(4);
        });

        it("should return a new offset", function () {

            expect(q.fromArray(arr, offset0)).to.equal(offset0 + 4);
        });
    });

    describe("#toArray", function () {

        var q = makeQuaternion(2, 3, 4, 5),
            arr = [0, 1, 2, 3, 4, 5, 6, 7, 8],
            offset = 3;

        it("should set a quaternion to an array", function () {

            q.toArray(arr);

            expect(arr).to.have.length.at.least(4);
            expect(q).to.be.closeByComponents(arr);
        });

        it("should set a quaternion to an array with a given offset", function () {

            q.toArray(arr, offset);

            expect(arr).to.have.length.at.least(offset + 4);
            expect(q).to.be.closeByComponents(arr.slice(offset));
        });

        it("should return 4 if the offset is not passed", function () {

            expect(q.toArray(arr)).to.equal(4);
        });

        it("should return a new offset", function () {

            expect(q.toArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#fromAxisAngle", function () {

        it("should set a quaternion from an axis and an angle", function () {

            var V3 = M.Vector3,

                q = makeQuaternion(),
                v = makeVector3(),

                check = function (axis, angle, vector, msg, refX, refY, refZ) {

                    vector.rotate(q.fromAxisAngle(axis, angle));
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(V3.X, HALF_PI, v.set(0, 1, 0), "X=Pi/2", 0, 0, 1);
            check(V3.X, PI, v.set(0, 1, 0), "X=Pi", 0, -1, 0);
            check(V3.X, -HALF_PI, v.set(0, 1, 0), "X=-Pi/2", 0, 0, -1);

            check(V3.Y, HALF_PI, v.set(0, 0, 1), "Y=Pi/2", 1, 0, 0);
            check(V3.Y, PI, v.set(0, 0, 1), "Y=Pi", 0, 0, -1);
            check(V3.Y, -HALF_PI, v.set(0, 0, 1), "Y=-Pi/2", -1, 0, 0);

            check(V3.Z, HALF_PI, v.set(1, 0, 0), "Z=Pi/2", 0, 1, 0);
            check(V3.Z, PI, v.set(1, 0, 0), "Z=Pi", -1, 0, 0);
            check(V3.Z, -HALF_PI, v.set(1, 0, 0), "Z=-Pi/2", 0, -1, 0);
        });

        it("should not create a new object", function () {

            var q = makeQuaternion();

            expect(q.fromAxisAngle(makeVector3(0, 1, 0), HALF_PI)).to.equal(q);
        });
    });

    describe("#fromRotationMatrix", function () {

        it("should set a quaternion from M.Matrix3", function () {

            var V3 = M.Vector3,

                q = makeQuaternion(),
                mx0 = makeMatrix3(),
                mx1 = makeMatrix3(),
                v = makeVector3(),

                setMX = function (mx, axis, angle) {
                    return mx.rotationAxis(axis, angle);
                },

                check = function (mx, vector, msg, refX, refY, refZ) {

                    vector.rotate(q.fromRotationMatrix(mx));
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(setMX(mx0, V3.X, HALF_PI), v.set(0, 1, 0), "X=Pi/2", 0, 0, 1);
            check(setMX(mx0, V3.X, PI), v.set(0, 1, 0), "X=Pi", 0, -1, 0);
            check(setMX(mx0, V3.X, -HALF_PI), v.set(0, 1, 0), "X=-Pi/2", 0, 0, -1);

            check(setMX(mx0, V3.Y, HALF_PI), v.set(0, 0, 1), "Y=Pi/2", 1, 0, 0);
            check(setMX(mx0, V3.Y, PI), v.set(0, 0, 1), "Y=Pi", 0, 0, -1);
            check(setMX(mx0, V3.Y, -HALF_PI), v.set(0, 0, 1), "Y=-Pi/2", -1, 0, 0);

            check(setMX(mx0, V3.Z, HALF_PI), v.set(1, 0, 0), "Z=Pi/2", 0, 1, 0);
            check(setMX(mx0, V3.Z, PI), v.set(1, 0, 0), "Z=Pi", -1, 0, 0);
            check(setMX(mx0, V3.Z, -HALF_PI), v.set(1, 0, 0), "Z=-Pi/2", 0, -1, 0);

            check(setMX(mx0, V3.X, HALF_PI).mul(setMX(mx1, V3.Y, HALF_PI)),
                v.set(0, 1, 0), "X=Pi/2, Y=Pi/2", 1, 0, 0);
            check(setMX(mx0, V3.Y, HALF_PI).mul(setMX(mx1, V3.Z, HALF_PI)),
                v.set(0, 0, 1), "Y=Pi/2, Z=Pi/2", 0, 1, 0);
            check(setMX(mx0, V3.Z, HALF_PI).mul(setMX(mx1, V3.X, HALF_PI)),
                v.set(1, 0, 0), "Z=Pi/2, X=Pi/2", 0, 0, 1);
        });

        it("should set a quaternion from M.Matrix4", function () {

            var V3 = M.Vector3,

                q = makeQuaternion(),
                mx0 = makeMatrix4(),
                mx1 = makeMatrix4(),
                v = makeVector3(),

                setMX = function (mx, axis, angle) {
                    return mx.rotationAxis(axis, angle);
                },

                check = function (mx, vector, msg, refX, refY, refZ) {

                    vector.rotate(q.fromRotationMatrix(mx));
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(setMX(mx0, V3.X, HALF_PI), v.set(0, 1, 0), "X=Pi/2", 0, 0, 1);
            check(setMX(mx0, V3.X, PI), v.set(0, 1, 0), "X=Pi", 0, -1, 0);
            check(setMX(mx0, V3.X, -HALF_PI), v.set(0, 1, 0), "X=-Pi/2", 0, 0, -1);

            check(setMX(mx0, V3.Y, HALF_PI), v.set(0, 0, 1), "Y=Pi/2", 1, 0, 0);
            check(setMX(mx0, V3.Y, PI), v.set(0, 0, 1), "Y=Pi", 0, 0, -1);
            check(setMX(mx0, V3.Y, -HALF_PI), v.set(0, 0, 1), "Y=-Pi/2", -1, 0, 0);

            check(setMX(mx0, V3.Z, HALF_PI), v.set(1, 0, 0), "Z=Pi/2", 0, 1, 0);
            check(setMX(mx0, V3.Z, PI), v.set(1, 0, 0), "Z=Pi", -1, 0, 0);
            check(setMX(mx0, V3.Z, -HALF_PI), v.set(1, 0, 0), "Z=-Pi/2", 0, -1, 0);

            check(setMX(mx0, V3.X, HALF_PI).mul(setMX(mx1, V3.Y, HALF_PI)),
                v.set(0, 1, 0), "X=Pi/2, Y=Pi/2", 1, 0, 0);
            check(setMX(mx0, V3.Y, HALF_PI).mul(setMX(mx1, V3.Z, HALF_PI)),
                v.set(0, 0, 1), "Y=Pi/2, Z=Pi/2", 0, 1, 0);
            check(setMX(mx0, V3.Z, HALF_PI).mul(setMX(mx1, V3.X, HALF_PI)),
                v.set(1, 0, 0), "Z=Pi/2, X=Pi/2", 0, 0, 1);
        });

        it("should not create a new object", function () {

            var q = makeQuaternion();

            expect(q.fromRotationMatrix(M.Matrix3.IDENTITY)).to.equal(q);
        });
    });

    describe("#fromAngles", function () {

        it("should set a quaternion from M.Angles", function () {

            var q = makeQuaternion(),
                a = makeAngles(),
                v = makeVector3(),

                check = function (angles, vector, msg, refX, refY, refZ) {

                    vector.rotate(q.fromAngles(angles));
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(a.set(HALF_PI, 0, 0), v.set(0, 0, 1), "yaw=Pi/2", 1, 0, 0);
            check(a.set(PI, 0, 0), v.set(0, 0, 1), "yaw=Pi", 0, 0, -1);
            check(a.set(-HALF_PI, 0, 0), v.set(0, 0, 1), "yaw=-Pi/2", -1, 0, 0);

            check(a.set(0, HALF_PI, 0), v.set(0, 0, 1), "pitch=Pi/2", 0, -1, 0);
            check(a.set(0, -HALF_PI, 0), v.set(0, 0, 1), "pitch=-Pi/2", 0, 1, 0);

            check(a.set(0, 0, HALF_PI), v.set(1, 0, 0), "roll=Pi/2", 0, 1, 0);
            check(a.set(0, 0, PI), v.set(1, 0, 0), "roll=Pi", -1, 0, 0);
            check(a.set(0, 0, -HALF_PI), v.set(1, 0, 0), "roll=-Pi/2", 0, -1, 0);

            check(a.set(HALF_PI, HALF_PI, 0), v.set(0, 0, 1),
                "yaw=Pi/2, pitch=Pi/2", 0, -1, 0);
            check(a.set(HALF_PI, 0, HALF_PI), v.set(1, 0, 0),
                "yaw=Pi/2, roll=Pi/2", 0, 1, 0);
            check(a.set(0, HALF_PI, HALF_PI), v.set(0, 1, 0),
                "pitch=Pi/2, roll=Pi/2", -1, 0, 0);

            check(a.set(HALF_PI, HALF_PI, HALF_PI), v.set(0, 1, 0),
                "yaw=Pi/2, pitch=Pi/2, roll=Pi/2", 0, 0, 1);
            check(a.set(HALF_PI, -HALF_PI, HALF_PI), v.set(0, 1, 0),
                "yaw=Pi/2, pitch=-Pi/2, roll=Pi/2", 0, 0, 1);
        });

        it("should not create a new object", function () {

            var q = makeQuaternion();

            expect(q.fromAngles(makeAngles(PI, 0, 0))).to.equal(q);
        });
    });

    describe("#axis", function () {

        it("should return axis vector", function () {

            var axis = makeVector3(-1, 1, 0).normalize(),
                q = makeQuaternion().fromAxisAngle(axis, HALF_PI);

            expect(q.axis()).to.be.instanceof(M.Vector3).and.
                to.be.closeByComponents(axis.x, axis.y, axis.z);
        });

        it("should return zero-vector for identity quaternion", function () {

            expect(M.Quaternion.IDENTITY.axis()).to.be.instanceof(M.Vector3).and.
                to.be.closeByComponents(0, 0, 0);
        });

        it("should set axis vector to a given vector", function () {

            var axis = makeVector3(-1, 1, 0).normalize(),
                q = makeQuaternion().fromAxisAngle(axis, HALF_PI),
                result = makeVector3();

            expect(q.axis(result)).to.be.instanceof(M.Vector3).and.
                to.be.closeByComponents(axis.x, axis.y, axis.z);
        });
    });

    describe("#angle", function () {

        it("should return angle", function () {

            var q = makeQuaternion().fromAxisAngle(makeVector3(-1, 1, 0), HALF_PI);

            expect(q.angle()).to.be.a("number").and.to.be.closeTo(HALF_PI, EPSILON);
        });
    });

    describe("#mulQuaternions", function () {

        it("should multiply two given quaternions", function () {

            var q1 = makeQuaternion().fromAxisAngle(makeVector3(0, 1, 0), HALF_PI),
                q2 = makeQuaternion().fromAxisAngle(makeVector3(1, 0, 0), HALF_PI),
                q3 = makeQuaternion(),
                v = makeVector3(1, 0, 0);

            q3.mulQuaternions(q1, q2);
            v.rotate(q3);
            expect(v).to.be.closeByComponents(0, 1, 0);
        });

        it("should not create a new object", function () {

            var q1 = makeQuaternion().fromAxisAngle(makeVector3(0, 1, 0), HALF_PI),
                q2 = makeQuaternion().fromAxisAngle(makeVector3(1, 0, 0), HALF_PI),
                q3 = makeQuaternion();

            expect(q3.mulQuaternions(q1, q2)).to.equal(q3);
        });
    });

    describe("#mul", function () {

        it("should call M.Quaternion.mulQuaternions", function () {

            var q1 = makeQuaternion(),
                q2 = makeQuaternion(),

                spy = sinon.spy(q1, "mulQuaternions");

            q1.mul(q2);
            expect(spy).to.be.calledWith(q1, q2);
        });

        it("should not create a new object", function () {

            var q = makeQuaternion();

            expect(q.mul(2)).to.equal(q);
        });
    });

    describe("#dot", function () {

        it("should return dot product of a quaternion and another quaternion", function () {

            var q1 = makeQuaternion().fromAxisAngle(makeVector3(0, 1, 0), PI),
                q2 = makeQuaternion().fromAxisAngle(makeVector3(0, 0, 1), PI);

            expect(q1.dot(q2)).to.be.a("number").and.be.closeTo(0, EPSILON);
        });

        it("should return 1 if dot product of a quaternion with itself ", function () {

            var q = makeQuaternion().fromAxisAngle(makeVector3(0, 1, 0), PI);

            expect(q.dot(q)).to.be.a("number").and.be.closeTo(1, EPSILON);
        });
    });

    describe("#invert", function () {

        it("should invert a quaternion", function () {

            var q = makeQuaternion(),
                v = makeVector3();

            q.fromAxisAngle(makeVector3(0, 1, 0), HALF_PI);
            v.set(1, 0, 0).rotate(q);
            q.invert();
            v.rotate(q);
            expect(v, "[x-axis]").to.be.closeByComponents(1, 0, 0);

            q.fromAxisAngle(makeVector3(1, 0, 0), HALF_PI);
            v.set(0, 1, 0).rotate(q);
            q.invert();
            v.rotate(q);
            expect(v, "[y-axis]").to.be.closeByComponents(0, 1, 0);

            q.fromAxisAngle(makeVector3(0, 0, 1), HALF_PI);
            v.set(1, 0, 0).rotate(q);
            q.invert();
            v.rotate(q);
            expect(v, "[z-axis]").to.be.closeByComponents(1, 0, 0);
        });

        it("should not create a new object", function () {

            var q = makeQuaternion();

            expect(q.invert()).to.equal(q);
        });
    });

    describe("#slerp", function () {

        it("should spherical interpolate between two given quaternions", function () {

            var v = makeVector3(),
                q1 = makeQuaternion(),
                q2 = makeQuaternion();

            q1.fromAxisAngle(makeVector3(1, 0, 0), HALF_PI);
            q2.fromAxisAngle(makeVector3(1, 0, 0), PI);

            v.set(0, 1, 0).rotate(q1.slerp(q2, 0));
            expect(v, "along x-axis [t=0]").to.be.closeByComponents(0, 0, 1);

            v.set(0, 1, 0).rotate(q1.slerp(q2, 0.5));
            expect(v, "along x-axis [t=0.5]").to.be.closeByComponents(
                0, Math.cos(PI * 0.75), Math.sin(PI * 0.75));

            v.set(0, 1, 0).rotate(q1.slerp(q2, 1));
            expect(v, "along x-axis [t=1]").to.be.closeByComponents(0, -1, 0);


            q1.fromAxisAngle(makeVector3(0, 1, 0), PI);
            q2.fromAxisAngle(makeVector3(0, 1, 0), HALF_PI);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 0));
            expect(v, "along y-axis [t=0]").to.be.closeByComponents(-1, 0, 0);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 0.5));
            expect(v, "along y-axis [t=0.5]").to.be.closeByComponents(
                Math.cos(PI * 0.75), 0, -Math.sin(PI * 0.75));

            v.set(1, 0, 0).rotate(q1.slerp(q2, 1));
            expect(v, "along y-axis [t=1]").to.be.closeByComponents(0, 0, -1);


            q1.fromAxisAngle(makeVector3(0, 0, 1), PI * 0.25);
            q2.fromAxisAngle(makeVector3(0, 0, 1), -PI * 0.25);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 0));
            expect(v, "along y-axis [t=0]").to.be.closeByComponents(
                Math.cos(PI * 0.25), Math.sin(PI * 0.25), 0);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 0.5));
            expect(v, "along y-axis [t=0.5]").to.be.closeByComponents(1, 0, 0);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 1));
            expect(v, "along y-axis [t=1]").to.be.closeByComponents(
                Math.cos(PI * 0.25), -Math.sin(PI * 0.25), 0);
        });

        it("should spherical interpolate by shortest arc", function () {

            var v = makeVector3(),
                q1 = makeQuaternion(),
                q2 = makeQuaternion();

            q1.fromAxisAngle(makeVector3(0, 0, 1), PI * 0.25);
            q2.fromAxisAngle(makeVector3(0, 0, 1), PI * 1.75);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 0));
            expect(v, "along y-axis [t=0]").to.be.closeByComponents(
                Math.cos(PI * 0.25), Math.sin(PI * 0.25), 0);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 0.5));
            expect(v, "along y-axis [t=0.5]").to.be.closeByComponents(1, 0, 0);

            v.set(1, 0, 0).rotate(q1.slerp(q2, 1));
            expect(v, "along y-axis [t=1]").to.be.closeByComponents(
                Math.cos(PI * 0.25), -Math.sin(PI * 0.25), 0);
        });

        it("should not create a new object", function () {

            var q1 = makeQuaternion(),
                q2 = makeQuaternion(),
                q = makeQuaternion();

            expect(q1.slerp(q2, 0.5, q)).to.equal(q);
        });
    });

    describe("#equal", function () {

        it("should return true if quaternions are equal", function () {

            var q1 = makeQuaternion(-1, 1, 2, 3),
                q2 = makeQuaternion(-1, 1, 2, 3);

            expect(q1.equal(q2)).to.be.true;
        });

        it("should return false if quaternions are not equal", function () {

            var q1 = makeQuaternion(-1, 1, 2, 3),
                q2 = makeQuaternion(0, 1, 2, 3);

            expect(q1.equal(q2)).to.be.false;
        });
    });

    describe("IDENTITY", function () {

        it("should exist", function () {
            expect(M.Quaternion.IDENTITY).to.exist;
        });

        it("should be an instance of M.Quaternion", function () {
            expect(M.Quaternion.IDENTITY).to.be.instanceof(M.Quaternion);
        });

        it("should be identity quaternion", function () {

            var identity = M.Quaternion.IDENTITY;

            expect(identity).to.be.closeByComponents(1, 0, 0, 0);
        });
    });
});
