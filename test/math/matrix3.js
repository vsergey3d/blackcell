
describe("B.Math.Matrix3", function () {

    var M = B.Math,
        PI = Math.PI,
        HALF_PI = PI * 0.5,

        makeVector3 = M.makeVector3,
        makeMatrix3 = M.makeMatrix3,
        makeAngles = M.makeAngles,
        makeQuaternion = M.makeQuaternion;

    it("should exist", function () {
        expect(M.Matrix3).to.exist;
    });

    describe("ZERO", function () {

        it("should exist", function () {
            expect(M.Matrix3.ZERO).to.exist;
        });

        it("should be an instance of M.Matrix3", function () {
            expect(M.Matrix3.ZERO).to.be.instanceof(M.Matrix3);
        });

        it("should be zero matrix", function () {

            var m = M.Matrix3.ZERO.m;

            expect(m[0], "m00").to.be.a("number").and.equal(0);
            expect(m[1], "m10").to.be.a("number").and.equal(0);
            expect(m[2], "m20").to.be.a("number").and.equal(0);

            expect(m[3], "m01").to.be.a("number").and.equal(0);
            expect(m[4], "m11").to.be.a("number").and.equal(0);
            expect(m[5], "m21").to.be.a("number").and.equal(0);

            expect(m[6], "m02").to.be.a("number").and.equal(0);
            expect(m[7], "m12").to.be.a("number").and.equal(0);
            expect(m[8], "m22").to.be.a("number").and.equal(0);
        });
    });

    describe("IDENTITY", function () {

        it("should exist", function () {
            expect(M.Matrix3.IDENTITY).to.exist;
        });

        it("should be an instance of M.Matrix3", function () {
            expect(M.Matrix3.IDENTITY).to.be.instanceof(M.Matrix3);
        });

        it("should be identity matrix", function () {

            var m = M.Matrix3.IDENTITY.m;

            expect(m[0], "m00").to.be.a("number").and.equal(1);
            expect(m[1], "m10").to.be.a("number").and.equal(0);
            expect(m[2], "m20").to.be.a("number").and.equal(0);

            expect(m[3], "m01").to.be.a("number").and.equal(0);
            expect(m[4], "m11").to.be.a("number").and.equal(1);
            expect(m[5], "m21").to.be.a("number").and.equal(0);

            expect(m[6], "m02").to.be.a("number").and.equal(0);
            expect(m[7], "m12").to.be.a("number").and.equal(0);
            expect(m[8], "m22").to.be.a("number").and.equal(1);
        });
    });

    describe("constructor", function () {

        it("should be identity matrix by default", function () {

            var mx = new M.Matrix3();

            expect(mx).to.equalByComponents(M.Matrix3.IDENTITY);
        });

        it("should not be identity matrix initialized arguments passed", function () {

            var mx = new M.Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

            expect(mx).to.not.deep.equal(M.Matrix3.IDENTITY);
        });

        it("should initialized with passed arguments", function () {

            var mx = new M.Matrix3(
                1, 4, 7,
                2, 5, 8,
                3, 6, 9),

                m = mx.m;

            expect(m[0], "m00").to.be.a("number").and.equal(1);
            expect(m[1], "m10").to.be.a("number").and.equal(2);
            expect(m[2], "m20").to.be.a("number").and.equal(3);

            expect(m[3], "m01").to.be.a("number").and.equal(4);
            expect(m[4], "m11").to.be.a("number").and.equal(5);
            expect(m[5], "m21").to.be.a("number").and.equal(6);

            expect(m[6], "m02").to.be.a("number").and.equal(7);
            expect(m[7], "m12").to.be.a("number").and.equal(8);
            expect(m[8], "m22").to.be.a("number").and.equal(9);
        });
    });

    describe("#clone", function () {

        it("should clone the matrix", function () {

            var mx = makeMatrix3(5, 0, 1, 0, 5, 1, 0, 1, 5),
                clone = mx.clone();

            expect(clone).to.equalByComponents(mx);
        });

        it("should create a new object", function () {

            var mx = makeMatrix3(),
                clone = mx.clone();

            expect(clone).to.not.equal(mx);
        });
    });

    describe("#copy", function () {

        it("should copy matrix", function () {

            var mx1 = makeMatrix3(5, 0, 1, 0, 5, 1, 0, 1, 5),
                mx2 = makeMatrix3();

            mx2.copy(mx1);
            expect(mx2).to.equalByComponents(mx1);
        });

        it("should not create a new object", function () {

            var mx1 = makeMatrix3(5, 0, 1, 0, 5, 1, 0, 1, 5),
                mx2 = makeMatrix3();

            expect(mx2.copy(mx1)).to.equal(mx2);
        });
    });

    describe("#set", function () {

        it("should set matrix elements", function () {

            var mx = makeMatrix3();

            mx.set(5, 1, 0, 1, 5, 1, 0, 0, 5);

            expect(mx).to.equalByComponents(5, 1, 0, 1, 5, 0, 0, 1, 5);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();
            expect(mx.set(1, 0, 0, 0, 1, 0,  0, 0, 1)).to.equal(mx);
        });
    });

    describe("#get", function () {

        it("should return matrix element by row and column indices", function () {

            var mx = makeMatrix3(
                1, 4, 7,
                2, 5, 8,
                3, 6, 9);

            expect(mx.get(0, 0), "m00").to.be.a("number").and.equal(1);
            expect(mx.get(1, 0), "m10").to.be.a("number").and.equal(2);
            expect(mx.get(2, 0), "m20").to.be.a("number").and.equal(3);

            expect(mx.get(0, 1), "m01").to.be.a("number").and.equal(4);
            expect(mx.get(1, 1), "m11").to.be.a("number").and.equal(5);
            expect(mx.get(2, 1), "m21").to.be.a("number").and.equal(6);

            expect(mx.get(0, 2), "m02").to.be.a("number").and.equal(7);
            expect(mx.get(1, 2), "m12").to.be.a("number").and.equal(8);
            expect(mx.get(2, 2), "m22").to.be.a("number").and.equal(9);
        });

        it("should throw if the index is out of range", function () {

            var mx = makeMatrix3(
                    1, 4, 7,
                    2, 5, 8,
                    3, 6, 9);

            expect(function () {
                mx.get(-1, 0);
            }, "row < 0").to.throw();

            expect(function () {
                mx.get(3, 0);
            }, "col > 2").to.throw();

            expect(function () {
                mx.get(0, -1);
            }, "row > 0").to.throw();

            expect(function () {
                mx.get(0, 3);
            }, "row > 2").to.throw();
        });
    });

    describe("#setAxisX", function () {

        it("should set elements of X-axis [x component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisX(makeVector3(1, 0, 0));

            expect(m[0], "m00").to.equal(1);
            expect(m[1], "m10").to.equal(0);
            expect(m[2], "m20").to.equal(0);
        });

        it("should set elements of X-axis [y component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisX(makeVector3(0, 1, 0));

            expect(m[0], "m00").to.equal(0);
            expect(m[1], "m10").to.equal(1);
            expect(m[2], "m20").to.equal(0);
        });

        it("should set elements of X-axis [z component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisX(makeVector3(0, 0, 1));

            expect(m[0], "m00").to.equal(0);
            expect(m[1], "m10").to.equal(0);
            expect(m[2], "m20").to.equal(1);
        });

        it("should not change elements other than of X-axis", function () {

            var mx = makeMatrix3();

            mx.setAxisX(makeVector3(1, 1, 1));

            expect(mx).to.equalByComponents(
                1, 1, 1,
                0, 1, 0,
                0, 0, 1);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.setAxisX(makeVector3(1, 0, 0))).to.equal(mx);
        });
    });

    describe("#getAxisX", function () {

        it("should return X-axis vector", function () {

            var mx = makeMatrix3().setAxisX(makeVector3(2, 3, 4)),
                res = mx.getAxisX();

            expect(res).to.be.instanceof(M.Vector3).and.to.equalByComponents(2, 3, 4);
        });

        it("should set X-axis to the vector if passed", function () {

            var mx = makeMatrix3().setAxisX(makeVector3(2, 3, 4)),
                v = makeVector3();

            mx.getAxisX(v);
            expect(v).to.equalByComponents(2, 3, 4);
        });
    });

    describe("#setAxisY", function () {

        it("should set elements of Y-axis [x component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisY(makeVector3(1, 0, 0));

            expect(m[3], "m01").to.equal(1);
            expect(m[4], "m11").to.equal(0);
            expect(m[5], "m12").to.equal(0);
        });

        it("should set elements of Y-axis [y component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisY(makeVector3(0, 1, 0));

            expect(m[3], "m01").to.equal(0);
            expect(m[4], "m11").to.equal(1);
            expect(m[5], "m12").to.equal(0);
        });

        it("should set elements of Y-axis [z component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisY(makeVector3(0, 0, 1));

            expect(m[3], "m01").to.equal(0);
            expect(m[4], "m11").to.equal(0);
            expect(m[5], "m12").to.equal(1);
        });

        it("should not change elements other than of Y-axis", function () {

            var mx = makeMatrix3();

            mx.setAxisY(makeVector3(1, 1, 1));

            expect(mx).to.equalByComponents(
                1, 0, 0,
                1, 1, 1,
                0, 0, 1);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.setAxisY(makeVector3(1, 0, 0))).to.equal(mx);
        });
    });

    describe("#getAxisY", function () {

        it("should return Y-axis vector", function () {

            var mx = makeMatrix3().setAxisY(makeVector3(2, 3, 4)),
                res = mx.getAxisY();

            expect(res).to.be.instanceof(M.Vector3).and.to.equalByComponents(2, 3, 4);
        });

        it("should set Y-axis to the vector if passed", function () {

            var mx = makeMatrix3().setAxisY(makeVector3(2, 3, 4)),
                v = makeVector3();

            mx.getAxisY(v);
            expect(v).to.equalByComponents(2, 3, 4);
        });
    });

    describe("#setAxisZ", function () {

        it("should set elements of Z-axis [x component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisZ(makeVector3(1, 0, 0));

            expect(m[6], "m02").to.equal(1);
            expect(m[7], "m12").to.equal(0);
            expect(m[8], "m22").to.equal(0);
        });

        it("should set elements of Z-axis [y component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisZ(makeVector3(0, 1, 0));

            expect(m[6], "m02").to.equal(0);
            expect(m[7], "m12").to.equal(1);
            expect(m[8], "m22").to.equal(0);
        });

        it("should set elements of Z-axis [z component]", function () {

            var mx = makeMatrix3(),
                m = mx.m;

            mx.setAxisZ(makeVector3(0, 0, 1));

            expect(m[6], "m02").to.equal(0);
            expect(m[7], "m12").to.equal(0);
            expect(m[8], "m22").to.equal(1);
        });

        it("should not change elements other than of Z-axis", function () {

            var mx = makeMatrix3();

            mx.setAxisZ(makeVector3(1, 1, 1));
            expect(mx).to.equalByComponents(
                1, 0, 0,
                0, 1, 0,
                1, 1, 1);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.setAxisZ(makeVector3(1, 0, 0))).to.equal(mx);
        });
    });

    describe("#getAxisZ", function () {

        it("should return Z-axis vector", function () {

            var mx = makeMatrix3().setAxisZ(makeVector3(2, 3, 4)),
                res = mx.getAxisZ();

            expect(res).to.be.instanceof(M.Vector3).and.to.equalByComponents(2, 3, 4);
        });

        it("should set Z-axis to the vector if passed", function () {

            var mx = makeMatrix3().setAxisZ(makeVector3(2, 3, 4)),
                v = makeVector3();

            mx.getAxisZ(v);
            expect(v).to.equalByComponents(2, 3, 4);
        });
    });

    describe("#extractScale", function () {

        it("should return scale factors [only scale]", function () {

            var mx = makeMatrix3().scale(2, 3, 4);

            expect(mx.extractScale()).to.be.instanceof(M.Vector3).and.closeByComponents(2, 3, 4);
        });

        it("should return scale factors", function () {

            var mxS = makeMatrix3().scale(2, 3, 4),
                mxR = makeMatrix3().rotationAxis(
                    makeVector3(1, 1, 1).normalize(), HALF_PI),
                mx = mxS.clone().mul(mxR);

            expect(mx.extractScale()).to.be.instanceof(M.Vector3).and.closeByComponents(2, 3, 4);
        });
    });

    describe("#fromArray", function () {

        var mx = makeMatrix3(),
            arr = [1, -1, 5, 0, 1, 0, 5, 1, 0, 1, 5],
            offset = 2;

        it("should set matrix from array", function () {

            mx.fromArray(arr);
            expect(mx).to.equalByComponents(arr);
        });

        it("should set matrix from array with given offset", function () {

            mx.fromArray(arr, offset);
            expect(mx).to.equalByComponents(arr.slice(offset));
        });

        it("should return 9 if offset is not passed", function () {

            expect(mx.fromArray(arr)).to.equal(9);
        });

        it("should return new offset", function () {

            expect(mx.fromArray(arr, offset)).to.equal(offset + 9);
        });
    });

    describe("#toArray", function () {

        var mx = makeMatrix3(),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 1;

        it("should set matrix elements to an array", function () {

            mx.toArray(arr);

            expect(arr).to.have.length.at.least(9);
            expect(mx).to.equalByComponents(arr);
        });

        it("should set matrix elements to an array with given offset", function () {

            mx.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 9);
            expect(mx).to.equalByComponents(arr.slice(offset));
        });

        it("should return 9 if offset is not passed", function () {

            expect(mx.toArray(arr)).to.equal(9);
        });

        it("should return new offset", function () {

            expect(mx.toArray(arr, offset)).to.equal(offset + 9);
        });
    });

    describe("#fromAngles", function () {

        it("should set matrix from angles", function() {

            var mx = makeMatrix3(),
                a = makeAngles(),
                v = makeVector3(),

                check = function (angles, vector, msg, refX, refY, refZ) {

                    vector.transform(mx.fromAngles(angles));
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

            check(a.set(HALF_PI, HALF_PI, 0), v.set(0, 0, 1), "yaw=Pi/2, pitch=Pi/2", 0, -1, 0);
            check(a.set(HALF_PI, 0, HALF_PI), v.set(1, 0, 0), "yaw=Pi/2, roll=Pi/2", 0, 1, 0);
            check(a.set(0, HALF_PI, HALF_PI), v.set(0, 1, 0), "pitch=Pi/2, roll=Pi/2", -1, 0, 0);

            check(a.set(HALF_PI, HALF_PI, HALF_PI), v.set(0, 1, 0),
                "yaw=Pi/2, pitch=Pi/2, roll=Pi/2", 0, 0, 1);
            check(a.set(HALF_PI, -HALF_PI, HALF_PI), v.set(0, 1, 0),
                "yaw=Pi/2, pitch=-Pi/2, roll=Pi/2", 0, 0, 1);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.fromAngles(makeAngles())).to.equal(mx);
        });
    });

    describe("#fromQuaternion", function() {

        it("should set matrix from quaternion", function() {

            var V3 = M.Vector3,

                mx = makeMatrix3(),
                q0 = makeQuaternion(),
                q1 = makeQuaternion(),
                v = makeVector3(),

                setQ = function (q, axis, angle) {
                    return q.fromAxisAngle(axis, angle);
                },

                check = function (q, vector, msg, refX, refY, refZ) {

                    vector.transform(mx.fromQuaternion(q));
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

            var mx = makeMatrix3();

            expect(mx.fromQuaternion(makeQuaternion())).to.equal(mx);
        });
    });

    describe("#identity", function () {

        it("should set matrix to identity", function () {

            var mx = makeMatrix3(5, 0, 1, 0, 5, 1, 0, 1, 5);

            mx.identity();
            expect(mx).to.equalByComponents(M.Matrix3.IDENTITY);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3(5, 0, 1, 0, 5, 1, 0, 1, 5);

            expect(mx.identity()).to.equal(mx);
        });
    });

    describe("#rotationX", function () {

        it("should set matrix to X-axis rotation transform", function () {

            var mx = makeMatrix3(),
                v = makeVector3();

            mx.rotationX(HALF_PI);
            v.set(0, 1, 0).transform(mx);
            expect(v, "Pi/2").to.be.closeByComponents(0, 0, 1);

            mx.rotationX(PI);
            v.set(0, 1, 0).transform(mx);
            expect(v, "Pi").to.be.closeByComponents(0, -1, 0);

            mx.rotationX(-HALF_PI);
            v.set(0, 1, 0).transform(mx);
            expect(v, "-Pi/2").to.be.closeByComponents(0, 0, -1);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.rotationX(PI)).to.equal(mx);
        });
    });

    describe("#rotationY", function () {

        it("should set matrix to Y-axis rotation transform", function () {

            var mx = makeMatrix3(),
                v = makeVector3();

            mx.rotationY(HALF_PI);
            v.set(0, 0, 1).transform(mx);
            expect(v, "Pi/2").to.be.closeByComponents(1, 0, 0);

            mx.rotationY(PI);
            v.set(0, 0, 1).transform(mx);
            expect(v, "Pi").to.be.closeByComponents(0, 0, -1);

            mx.rotationY(-HALF_PI);
            v.set(0, 0, 1).transform(mx);
            expect(v, "-Pi/2").to.be.closeByComponents(-1, 0, 0);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.rotationY(PI)).to.equal(mx);
        });
    });

    describe("#rotationZ", function () {

        it("should set matrix to Z-axis rotation transform", function () {

            var mx = makeMatrix3(),
                v = makeVector3();

            mx.rotationZ(HALF_PI);
            v.set(1, 0, 0).transform(mx);
            expect(v, "Pi/2").to.be.closeByComponents(0, 1, 0);

            mx.rotationZ(PI);
            v.set(1, 0, 0).transform(mx);
            expect(v, "Pi").to.be.closeByComponents(-1, 0, 0);

            mx.rotationZ(-HALF_PI);
            v.set(1, 0, 0).transform(mx);
            expect(v, "-Pi/2").to.be.closeByComponents(0, -1, 0);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.rotationZ(PI)).to.equal(mx);
        });
    });

    describe("#rotationAxis", function () {

        it("should set matrix to arbitrary axis rotation transform", function () {

            var V3 = M.Vector3,

                mx = makeMatrix3(),
                v = makeVector3(),

                check = function (axis, angle, vector, msg, refX, refY, refZ) {

                    vector.transform(mx.rotationAxis(axis, angle));
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

            var mx = makeMatrix3();

            expect(mx.rotationAxis(M.Vector3.Y, PI)).to.equal(mx);
        });
    });

    describe("#scale", function () {

        it("should set matrix to scale transform", function () {

            var mx = makeMatrix3(),
                v = makeVector3(1, 1, 1);

            mx.scale(5, 1, 1);
            v.transform(mx);
            expect(v, "x-axis").to.equalByComponents(5, 1, 1);

            v.set(1, 1, 1);
            mx.scale(1, 5, 1);
            v.transform(mx);
            expect(v, "y-axis").to.equalByComponents(1, 5, 1);

            v.set(1, 1, 1);
            mx.scale(1, 1, 5);
            v.transform(mx);
            expect(v, "z-axis").to.equalByComponents(1, 1, 5);
        });

        it("should reset matrix and set it to scale transform", function () {

            var mx = makeMatrix3(5, 0, 1, 0, 5, 1, 0, 1, 5, 0);

            mx.scale(5, 4, 3);
            expect(mx).to.equalByComponents(
                5, 0, 0,
                0, 4, 0,
                0, 0, 3);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.scale(5, 5, 5)).to.equal(mx);
        });
    });

    describe("#add", function () {

        it("should add a matrix", function () {

            var mx1 = makeMatrix3(
                    1, 4, 7,
                    2, 5, 8,
                    3, 6, 9),
                mx2 = makeMatrix3(
                    1, 4, 7,
                    2, 5, 8,
                    3, 6, 9);

            expect(mx1.add(mx2)).to.equalByComponents(
                2, 4, 6,
                8, 10, 12,
                14, 16, 18
            );
        });

        it("should not create a new object", function () {

            var mx1 = makeMatrix3(),
                mx2 = makeMatrix3();

            expect(mx1.add(mx2)).to.equal(mx1);
        });
    });

    describe("#mulScalar", function () {

        it("should multiply matrix by given scalar", function () {

            var mx = makeMatrix3(
                    1, 4, 7,
                    2, 5, 8,
                    3, 6, 9),
                val = 10;

            mx.mulScalar(val);
            expect(mx).to.equalByComponents(
                10, 20, 30,
                40, 50, 60,
                70, 80, 90);
        });

        it("should return zero matrix if multiply by zero matrix", function () {

            var mx = M.Matrix3.ZERO.clone(),
                val = 2;

            mx.mulScalar(val);
            expect(mx).to.equalByComponents(M.Matrix3.ZERO);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3(),
                val = 2;

            expect(mx.mulScalar(val)).to.equal(mx);
        });
    });

    describe("#mulMatrices", function () {

        it("should multiply two matrix and set value to the matrix", function () {

            var mx = makeMatrix3(),
                mxR = makeMatrix3().rotationAxis(makeVector3(1, 1, 1), HALF_PI),
                mxRz = makeMatrix3().rotationZ(HALF_PI),

                v1 = makeVector3(1, 1, 1),
                v2 = makeVector3(1, 1, 1);

            v1.transform(mxR).transform(mxRz);
            mx.mulMatrices(mxR, mxRz);
            v2.transform(mx);

            expect(v1).to.be.closeByComponents(v2);
        });

        it("should return the same matrix if multiply by identity matrix", function () {

            var mx1 = makeMatrix3(),
                mx2 = makeMatrix3(
                    5, 0, 1,
                    0, 4, 0,
                    0, 1, 3);

            mx1.mulMatrices(M.Matrix3.IDENTITY, mx2);
            expect(mx1).to.equalByComponents(mx2);
        });

        it("should return zero matrix if multiply by zero matrix", function () {

            var mx1 = makeMatrix3(),
                mx2 = makeMatrix3(
                    5, 0, 1,
                    0, 4, 0,
                    0, 1, 3);

            mx1.mulMatrices(M.Matrix3.ZERO, mx2);
            expect(mx1).to.equalByComponents(M.Matrix3.ZERO);
        });

        it("should not create a new object", function () {

            var mx1 = makeMatrix3(),
                mx2 = makeMatrix3(),
                mx3 = makeMatrix3();

            expect(mx1.mulMatrices(mx2, mx3)).to.equal(mx1);
        });
    });

    describe("#mul", function () {

        it("should call M.Matrix3.mulScalar if scalar is passed", function () {

            var mx = makeMatrix3(),
                val = 5,

                spy = sinon.spy(mx, "mulScalar");

            mx.mul(val);
            expect(spy).to.be.calledWith(val);
        });

        it("should call M.Matrix3.mulMatrices if matrix is passed", function () {

            var mx1 = makeMatrix3(),
                mx2 = makeMatrix3(),

                spy = sinon.spy(mx1, "mulMatrices");

            mx1.mul(mx2);
            expect(spy).to.be.calledWith(mx1, mx2);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.mul(2)).to.equal(mx);
        });
    });

    describe("#determinant", function () {

        it("should return determinant of a matrix", function () {

            var mx = makeMatrix3(
                1, 0, 0,
                0, 1, 0,
                0, 0, 2);

            expect(mx.determinant()).to.be.a("number").and.equal(2);
        });

        it("should return 1 if matrix is identity", function () {

            expect(M.Matrix3.IDENTITY.determinant()).to.equal(1);
        });

        it("should return 0 if matrix is zero", function () {

            expect(M.Matrix3.ZERO.determinant()).to.equal(0);
        });

        it("should return -1 for mirror matrix", function () {

            var mx = makeMatrix3(
                1, 0, 0,
                0, -1, 0,
                0, 0, 1);

            expect(mx.determinant()).to.equal(-1);
        });

        it("should return 0 if matrix is singular", function () {

            var mx = makeMatrix3(
                0, 0, 0,
                0, 1, 0,
                0, 0, 1);

            expect(mx.determinant()).to.equal(0);
        });

        it("should return 1 for rotation matrix", function () {

            var mx = makeMatrix3();

            mx.rotationX(HALF_PI);
            expect(mx.determinant(), "x-axis").to.equal(1);

            mx.rotationY(HALF_PI);
            expect(mx.determinant(), "y-axis").to.equal(1);

            mx.rotationZ(HALF_PI);
            expect(mx.determinant(), "z-axis").to.equal(1);
        });

        it("should scale determinant for scale matrix", function () {

            var mx = makeMatrix3().scale(2, 2, 2);

            expect(mx.determinant()).to.equal(8);
        });
    });

    describe("#transpose", function () {

        it("should transpose matrix)", function () {

            var mx = makeMatrix3(
                1, 4, 7,
                2, 5, 8,
                3, 6, 9);

            mx.transpose();
            expect(mx).to.equalByComponents(
                1, 4, 7,
                2, 5, 8,
                3, 6, 9);
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.transpose()).to.equal(mx);
        });
    });

    describe("#invert", function () {

        it("should invert matrix", function () {

            var mxS = makeMatrix3().scale(1, 2, 3),
                mxR = makeMatrix3().rotationAxis(makeVector3(1, 1, 1), HALF_PI),
                mx, mxInv;

            mx = mxS.clone().mul(mxR);
            mxInv = mx.clone().invert();

            mx.mul(mxInv);
            expect(mx).to.be.closeByComponents(M.Matrix3.IDENTITY);
        });

        it("should return original matrix if inverted matrix passed", function () {

            var mxS = makeMatrix3().scale(1, 2, 3),
                mxR = makeMatrix3().rotationAxis(makeVector3(1, 1, 1), HALF_PI),
                mx, mxInv;

            mx = mxS.clone().mul(mxR);
            mxInv = mx.clone().invert();
            mxInv.invert();

            expect(mx).to.be.closeByComponents(mxInv);
        });

        it("should throw if determinant is 0", function () {

            var mx = makeMatrix3(
                    0, 0, 0,
                    0, 1, 0,
                    0, 0, 1),
                func = function () { mx.invert(); };

            expect(func).to.throw();
        });

        it("should not create a new object", function () {

            var mx = makeMatrix3();

            expect(mx.invert()).to.equal(mx);
        });
    });

    describe("#equal", function () {

        it("should return true if matrices are equal", function () {

            var m1 = makeMatrix3(),
                m2 = makeMatrix3();

            expect(m1.equal(m2)).to.be.true;
        });

        it("should return false if matrices are not equal", function () {

            var m1 = makeMatrix3(1, 0, 0, 0, 1, 0, 0, 0, 1),
                m2 = makeMatrix3(0, 1, 0, 0, 1, 0, 0, 0, 1);

            expect(m1.equal(m2)).to.be.false;
        });
    });
});
