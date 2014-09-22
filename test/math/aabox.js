
describe("B.Math.AABox", function() {

    var makeVector3 = B.Math.makeVector3,
        makeMatrix4 = B.Math.makeMatrix4,
        makeAABox = B.Math.makeAABox,
        makeSegment = B.Math.makeSegment,
        makeTriangle = B.Math.makeTriangle,
        makeSphere = B.Math.makeSphere;

    it("should exist", function () {
        expect(B.Math.AABox).to.exist;
    });

    describe("#constructor", function(){

        it("should initialized components with infinity vector if no params passed", function () {

            var aabb = new B.Math.AABox();

            expect(aabb).to.have.property("min").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.INF);
            expect(aabb).to.have.property("max").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.N_INF);
        });

        it("should set passed min value", function () {

            var aabb = new B.Math.AABox(makeVector3(1, 0, -1));
            expect(aabb).to.have.property("min").that.equalByComponents(1, 0, -1);
        });

        it("should set passed max value", function () {

            var aabb = new B.Math.AABox(makeVector3(), makeVector3(1, 0, -1));
            expect(aabb).to.have.property("max").that.equalByComponents(1, 0, -1);
        });
    });

    describe("#clone", function(){

        it("should clone a box", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                clone = aabb.clone();

            expect(clone).to.equalByComponents(aabb);
        });

        it("should return a new object", function () {

            var aabb = makeAABox(),
                clone = aabb.clone();

            expect(clone).to.not.equal(aabb);
        });
    });

    describe("#copy", function(){

        it("should copy a box", function () {

            var aabb1 = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                aabb2 = makeAABox();

            aabb2.copy(aabb1);
            expect(aabb2).to.equalByComponents(aabb1);
        });

        it("should not create a object", function () {

            var aabb1 = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                aabb2 = makeAABox();

            expect(aabb2.copy(aabb1)).to.equal(aabb2);
        });
    });

    describe("#set", function(){

        it("should set box from min and max", function () {

            var aabb = makeAABox();

            aabb.set(makeVector3(1, 2, 3), makeVector3(3, 4, 5));
            expect(aabb).to.equalByComponents(1, 2, 3, 3, 4, 5);
        });

        it("should not create a new object", function () {

            var aabb = makeAABox();
            expect(aabb.set(makeVector3(1, 2, 3), makeVector3(3, 4, 5))).to.equal(aabb);
        });
    });

    describe("#fromArray", function() {

        var aabb = makeAABox(),
            arr = [1, -1, 1, 2, 3, 4, 5, 6],
            offset = 2;

        it("should set box from an array", function () {

            aabb.fromArray(arr);
            expect(aabb).to.equalByComponents(arr);
        });

        it("should set box from array with given offset", function () {

            aabb.fromArray(arr, offset);
            expect(aabb).to.equalByComponents(arr.slice(offset));
        });

        it("should return 6 if offset is not passed", function () {

            expect(aabb.fromArray(arr)).to.equal(6);
        });

        it("should return new offset", function () {

            expect(aabb.fromArray(arr, offset)).to.equal(offset + 6);
        });
    });

    describe("#toArray", function(){

        var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set box to an array", function () {

            aabb.toArray(arr);
            expect(arr).to.have.length.at.least(6);
            expect(aabb).to.equalByComponents(arr);
        });

        it("should set box to an array with given offset", function () {

            aabb.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 6);
            expect(aabb).to.equalByComponents(arr.slice(offset));
        });

        it("should return 6 if offset is not passed", function () {

            expect(aabb.toArray(arr)).to.equal(6);
        });

        it("should return new offset", function () {

            expect(aabb.toArray(arr, offset)).to.equal(offset + 6);
        });
    });

    describe("#fromCenterSize", function(){

        it("should set box from center and size", function () {

            var aabb = makeAABox(),
                center = makeVector3(0, 10, 5),
                size = makeVector3(3, 4, 5);

            aabb.fromCenterSize(center, size);
            expect(aabb).to.equalByComponents(-1.5, 8, 2.5, 1.5, 12, 7.5);
        });

        it("should return false if a given box is not equal to this vector", function () {

            var aabb = makeAABox(),
                center = makeVector3(0, 10, 5),
                size = makeVector3(3, 4, 5);

            expect(aabb.fromCenterSize(center, size)).to.equal(aabb);
        });
    });

    describe("#fromPoints", function(){

        it("should set box from an array of points [1 point]", function () {

            var aabb = makeAABox(),
                points = [ makeVector3(3, 4, 5) ];

            aabb.fromPoints(points);
            expect(aabb).to.equalByComponents(3, 4, 5, 3, 4, 5);
        });

        it("should set box from an array of points [2 points]", function () {

            var aabb = makeAABox(),
                points = [ makeVector3(-3, -4, -5), makeVector3(3, 4, 5) ];

            aabb.fromPoints(points);
            expect(aabb).to.equalByComponents(-3, -4, -5, 3, 4, 5);
        });

        it("should set box from an array of points  [3 points]", function () {

            var aabb = makeAABox(),
                points = [ makeVector3(-3, -4, -5), makeVector3(3, 4, 5), makeVector3(0, 10, -8) ];

            aabb.fromPoints(points);
            expect(aabb).to.equalByComponents(-3, -4, -8, 3, 10, 5);
        });

        it("should not create a new object", function () {

            var aabb = makeAABox(),
                points = [ makeVector3(-3, -4, -5), makeVector3(3, 4, 5) ];

            expect(aabb.fromPoints(points)).to.equal(aabb);
        });
    });

    describe("#fromSphere", function(){

        it("should set a sphere from a box", function () {

            var sphere = makeSphere(makeVector3(2, -2, 2), 5),
                box = makeAABox();

            box.fromSphere(sphere);
            expect(box).to.equalByComponents(-3, -7, -3, 7, 3, 7);
        });

        it("should not create a new object", function () {

            var box = makeAABox();

            expect(box.fromSphere(makeSphere())).to.equal(box);
        });
    });

    describe("#reset", function(){

        it("should reset box to initial state", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5));

            aabb.reset();
            expect(aabb.min, "min").to.equalByComponents(B.Math.Vector3.INF);
            expect(aabb.max, "max").to.equalByComponents(B.Math.Vector3.N_INF);
        });

        it("should not create a new object", function () {

            var aabb = makeAABox();
            expect(aabb.reset()).to.equal(aabb);
        });
    });

    describe("#empty", function(){

        it("should return false for non-zero volume of box", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5));

            expect(aabb.empty()).to.be.false;
        });

        it("should return true for zero volume of box", function () {

            var aabb = makeAABox(makeVector3(3, 4, 5), makeVector3(1, 2, 3));
            expect(aabb.empty()).to.be.true;
        });
    });

    describe("#center", function(){

        it("should return center of box [positive]", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                center = aabb.center();

            expect(center).to.equalByComponents(2, 3, 4);
        });

        it("should return center of box [negative]", function () {

            var aabb = makeAABox(makeVector3(-3, -4, -5), makeVector3(-1, -2, -3)),
                center = aabb.center();

            expect(center).to.equalByComponents(-2, -3, -4);
        });

        it("should return center of box [positive-negative]", function () {

            var aabb = makeAABox(makeVector3(-3, -4, -5), makeVector3(1, 2, 3)),
                center = aabb.center();

            expect(center).to.equalByComponents(-1, -1, -1);
        });

        it("should set center of box to a passed vector", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                center = makeVector3();

            aabb.center(center);
            expect(center).to.equalByComponents(2, 3, 4);
        });
    });

    describe("#size", function(){

        it("should return size of the box [positive]", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 6, 9)),
                size = aabb.size();

            expect(size).to.equalByComponents(2, 4, 6);
        });

        it("should return size of the box [negative]", function () {

            var aabb = makeAABox(makeVector3(-3, -6, -9), makeVector3(-1, -2, -3)),
                size = aabb.size();

            expect(size).to.equalByComponents(2, 4, 6);
        });

        it("should return size of the box [positive-negative]", function () {

            var aabb = makeAABox(makeVector3(-3, -6, -9), makeVector3(1, 2, 3)),
                size = aabb.size();

            expect(size).to.equalByComponents(4, 8, 12);
        });

        it("should set size of the box to a passed vector", function () {

            var aabb = makeAABox(makeVector3(1, 2, -3), makeVector3(3, 6, 9)),
                size = makeVector3();

            aabb.size(size);
            expect(size).to.equalByComponents(2, 4, 12);
        });
    });

    describe("#cornerPoints", function(){

        var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
            expected = [
                makeVector3(1, 2, 3),
                makeVector3(1, 2, 5),
                makeVector3(1, 4, 3),
                makeVector3(1, 4, 5),
                makeVector3(3, 2, 3),
                makeVector3(3, 2, 5),
                makeVector3(3, 4, 3),
                makeVector3(3, 4, 5)
            ],
            fn = function(p) {
                return expected.some(function(e) { return e.equal(p); });
            };

        it("should return corner points of this box", function () {

            var points = aabb.cornerPoints();

            expect(points).to.have.length(8);
            expect(points[0], "p0").to.satisfy(fn);
            expect(points[1], "p1").to.satisfy(fn);
            expect(points[2], "p2").to.satisfy(fn);
            expect(points[3], "p3").to.satisfy(fn);
            expect(points[4], "p4").to.satisfy(fn);
            expect(points[5], "p5").to.satisfy(fn);
            expect(points[6], "p6").to.satisfy(fn);
            expect(points[7], "p7").to.satisfy(fn);
        });

        it("should set corner points of this box to a given vector", function () {

            var points = [];

            aabb.cornerPoints(points);

            expect(points).to.have.length(8);
            expect(points[0], "p0").to.satisfy(fn);
            expect(points[1], "p1").to.satisfy(fn);
            expect(points[2], "p2").to.satisfy(fn);
            expect(points[3], "p3").to.satisfy(fn);
            expect(points[4], "p4").to.satisfy(fn);
            expect(points[5], "p5").to.satisfy(fn);
            expect(points[6], "p6").to.satisfy(fn);
            expect(points[7], "p7").to.satisfy(fn);
        });
    });

    describe("#translate", function(){

        it("should translate the box by offset", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                offset = makeVector3(-1, -1, -1);

            aabb.translate(offset);
            expect(aabb).to.equalByComponents(0, 1, 2, 2, 3, 4);
        });

        it("should not create a new object", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                offset = makeVector3(-1, -1, -1);

            expect(aabb.translate(offset)).to.equal(aabb);
        });
    });

    describe("#transform", function(){

        it("should transform the box by a matrix [translation]", function () {

            var aabb = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                mx = makeMatrix4().translation(1, 0, -1);

            aabb.transform(mx);
            expect(aabb).to.equalByComponents(2, 2, 2, 4, 4, 4);
        });

        it("should transform the box by a matrix [rotation without changing box]", function () {

            var aabb = makeAABox(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                mx = makeMatrix4().rotationY(Math.PI * 0.5);

            aabb.transform(mx);
            expect(aabb).to.equalByComponents(-2, -2, -2, 2, 2, 2);
        });

        it("should transform the box by a matrix [rotation]", function () {

            var aabb = makeAABox(makeVector3(-2, -2, -2), makeVector3(2, 2, 2)),
                mx = makeMatrix4().rotationY(Math.PI/4),

                newPoint = Math.sqrt(2*2 + 2*2);

            aabb.transform(mx);
            expect(aabb).to.be.closeByComponents(-newPoint, -2, -newPoint,
                newPoint, 2, newPoint);
        });
    });

    describe("#merge", function() {

        it("should merge the box with array of points", function () {

            var aabb = makeAABox();

            aabb.merge(makeVector3(-3, -4, -5));
            expect(aabb).to.equalByComponents(-3, -4, -5, -3, -4, -5);
        });

        it("should merge the box with a segment", function () {

            var aabb = makeAABox();

            aabb.merge(makeSegment(makeVector3(-3, -4, -5), makeVector3(5, 8, 0)));
            expect(aabb).to.equalByComponents(-3, -4, -5, 5, 8, 0);
        });

        it("should merge the box with a triangle", function () {

            var aabb = makeAABox();

            aabb.merge(makeTriangle(makeVector3(0, 1, 3), makeVector3(5, 0, 0),
                makeVector3(0, 2, -8)));
            expect(aabb).to.equalByComponents(0, 0, -8, 5, 2, 3);
        });

        it("should merge the box with an another box", function () {

            var aabb1 = makeAABox(),
                aabb2 = makeAABox(makeVector3(1, 2, 3), makeVector3(4, 5, 6));

            aabb1.merge(aabb2);
            expect(aabb1).to.equalByComponents(aabb2);
        });

        it("should merge the box with a sphere", function () {

            var aabb = makeAABox();

            aabb.merge(makeSphere(makeVector3(2, -2, 2), 5));
            expect(aabb).to.equalByComponents(-3, -7, -3, 7, 3, 7);
        });

        it("should throw if the object argument has unsupported type", function () {

            var aabb = makeAABox(),
                fn = function () { aabb.merge(5); };

            expect(fn).to.throw();
        });

        it("should not create a new object", function () {

            var aabb = makeAABox();

            expect(aabb.merge(makeVector3(-3, -4, -5))).to.equal(aabb);
        });
    });

    describe("#equal", function(){

        it("should return true if a given box is equal to this box", function () {

            var aabb1 = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                aabb2 = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5));

            expect(aabb1.equal(aabb2)).to.be.true;
        });

        it("should return false if a given box is not equal to this vector", function () {

            var aabb1 = makeAABox(makeVector3(1, 2, 3), makeVector3(3, 4, 5)),
                aabb2 = makeAABox(makeVector3(0, 2, 3), makeVector3(3, 4, 5));

            expect(aabb1.equal(aabb2)).to.be.false;
        });
    });
});