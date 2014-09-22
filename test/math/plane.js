
describe("B.Math.Plane", function () {

    var M = B.Math,
        makeVector3 = B.Math.makeVector3,
        makeMatrix4 = B.Math.makeMatrix4,
        makeRay = B.Math.makeRay,
        makeSegment = B.Math.makeSegment,
        makeTriangle = B.Math.makeTriangle,
        makeSphere = B.Math.makeSphere,
        makeAABox = B.Math.makeAABox,
        makePlane = B.Math.makePlane;

    it("should exist", function () {
        expect(M.Plane).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized the plane with default values if no params passed", function () {

            var plane = new M.Plane();

            expect(plane).to.have.property("normal").that.is.instanceof(M.Vector3).and.
                equalByComponents(0.0, 1.0, 0.0);
            expect(plane).to.have.property("distance").that.is.a("number").and.equal(0.0);
        });

        it("should set passed normal", function () {

            var plane = new M.Plane(makeVector3(1, -1, 1));

            expect(plane).to.have.property("normal").that.equalByComponents(1, -1, 1);
        });

        it("should set passed distance", function () {

            var plane = new M.Plane(makeVector3(), 5.0);

            expect(plane).to.have.property("distance").that.equal(5.0);
        });
    });

    describe("#clone", function () {

        it("should clone a plane", function () {

            var plane = makePlane(makeVector3(1, -1, 1), 5),
                clone = plane.clone();

            expect(clone.normal, "normal").to.equalByComponents(plane.normal);
            expect(clone.distance, "distance").to.equal(plane.distance);
        });

        it("should return a new object", function () {

            var plane = makePlane(),
                clone = plane.clone();

            expect(clone).to.not.equal(plane);
        });
    });

    describe("#copy", function () {

        it("should copy a plane", function () {

            var plane1 = makePlane(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                plane2 = makePlane();

            plane2.copy(plane1);
            expect(plane2.normal, "normal").to.equalByComponents(plane1.normal);
            expect(plane2.distance, "distance").to.equalByComponents(plane1.distance);
        });

        it("should not create a object", function () {

            var plane1 = makePlane(makeVector3(1, -1, 1), 5),
                plane2 = makePlane();

            expect(plane2.copy(plane1)).to.equal(plane2);
        });
    });

    describe("#set", function () {

        it("should set plane from normal and distance", function () {

            var plane = makePlane();

            plane.set(makeVector3(1, 2, 3), 5);
            expect(plane.normal, "normal").to.equalByComponents(1, 2, 3);
            expect(plane.distance, "distance").to.equal(5);
        });

        it("should not create a new object", function () {

            var plane = makePlane();
            expect(plane.set(makeVector3(1, 2, 3), 5)).to.equal(plane);
        });
    });

    describe("#fromArray", function () {

        var plane = makePlane(),
            arr = [-1, 0, 1, 2, 3, 5, 6],
            offset = 2;

        it("should set plane from an array", function () {

            plane.fromArray(arr);
            expect(plane.normal, "normal").to.equalByComponents(arr);
            expect(plane.distance, "distance").to.equal(arr[3]);
        });

        it("should set plane from array with given offset", function () {

            plane.fromArray(arr, offset);
            expect(plane.normal, "normal").to.equalByComponents(arr.slice(offset));
            expect(plane.distance, "direction").to.equal(arr[offset + 3]);
        });

        it("should return 4 if offset is not passed", function () {

            expect(plane.fromArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(plane.fromArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#toArray", function () {

        var plane = makePlane(makeVector3(1, 2, 3), 5),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set plane to an array", function () {

            plane.toArray(arr);
            expect(arr).to.have.length.at.least(4);
            expect(plane.normal, "normal").to.equalByComponents(arr);
            expect(plane.distance, "distance").to.equal(5);
        });

        it("should set plane to an array with given offset", function () {

            plane.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 4);
            expect(plane.normal, "normal").to.equalByComponents(arr.slice(offset));
            expect(plane.distance, "distance").to.equal(5);
        });

        it("should return 4 if offset is not passed", function () {

            expect(plane.toArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(plane.toArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#fromNormalPoint", function () {

        it("should set plane from normal and point", function () {

            var plane = makePlane();

            plane.fromNormalPoint(makeVector3(0, -1, 0), makeVector3(3, -4, 0));
            expect(plane.normal, "normal").to.equalByComponents(0, -1, 0);
            expect(plane.distance, "distance").to.equal(4);
        });

        it("should set distance to 0 if point is zero", function () {

            var plane = makePlane();

            plane.fromNormalPoint(makeVector3(0, -1, 0), makeVector3());
            expect(plane.normal, "normal").to.equalByComponents(0, -1, 0);
            expect(plane.distance, "distance").to.equal(0);
        });
        it("should not create a new object", function () {

            var plane = makePlane();

            expect(plane.fromNormalPoint(makeVector3(1, -1, 0), makeVector3(3, -4, 0))).
                to.equal(plane);
        });
    });

    describe("#fromCoplanarPoints", function () {

        it("should set plane from three coplanar points", function () {

            var plane = makePlane();

            plane.fromCoplanarPoints(makeVector3(1, 2, 0), makeVector3(0, 2, 0),
                makeVector3(0, 2, 1));
            expect(plane.normal, "normal").to.equalByComponents(0, 1, 0);
            expect(plane.distance, "distance").to.equal(2);
        });

        it("should not create a new object", function () {

            var plane = makePlane();

            expect(plane.fromCoplanarPoints(makeVector3(1, 0, 0), makeVector3(0, 1, 0),
                makeVector3(0, 0, 1))).to.equal(plane);
        });
    });

    describe("#translate", function () {

        it("should translate plane by given offset", function () {

            var plane = makePlane(makeVector3(1, 0, 0), 5),
                offset = makeVector3(0.5, 0, 0);

            plane.translate(offset);
            expect(plane.distance, "distance").to.equal(5.5);
        });

        it("should not change normal of the plane", function () {

            var plane = makePlane(makeVector3(1, 0, 0), 5),
                offset = makeVector3(0.5, 0, 0);

            plane.translate(offset);
            expect(plane.normal, "normal").to.equalByComponents(1, 0, 0);
        });

        it("should not create a new object", function () {

            var plane = makePlane(),
                offset = makeVector3(4, 5, -3);

            expect(plane.translate(offset)).to.equal(plane);
        });
    });

    describe("#transform", function () {

        it("should transform plane [rotation]", function () {

            var plane = makePlane(makeVector3(1, 1, 0), 5),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            plane.transform(mx);
            expect(plane.normal, "normal").to.be.closeByComponents(-1, 1, 0);
            expect(plane.distance, "distance").to.equal(5);
        });

        it("should transform plane [translation]", function () {

            var plane = makePlane(makeVector3(1, 0, 0), 3),
                mx = makeMatrix4().translation(5, 0, 0);

            plane.transform(mx);
            expect(plane.normal, "normal").to.be.closeByComponents(1, 0, 0);
            expect(plane.distance, "distance").to.equal(8);
        });

        it("should not create a new object", function () {

            var plane = makePlane();

            expect(plane.transform(M.Matrix4.IDENTITY)).to.equal(plane);
        });
    });

    describe("#normalize", function () {

        it("should normalize plane", function () {

            var plane = makePlane(makeVector3(0, 2, 0), 4);

            plane.normalize();
            expect(plane.normal, "normal").to.equalByComponents(0, 1, 0);
            expect(plane.distance, "distance").to.equal(2);
        });

        it("should not create a new object", function () {

            var plane = makePlane();

            expect(plane.normalize()).to.equal(plane);
        });
    });

    describe("#negate", function () {

        it("should negate plane", function () {

            var plane = makePlane(makeVector3(1, 0, -1), 5);

            plane.negate();
            expect(plane.normal, "normal").to.equalByComponents(-1, 0, 1);
            expect(plane.distance, "distance").to.equal(-5);
        });

        it("should not create a new object", function () {

            var plane = makePlane();

            expect(plane.negate()).to.equal(plane);
        });
    });

    describe("#projectPoint", function () {

        it("should return a point projected to the plane",
            function () {

                var plane = makePlane(makeVector3(1, 0, 0), 2),
                    p = makeVector3(3, 0, 0),
                    v;

                v = plane.projectPoint(p);
                expect(v).to.equalByComponents(2, 0, 0);
            });

        it("should set a point projected to the plane to a given vector", function () {

            var plane = makePlane(makeVector3(1, 1, 1).normalize(), Math.sqrt(12)),
                p = makeVector3(3, 3, 3),
                v = makeVector3();

            plane.projectPoint(p, v);
            expect(v).to.be.closeByComponents(2, 2, 2);
        });
    });

    describe("distanceTo", function() {

        var test = function(desc, nx, ny, nz, d, obj, res) {

            it(desc, function () {

                expect(makePlane(makeVector3(nx, ny, nz), d).distanceTo(obj)).to.be.a("number").and.
                    equal(res);
            });
        },
        msg;

        describe("#point", function() {

            var testPoint = function(desc, nx, ny, nz, d, px, py, pz, res) {

                test(desc, nx, ny, nz, d, makeVector3(px, py, pz), res);
            };

            msg = "should return positive distance if point is in front of a plain ";
            testPoint(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0,  2);
            testPoint(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0,  2);
            testPoint(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2,  2);

            msg = "should return zero distance if point is in a plain ";
            testPoint(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0,  0);
            testPoint(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0,  0);
            testPoint(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0,  0);

            msg = "should return negative distance if point is behind a plain ";
            testPoint(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0,  -2);
            testPoint(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0,  -2);
            testPoint(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2,  -2);
        });

        describe("#plane", function() {

            var testPlane = function(desc, nx1, ny1, nz1, d1, nx2, ny2, nz2, d2, res) {

                test(desc, nx1, ny1, nz1, d1, makePlane(makeVector3(nx2, ny2, nz2), d2), res);
            };

            msg = "should return positive distance if a plain is in front of another plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 0, 0, 2,  2);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  0, 1, 0, 2,  2);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 1, 2,  2);

            msg = "should return zero distance if a plain is in another plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 0, 0, 0,  0);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  0, 1, 0, 0,  0);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 1, 0,  0);

            msg = "should return zero distance if a plain intersects another plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 1, 0, 0,  0);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  1, 1, 0, 0,  0);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  1, 1, 0, 0,  0);

            msg = "should return negative distance if a plain is behind plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 0, 0, -2,  -2);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  0, 1, 0, -2,  -2);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 1, -2,  -2);

            msg = "should return negative distance if plains are opposite directed ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 2,  -1, 0, 0, 2,  -4);
            testPlane(msg + "[y-axis]", 0, 1, 0, 2,  0, -1, 0, 2,  -4);
            testPlane(msg + "[z-axis]", 0, 0, 1, 2,  0, 0, -1, 2,  -4);

            msg = "should return negative distance if plains are opposite directed and" +
                " first one has negative direction ";
            testPlane(msg + "[x-axis]", 1, 0, 0, -1,  -1, 0, 0, 2,  -1);
            testPlane(msg + "[y-axis]", 0, 1, 0, -1,  0, -1, 0, 2,  -1);
            testPlane(msg + "[z-axis]", 0, 0, 1, -1,  0, 0, -1, 2,  -1);

            msg = "should return negative distance if plains are opposite directed and " +
                "second one has negative direction ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 2,  -1, 0, 0, -1,  -1);
            testPlane(msg + "[y-axis]", 0, 1, 0, 2,  0, -1, 0, -1,  -1);
            testPlane(msg + "[z-axis]", 0, 0, 1, 2,  0, 0, -1, -1,  -1);
        });

        describe("#ray", function() {

            var testRay = function(desc, nx, ny, nz, d, origx, origy, origz, dirx, diry, dirz, res){

                test(desc, nx, ny, nz, d, makeRay(makeVector3(origx, origy, origz),
                    makeVector3(dirx, diry, dirz)), res);
            };

            msg = "should return positive distance if a ray is in front of a plain ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, 0, 1, 0,  2);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0, 1, 0, 0,  2);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2, 0, 1, 0,  2);

            msg = "should return zero distance if a ray is in a plain (same dir) ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 0, 1, 0,  0);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 1, 0, 0,  0);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 0, 1, 0,  0);

            msg = "should return zero distance if a ray is in a plain (different dir) ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 1, 1, 0,  0);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 1, 1, 0,  0);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 1, 1, 0,  0);

            msg = "should return zero distance if a ray intersects a plain ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, 1, 1, 0,  0);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, 1, 1, 0,  0);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, 1, 1,  0);

            msg = "should return negative distance if a ray is behind plain ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, 0, 1, 0,  -2);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, 1, 0, 0,  -2);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, 1, 0,  -2);
        });

        describe("#segment", function() {

            var testSegment = function(desc, nx, ny, nz, d, startx, starty, startz,
                                       endx, endy, endz, res) {

                test(desc, nx, ny, nz, d, makeSegment(makeVector3(startx, starty, startz),
                    makeVector3(endx, endy, endz)), res);
            };

            msg = "should return positive distance if a segment is in front of a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, 5, 1, 0,  2);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0, 1, 5, 0,  2);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2, 0, 1, 5,  2);

            msg = "should return zero distance if a segment lies on a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  0, -2, 0, 0, 2, 0,  0);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  -2, 0, 0, 2, 0, 0,  0);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, -2, 0, 0, 2, 0,  0);

            msg = "should return zero distance if start point of segment lies on a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  0, -2, 0, 2, 2, 0,  0);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  -2, 0, 0, 2, 2, 0,  0);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, -2, 0, 2, 2, 0,  0);

            msg = "should return zero distance if end point of segment lies on a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, 0, 0, 2, 0,  0);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, 0, 2, 0, 0,  0);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, -2, -2, 0, 2, 0,  0);

            msg = "should return zero distance if a segment intersects a plain ";
            testSegment(msg + "[x-axis]",
                1, 0, 0, 0,  -2, -2, -2, 2, 2, 2,  0);
            testSegment(msg + "[y-axis]",
                0, 1, 0, 0,  -2, -2, -2, 2, 2, 2,  0);
            testSegment(msg + "[z-axis]",
                0, 0, 1, 0,  -2, -2, -2, 2, 2, 2,  0);

            msg = "should return negative distance if a segment is behind a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, -5, -1, 0,  -2);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, -1, -5, 0,  -2);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, -1, -5,  -2);
        });

        describe("#triangle", function() {

            var testTriangle = function(desc, nx, ny, nz, d, ax, ay, az, bx, by, bz, cx, cy, cz,
                                        res) {

                test(desc, nx, ny, nz, d, makeTriangle(makeVector3(ax, ay, az),
                    makeVector3(bx, by, bz), makeVector3(cx, cy, cz)), res);
            };

            msg = "should return positive distance if a triangle is in front of a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, 5, 1, 0, 3, -1, 0,  2);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0, 1, 5, 0, 5, 3, -1,  2);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2, 0, 1, 5, 1, 1, 5,  2);

            msg = "should return zero distance if one of triangle's points lies on " +
                "a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  0, 2, 0, 5, 1, 0, 3, -1, 0,  0);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  2, 0, 0, 1, 5, 0, 5, 3, -1,  0);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 2, 0, 0, 1, 5, 1, 1, 5,  0);

            msg = "should return zero distance if any of triangle's points lies on " +
                "a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  0, 2, 0, 0, 1, 0, 3, -1, 0,  0);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  2, 0, 0, 1, 0, 0, 0, 1, -1,  0);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 2, 0, 0, 1, 0, 3, -1, -1,  0);

            msg = "should return zero distance if triangle intersects a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, 5, 1, 0, 3, -1, 0,  0);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, 5, 1, 0, 3, -1, 0,  0);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 5, 1, 0, 3, -1, 0,  0);

            msg = "should return negative distance if triangle is behind a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, -5, -1, 0, -3, 1, 0,  -2);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, -1, -5, 0, 5, -3, -1,  -2);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, -1, -5, -1, -1, -5,  -2);
        });

        describe("#aabox", function() {

            var testAabox = function(desc, nx, ny, nz, d, minx, miny, minz, maxx, maxy, maxz,
                                     res) {

                test(desc, nx, ny, nz, d, makeAABox(makeVector3(minx, miny, minz),
                    makeVector3(maxx, maxy, maxz)), res);
            };

            msg = "should return positive distance if an aabox is in front of a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  2, 2, 2, 5, 5, 5,  2);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  2, 2, 2, 5, 5, 5,  2);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  2, 2, 2, 5, 5, 5,  2);

            msg = "should return zero distance if an aabox lies on a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 2, 2, 2,  0);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 2, 2, 2,  0);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 2, 2, 2,  0);

            msg = "should return zero distance if an aabox lies on a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 0, 0, 0,  0);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, -2, 0, 0, 0,  0);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  -2, -2, -2, 0, 0, 0,  0);

            msg = "should return zero distance if an aabox intersects a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 2, 2, 2,  0);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, -2, 2, 2, 2,  0);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  -2, -2, -2, 2, 2, 2,  0);

            msg = "should return negative distance if an aabox is behind a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  -5, -5, -5, -2, -2, -2,  -2);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  -5, -5, -5, -2, -2, -2,  -2);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  -5, -5, -5, -2, -2, -2,  -2);
        });

        describe("#sphere", function() {

            var testSphere = function(desc, nx, ny, nz, d, cx, cy, cz, r, res) {

                test(desc, nx, ny, nz, d, makeSphere(makeVector3(cx, cy, cz), r), res);
            };

            msg = "should return positive distance if an sphere is in front of a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  5, 5, 5, 2,  3);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  5, 5, 5, 2,  3);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  5, 5, 5, 2,  3);

            msg = "should zero positive distance if an sphere intersects a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 2,  0);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 2,  0);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 2,  0);

            msg = "should zero positive distance if an sphere lies on a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  2, 2, 2, 2,  0);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  2, 2, 2, 2,  0);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  2, 2, 2, 2,  0);

            msg = "should zero positive distance if an sphere lies on a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 2,  0);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, -2, 2,  0);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  -2, -2, -2, 2,  0);

            msg = "should zero positive distance if an sphere is behind a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  -5, -5, -5, 2,  -3);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  -5, -5, -5, 2,  -3);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  -5, -5, -5, 2,  -3);
        });

        it("should throw if the object argument has unsupported type", function () {

            var plane = makePlane(makeVector3(1, -1, 0), 5),
                fn = function () { plane.distanceTo(5); };

            expect(fn).to.throw();
        });
    });

    describe("#test", function() {

        var R = B.Math.Relation,

            test = function(desc, nx, ny, nz, d, obj, res) {

                it(desc, function () {

                    var plane = makePlane(makeVector3(nx, ny, nz), d),

                        iTest = plane.test(obj, R.INTERSECT),
                        inTest = plane.test(obj, R.INSIDE),
                        outTest = plane.test(obj, R.OUTSIDE),
                        defTest = plane.test(obj);

                    expect(iTest, "intersect test").to.equal(!!(res & R.INTERSECT));
                    expect(inTest, "inside test").to.equal(!!(res & R.INSIDE));
                    expect(outTest, "outside test").to.equal(!!(res & R.OUTSIDE));
                    expect(defTest, "default test").to.equal(!!(res & R.INTERSECT));
                });
            },
            msg;

        describe("#point", function() {

            var testPoint = function(desc, nx, ny, nz, d, px, py, pz, res) {

                test(desc, nx, ny, nz, d, makeVector3(px, py, pz), res);
            };

            msg = "should pass only outside test if point is in front of a plain ";
            testPoint(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, R.OUTSIDE);
            testPoint(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0,  R.OUTSIDE);
            testPoint(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2,  R.OUTSIDE);

            msg = "should pass only intersect test if point is in a plain ";
            testPoint(msg + " [x-axis]", 1, 0, 0, 0,  0, 0, 0,  R.INTERSECT);
            testPoint(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0,  R.INTERSECT);
            testPoint(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0,  R.INTERSECT);

            msg = "should pass only outside test if point is behind a plain ";
            testPoint(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0,  R.OUTSIDE);
            testPoint(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0,  R.OUTSIDE);
            testPoint(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2,  R.OUTSIDE);
        });

        describe("#plane", function() {

            var testPlane = function(desc, nx1, ny1, nz1, d1, nx2, ny2, nz2, d2, res) {

                test(desc, nx1, ny1, nz1, d1, makePlane(makeVector3(nx2, ny2, nz2), d2),  res);
            };

            msg = "should pass only outside test if a plain is in front of another plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 0, 0, 2,  R.OUTSIDE);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  0, 1, 0, 2,  R.OUTSIDE);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 1, 2,  R.OUTSIDE);

            msg = "should pass only intersect test if a plain is in another plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 0, 0, 0,  R.INTERSECT);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  0, 1, 0, 0,  R.INTERSECT);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 1, 0,  R.INTERSECT);

            msg = "should pass only intersect test if a plain intersects another plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 1, 0, 0,  R.INTERSECT);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  1, 1, 0, 0,  R.INTERSECT);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  1, 1, 0, 0,  R.INTERSECT);

            msg = "should pass only outside test if a plain is behind plain ";
            testPlane(msg + "[x-axis]", 1, 0, 0, 0,  1, 0, 0, -2,  R.OUTSIDE);
            testPlane(msg + "[y-axis]", 0, 1, 0, 0,  0, 1, 0, -2,  R.OUTSIDE);
            testPlane(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 1, -2,  R.OUTSIDE);
        });

        describe("#ray", function() {

            var testRay = function(desc, nx, ny, nz, d, origx, origy, origz, dirx, diry, dirz, res){

                test(desc, nx, ny, nz, d, makeRay(makeVector3(origx, origy, origz),
                    makeVector3(dirx, diry, dirz)), res);
            };

            msg = "should return positive distance if a ray is in front of a plain ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, 0, 1, 0,  R.OUTSIDE);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0, 1, 0, 0,  R.OUTSIDE);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2, 0, 1, 0,  R.OUTSIDE);

            msg = "should return zero distance if a ray is in a plain (same dir) ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 0, 1, 0,  R.INTERSECT);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 1, 0, 0,  R.INTERSECT);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 0, 1, 0,  R.INTERSECT);

            msg = "should return zero distance if a ray is in a plain (different dir) ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 1, 1, 0,  R.INTERSECT);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 1, 1, 0,  R.INTERSECT);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 1, 1, 0,  R.INTERSECT);

            msg = "should return zero distance if a ray intersects a plain ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, 1, 1, 0,  R.INTERSECT);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, 1, 1, 0,  R.INTERSECT);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, 1, 1,  R.INTERSECT);

            msg = "should return negative distance if a ray is behind plain ";
            testRay(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, 0, 1, 0,  R.OUTSIDE);
            testRay(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, 1, 0, 0,  R.OUTSIDE);
            testRay(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, 1, 0,  R.OUTSIDE);
        });

        describe("#segment", function() {

            var testSegment = function(desc, nx, ny, nz, d, startx, starty, startz,
                                       endx, endy, endz, res) {

                test(desc, nx, ny, nz, d, makeSegment(makeVector3(startx, starty, startz),
                    makeVector3(endx, endy, endz)), res);
            };

            msg = "should return positive distance if a segment is in front of a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, 5, 1, 0,  R.OUTSIDE);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0, 1, 5, 0,  R.OUTSIDE);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2, 0, 1, 5,  R.OUTSIDE);

            msg = "should return zero distance if a segment lies on a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  0, -2, 0, 0, 2, 0,  R.INTERSECT);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  -2, 0, 0, 2, 0, 0,  R.INTERSECT);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, -2, 0, 0, 2, 0,  R.INTERSECT);

            msg = "should return zero distance if start point of segment lies on a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  0, -2, 0, 2, 2, 0,  R.INTERSECT);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  -2, 0, 0, 2, 2, 0,  R.INTERSECT);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, -2, 0, 2, 2, 0,  R.INTERSECT);

            msg = "should return zero distance if end point of segment lies on a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, 0, 0, 2, 0,  R.INTERSECT);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, 0, 2, 0, 0,  R.INTERSECT);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, -2, -2, 0, 2, 0,  R.INTERSECT);

            msg = "should return zero distance if a segment intersects a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 2, 2, 2,  R.INTERSECT);
            testSegment(msg + "[x-axis]", 0, 1, 0, 0,  -2, -2, -2, 2, 2, 2,  R.INTERSECT);
            testSegment(msg + "[x-axis]", 0, 0, 1, 0,  -2, -2, -2, 2, 2, 2,  R.INTERSECT);

            msg = "should return negative distance if a segment is behind a plain ";
            testSegment(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, -5, -1, 0,  R.OUTSIDE);
            testSegment(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, -1, -5, 0,  R.OUTSIDE);
            testSegment(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, -1, -5,  R.OUTSIDE);
        });

        describe("#triangle", function() {

            var testTriangle = function(desc, nx, ny, nz, d, ax, ay, az, bx, by, bz, cx, cy, cz,
                                        res) {

                test(desc, nx, ny, nz, d, makeTriangle(makeVector3(ax, ay, az),
                    makeVector3(bx, by, bz), makeVector3(cx, cy, cz)),res);
            };

            msg = "should return positive distance if a triangle is in front of a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  2, 0, 0, 5, 1, 0, 3, -1, 0,  R.OUTSIDE);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  0, 2, 0, 1, 5, 0, 5, 3, -1,  R.OUTSIDE);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 2, 0, 1, 5, 1, 1, 5,  R.OUTSIDE);

            msg = "should return zero distance if one of triangle's points lies on a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  0, 2, 0, 5, 1, 0, 3, -1, 0,  R.INTERSECT);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  2, 0, 0, 1, 5, 0, 5, 3, -1,  R.INTERSECT);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 2, 0, 0, 1, 5, 1, 1, 5,  R.INTERSECT);

            msg = "should return zero distance if any of triangle's points lies on a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  0, 2, 0, 0, 1, 0, 3, -1, 0,  R.INTERSECT);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  2, 0, 0, 1, 0, 0, 0, 1, -1,  R.INTERSECT);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 2, 0, 0, 1, 0, 3, -1, -1,  R.INTERSECT);

            msg = "should return zero distance if triangle intersects a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, 5, 1, 0, 3, -1, 0,  R.INTERSECT);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, 5, 1, 0, 3, -1, 0,  R.INTERSECT);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 5, 1, 0, 3, -1, 0,  R.INTERSECT);

            msg = "should return negative distance if triangle is behind a plain ";
            testTriangle(msg + "[x-axis]", 1, 0, 0, 0,  -2, 0, 0, -5, -1, 0, -3, 1, 0, R.OUTSIDE);
            testTriangle(msg + "[y-axis]", 0, 1, 0, 0,  0, -2, 0, -1, -5, 0, 5, -3, -1, R.OUTSIDE);
            testTriangle(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, -2, 0, -1, -5, -1, -1, -5, R.OUTSIDE);
        });

        describe("#aabox", function() {

            var testAabox = function(desc, nx, ny, nz, d, minx, miny, minz, maxx, maxy, maxz, res) {

                test(desc, nx, ny, nz, d, makeAABox(makeVector3(minx, miny, minz),
                    makeVector3(maxx, maxy, maxz)), res);
            };

            msg = "should return positive distance if an aabox is in front of a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  2, 2, 2, 5, 5, 5,  R.OUTSIDE);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  2, 2, 2, 5, 5, 5,  R.OUTSIDE);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  2, 2, 2, 5, 5, 5,  R.OUTSIDE);

            msg = "should return zero distance if an aabox lies on a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  0, 0, 0, 2, 2, 2,  R.INTERSECT);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  0, 0, 0, 2, 2, 2,  R.INTERSECT);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  0, 0, 0, 2, 2, 2,  R.INTERSECT);

            msg = "should return zero distance if an aabox lies on a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 0, 0, 0,  R.INTERSECT);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, -2, 0, 0, 0,  R.INTERSECT);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  -2, -2, -2, 0, 0, 0,  R.INTERSECT);

            msg = "should return zero distance if an aabox intersects a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 2, 2, 2,  R.INTERSECT);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, -2, 2, 2, 2,  R.INTERSECT);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  -2, -2, -2, 2, 2, 2,  R.INTERSECT);

            msg = "should return negative distance if an aabox is behind a plain ";
            testAabox(msg + "[x-axis]", 1, 0, 0, 0,  -5, -5, -5, -2, -2, -2,  R.OUTSIDE);
            testAabox(msg + "[y-axis]", 0, 1, 0, 0,  -5, -5, -5, -2, -2, -2,  R.OUTSIDE);
            testAabox(msg + "[z-axis]", 0, 0, 1, 0,  -5, -5, -5, -2, -2, -2,  R.OUTSIDE);
        });

        describe("#sphere", function() {

            var testSphere = function(desc, nx, ny, nz, d, cx, cy, cz, r, res) {

                test(desc, nx, ny, nz, d, makeSphere(makeVector3(cx, cy, cz), r), res);
            };

            msg = "should return positive distance if an sphere is in front of a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  5, 5, 5, 2,  R.OUTSIDE);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  5, 5, 5, 2,  R.OUTSIDE);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  5, 5, 5, 2,  R.OUTSIDE);

            msg = "should zero positive distance if an sphere intersects a plain ";
            testSphere(msg + "[x-axis]",
                1, 0, 0, 0,  0, 0, 0, 2,  R.INTERSECT);
            testSphere(msg + "[y-axis]",
                0, 1, 0, 0,  0, 0, 0, 2,  R.INTERSECT);
            testSphere(msg + "[z-axis]",
                0, 0, 1, 0,  0, 0, 0, 2,  R.INTERSECT);

            msg = "should zero positive distance if an sphere lies on a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  2, 2, 2, 2,  R.INTERSECT);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  2, 2, 2, 2,  R.INTERSECT);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  2, 2, 2, 2,  R.INTERSECT);

            msg = "should zero positive distance if an sphere lies on a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  -2, -2, -2, 2,  R.INTERSECT);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  -2, -2, -2, 2,  R.INTERSECT);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  -2, -2, -2, 2,  R.INTERSECT);

            msg = "should zero positive distance if an sphere is behind a plain ";
            testSphere(msg + "[x-axis]", 1, 0, 0, 0,  -5, -5, -5, 2,  R.OUTSIDE);
            testSphere(msg + "[y-axis]", 0, 1, 0, 0,  -5, -5, -5, 2,  R.OUTSIDE);
            testSphere(msg + "[z-axis]", 0, 0, 1, 0,  -5, -5, -5, 2,  R.OUTSIDE);
        });

        it("should throw if the object argument has unsupported type", function () {

            var plane = makePlane(makeVector3(1, -1, 0), 5),
                fn = function () { plane.test(5, R.INTERSECT); };

            expect(fn).to.throw();
        });
    });

    describe("#equal", function() {

        it("should return true if planes are equal", function () {

            var pl1 = makePlane(makeVector3(1, -1, 0), 5),
                pl2 = makePlane(makeVector3(1, -1, 0), 5);

            expect(pl1.equal(pl2)).to.be.true;
        });

        it("should return false if planes are not equal", function () {

            var pl1 = makePlane(makeVector3(1, -1, 0), 5),
                pl2 = makePlane(makeVector3(1, -1, 0), 5.1);

            expect(pl1.equal(pl2)).to.be.false;
        });
    });

    describe("X", function () {

        it("should exist", function () {
            expect(M.Plane.X).to.exist;
        });

        it("should be an instance of M.Plane", function () {
            expect(M.Plane.X).to.be.instanceof(M.Plane);
        });

        it("should be positive direction along X-axis", function () {
            expect(M.Plane.X).to.have.property("normal").that.equalByComponents(1, 0, 0);
        });
    });

    describe("Y", function () {

        it("should exist", function () {
            expect(M.Plane.Y).to.exist;
        });

        it("should be an instance of M.Plane", function () {
            expect(M.Plane.Y).to.be.instanceof(M.Plane);
        });

        it("should be positive direction along Y-axis", function () {
            expect(M.Plane.Y).to.have.property("normal").that.equalByComponents(0, 1, 0);
        });
    });

    describe("Z", function () {

        it("should exist", function () {
            expect(M.Plane.Z).to.exist;
        });

        it("should be an instance of M.Plane", function () {
            expect(M.Plane.Z).to.be.instanceof(M.Plane);
        });

        it("should be positive direction along Z-axis", function () {
            expect(M.Plane.Z).to.have.property("normal").that.equalByComponents(0, 0, 1);
        });
    });

    describe("N_X", function () {

        it("should exist", function () {
            expect(M.Plane.N_X).to.exist;
        });

        it("should be an instance of M.Plane", function () {
            expect(M.Plane.N_X).to.be.instanceof(M.Plane);
        });

        it("should be negative direction along X-axis", function () {
            expect(M.Plane.N_X).to.have.property("normal").that.equalByComponents(-1, 0, 0);
        });
    });

    describe("N_Y", function () {

        it("should exist", function () {
            expect(M.Plane.N_Y).to.exist;
        });

        it("should be an instance of M.Plane", function () {
            expect(M.Plane.N_Y).to.be.instanceof(M.Plane);
        });

        it("should be negative direction along Y-axis", function () {
            expect(M.Plane.N_Y).to.have.property("normal").that.equalByComponents(0, -1, 0);
        });
    });

    describe("N_Z", function () {

        it("should exist", function () {
            expect(M.Plane.N_Z).to.exist;
        });

        it("should be an instance of M.Plane", function () {
            expect(M.Plane.N_Z).to.be.instanceof(M.Plane);
        });

        it("should be negative direction along Z-axis", function () {
            expect(M.Plane.N_Z).to.have.property("normal").that.equalByComponents(0, 0, -1);
        });
    });
});
