
describe("B.Math", function () {

    var PI = Math.PI,
        EPSILON = B.Math.EPSILON;

    it("should exist", function () {
        expect(B.Math).to.exist;
    });

    describe("#degrees", function () {

        it("should convert from radians to degrees", function () {

            var degrees = B.Math.degrees;

            expect(degrees(0), "0 degrees").to.be.closeTo(0, EPSILON);
            expect(degrees(PI / 4), "45 degrees").to.be.closeTo(45, EPSILON);
            expect(degrees(PI / 3), "60 degrees").to.be.closeTo(60, EPSILON);
            expect(degrees(PI / 2), "90 degrees").to.be.closeTo(90, EPSILON);
            expect(degrees(PI), "180 degrees").to.be.closeTo(180, EPSILON);
            expect(degrees(PI * 2), "360 degrees").to.be.closeTo(360, EPSILON);
            expect(degrees(PI * 3), "450 degrees").to.be.closeTo(540, EPSILON);
            expect(degrees(PI * 4), "720 degrees").to.be.closeTo(720, EPSILON);
        });
    });

    describe("#radians", function () {

        it("should convert from degrees to radians", function () {

            var radians = B.Math.radians;

            expect(radians(0), "0 degrees").to.be.closeTo(0, EPSILON);
            expect(radians(45), "PI / 4 degrees").to.be.closeTo(PI / 4, EPSILON);
            expect(radians(60), "PI / 3 degrees").to.be.closeTo(PI / 3, EPSILON);
            expect(radians(90), "PI / 2 degrees").to.be.closeTo(PI / 2, EPSILON);
            expect(radians(180), "PI degrees").to.be.closeTo(PI, EPSILON);
            expect(radians(360), "PI * 2 degrees").to.be.closeTo(PI * 2, EPSILON);
            expect(radians(540), "PI * 3 degrees").to.be.closeTo(PI * 3, EPSILON);
            expect(radians(720), "PI * 4 degrees").to.be.closeTo(PI * 4, EPSILON);
        });
    });

    describe("#makeColor", function () {

        it("should create a new color object", function () {

            var spy = sinon.spy(B.Math, "Color");

            B.Math.makeColor(1, 2, 3, 4);
            expect(spy).to.be.calledWith(1, 2, 3, 4);
        });
    });

    describe("#makeVector2", function () {

        it("should create a new Vector2 object", function () {

            var spy = sinon.spy(B.Math, "Vector2");

            B.Math.makeVector2(1, 2);
            expect(spy).to.be.calledWith(1, 2);
        });
    });

    describe("#makeVector3", function () {

        it("should create a new Vector3 object", function () {

            var spy = sinon.spy(B.Math, "Vector3");

            B.Math.makeVector3(1, 2, 3);
            expect(spy).to.be.calledWith(1, 2);
        });
    });

    describe("#makeVector4", function () {

        it("should create a new Vector4 object", function () {

            var spy = sinon.spy(B.Math, "Vector4");

            B.Math.makeVector4(1, 2, 3, 4);
            expect(spy).to.be.calledWith(1, 2);
        });
    });

    describe("#makeMatrix3", function () {

        var spy = sinon.spy(B.Math, "Matrix3");

        beforeEach(function() {

            spy.reset();
        });

        it("should create a new matrix object", function () {

            B.Math.makeMatrix3();
            expect(spy).to.be.calledOnce;
            expect(spy.getCall(0).args[0], "args").to.be.empty;
        });

        it("should create a new matrix object with passed args", function () {

            B.Math.makeMatrix3(0, 1, 2, 3, 4, 5, 6, 7, 8);
            expect(spy).to.be.calledOnce.and.calledWithExactly(0, 1, 2, 3, 4, 5, 6, 7, 8);
        });
    });

    describe("#makeMatrix4", function () {

        var spy = sinon.spy(B.Math, "Matrix4");

        beforeEach(function() {

            spy.reset();
        });

        it("should create a new matrix object", function () {

            B.Math.makeMatrix4();
            expect(spy).to.be.calledOnce;
            expect(spy.getCall(0).args[0], "args").to.be.empty;
        });

        it("should create a new matrix object with passed args", function () {

            B.Math.makeMatrix4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
            expect(spy).to.be.calledOnce.
                and.calledWithExactly(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
        });
    });

    describe("#makeQuaternion", function () {

        it("should create a new Quaternion object", function () {

            var spy = sinon.spy(B.Math, "Quaternion");

            B.Math.makeQuaternion(1, 2, 3, 4);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(1, 2, 3, 4);
        });
    });

    describe("#makeAngles", function () {

        it("should create a new Euler angles object", function () {

            var spy = sinon.spy(B.Math, "Angles");

            B.Math.makeAngles(1, 2, 3);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(1, 2, 3);
        });
    });

    describe("#makePlane", function () {

        it("should create a new Plane object", function () {

            var spy = sinon.spy(B.Math, "Plane"),
                n = B.Math.makeVector3(0, -1, 0),
                d = 5.0;

            B.Math.makePlane(n, d);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(n, d);
        });
    });

    describe("#makeRay", function () {

        it("should create a new Ray object", function () {

            var spy = sinon.spy(B.Math, "Ray"),
                origin = B.Math.makeVector3(-2, 3, -2),
                dir = B.Math.makeVector3(1, 0, 1);

            B.Math.makeRay(origin, dir);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(origin, dir);
        });
    });

    describe("#makeSegment", function () {

        it("should create a new Segment object", function () {

            var spy = sinon.spy(B.Math, "Segment"),
                start = B.Math.makeVector3(-2, -2, -2),
                end = B.Math.makeVector3(2, 2, 2);

            B.Math.makeSegment(start, end);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(start, end);
        });
    });

    describe("#makeTriangle", function () {

        it("should create a new Triangle object", function () {

            var spy = sinon.spy(B.Math, "Triangle"),
                a = B.Math.makeVector3(0, 1, 3),
                b = B.Math.makeVector3(5, 0, 0),
                c = B.Math.makeVector3(0, 2, 0);

            B.Math.makeTriangle(a, b, c);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(a, b, c);
        });
    });

    describe("#makeAABox", function () {

        it("should create a new AABox object", function () {

            var spy = sinon.spy(B.Math, "AABox"),
                min = B.Math.makeVector3(-2, -2, -2),
                max = B.Math.makeVector3(2, 2, 2);

            B.Math.makeAABox(min, max);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(min, max);
        });
    });

    describe("#makeSphere", function () {

        it("should create a new Sphere object", function () {

            var spy = sinon.spy(B.Math, "Sphere"),
                center = B.Math.makeVector3(-2, 2, 5),
                radius = 4.0;

            B.Math.makeSphere(center, radius);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(center, radius);
        });
    });

    describe("#makeFrustum", function () {

        it("should create a new Frustum object", function () {

            var Vector3 = B.Math.Vector3,
                makePlane = B.Math.makePlane,

                spy = sinon.spy(B.Math, "Frustum"),
                left = makePlane(Vector3.X, -5),
                right = makePlane(Vector3.N_X, -5),
                top = makePlane(Vector3.N_Y, -5),
                bottom = makePlane(Vector3.Y, -5),
                near = makePlane(Vector3.N_Z, 0.01),
                far = makePlane(Vector3.Z, -100.0);

            B.Math.makeFrustum(left, right, top, bottom, near, far);
            expect(spy).to.to.be.calledOnce.and.calledWithExactly(left, right, top, bottom,
                near, far);
        });
    });
});
