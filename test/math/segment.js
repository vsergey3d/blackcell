
describe("B.Math.Segment", function() {

    var makeVector3 = B.Math.makeVector3,
        makeMatrix4 = B.Math.makeMatrix4,
        makeAABox = B.Math.makeAABox,
        makeSphere = B.Math.makeSphere,
        makeSegment = B.Math.makeSegment,
        makeRay = B.Math.makeRay,
        makeTriangle = B.Math.makeTriangle,
        makePlane = B.Math.makePlane;

    it("should exist", function () {
        expect(B.Math.Segment).to.exist;
    });

    describe("#constructor", function(){

        it("should initialized the segment with default values if no params passed", function () {

            var seg = new B.Math.Segment();

            expect(seg).to.have.property("start").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.ZERO);
            expect(seg).to.have.property("end").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.ZERO);
        });

        it("should set passed start value", function () {

            var seg = new B.Math.Segment(makeVector3(1, -1, 1));
            expect(seg).to.have.property("start").that.equalByComponents(1, -1, 1);
        });

        it("should set passed end value", function () {

            var seg = new B.Math.Segment(makeVector3(), makeVector3(0, -1, 1));
            expect(seg).to.have.property("end").that.equalByComponents(0, -1, 1);
        });
    });

    describe("#clone", function(){

        it("should clone a segment", function () {

            var seg = makeSegment(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                clone = seg.clone();

            expect(clone.start, "start").to.equalByComponents(seg.start);
            expect(clone.end, "end").to.equalByComponents(seg.end);
        });

        it("should return a new object", function () {

            var seg = makeSegment(),
                clone = seg.clone();

            expect(clone).to.not.equal(seg);
        });
    });

    describe("#copy", function(){

        it("should copy a segment", function () {

            var seg1 = makeSegment(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                seg2 = makeSegment();

            seg2.copy(seg1);
            expect(seg2.start, "start").to.equalByComponents(seg1.start);
            expect(seg2.end, "end").to.equalByComponents(seg1.end);
        });

        it("should not create a object", function () {

            var seg1 = makeSegment(makeVector3(1, -1, 1), makeVector3(0, 1, 1)),
                seg2 = makeSegment();

            expect(seg2.copy(seg1)).to.equal(seg2);
        });
    });

    describe("#set", function(){

        it("should set segment from start and end points", function () {

            var seg = makeSegment();

            seg.set(makeVector3(1, 2, 3), makeVector3(3, 4, 5));
            expect(seg.start, "start").to.equalByComponents(1, 2, 3);
            expect(seg.end, "end").to.equalByComponents(3, 4, 5);
        });

        it("should not create a new object", function () {

            var seg = makeSegment();
            expect(seg.set(makeVector3(1, 2, 3), makeVector3(3, 4, 5))).to.equal(seg);
        });
    });

    describe("#fromArray", function() {

        var seg = makeSegment(),
            arr = [-1, 0, 1, 2, 3, 4, 5, 6],
            offset = 2;

        it("should set segment from an array", function () {

            seg.fromArray(arr);
            expect(seg.start, "start").to.equalByComponents(arr);
            expect(seg.end, "end").to.equalByComponents(arr.slice(3));
        });

        it("should set segment from array with given offset", function () {

            seg.fromArray(arr, offset);
            expect(seg.start, "start").to.equalByComponents(arr.slice(offset));
            expect(seg.end, "end").to.equalByComponents(arr.slice(offset + 3));
        });

        it("should return 6 if offset is not passed", function () {

            expect(seg.fromArray(arr)).to.equal(6);
        });

        it("should return new offset", function () {

            expect(seg.fromArray(arr, offset)).to.equal(offset + 6);
        });
    });

    describe("#toArray", function(){

        var seg = makeSegment(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set segment to an array", function () {

            seg.toArray(arr);
            expect(arr).to.have.length.at.least(6);
            expect(seg.start, "start").to.equalByComponents(arr);
            expect(seg.end, "direction").to.equalByComponents(arr.slice(3));
        });

        it("should set segment to an array with given offset", function () {

            seg.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 6);
            expect(seg.start, "start").to.equalByComponents(arr.slice(offset));
            expect(seg.end, "end").to.equalByComponents(arr.slice(offset + 3));
        });

        it("should return 6 if offset is not passed", function () {

            expect(seg.toArray(arr)).to.equal(6);
        });

        it("should return new offset", function () {

            expect(seg.toArray(arr, offset)).to.equal(offset + 6);
        });
    });

    describe("#translate", function() {

        it("should translate segment by given offset", function () {

            var seg = makeSegment(makeVector3(2, 2, 2), makeVector3(0, -1, 0)),
                offset = makeVector3(4, 5, -3);

            seg.translate(offset);
            expect(seg.start, "start").to.equalByComponents(6, 7, -1);
            expect(seg.end, "end").to.equalByComponents(4, 4, -3);
        });

        it("should not create a new object", function () {

            var seg = makeSegment(),
                offset = makeVector3(4, 5, -3);

            expect(seg.translate(offset)).to.equal(seg);
        });
    });

    describe("#transform", function() {

        it("should transform segment by given matrix [only rotation]", function () {

            var seg = makeSegment(makeVector3(0, 0, 0), makeVector3(1, 1, 0)),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            seg.transform(mx);
            expect(seg.start, "start").to.be.closeByComponents(0, 0, 0);
            expect(seg.end, "end").to.be.closeByComponents(-1, 1, 0);
        });

        it("should transform segment by given matrix [only translation]", function () {

            var seg = makeSegment(makeVector3(0, 0, 0), makeVector3(1, 1, 0)),
                mx = makeMatrix4().translation(4, 5, -3);

            seg.transform(mx);
            expect(seg.start, "start").to.be.closeByComponents(4, 5, -3);
            expect(seg.end, "end").to.be.closeByComponents(5, 6, -3);
        });

        it("should transform segment by given matrix", function () {

            var seg = makeSegment(makeVector3(2, 2, 2), makeVector3(3, 3, 0)),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            seg.transform(mx);
            expect(seg.start, "start").to.be.closeByComponents(-2, 2, 2);
            expect(seg.end, "end").to.be.closeByComponents(-3, 3, 0);
        });

        it("should not create a new object", function () {

            var seg = makeSegment();
            expect(seg.transform(B.Math.Matrix4.IDENTITY)).to.equal(seg);
        });
    });

    describe("#center", function() {

        it("should return a center of the segment", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 0, 2)),
                center;

            center = seg.center();
            expect(center).to.equalByComponents(0, -1, 0);
        });

        it("should set a center of the segment to passed vector", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 0, 2)),
                center = makeVector3();

            seg.center(center);
            expect(center).to.equalByComponents(0, -1, 0);
        });
    });

    describe("#delta", function() {

        it("should return a vector from start to end", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 0, 2)),
                delta;

            delta = seg.delta();
            expect(delta).to.be.instanceof(B.Math.Vector3).and.equalByComponents(4, 2, 4);
        });

        it("should set a vector from start to end to passed vector", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 0, 2)),
                delta = makeVector3();

            seg.delta(delta);
            expect(delta).to.equalByComponents(4, 2, 4);
        });
    });

    describe("length", function() {

        it("should return a length of the segment", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

            expect(seg.length()).to.be.a("number").and.be.closeTo(Math.sqrt(48), 0.00001);
        });
    });

    describe("at", function() {

        it("should return a point at this segment", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

            expect(seg.at(0.5)).to.be.instanceof(B.Math.Vector3).and.equalByComponents(0, 0, 0);
        });

        it("should return start point of the segment if t is 0.0", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

            expect(seg.at(0.0)).to.be.instanceof(B.Math.Vector3).and.equalByComponents(-2, -2, -2);
        });

        it("should return end point of the segment if t is 1.0", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

            expect(seg.at(1.0)).to.be.instanceof(B.Math.Vector3).and.equalByComponents(2, 2, 2);
        });

        it("should set a point at the ray to a given vector", function () {

            var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                p = makeVector3();

            seg.at(0.5, p);
            expect(p).to.be.instanceof(B.Math.Vector3).and.equalByComponents(0, 0, 0);
        });
    });

    describe("#projectPoint", function() {

        it("should return a point projected to the segment [projected point lies on the segment]",
            function () {

                var seg = makeSegment(makeVector3(2, 0, 0), makeVector3(5, 0, 0)),
                    p = makeVector3(4, 3, 4),
                    v;

                v = seg.projectPoint(p);
                expect(v).to.equalByComponents(4, 0, 0);
            });

        it("should return start poinf if a projected point lies below the segment", function () {

                var seg = makeSegment(makeVector3(2, 2, 2), makeVector3(5, 5, 5)),
                    p = makeVector3(),
                    v;

                v = seg.projectPoint(p);
                expect(v).to.equalByComponents(2, 2, 2);
            });

        it("should return start poinf if a projected point lies above the segment", function () {

            var seg = makeSegment(makeVector3(2, 2, 2), makeVector3(5, 5, 5)),
                p = makeVector3(7, 7, 7),
                v;

            v = seg.projectPoint(p);
            expect(v).to.equalByComponents(5, 5, 5);
        });

        it("should return a point projected to the segment " +
            "[projected point consides with the start point]", function () {

                var seg = makeSegment(makeVector3(0, 2, 0), makeVector3(0, 5, 0)),
                    p = makeVector3(1, 2, 2),
                    v;

                v = seg.projectPoint(p);
                expect(v).to.equalByComponents(0, 2, 0);
            });

        it("should return a point projected to the segment " +
            "[projected point consides with the end point]", function () {

            var seg = makeSegment(makeVector3(0, 2, 0), makeVector3(0, 5, 0)),
                p = makeVector3(1, 5, 2),
                v;

            v = seg.projectPoint(p);
            expect(v).to.equalByComponents(0, 5, 0);
        });

        it("should set a point projected to the segment to a given vector", function () {

            var seg = makeSegment(makeVector3(2, 2, 2), makeVector3(5, 5, 5)),
                p = makeVector3(),
                v = makeVector3();

            seg.projectPoint(p, v);
            expect(v).to.equalByComponents(2, 2, 2);
        });
    });

    describe("#trace", function() {

        describe("[plane]", function() {

            it("should return point of intersection", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    p = makePlane(makeVector3(1, 1, 1), 0);

                expect(seg.trace(p)).to.be.closeTo(Math.sqrt(12), 0.0001);
            });

            it("should set point of intersection to a given vector", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    p = makePlane(makeVector3(1, 1, 1), 0),
                    res = makeVector3();

                seg.trace(p, res);
                expect(res).to.be.instanceof(B.Math.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is start point of segment", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    p = makePlane(makeVector3(-1, 0, 0), 2);

                expect(seg.trace(p)).to.equal(0);
            });

            it("should return length if point of intersection is end point of segment", function (){

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    p = makePlane(makeVector3(1, 0, 0), 2);

                expect(seg.trace(p)).to.be.closeTo(seg.length(), 0.0001);
            });

            it("should return null if no intersections", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makePlane(makeVector3(1, 0, 0), -3)), "[behind a segment]").
                    to.be.null;
                expect(seg.trace(makePlane(makeVector3(-1, 0, 0), -3)), "[in front of a segment]").
                    to.be.null;
            });
        });

        describe("[triangle]", function() {

            it("should return point of intersection", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeTriangle(makeVector3(0, 2, 0), makeVector3(0, 0, 2),
                    makeVector3(0, 0, -2)))).to.be.closeTo(Math.sqrt(12), 0.0001);
            });

            it("should set point of intersection to a given vector", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    tri = makeTriangle(makeVector3(0, 2, 0), makeVector3(0, 0, 2),
                        makeVector3(0, 0, -2)),
                    res = makeVector3();

                seg.trace(tri, res);
                expect(res).to.be.instanceof(B.Math.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is start point of segment", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeTriangle(makeVector3(-2, -2, -2), makeVector3(-2, -3, -2),
                    makeVector3(-2, -3, -3))), "[a]").to.equal(0);
                expect(seg.trace(makeTriangle(makeVector3(0, -2, -2), makeVector3(-2, -2, -2),
                    makeVector3(0, -2, 0))), "[b]").to.equal(0);
                expect(seg.trace(makeTriangle(makeVector3(0, -2, -2), makeVector3(-2, -2, -4),
                    makeVector3(-2, -2, -2))), "[c]").to.equal(0);
            });

            it("should return length if point of intersection is end point of segment", function (){

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeTriangle(makeVector3(2, 2, 2), makeVector3(2, 2, 4),
                    makeVector3(2, 0, 0))), "[a]").to.be.closeTo(seg.length(), 0.0001);
                expect(seg.trace(makeTriangle(makeVector3(2, 4, 2), makeVector3(2, 2, 2),
                    makeVector3(2, 2, 4))), "[b]").to.be.closeTo(seg.length(), 0.0001);
                expect(seg.trace(makeTriangle(makeVector3(2, 4, 2), makeVector3(2, 2, 4),
                    makeVector3(2, 2, 2))), "[c]").to.be.closeTo(seg.length(), 0.0001);
            });

            it("should return null if no intersections", function () {

                var triangle = makeTriangle(makeVector3(1, 0, 0),
                    makeVector3(0, 1, 0), makeVector3(0, 0, 1));

                expect(makeSegment(makeVector3(2, 2, 2), makeVector3(2, 2, 0)).
                    trace(triangle), "case 0").to.be.null;
                expect(makeSegment(makeVector3(2, 2, 2), makeVector3(0, 2, 2)).
                    trace(triangle), "case 1").to.be.null;
                expect(makeSegment(makeVector3(2, 2, 2), makeVector3(0, -2, 0)).
                    trace(triangle), "case 2").to.be.null;
            });

            it("should return null if no intersections (segment is parallel to triangle)",
                function () {

                var triangle = makeTriangle(makeVector3(1, 0, 0),
                        makeVector3(-1, 0, 0), makeVector3(0, 1, 0)),
                    seg = makeSegment(makeVector3(0, 0, 1), makeVector3(0, 1, 1));

                expect(seg.trace(triangle)).to.be.null;
            });
        });

        describe("[aabox]", function() {

            it("should return point of intersection", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeAABox(makeVector3(0, -2, 0), makeVector3(4, 4, 2)))).
                    to.be.closeTo(Math.sqrt(12), 0.0001);
            });

            it("should set point of intersection to a given vector", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    aabox = makeAABox(makeVector3(0, -2, 0), makeVector3(4, 4, 2)),
                    res = makeVector3();

                seg.trace(aabox, res);
                expect(res).to.be.instanceof(B.Math.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is start point of segment", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeAABox(makeVector3(-2, -2, -2), makeVector3(0, 0, 0))),
                    "[min]").to.equal(0);
                expect(seg.trace(makeAABox(makeVector3(-4, -4, -4), makeVector3(-2, -2, -2))),
                    "[max]").to.equal(0);
            });

            it("should return length if point of intersection is end point of segment", function (){

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeAABox(makeVector3(2, 2, 2), makeVector3(4, 4, 4))),
                    "[min]").to.be.closeTo(seg.length(), 0.0001);
            });

            it("should return null if no intersections", function () {

                var box = makeAABox(makeVector3(-1, -1, -1), makeVector3(1, 1, 1));

                expect(makeSegment(makeVector3(0, 0, -5), makeVector3(0, 5, 0)).
                    trace(box), "case 0").to.be.null;
                expect(makeSegment(makeVector3(0, 0, -5), makeVector3(0, -5, 0)).
                    trace(box), "case 1").to.be.null;
                expect(makeSegment(makeVector3(0, 0, -5), makeVector3(5, 0, 0)).
                    trace(box), "case 2").to.be.null;
                expect(makeSegment(makeVector3(0, 0, -5), makeVector3(-5, 0, 0)).
                    trace(box), "case 3").to.be.null;

                expect(makeSegment(makeVector3(0, -5, 0), makeVector3(0, 0, 5)).
                    trace(box), "case 4").to.be.null;
                expect(makeSegment(makeVector3(0, -5, 0), makeVector3(0, 0, -5)).
                    trace(box), "case 5").to.be.null;
                expect(makeSegment(makeVector3(0, -5, 0), makeVector3(5, 0, 0)).
                    trace(box), "case 6").to.be.null;
                expect(makeSegment(makeVector3(0, -5, 0), makeVector3(-5, 0, 0)).
                    trace(box), "case 7").to.be.null;

                expect(makeSegment(makeVector3(-5, 0, 0), makeVector3(0, 0, 5)).
                    trace(box), "case 8").to.be.null;
                expect(makeSegment(makeVector3(-5, 0, 0), makeVector3(0, 0, -5)).
                    trace(box), "case 9").to.be.null;
                expect(makeSegment(makeVector3(-5, 0, 0), makeVector3(0, 5, 0)).
                    trace(box), "case 10").to.be.null;
                expect(makeSegment(makeVector3(-5, 0, 0), makeVector3(0, -5, 0)).
                    trace(box), "case 11").to.be.null;

                expect(makeSegment(makeVector3(0, 0, -5), makeVector3(0, 0, -10)).
                    trace(box), "case 12").to.be.null;
            });

            it("should return null if no intersections", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeAABox(makeVector3(-5, -5, -5), makeVector3(-3, -3, -3))),
                    "[behind a segment]").to.be.null;
                expect(seg.trace(makeAABox(makeVector3(3, 3, 3), makeVector3(5, 5, 5))),
                    "[in front of a segment]").to.be.null;
            });
        });

        describe("[sphere]", function() {

            it("should return point of intersection", function () {

                expect(makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)).
                    trace(makeSphere(makeVector3(0, 2, 0), 2))).
                    to.be.closeTo(Math.sqrt(12), 0.0001);

                expect(makeSegment(makeVector3(-2, -3, -2), makeVector3(-2, 3, -2)).trace(
                    makeSphere(makeVector3(-2, -2, -2), 2))).to.be.closeTo(3, 0.0001);
            });

            it("should set point of intersection to a given vector", function () {

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                    sphere = makeSphere(makeVector3(0, 2, 0), 2),
                    res = makeVector3();

                seg.trace(sphere, res);
                expect(res).to.be.instanceof(B.Math.Vector3).and.be.closeByComponents(0, 0, 0);
            });

            it("should return 0 if point of intersection is start point of segment", function () {

                var seg = makeSegment(makeVector3(0, -2, 0), makeVector3(0, 2, 0));

                expect(seg.trace(makeSphere(makeVector3(0, 0, 0), 2))).to.equal(0);
            });

            it("should return length if point of intersection is end point of segment",
                function (){

                var seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

                expect(seg.trace(makeSphere(makeVector3(2, 4, 2), 2))).
                    to.be.closeTo(seg.length(), 0.0001);
            });

            it("should return null if no intersections", function () {

                var sphere = makeSphere(makeVector3(2, 2, 2), 1);

                expect(makeSegment(makeVector3(2, 4, 2), makeVector3(2, 6, 2)).trace(
                    sphere), "discriminant > 0").to.be.null;

                expect(makeRay(makeVector3(2, 4, 2), makeVector3(2, 4, 4)).trace(
                    sphere), "discriminant < 0").to.be.null;
            });
        });

        it("should throw if the object argument has unsupported type", function () {

            var seg = makeSegment(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                fn = function() { seg.trace(5); };

            expect(fn).to.throw();
        });
    });

    describe("#distanceTo", function() {

        describe("[point]", function() {

            var xSeg = makeSegment(makeVector3(-2, 0, 0), makeVector3(2, 0, 0)),
                ySeg = makeSegment(makeVector3(0, -2, 0), makeVector3(0, 2, 0)),
                zSeg = makeSegment(makeVector3(0, 0, -2), makeVector3(0, 0, 2)),

                p = makeVector3();

            it("should return zero distance if a point is in a segment", function() {

                p.set(0, 0, 0);
                expect(xSeg.distanceTo(p), "[x-axis]").to.equal(0);
                expect(ySeg.distanceTo(p), "[y-axis]").to.equal(0);
                expect(zSeg.distanceTo(p), "[z-axis]").to.equal(0);
            });

            it("should return zero distance if a point is start of a segment", function() {

                expect(xSeg.distanceTo(xSeg.start), "[x-axis]").to.equal(0);
                expect(ySeg.distanceTo(ySeg.start), "[y-axis]").to.equal(0);
                expect(zSeg.distanceTo(zSeg.start), "[z-axis]").to.equal(0);
            });

            it("should return zero distance if a point is end of a segment", function() {

                expect(xSeg.distanceTo(xSeg.end), "[x-axis]").to.equal(0);
                expect(ySeg.distanceTo(ySeg.end), "[y-axis]").to.equal(0);
                expect(zSeg.distanceTo(zSeg.end), "[z-axis]").to.equal(0);
            });

            it("should return distance between a point and a segment", function() {

                p.set(0, 2, 0);
                expect(xSeg.distanceTo(p), "[x-axis]").to.equal(2);

                p.set(-2, 0, 0);
                expect(ySeg.distanceTo(p), "[y-axis]").to.equal(2);
                expect(zSeg.distanceTo(p), "[z-axis]").to.equal(2);
            });

            it("should return positive distance if a point is behind a segment", function() {

                p.set(-4, 0, 0);
                expect(xSeg.distanceTo(p), "[x-axis]").to.equal(2);

                p.set(0, -4, 0);
                expect(ySeg.distanceTo(p), "[y-axis]").to.equal(2);

                p.set(0, 0, -4);
                expect(zSeg.distanceTo(p), "[z-axis]").to.equal(2);
            });

            it("should return positive distance if a point is in front of a segment",
                function() {

                p.set(4, 0, 0);
                expect(xSeg.distanceTo(p), "[x-axis]").to.equal(2);

                p.set(0, 4, 0);
                expect(ySeg.distanceTo(p), "[y-axis]").to.equal(2);

                p.set(0, 0, 4);
                expect(zSeg.distanceTo(p), "[z-axis]").to.equal(2);
            });
        });

        it("should throw if the object argument has unsupported type", function () {

            var seg = makeSegment(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                fn = function () { seg.distanceTo(5); };

            expect(fn).to.throw();
        });
    });

    describe("#equal", function(){

        it("should return true if segments are equal", function () {

            var seg1 = makeSegment(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                seg2 = makeSegment(makeVector3(1, 2, 3), makeVector3(3, 4, 5));

            expect(seg1.equal(seg2)).to.be.true;
        });

        it("should return false if segments are not equal", function () {

            var seg1 = makeSegment(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                seg2 = makeSegment(makeVector3(-1, -2, -3), makeVector3(3, 4, 5));

            expect(seg1.equal(seg2)).to.be.false;
        });
    });
});