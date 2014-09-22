
describe("B.Math.Sphere", function () {

    var M = B.Math,
        makeVector3 = M.makeVector3,
        makeMatrix4 = M.makeMatrix4,
        makeSegment = M.makeSegment,
        makeSphere = M.makeSphere,
        makeTriangle = M.makeTriangle,
        makeAABox = M.makeAABox;

    it("should exist", function () {
        expect(M.Sphere).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized the sphere with default values if no params passed", function () {

            var sphere = new M.Sphere();

            expect(sphere).to.have.property("center").that.is.instanceof(M.Vector3).and.
                equalByComponents(M.Vector3.ZERO);
            expect(sphere).to.have.property("radius").that.is.a("number").and.equal(0.0);
        });

        it("should set passed center value", function () {

            var sphere = new M.Sphere(makeVector3(1, 0, -1));

            expect(sphere).to.have.property("center").that.equalByComponents(1, 0, -1);
        });

        it("should set passed radius value", function () {

            var sphere = new M.Sphere(makeVector3(), 5);

            expect(sphere).to.have.property("radius").that.equal(5);
        });
    });

    describe("#clone", function () {

        it("should clone a sphere", function () {

            var sphere = makeSphere(makeVector3(1, 0, -1), 5),
                clone = sphere.clone();

            expect(clone.center, "center").to.equalByComponents(sphere.center);
            expect(clone.radius, "radius").to.equal(sphere.radius);
        });

        it("should return a new object", function () {

            var sphere = makeSphere(),
                clone = sphere.clone();

            expect(clone).to.not.equal(sphere);
        });
    });

    describe("#copy", function () {

        it("should copy a sphere", function () {

            var sphere1 = makeSphere(makeVector3(1, 0, -1), 5),
                sphere2 = makeSphere();

            sphere2.copy(sphere1);
            expect(sphere2.center, "center").to.equalByComponents(sphere1.center);
            expect(sphere2.radius, "radius").to.equal(sphere1.radius);
        });

        it("should not create a object", function () {

            var sphere1 = makeSphere(makeVector3(1, 0, -1), 5),
                sphere2 = makeSphere();

            expect(sphere2.copy(sphere1)).to.equal(sphere2);
        });
    });

    describe("#set", function () {

        it("should set segment from start and end points", function () {

            var sphere = makeSphere();

            sphere.set(makeVector3(1, 0, -1), 5);
            expect(sphere.center, "center").to.equalByComponents(1, 0, -1);
            expect(sphere.radius, "radius").to.equal(5);
        });

        it("should not create a new object", function () {

            var sphere = makeSphere();

            expect(sphere.set(makeVector3(1, 0, -1), 5)).to.equal(sphere);
        });
    });

    describe("#fromArray", function () {

        var sphere = makeSphere(),
            arr = [-1, 0, 1, 2, 3, 4],
            offset = 2;

        it("should set box from an array", function () {

            sphere.fromArray(arr);
            expect(sphere.center, "center").to.equalByComponents(arr);
            expect(sphere.radius, "radius").to.equal(arr[3]);
        });

        it("should set box from array with given offset", function () {

            sphere.fromArray(arr, offset);
            expect(sphere.center, "center").to.equalByComponents(arr.slice(offset));
            expect(sphere.radius, "radius").to.equal(arr[offset + 3]);
        });

        it("should return 4 if offset is not passed", function () {

            expect(sphere.fromArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(sphere.fromArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#toArray", function () {

        var sphere = makeSphere(makeVector3(1, 2, 3), 4),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set box to an array", function () {

            sphere.toArray(arr);
            expect(arr).to.have.length.at.least(4);
            expect(sphere.center, "center").to.equalByComponents(arr);
            expect(sphere.radius, "radius").to.equal(arr[3]);
        });

        it("should set box to an array with given offset", function () {

            sphere.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 4);
            expect(sphere.center, "center").to.equalByComponents(arr.slice(offset));
            expect(sphere.radius, "radius").to.equal(arr[offset + 3]);
        });

        it("should return 4 if offset is not passed", function () {

            expect(sphere.toArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(sphere.toArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#fromAABox", function () {

        it("should set a sphere from a box.", function () {

            var sphere = makeSphere(),
                aabb = makeAABox(makeVector3(-3, -4, 0), makeVector3(3, 4, 0));

            sphere.fromAABox(aabb);
            expect(sphere.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere.radius, "radius").to.equal(5);
        });

        it("should not create a new object", function () {

            var sphere = makeSphere();

            expect(sphere.fromAABox(makeAABox())).to.equal(sphere);
        });
    });

    describe("#fromPoints", function () {

        it("should set a sphere from an array of points [1 point]", function () {

            var sphere = makeSphere(),
                points = [ makeVector3(3, 4, 5) ];

            sphere.fromPoints(points);
            expect(sphere.center, "center").to.equalByComponents(3, 4, 5);
            expect(sphere.radius, "radius").to.equal(0);
        });

        it("should set a sphere from an array of points [2 point]", function () {

            var sphere = makeSphere(),
                points = [ makeVector3(-2, -2, -2), makeVector3(2, 2, 2) ];

            sphere.fromPoints(points);
            expect(sphere.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere.radius, "radius").to.equal(Math.sqrt(12));
        });

        it("should set a sphere from an array of points [empty array]", function () {

            var sphere = makeSphere(makeVector3(2, 2, 2), 2),
                points = [];

            sphere.fromPoints(points);
            expect(sphere.center, "center").to.equalByComponents(2, 2, 2);
            expect(sphere.radius, "radius").to.equal(2);
        });

        it("should not create a new object", function () {

            var sphere = makeSphere(),
                points = [ makeVector3(-3, -4, -5), makeVector3(3, 4, 5) ];

            expect(sphere.fromPoints(points)).to.equal(sphere);
        });
    });

    describe("#reset", function () {

        it("should reset sphere to initial state", function () {

            var sphere = makeSphere(makeVector3(1, 2, 3), 4);

            sphere.reset();
            expect(sphere.center, "center").to.equalByComponents(M.Vector3.ZERO);
            expect(sphere.radius, "radius").to.equal(0.0);
        });

        it("should not create a new object", function () {

            var sphere = makeSphere();

            expect(sphere.reset()).to.equal(sphere);
        });
    });

    describe("#empty", function () {

        it("should return false for non-zero volume sphere", function () {

            var sphere = makeSphere(makeVector3(1, 0, -1), 5);

            expect(sphere.empty()).to.be.false;
        });

        it("should return true for zero volume sphere [radius=0]", function () {

            var sphere = makeSphere();

            expect(sphere.empty()).to.be.true;
        });

        it("should return true for zero volume sphere [radius<0]", function () {

            var sphere = makeSphere(makeVector3(1, 0, -1), -5);

            expect(sphere.empty()).to.be.true;
        });
    });

    describe("#translate", function () {

        it("should translate sphere by given offset", function () {

            var sphere = makeSphere(makeVector3(-2, 2, 5), 4),
                offset = makeVector3(4, 5, -3);

            sphere.translate(offset);
            expect(sphere.center, "center").to.equalByComponents(2, 7, 2);
        });

        it("should not change radius of the sphere", function () {

            var sphere = makeSphere(makeVector3(-2, 2, 5), 4),
                offset = makeVector3(4, 5, -3);

            sphere.translate(offset);
            expect(sphere.radius, "radius").to.equal(4);
        });

        it("should not create a new object", function () {

            var sphere = makeSphere(),
                offset = makeVector3(4, 5, -3);

            expect(sphere.translate(offset)).to.equal(sphere);
        });
    });

    describe("#transform", function () {

        it("should transform sphere by given matrix [only rotation]", function () {

            var sphere = makeSphere(makeVector3(2, 2, 2), 3),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            sphere.transform(mx);
            expect(sphere.center, "center").to.be.closeByComponents(-2, 2, 2);
            expect(sphere.radius, "radius").to.equal(3);
        });

        it("should transform sphere by given matrix [only translation]", function () {

            var sphere = makeSphere(makeVector3(-2, 2, 5), 4),
                mx = makeMatrix4().translation(4, 5, -3);

            sphere.transform(mx);
            expect(sphere.center, "center").to.be.closeByComponents(2, 7, 2);
            expect(sphere.radius, "radius").to.equal(4);
        });

        it("should transform sphere by given matrix", function () {

            var sphere = makeSphere(makeVector3(0, 0, 0), 5),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            sphere.transform(mx);
            expect(sphere.center, "center").to.be.closeByComponents(0, 0, 0);
            expect(sphere.radius, "radius").to.equal(5);
        });

        it("should not create a new object", function () {

            var sphere = makeSphere();

            expect(sphere.transform(M.Matrix4.IDENTITY)).to.equal(sphere);
        });
    });

    describe("#merge", function () {

        it("should merge a sphere with a point", function () {

            var sphere = makeSphere(),
                p = makeVector3(2, 2, 2);

            sphere.merge(p);
            expect(sphere.center, "center").to.equalByComponents(1, 1, 1);
            expect(sphere.radius, "radius").to.be.closeTo(Math.sqrt(3), 0.0001);
        });

        it("should merge a sphere with a point (point inside sphere)", function () {

            var sphere = makeSphere(makeVector3(0, 0, 0), 5),
                p = makeVector3(2, 2, 2);

            sphere.merge(p);
            expect(sphere.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere.radius, "radius").to.equal(5);
        });

        it("should merge a sphere with a segment", function () {

            var sphere = makeSphere(),
                seg = makeSegment(makeVector3(-2, -2, -2), makeVector3(2, 2, 2));

            sphere.merge(seg);
            expect(sphere.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere.radius, "radius").to.equal(Math.sqrt(12));
        });

        it("should merge a sphere with a triangle", function () {

            var sphere = makeSphere(),
                tri = makeTriangle(makeVector3(-1, 0, -1), makeVector3(1, 0, 1),
                    makeVector3(0, 0, 1));

            sphere.merge(tri);
            expect(sphere.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere.radius, "radius").to.equal(Math.sqrt(8) * 0.5);
        });

        it("should merge a sphere with a box", function () {

            var sphere = makeSphere(),
                box = makeAABox(makeVector3(-3, -7, -3), makeVector3(7, 3, 7));

            sphere.merge(box);
            expect(sphere.center, "center").to.equalByComponents(2, -2, 2);
            expect(sphere.radius, "radius").to.equal(Math.sqrt(75));
        });

        it("should merge a sphere with another sphere", function () {

            var sphere1 = makeSphere(),
                sphere2 = makeSphere();

            sphere1.set(makeVector3(2, 0, 0), 2).merge(sphere2.set(makeVector3(-2, 0, 0), 2));
            expect(sphere1.center, "along x-axis: center").to.equalByComponents(0, 0, 0);
            expect(sphere1.radius, "along x-axis: radius").to.equal(4);

            sphere1.set(makeVector3(0, 2, 0), 2).merge(sphere2.set(makeVector3(0, -2, 0), 2));
            expect(sphere1.center, "along y-axis: center").to.equalByComponents(0, 0, 0);
            expect(sphere1.radius, "along y-axis: radius").to.equal(4);

            sphere1.set(makeVector3(0, 0, 2), 2).merge(sphere2.set(makeVector3(0, 0, -2), 2));
            expect(sphere1.center, "along z-axis: center").to.equalByComponents(0, 0, 0);
            expect(sphere1.radius, "along z-axis: radius").to.equal(4);
        });

        it("should merge a sphere with another sphere (b inside a)", function () {

            var sphere1 = makeSphere(makeVector3(0, 0, 0), 10),
                sphere2 = makeSphere(makeVector3(-2, -2, -2), 2);

            sphere1.merge(sphere2);
            expect(sphere1.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere1.radius, "radius").to.equal(10);
        });

        it("should merge a sphere with another sphere (a inside b)", function () {

            var sphere1 = makeSphere(makeVector3(-2, -2, -2), 2),
                sphere2 = makeSphere(makeVector3(0, 0, 0), 10);

            sphere1.merge(sphere2);
            expect(sphere1.center, "center").to.equalByComponents(0, 0, 0);
            expect(sphere1.radius, "radius").to.equal(10);
        });

        it("should throw if the object argument has unsupported type", function () {

            var sphere = makeSphere(makeVector3(2, 2, 2), 5),
                fn = function () { sphere.merge(5); };

            expect(fn).to.throw();
        });
    });

    describe("#equal", function () {

        it("should return true if spheres are equal", function () {

            var sphere1 = makeSphere(makeVector3(1, 2, 3), 5),
                sphere2 = makeSphere(makeVector3(1, 2, 3), 5);

            expect(sphere1.equal(sphere2)).to.be.true;
        });

        it("should return false if spheres are not equal", function () {

            var sphere1 = makeSphere(makeVector3(1, 2, 3), 5),
                sphere2 = makeSphere(makeVector3(1, 2, 3), 5.1);

            expect(sphere1.equal(sphere2)).to.be.false;
        });
    });
});
