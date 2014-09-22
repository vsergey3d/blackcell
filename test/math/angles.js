
describe("B.Math.Angles", function() {

    var M = B.Math,
        EPSILON = M.EPSILON,
        PI = Math.PI,
        HALF_PI = PI * 0.5,
        QUARTER_PI = PI * 0.25,

        makeVector3 = M.makeVector3,
        makeMatrix3 = M.makeMatrix3,
        makeMatrix4 = M.makeMatrix4,
        makeQuaternion = M.makeQuaternion,
        makeAngles = M.makeAngles;

    it("should exist", function () {
        expect(M.Angles).to.exist;
    });

    describe("#constructor", function() {

        it("should initialized angles with default values if no params passed", function () {

            var angles = new M.Angles();

            expect(angles).to.be.closeByComponents(0, 0, 0);
        });

        it("should set passed params", function () {

            var angles = new M.Angles(HALF_PI, QUARTER_PI, -PI);

            expect(angles).to.be.closeByComponents(HALF_PI, QUARTER_PI, -PI);
        });
    });

    describe("#clone", function() {

        it("should clone angles", function () {

            var angles = makeAngles(HALF_PI, QUARTER_PI, -PI),
                clone = angles.clone();

            expect(clone).to.be.closeByComponents(angles);
        });

        it("should return a new object", function () {

            var angles = makeAngles();

            expect(angles.clone()).to.not.equal(angles);
        });
    });

    describe("#copy", function() {

        it("should copy angles", function () {

            var a1 = makeAngles(HALF_PI, QUARTER_PI, -PI),
                a2 = makeAngles();

            a2.copy(a1);
            expect(a2).to.be.closeByComponents(a1);
        });

        it("should not create a object", function () {

            var q1 = makeAngles(HALF_PI, QUARTER_PI, -PI),
                q2 = makeAngles();

            expect(q2.copy(q1)).to.equal(q2);
        });
    });

    describe("#set", function() {

        it("should set elements of angles", function () {

            var angles = makeAngles();

            angles.set(HALF_PI, QUARTER_PI, -PI);
            expect(angles).to.be.closeByComponents(HALF_PI, QUARTER_PI, -PI);
        });

        it("should handle the gimbal lock case", function () {

            var angles = makeAngles();

            angles.set(HALF_PI, HALF_PI, HALF_PI);
            expect(angles, "PI/2, PI/2, PI/2").to.be.closeByComponents(0, HALF_PI, 0);

            angles.set(-HALF_PI, HALF_PI, -HALF_PI);
            expect(angles, "-PI/2, PI/2, -PI/2").to.be.closeByComponents(0, HALF_PI, 0);

            angles.set(-HALF_PI, HALF_PI, HALF_PI);
            expect(angles, "-PI/2, PI/2, PI/2").to.be.closeByComponents(-PI, HALF_PI, 0);

            angles.set(HALF_PI, HALF_PI, -HALF_PI);
            expect(angles, "PI/2, PI/2, -PI/2").to.be.closeByComponents(PI, HALF_PI, 0);

            angles.set(HALF_PI, -HALF_PI, HALF_PI);
            expect(angles, "PI/2, -PI/2, PI/2").to.be.closeByComponents(PI, -HALF_PI, 0);

            angles.set(-HALF_PI, -HALF_PI, -HALF_PI);
            expect(angles, "-PI/2, -PI/2, -PI/2").to.be.closeByComponents(-PI, -HALF_PI, 0);

            angles.set(-HALF_PI, -HALF_PI, HALF_PI);
            expect(angles, "-PI/2, -PI/2, PI/2").to.be.closeByComponents(0, -HALF_PI, 0);

            angles.set(HALF_PI, -HALF_PI, -HALF_PI);
            expect(angles, "PI/2, -PI/2, -PI/2").to.be.closeByComponents(0, -HALF_PI, 0);
        });

        it("should not create a new object", function () {

            var q = makeAngles();
            expect(q.set(HALF_PI, QUARTER_PI, -PI)).to.equal(q);
        });
    });

    describe("#get", function () {

        it("should return elements by index", function () {

            var angles = makeAngles(HALF_PI, QUARTER_PI, -PI);

            expect(angles.get(0), "yaw").to.be.a("number").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles.get(1), "pitch").to.be.a("number").to.be.closeTo(QUARTER_PI, EPSILON);
            expect(angles.get(2), "roll").to.be.a("number").to.be.closeTo(-PI, EPSILON);
        });

        it("should throw if the index is out of range", function () {

            var angles = makeAngles(HALF_PI, QUARTER_PI, -PI);

            expect(function () {
                angles.get(3);
            }, "index > 2").to.throw();

            expect(function () {
                angles.get(-1);
            }, "negative index").to.throw();
        });
    });

    describe("#yaw", function() {

        it("should return default yaw angle", function () {

            var angles = makeAngles();

            expect(angles.yaw()).to.be.a("number").to.be.closeTo(0, EPSILON);
        });

        it("should return initial yaw angle", function () {

            var angles = makeAngles(-HALF_PI, 0, 0);

            expect(angles.yaw()).to.be.a("number").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles).to.be.closeByComponents(-HALF_PI, 0, 0);
        });

        it("should set yaw angle if new value passed", function () {

            var angles = makeAngles();

            angles.yaw(HALF_PI);
            expect(angles.yaw(), "PI/2").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles, "PI/2").to.be.closeByComponents(HALF_PI, 0, 0);

            angles.set(0, 0, 0).yaw(-HALF_PI);
            expect(angles.yaw(), "-PI/2").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles, "-PI/2").to.be.closeByComponents(-HALF_PI, 0, 0);

            angles.set(0, 0, 0).yaw(PI * 1.5);
            expect(angles.yaw(), "3*PI/2").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles, "3*PI/2").to.be.closeByComponents(-HALF_PI, 0, 0);

            angles.set(0, 0, 0).yaw(-PI * 1.5);
            expect(angles.yaw(), "-3*PI/2").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles, "-3*PI/2").to.be.closeByComponents(HALF_PI, 0, 0);

            angles.set(0, 0, 0).yaw(-PI);
            expect(angles.yaw(), "-PI").to.be.closeTo(-PI, EPSILON);
            expect(angles, "-PI").to.be.closeByComponents(-PI, 0, 0);

            angles.set(0, 0, 0).yaw(PI);
            expect(angles.yaw(), "PI").to.be.closeTo(PI, EPSILON);
            expect(angles, "PI").to.be.closeByComponents(PI, 0, 0);
        });

        it("should return the same object if setter is used", function () {

            var angles = makeAngles();

            expect(angles.yaw(HALF_PI)).to.equal(angles);
        });
    });

    describe("#pitch", function() {

        it("should return default pitch angle", function () {

            var angles = makeAngles();

            expect(angles.pitch()).to.be.a("number").to.be.closeTo(0, EPSILON);
        });

        it("should return initial pitch angle", function () {

            var angles = makeAngles(0, -HALF_PI, 0);

            expect(angles.pitch()).to.be.a("number").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles).to.be.closeByComponents(0, -HALF_PI, 0);
        });

        it("should set pitch angle if new value passed", function () {

            var angles = makeAngles();

            angles.pitch(QUARTER_PI);
            expect(angles.pitch(), "PI/4").to.be.closeTo(QUARTER_PI, EPSILON);
            expect(angles, "PI/4").to.be.closeByComponents(0, QUARTER_PI, 0);

            angles.set(0, 0, 0).pitch(-QUARTER_PI);
            expect(angles.pitch(), "-PI/4").to.be.closeTo(-QUARTER_PI, EPSILON);
            expect(angles, "-PI/4").to.be.closeByComponents(0, -QUARTER_PI, 0);

            angles.set(0, 0, 0).pitch(HALF_PI);
            expect(angles.pitch(), "PI/2").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles, "PI/2").to.be.closeByComponents(0, HALF_PI, 0);

            angles.set(0, 0, 0).pitch(-HALF_PI);
            expect(angles.pitch(), "-PI/2").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles, "-PI/2").to.be.closeByComponents(0, -HALF_PI, 0);

            angles.set(0, 0, 0).pitch(-PI);
            expect(angles.pitch(), "-PI").to.be.closeTo(0, EPSILON);
            expect(angles, "-PI").to.be.closeByComponents(PI, 0, PI);

            angles.set(0, 0, 0).pitch(PI);
            expect(angles.pitch(), "PI").to.be.closeTo(0, EPSILON);
            expect(angles, "PI").to.be.closeByComponents(PI, 0, PI);

            angles.set(0, 0, 0).pitch(-PI * 1.5);
            expect(angles.pitch(), "-3*PI/2").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles, "-3*PI/2").to.be.closeByComponents(0, HALF_PI, 0);

            angles.set(0, 0, 0).pitch(PI * 1.5);
            expect(angles.pitch(), "3*PI/2").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles, "3*PI/2").to.be.closeByComponents(0, -HALF_PI, 0);
        });

        it("should return the same object if setter is used", function () {

            var angles = makeAngles();

            expect(angles.pitch(HALF_PI)).to.equal(angles);
        });
    });

    describe("#roll", function() {

        it("should return default roll angle", function () {

            var angles = makeAngles();

            expect(angles.roll()).to.be.a("number").to.be.closeTo(0, EPSILON);
        });

        it("should return initial roll angle", function () {

            var angles = makeAngles(0, 0, -HALF_PI);

            expect(angles.roll()).to.be.a("number").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles).to.be.closeByComponents(0, 0, -HALF_PI);
        });

        it("should set roll angle if new value passed", function () {

            var angles = makeAngles();

            angles.roll(HALF_PI);
            expect(angles.roll(), "PI/2").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles, "PI/2").to.be.closeByComponents(0, 0, HALF_PI);

            angles.set(0, 0, 0).roll(-HALF_PI);
            expect(angles.roll(), "-PI/2").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles, "-PI/2").to.be.closeByComponents(0, 0, -HALF_PI);

            angles.set(0, 0, 0).roll(-PI);
            expect(angles.roll(), "-PI").to.be.closeTo(-PI, EPSILON);
            expect(angles, "-PI").to.be.closeByComponents(0, 0, -PI);

            angles.set(0, 0, 0).roll(PI);
            expect(angles.roll(), "PI").to.be.closeTo(PI, EPSILON);
            expect(angles, "PI").to.be.closeByComponents(0, 0, PI);

            angles.set(0, 0, 0).roll(PI * 1.5);
            expect(angles.roll(), "3*PI/2").to.be.closeTo(-HALF_PI, EPSILON);
            expect(angles, "3*PI/2").to.be.closeByComponents(0, 0, -HALF_PI);

            angles.set(0, 0, 0).roll(-PI * 1.5);
            expect(angles.roll(), "-3*PI/2").to.be.closeTo(HALF_PI, EPSILON);
            expect(angles, "-3*PI/2").to.be.closeByComponents(0, 0, HALF_PI);
        });

        it("should return the same object if setter is used", function () {

            var angles = makeAngles(1, 2, 3);

            expect(angles.roll(3)).to.equal(angles);
        });
    });

    describe("#fromArray", function() {

        var angles = makeAngles(),
            arr = [-HALF_PI, -QUARTER_PI, HALF_PI, QUARTER_PI, -PI],
            offset = 2;

        it("should set angles from an array", function () {

            angles.fromArray(arr);
            expect(angles).to.be.closeByComponents(arr);
        });

        it("should set angles from array with given offset", function () {

            angles.fromArray(arr, offset);
            expect(angles).to.be.closeByComponents(arr.slice(offset));
        });

        it("should return 3 if offset is not passed", function () {

            expect(angles.fromArray(arr)).to.equal(3);
        });

        it("should return new offset", function () {

            expect(angles.fromArray(arr, offset)).to.equal(offset + 3);
        });
    });

    describe("#toArray", function() {

        var angles = makeAngles(HALF_PI, QUARTER_PI, -PI),
            arr = [10, 52.9, 38, -18, 100],
            offset = 3;

        it("should set angles to an array", function () {

            var angles = makeAngles(HALF_PI, QUARTER_PI, -PI),
                arr = [];

            angles.toArray(arr);
            expect(arr).to.have.length.at.least(3);
            expect(angles).to.be.closeByComponents(arr);
        });

        it("should set angles to an array with given offset", function () {

            angles.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 3);
            expect(angles).to.be.closeByComponents(arr.slice(offset));
        });

        it("should return 3 if offset is not passed", function () {

            expect(angles.toArray(arr)).to.equal(3);
        });

        it("should return new offset", function () {

            expect(angles.toArray(arr, offset)).to.equal(offset + 3);
        });
    });

    describe("#fromRotationMatrix", function() {

        it("should set angles from 3x3 rotation matrix", function() {

            var V3 = M.Vector3,

                angles = makeAngles(),
                mx0 = makeMatrix3(),
                mx1 = makeMatrix3(),
                v = makeVector3(),

                setMX = function (mx, axis, angle) {
                    return mx.rotationAxis(axis, angle);
                },

                check = function (mx, vector, msg, refX, refY, refZ) {

                    vector.rotate(angles.fromRotationMatrix(mx));
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

        it("should set angles from 4x4 rotation matrix", function() {

            var V3 = M.Vector3,

                angles = makeAngles(),
                mx0 = makeMatrix4(),
                mx1 = makeMatrix4(),
                v = makeVector3(),

                setMX = function (mx, axis, angle) {
                    return mx.rotationAxis(axis, angle);
                },

                check = function (mx, vector, msg, refX, refY, refZ) {

                    vector.rotate(angles.fromRotationMatrix(mx));
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

            var a = makeAngles();

            expect(a.fromRotationMatrix(makeMatrix3())).to.equal(a);
            expect(a.fromRotationMatrix(makeMatrix4())).to.equal(a);
        });
    });

    describe("#fromQuaternion", function() {

        it("should set angles from quaternion", function() {

            var V3 = M.Vector3,

                angles = makeAngles(),
                q0 = makeQuaternion(),
                q1 = makeQuaternion(),
                v = makeVector3(),

                setQ = function (q, axis, angle) {
                    return q.fromAxisAngle(axis, angle);
                },

                check = function (q, vector, msg, refX, refY, refZ) {

                    vector.rotate(angles.fromQuaternion(q));
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(setQ(q0, V3.X, HALF_PI), v.set(0, 0, 1), "X=Pi/2", 0, -1, 0);
            check(setQ(q0, V3.X, PI), v.set(0, 0, 1), "X=Pi", 0, 0, -1);
            check(setQ(q0, V3.X, -HALF_PI), v.set(0, 0, 1), "X=-Pi/2", 0, 1, 0);

            check(setQ(q0, V3.Y, HALF_PI), v.set(1, 0, 0), "Y=Pi/2", 0, 0, -1);
            check(setQ(q0, V3.Y, PI), v.set(1, 0, 0), "Y=Pi", -1, 0, 0);
            check(setQ(q0, V3.Y, -HALF_PI), v.set(1, 0, 0), "Y=-Pi/2", 0, 0, 1);

            check(setQ(q0, V3.Z, HALF_PI), v.set(0, 1, 0), "Z=Pi/2", -1, 0, 0);
            check(setQ(q0, V3.Z, PI), v.set(0, 1, 0), "Z=Pi", 0, -1, 0);
            check(setQ(q0, V3.Z, -HALF_PI), v.set(0, 1, 0), "Z=-Pi/2", 1, 0, 0);

            check(setQ(q0, V3.Z, HALF_PI), v.set(0, 1, 0), "Z=Pi/2", -1, 0, 0);
            check(setQ(q0, V3.Z, PI), v.set(0, 1, 0), "Z=Pi", 0, -1, 0);
            check(setQ(q0, V3.Z, -HALF_PI), v.set(0, 1, 0), "Z=-Pi/2", 1, 0, 0);

            check(setQ(q1, V3.X, HALF_PI).mul(setQ(q0, V3.Y, HALF_PI)),
                v.set(0, 1, 0), "X=Pi/2, Y=Pi/2", 1, 0, 0);
            check(setQ(q1, V3.Y, HALF_PI).mul(setQ(q0, V3.Z, HALF_PI)),
                v.set(0, 0, 1), "Y=Pi/2, Z=Pi/2", 0, 1, 0);
            check(setQ(q1, V3.Z, HALF_PI).mul(setQ(q0, V3.X, HALF_PI)),
                v.set(1, 0, 0), "Z=Pi/2, X=Pi/2", 0, 0, 1);
        });

        it("should not create a new object", function () {

            var a = makeAngles();

            expect(a.fromQuaternion(makeQuaternion())).to.equal(a);
        });
    });

    describe("#equal", function () {

        it("should return true if angles are equal", function () {

            var a1 = makeAngles(1, 2, 3),
                a2 = makeAngles(1, 2, 3);

            expect(a1.equal(a2)).to.be.true;
        });

        it("should return false if angles are not equal", function () {

            var a1 = makeAngles(1, 2, 3),
                a2 = makeAngles(1, 0, 3);

            expect(a1.equal(a2)).to.be.false;
        });
    });
});
