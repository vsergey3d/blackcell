
describe("B.Math.Ray", function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        makeVector3 = M.makeVector3,
        makeMatrix4 = M.makeMatrix4,
        makeAABox = M.makeAABox,
        makeSphere = M.makeSphere,
        makeSegment = M.makeSegment,
        makeRay = M.makeRay,
        makeTriangle = M.makeTriangle,
        makePlane = M.makePlane;

    it("should exist", function () {
        expect(M.Ray).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized the ray with default values if no params passed", function () {

            var ray = new M.Ray();

            expect(ray).to.have.property("origin").that.is.instanceof(M.Vector3).and.
                equalByComponents(M.Vector3.ZERO);
            expect(ray).to.have.property("direction").that.is.instanceof(M.Vector3).and.
                equalByComponents(M.Vector3.Z);
        });

        it("should set passed origin", function () {

            var ray = new M.Ray(makeVector3(1, 2, 3));

            expect(ray).to.have.property("origin").that.equalByComponents(1, 2, 3);
        });

        it("should set passed direction", function () {

            var dir = makeVector3(1, 2, 3).normalize(),
                ray = new M.Ray(makeVector3(), makeVector3(dir.x, dir.y, dir.z));

            expect(ray).to.have.property("direction").that.equalByComponents(dir.x, dir.y, dir.z);
        });

        it("should normalize passed direction", function () {

            var dir = makeVector3(1, 2, 3),
                ray = new M.Ray(makeVector3(), makeVector3(dir.x, dir.y, dir.z));

            dir.normalize();
            expect(ray).to.have.property("direction").that.equalByComponents(dir.x, dir.y, dir.z);
        });
    });

    describe("#clone", function () {

        it("should clone a ray", function () {

            var ray = makeRay(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                clone = ray.clone();

            expect(clone.origin, "origin").to.equalByComponents(ray.origin);
            expect(clone.direction, "direction").to.equalByComponents(ray.direction);
        });

        it("should return a new object", function () {

            var ray = makeRay(),
                clone = ray.clone();

            expect(clone).to.not.equal(ray);
        });
    });

    describe("#copy", function () {

        it("should copy a ray", function () {

            var ray1 = makeRay(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                ray2 = makeRay();

            ray2.copy(ray1);
            expect(ray2.origin, "origin").to.equalByComponents(ray1.origin);
            expect(ray2.direction, "direction").to.equalByComponents(ray1.direction);
        });

        it("should not create a object", function () {

            var ray1 = makeRay(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                ray2 = makeRay();

            expect(ray2.copy(ray1)).to.equal(ray2);
        });
    });

    describe("#set", function () {

        it("should set ray from origin and direction", function () {

            var ray = makeRay(),
                dir = makeVector3(3, 4, 5).normalize();

            ray.set(makeVector3(1, 2, 3), makeVector3(dir.x, dir.y, dir.z));
            expect(ray.origin, "origin").to.be.closeByComponents(1, 2, 3);
            expect(ray.direction, "direction").to.be.closeByComponents(dir.x, dir.y, dir.z);
        });

        it("should not create a new object", function () {

            var ray = makeRay();

            expect(ray.set(makeVector3(1, 2, 3), makeVector3(3, 4, 5))).to.equal(ray);
        });
    });

    describe("#fromOriginTarget", function () {

        it("should set ray from origin and target", function () {

            var ray = makeRay();

            ray.fromOriginTarget(makeVector3(1, 5, 0), makeVector3(2, 5, 0));
            expect(ray.origin, "origin").to.equalByComponents(1, 5, 0);
            expect(ray.direction, "direction").to.equalByComponents(1, 0, 0);
        });

        it("should not create a new object", function () {

            var ray = makeRay();

            expect(ray.fromOriginTarget(makeVector3(1, 2, 3), makeVector3(3, 4, 5))).to.equal(ray);
        });
    });

    describe("#fromArray", function () {

        var ray = makeRay(),
            arr = [-1, 0, 1, 2, 3, 4, 5, 6],
            offset = 2;

        it("should set ray from an array", function () {

            ray.fromArray(arr);
            expect(ray.origin, "origin").to.equalByComponents(arr);
            expect(ray.direction, "direction").to.equalByComponents(arr.slice(3));
        });

        it("should set ray from array with given offset", function () {

            ray.fromArray(arr, offset);
            expect(ray.origin, "origin").to.equalByComponents(arr.slice(offset));
            expect(ray.direction, "direction").to.equalByComponents(arr.slice(offset + 3));
        });

        it("should return 6 if offset is not passed", function () {

            expect(ray.fromArray(arr)).to.equal(6);
        });

        it("should return new offset", function () {

            expect(ray.fromArray(arr, offset)).to.equal(offset + 6);
        });
    });

    describe("#toArray", function () {

        var ray = makeRay(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set ray to an array", function () {

            ray.toArray(arr);
            expect(arr).to.have.length.at.least(6);
            expect(ray.origin, "origin").to.equalByComponents(arr);
            expect(ray.direction, "direction").to.equalByComponents(arr.slice(3));
        });

        it("should set ray to an array with given offset", function () {

            ray.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 6);
            expect(ray.origin, "origin").to.equalByComponents(arr.slice(offset));
            expect(ray.direction, "direction").to.equalByComponents(arr.slice(offset + 3));
        });

        it("should return 6 if offset is not passed", function () {

            expect(ray.toArray(arr)).to.equal(6);
        });

        it("should return new offset", function () {

            expect(ray.toArray(arr, offset)).to.equal(offset + 6);
        });
    });

    describe("#translate", function () {

        it("should translate ray by given offset", function () {

            var ray = makeRay(makeVector3(2, 2, 2), makeVector3(0, -1, 0)),
                offset = makeVector3(4, 5, -3);

            ray.translate(offset);
            expect(ray.origin, "origin").to.equalByComponents(6, 7, -1);
        });

        it("should not change direction of the ray", function () {

            var ray = makeRay(makeVector3(2, 2, 2), makeVector3(0, -1, 0)),
                offset = makeVector3(4, 5, -3);

            ray.translate(offset);
            expect(ray.direction, "direction").to.equalByComponents(0, -1, 0);
        });

        it("should not create a new object", function () {

            var ray = makeRay(),
                offset = makeVector3(4, 5, -3);

            expect(ray.translate(offset)).to.equal(ray);
        });
    });

    describe("#transform", function () {

        it("should transform ray by given matrix [only rotation]", function () {

            var dir = makeVector3(1, 1, 0).normalize(),
                ray = makeRay(makeVector3(0, 0, 0), dir.clone()),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            ray.transform(mx);
            expect(ray.origin, "origin").to.be.closeByComponents(0, 0, 0);
            expect(ray.direction, "direction").to.be.closeByComponents(-dir.x, dir.y, dir.z);
        });

        it("should transform ray by given matrix [only translation]", function () {

            var dir = makeVector3(1, 1, 0).normalize(),
                ray = makeRay(makeVector3(0, 0, 0), dir.clone()),
                mx = makeMatrix4().translation(4, 5, -3);

            ray.transform(mx);
            expect(ray.origin, "origin").to.be.closeByComponents(4, 5, -3);
            expect(ray.direction, "direction").to.be.closeByComponents(dir.x, dir.y, dir.z);
        });

        it("should transform ray by given matrix", function () {

            var dir = makeVector3(1, 1, 0).normalize(),
                ray = makeRay(makeVector3(2, 2, 2), dir.clone()),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            ray.transform(mx);
            expect(ray.origin, "origin").to.be.closeByComponents(-2, 2, 2);
            expect(ray.direction, "direction").to.be.closeByComponents(-dir.x, dir.y, dir.z);
        });

        it("should not create a new object", function () {

            var ray = makeRay();

            expect(ray.transform(M.Matrix4.IDENTITY)).to.equal(ray);
        });
    });

    describe("#at", function () {

        it("should return a point at the ray", function () {

            var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                t = Math.sqrt(12) * 0.5,
                p;

            p = ray.at(t);
            expect(p).to.be.instanceof(M.Vector3).and.equalByComponents(-1, -1, -1);
        });

        it("should return origin if t is 0.0", function () {

            var ray = makeRay(makeVector3(2, 2, 2), makeVector3(1, 1, 0)),
                t = 0,
                p;

            p = ray.at(t);
            expect(p).to.be.instanceof(M.Vector3).and.equalByComponents(ray.origin);
        });

        it("should set a point at the ray to a given vector", function () {

            var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                t = Math.sqrt(12) * 0.5,
                p = makeVector3();

            p = ray.at(t);
            expect(p).to.be.instanceof(M.Vector3).and.equalByComponents(-1, -1, -1);
        });
    });

    describe("#projectPoint", function () {

        it("should return a point projected to the ray [projected point lies on the ray]",
            function () {

            var ray = makeRay(makeVector3(-2, -2, 0), makeVector3(1, 1, 0)),
                p = makeVector3(-2, 0, 0),
                v;

            v = ray.projectPoint(p);
            expect(v).to.be.closeByComponents(-1, -1, 0);
        });

        it("should return a point projected to the ray [projected point doesn't lie on the ray]",
            function () {

            var ray = makeRay(makeVector3(2, 2, 2), makeVector3(1, 1, 0)),
                p = makeVector3(),
                v;

            v = ray.projectPoint(p);
            expect(v).to.equalByComponents(2, 2, 2);
        });

        it("should return a point projected to the ray [projected point coincides with the origin]",
            function () {

            var ray = makeRay(makeVector3(2, 2, 2), makeVector3(1, 1, 0)),
                p = makeVector3(1, 2, 2),
                v;

            v = ray.projectPoint(p);
            expect(v).to.equalByComponents(2, 2, 2);
        });

        it("should set a point projected to the ray to a given vector", function () {

            var ray = makeRay(makeVector3(2, 2, 2), makeVector3(1, 1, 0)),
                p = makeVector3(),
                v = makeVector3();

            ray.projectPoint(p, v);
            expect(v).to.equalByComponents(2, 2, 2);
        });
    });

    describe("#trace", function () {

        describe("[plane]", function () {

            it("should return point of intersection", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                    p = makePlane(makeVector3(1, 0, 0), 0);

                expect(ray.trace(p)).to.be.closeTo(Math.sqrt(12), EPSILON);
            });

            it("should set point of intersection to a given vector", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                    p = makePlane(makeVector3(1, 1, 1), 0),
                    res = makeVector3();

                ray.trace(p, res);
                expect(res).to.be.instanceof(M.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is origin of ray", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                    p = makePlane(makeVector3(-1, 0, 0), 2);

                expect(ray.trace(p)).to.equal(0);
            });

            it("should return 0 if ray lies on the plane", function () {

                var ray = makeRay(makeVector3(0, 0, 0), makeVector3(0, 1, 0)),
                    p = makePlane(makeVector3(1, 0, 0), 0);

                expect(ray.trace(p)).to.equal(0);
            });

            it("should return null if no intersections", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1));

                expect(ray.trace(makePlane(makeVector3(-1, 0, 0), 3))).to.be.null;
            });

            it("should return null if no intersections [ray is parallel to plane]", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(0, 1, 0));

                expect(ray.trace(makePlane(makeVector3(1, 0, 0), 3))).to.be.null;
            });
        });

        describe("[triangle]", function () {

            it("should return point of intersection", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1));

                expect(ray.trace(makeTriangle(makeVector3(0, 2, 0), makeVector3(0, 0, 2),
                    makeVector3(0, 0, -2)))).to.be.closeTo(Math.sqrt(12), EPSILON);
            });

            it("should set point of intersection to a given vector", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                    tri = makeTriangle(makeVector3(0, 2, 0), makeVector3(0, 0, 2),
                        makeVector3(0, 0, -2)),
                    res = makeVector3();

                ray.trace(tri, res);
                expect(res).to.be.instanceof(M.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is origin of ray", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1));

                expect(ray.trace(makeTriangle(makeVector3(-2, -2, -2), makeVector3(-2, -3, -2),
                    makeVector3(-2, -3, -3))), "[a]").to.equal(0);
                expect(ray.trace(makeTriangle(makeVector3(0, -2, -2), makeVector3(-2, -2, -2),
                    makeVector3(0, -2, 0))), "[b]").to.equal(0);
                expect(ray.trace(makeTriangle(makeVector3(0, -2, -2), makeVector3(-2, -2, -4),
                    makeVector3(-2, -2, -2))), "[c]").to.equal(0);
            });

            it("should return null if no intersections", function () {

                var triangle = makeTriangle(makeVector3(1, 0, 0),
                        makeVector3(0, 1, 0), makeVector3(0, 0, 1));

                expect(makeRay().fromOriginTarget(makeVector3(2, 2, 2), makeVector3(2, 2, 0)).
                    trace(triangle), "case 0").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(2, 2, 2), makeVector3(0, 2, 2)).
                    trace(triangle), "case 1").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(2, 2, 2), makeVector3(0, -2, 0)).
                    trace(triangle), "case 2").to.be.null;
            });

            it("should return null if no intersections (ray is parallel to triangle)", function () {

                var triangle = makeTriangle(makeVector3(1, 0, 0),
                        makeVector3(-1, 0, 0), makeVector3(0, 1, 0)),
                    ray = makeRay(makeVector3(0, 0, 1), makeVector3(0, 1, 0));

                expect(ray.trace(triangle)).to.be.null;
            });
        });

        describe("[aabox]", function () {

            it("should return point of intersection", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1));

                expect(ray.trace(makeAABox(makeVector3(0, -2, 0), makeVector3(4, 4, 2)))).
                    to.be.closeTo(Math.sqrt(12), EPSILON);
            });

            it("should set point of intersection to a given vector", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                    aabox = makeAABox(makeVector3(0, -2, 0), makeVector3(4, 4, 2)),
                    res = makeVector3();

                ray.trace(aabox, res);
                expect(res).to.be.instanceof(M.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is origin of ray", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1));

                expect(ray.trace(makeAABox(makeVector3(-2, -2, -2), makeVector3(0, 0, 0))),
                    "[min]").to.equal(0);
                expect(ray.trace(makeAABox(makeVector3(-4, -4, -4), makeVector3(-2, -2, -2))),
                    "[max]").to.equal(0);
            });

            it("should return null if no intersections", function () {

                var box = makeAABox(makeVector3(-1, -1, -1), makeVector3(1, 1, 1));

                expect(makeRay().fromOriginTarget(makeVector3(0, 0, -5), makeVector3(0, 5, 0)).
                    trace(box), "case 0").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(0, 0, -5), makeVector3(0, -5, 0)).
                    trace(box), "case 1").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(0, 0, -5), makeVector3(5, 0, 0)).
                    trace(box), "case 2").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(0, 0, -5), makeVector3(-5, 0, 0)).
                    trace(box), "case 3").to.be.null;

                expect(makeRay().fromOriginTarget(makeVector3(0, -5, 0), makeVector3(0, 0, 5)).
                    trace(box), "case 4").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(0, -5, 0), makeVector3(0, 0, -5)).
                    trace(box), "case 5").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(0, -5, 0), makeVector3(5, 0, 0)).
                    trace(box), "case 6").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(0, -5, 0), makeVector3(-5, 0, 0)).
                    trace(box), "case 7").to.be.null;

                expect(makeRay().fromOriginTarget(makeVector3(-5, 0, 0), makeVector3(0, 0, 5)).
                    trace(box), "case 8").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(-5, 0, 0), makeVector3(0, 0, -5)).
                    trace(box), "case 9").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(-5, 0, 0), makeVector3(0, 5, 0)).
                    trace(box), "case 10").to.be.null;
                expect(makeRay().fromOriginTarget(makeVector3(-5, 0, 0), makeVector3(0, -5, 0)).
                    trace(box), "case 11").to.be.null;

                expect(makeRay(makeVector3(0, 0, -5), makeVector3(0, 0, -1)).
                    trace(box), "case 12").to.be.null;
            });
        });

        describe("[sphere]", function () {

            it("should return point of intersection", function () {

                expect(makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)).trace(
                    makeSphere(makeVector3(0, 2, 0), 2))).to.be.closeTo(Math.sqrt(12), EPSILON);

                expect(makeRay(makeVector3(-2, -3, -2), makeVector3(0, 1, 0)).trace(
                    makeSphere(makeVector3(-2, -2, -2), 2))).to.be.closeTo(3, EPSILON);
            });

            it("should set point of intersection to a given vector", function () {

                var ray = makeRay(makeVector3(-2, -2, -2), makeVector3(1, 1, 1)),
                    sphere = makeSphere(makeVector3(0, 2, 0), 2),
                    res = makeVector3();

                ray.trace(sphere, res);
                expect(res).to.be.instanceof(M.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is origin of ray", function () {

                var ray = makeRay(makeVector3(0, -2, 0), makeVector3(0, 1,0));

                expect(ray.trace(makeSphere(makeVector3(0, 0, 0), 2))).to.equal(0);
            });

            it("should return null if no intersections", function () {

                var sphere = makeSphere(makeVector3(2, 2, 2), 1);

                expect(makeRay(makeVector3(2, 4, 2), makeVector3(0, 1, 0)).trace(
                    sphere), "discriminant > 0").to.be.null;

                expect(makeRay(makeVector3(2, 4, 2), makeVector3(0, 0, 1)).trace(
                    sphere), "discriminant < 0").to.be.null;
            });
        });

        it("should throw if the object argument has unsupported type", function () {

            var ray = makeRay(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                fn = function () { ray.trace(5); };

            expect(fn).to.throw();
        });
    });

    describe("#distanceTo", function() {

        describe("[point]", function() {

            var xAxis = makeRay(makeVector3(-2, 0, 0), makeVector3(1, 0, 0)),
                yAxis = makeRay(makeVector3(0, -2, 0), makeVector3(0, 1, 0)),
                zAxis = makeRay(makeVector3(0, 0, -2), makeVector3(0, 0, 1)),

                p = makeVector3();

            it("should return zero distance if a point is in a ray", function() {

                p.set(0, 0, 0);
                expect(xAxis.distanceTo(p), "[x-axis]").to.equal(0);
                expect(yAxis.distanceTo(p), "[y-axis]").to.equal(0);
                expect(zAxis.distanceTo(p), "[z-axis]").to.equal(0);
            });

            it("should return zero distance if a point is origin of a ray", function() {

                expect(xAxis.distanceTo(xAxis.origin), "[x-axis]").to.equal(0);
                expect(yAxis.distanceTo(yAxis.origin), "[y-axis]").to.equal(0);
                expect(zAxis.distanceTo(zAxis.origin), "[z-axis]").to.equal(0);
            });

            it("should return distance between a point and a ray", function() {

                p.set(0, 2, 0);
                expect(xAxis.distanceTo(p), "[x-axis]").to.equal(2);

                p.set(-2, 0, 0);
                expect(yAxis.distanceTo(p), "[y-axis]").to.equal(2);
                expect(zAxis.distanceTo(p), "[z-axis]").to.equal(2);
            });

            it("should return positive distance if a point is behind a ray", function() {

                p.set(-4, 0, 0);
                expect(xAxis.distanceTo(p), "[x-axis]").to.equal(2);

                p.set(0, -4, 0);
                expect(yAxis.distanceTo(p), "[y-axis]").to.equal(2);

                p.set(0, 0, -4);
                expect(zAxis.distanceTo(p), "[z-axis]").to.equal(2);
            });
        });

        describe("[ray]", function() {

            it("coincide", function() {

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-4, 1, 0), makeVector3(1, 0, 0)))).
                    to.be.closeTo(0, EPSILON);

                expect(makeRay(makeVector3(-4, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)))).
                    to.be.closeTo(0, EPSILON);

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)))).
                    to.be.closeTo(0, EPSILON);
            });

            it("coincide & opposite directed", function() {

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-4, 1, 0), makeVector3(-1, 0, 0)))).
                    to.be.closeTo(2, EPSILON);

                expect(makeRay(makeVector3(-4, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, 1, 0), makeVector3(-1, 0, 0)))).
                    to.be.closeTo(0, EPSILON);

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, 1, 0), makeVector3(-1, 0, 0)))).
                    to.be.closeTo(0, EPSILON);
            });

            it("parallel", function() {

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-4, -1, 0), makeVector3(1, 0, 0)))).
                    to.be.closeTo(2, EPSILON);

                expect(makeRay(makeVector3(-4, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, -1, 0), makeVector3(1, 0, 0)))).
                    to.be.closeTo(2, EPSILON);

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, -1, 0), makeVector3(1, 0, 0)))).
                    to.be.closeTo(2, EPSILON);
            });

            it("parallel & opposite directed", function() {

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-4, -1, 0), makeVector3(-1, 0, 0)))).
                    to.be.closeTo(Math.sqrt(8), EPSILON);

                expect(makeRay(makeVector3(-4, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, -1, 0), makeVector3(-1, 0, 0)))).
                    to.be.closeTo(2, EPSILON);

                expect(makeRay(makeVector3(-2, 1, 0), makeVector3(1, 0, 0)).distanceTo(
                    makeRay(makeVector3(-2, -1, 0), makeVector3(-1, 0, 0)))).
                    to.be.closeTo(2, EPSILON);
            });

            it("skew & same plane", function() {

                expect(makeRay(makeVector3(-2, -2, 0), makeVector3(1, 1, 0).normalize()).distanceTo(
                    makeRay(makeVector3(2, -2, 0), makeVector3(-1, 1, 0).normalize()))).
                    to.be.closeTo(0, EPSILON);

                expect(makeRay(makeVector3(-2, -2, 0), makeVector3(1, 1, 0).normalize()).distanceTo(
                    makeRay(makeVector3(2, -2, 0), makeVector3(1, -1, 0).normalize()))).
                    to.be.closeTo(Math.sqrt(8), EPSILON);

                expect(makeRay(makeVector3(-2, -2, 0), makeVector3(-1, -1, 0).normalize()).
                    distanceTo(makeRay(makeVector3(2, -2, 0), makeVector3(-1, 1, 0).normalize()))).
                    to.be.closeTo(Math.sqrt(8), EPSILON);

                expect(makeRay(makeVector3(-2, -2, 0), makeVector3(-1, -1, 0).normalize()).
                    distanceTo(makeRay(makeVector3(2, -2, 0), makeVector3(1, -1, 0).normalize()))).
                    to.be.closeTo(4, EPSILON);
            });

            it("skew", function() {

                expect(makeRay(makeVector3(-2, -2, 0), makeVector3(1, 1, 0).normalize()).distanceTo(
                    makeRay(makeVector3(2, -2, 2), makeVector3(-1, 1, 0).normalize()))).
                    to.be.closeTo(2, EPSILON);

                expect(makeRay(makeVector3(-2, -2, 0), makeVector3(1, 1, 0).normalize()).distanceTo(
                    makeRay(makeVector3(2, -2, 2), makeVector3(1, -1, 0).normalize()))).
                    to.be.closeTo(2 * Math.sqrt(3), EPSILON);

                expect(makeRay(makeVector3(-2, -2, 2), makeVector3(-1, -1, 0).normalize()).
                    distanceTo(makeRay(makeVector3(2, -2, 0), makeVector3(-1, 1, 0).normalize()))).
                    to.be.closeTo(2 * Math.sqrt(3), EPSILON);

                expect(makeRay(makeVector3(-2, -2, 4), makeVector3(-1, -1, 0).normalize()).
                    distanceTo(makeRay(makeVector3(2, -2, 0), makeVector3(1, -1, 0).normalize()))).
                    to.be.closeTo(Math.sqrt(32), EPSILON);

                expect(makeRay(makeVector3(-2, -2, 4), makeVector3(-1, -1, 0).normalize()).
                    distanceTo(makeRay(makeVector3(2, -2, 0), makeVector3(1, -1, 0).normalize()))).
                    to.be.closeTo(Math.sqrt(32), EPSILON);
            });
        });

        it("should throw if the object argument has unsupported type", function () {

            var ray = makeRay(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                fn = function () { ray.distanceTo(5); };

            expect(fn).to.throw();
        });
    });

    describe("#equal", function () {

        it("should return true if rays are equal", function () {

            var r1 = makeRay(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                r2 = makeRay(makeVector3(1, 2, 3), makeVector3(3, 4, 5));

            expect(r1.equal(r2)).to.be.true;
        });

        it("should return false if rays are not equal", function () {

            var r1 = makeRay(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                r2 = makeRay(makeVector3(-1, -2, -3), makeVector3(3, 4, 5));

            expect(r1.equal(r2)).to.be.false;
        });
    });
});
