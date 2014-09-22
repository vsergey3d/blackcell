
describe("B.Math.Frustum", function () {

    var M = B.Math,
        V3 = M.Vector3,
        P = M.Plane,

        makeVector3 = M.makeVector3,
        makeSegment = M.makeSegment,
        makeTriangle = M.makeTriangle,
        makeSphere = M.makeSphere,
        makeAABox = M.makeAABox,
        makePlane = M.makePlane,
        makeFrustum = M.makeFrustum;

    it("should exist", function () {
        expect(M.Frustum).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized the frustum with default values if no params passed", function () {

            var frustum = new M.Frustum();

            expect(frustum).to.have.property("left").that.is.instanceof(M.Plane).and.
                equalByComponents(P.X);
            expect(frustum).to.have.property("right").that.is.instanceof(M.Plane).and.
                equalByComponents(P.N_X);
            expect(frustum).to.have.property("top").that.is.instanceof(M.Plane).and.
                equalByComponents(P.N_Y);
            expect(frustum).to.have.property("bottom").that.is.instanceof(M.Plane).and.
                equalByComponents(P.Y);
            expect(frustum).to.have.property("near").that.is.instanceof(M.Plane).and.
                equalByComponents(P.Z);
            expect(frustum).to.have.property("far").that.is.instanceof(M.Plane).and.
                equalByComponents(P.N_Z);
        });

        it("should set passed left value", function () {

            var frustum = new M.Frustum(makePlane(V3.X, 5));

            expect(frustum.left).to.have.property("normal").that.equalByComponents(V3.X);
            expect(frustum.left).to.have.property("distance").that.equal(5);
        });

        it("should set passed right value", function () {

            var frustum = new M.Frustum(makePlane(), makePlane(V3.N_X, 5));

            expect(frustum.right).to.have.property("normal").that.equalByComponents(V3.N_X);
            expect(frustum.right).to.have.property("distance").that.equal(5);
        });

        it("should set passed top value", function () {

            var frustum = new M.Frustum(makePlane(), makePlane(), makePlane(V3.N_Y, 5));

            expect(frustum.top).to.have.property("normal").that.equalByComponents(V3.N_Y);
            expect(frustum.top).to.have.property("distance").that.equal(5);
        });

        it("should set passed bottom value", function () {

            var frustum = new M.Frustum(makePlane(), makePlane(), makePlane(),
                makePlane(V3.Y, 5));

            expect(frustum.bottom).to.have.property("normal").that.equalByComponents(V3.Y);
            expect(frustum.bottom).to.have.property("distance").that.equal(5);
        });

        it("should set passed near value", function () {

            var frustum = new M.Frustum(makePlane(), makePlane(), makePlane(), makePlane(),
                makePlane(V3.Z, -0.01));

            expect(frustum.near).to.have.property("normal").that.equalByComponents(V3.Z);
            expect(frustum.near).to.have.property("distance").that.equal(-0.01);
        });

        it("should set passed far value", function () {

            var frustum = new M.Frustum(makePlane(), makePlane(), makePlane(), makePlane(),
                makePlane(), makePlane(V3.N_Z, 100));

            expect(frustum.far).to.have.property("normal").that.equalByComponents(V3.N_Z);
            expect(frustum.far).to.have.property("distance").that.equal(100);
        });
    });

    describe("#clone", function () {

        it("should clone a frustum", function () {

            var frustum = makeFrustum(
                    makePlane(V3.X, 5),
                    makePlane(V3.N_X, 5),
                    makePlane(V3.N_Y, 5),
                    makePlane(V3.Y, 5),
                    makePlane(V3.Z, -0.01),
                    makePlane(V3.N_Z, 100.0)),
                clone = frustum.clone();

            expect(clone.left, "left").to.equalByComponents(frustum.left);
            expect(clone.right, "right").to.equalByComponents(frustum.right);
            expect(clone.top, "top").to.equalByComponents(frustum.top);
            expect(clone.bottom, "bottom").to.equalByComponents(frustum.bottom);
            expect(clone.near, "near").to.equalByComponents(frustum.near);
            expect(clone.far, "far").to.equalByComponents(frustum.far);
        });

        it("should return a new object", function () {

            var frustum = makeFrustum(),
                clone = frustum.clone();

            expect(clone).to.not.equal(frustum);
        });
    });

    describe("#copy", function () {

        it("should copy a frustum", function () {

            var frustum1 = makeFrustum(
                    makePlane(V3.X, 5),
                    makePlane(V3.N_X, 5),
                    makePlane(V3.N_Y, 5),
                    makePlane(V3.Y, 5),
                    makePlane(V3.Z, -0.01),
                    makePlane(V3.N_Z, 100.0)),
                frustum2 = makeFrustum();

            frustum2.copy(frustum1);
            expect(frustum2.left, "left").to.equalByComponents(frustum1.left);
            expect(frustum2.right, "right").to.equalByComponents(frustum1.right);
            expect(frustum2.top, "top").to.equalByComponents(frustum1.top);
            expect(frustum2.bottom, "bottom").to.equalByComponents(frustum1.bottom);
            expect(frustum2.near, "near").to.equalByComponents(frustum1.near);
            expect(frustum2.far, "far").to.equalByComponents(frustum1.far);
        });

        it("should return a new object", function () {

            var frustum1 = makeFrustum(),
                frustum2 = frustum1.clone();

            expect(frustum2.copy(frustum1)).to.equal(frustum2);
        });
    });

    describe("#set", function () {

        it("should set frustum from planes", function () {

            var frustum = makeFrustum(),
                left = makePlane(V3.X, 5),
                right = makePlane(V3.N_X, 5),
                top = makePlane(V3.N_Y, 5),
                bottom = makePlane(V3.Y, 5),
                near = makePlane(V3.Z, -0.01),
                far = makePlane(V3.N_Z, 100.0);

            frustum.set(left, right, top, bottom, near, far);
            expect(frustum.left, "left").to.equalByComponents(left);
            expect(frustum.right, "right").to.equalByComponents(right);
            expect(frustum.top, "top").to.equalByComponents(top);
            expect(frustum.bottom, "bottom").to.equalByComponents(bottom);
            expect(frustum.near, "near").to.equalByComponents(near);
            expect(frustum.far, "far").to.equalByComponents(far);
        });

        it("should not create a new object", function () {

            var frustum = makeFrustum();
            expect(frustum.set(makePlane(), makePlane(), makePlane(), makePlane(), makePlane(),
                makePlane())).to.equal(frustum);
        });
    });

    describe("#fromArray", function () {

        var frustum = makeFrustum(),
            arr = [ -1, 0,
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                13, 14, 15, 16,
                17, 18, 19, 20,
                21, 22, 23, 24
            ],
            offset = 2,

            checkPlane = function (plane, arr, desc) {
                expect(plane.normal, desc + ".normal").to.equalByComponents(arr);
                expect(plane.distance, desc + ".distance").to.equal(arr[3]);
            };

        it("should set frustum from an array", function () {

            frustum.fromArray(arr);
            checkPlane(frustum.left, arr.slice(0, 4), "left");
            checkPlane(frustum.right, arr.slice(4, 8), "right");
            checkPlane(frustum.top, arr.slice(8, 12), "top");
            checkPlane(frustum.bottom, arr.slice(12, 16), "bottom");
            checkPlane(frustum.near, arr.slice(16, 20), "near");
            checkPlane(frustum.far, arr.slice(20, 24), "far");
        });

        it("should set frustum from an array with a given offset", function () {

            frustum.fromArray(arr,  offset);
            checkPlane(frustum.left, arr.slice(0 + offset, 4 + offset), "left");
            checkPlane(frustum.right, arr.slice(4 + offset, 8 + offset), "right");
            checkPlane(frustum.top, arr.slice(8 + offset, 12 + offset), "top");
            checkPlane(frustum.bottom, arr.slice(12 + offset, 16 + offset), "bottom");
            checkPlane(frustum.near, arr.slice(16 + offset, 20 + offset), "near");
            checkPlane(frustum.far, arr.slice(20 + offset, 24 + offset), "far");
        });

        it("should return 24 if offset is not passed", function () {

            expect(frustum.fromArray(arr)).to.equal(24);
        });

        it("should return new offset", function () {

            expect(frustum.fromArray(arr, offset)).to.equal(offset + 24);
        });
    });

    describe("#toArray", function () {

        var frustum = makeFrustum(
                makePlane(V3.X, 5),
                makePlane(V3.N_X, 5),
                makePlane(V3.N_Y, 5),
                makePlane(V3.Y, 5),
                makePlane(V3.Z, -0.01),
                makePlane(V3.N_Z, 100.0)),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3,

            checkPlane = function (plane, arr, desc) {
                expect(plane.normal, desc + ".normal").to.equalByComponents(arr);
                expect(plane.distance, desc + ".distance").to.equal(arr[3]);
            };

        it("should set frustum to an array", function () {

            frustum.toArray(arr);
            expect(arr).to.have.length.at.least(24);
            checkPlane(frustum.left, arr.slice(0, 4), "left");
            checkPlane(frustum.right, arr.slice(4, 8), "right");
            checkPlane(frustum.top, arr.slice(8, 12), "top");
            checkPlane(frustum.bottom, arr.slice(12, 16), "bottom");
            checkPlane(frustum.near, arr.slice(16, 20), "near");
            checkPlane(frustum.far, arr.slice(20, 24), "far");
        });

        it("should set frustum to an array with a given offset", function () {

            frustum.toArray(arr, offset);
            expect(arr).to.have.length.at.least(offset + 24);
            checkPlane(frustum.left, arr.slice(0 + offset, 4 + offset), "left");
            checkPlane(frustum.right, arr.slice(4 + offset, 8 + offset), "right");
            checkPlane(frustum.top, arr.slice(8 + offset, 12 + offset), "top");
            checkPlane(frustum.bottom, arr.slice(12 + offset, 16 + offset), "bottom");
            checkPlane(frustum.near, arr.slice(16 + offset, 20 + offset), "near");
            checkPlane(frustum.far, arr.slice(20 + offset, 24 + offset), "far");
        });

        it("should return 24 if offset is not passed", function () {

            expect(frustum.toArray(arr)).to.equal(24);
        });

        it("should return new offset", function () {

            expect(frustum.toArray(arr, offset)).to.equal(offset + 24);
        });
    });

    describe("#fromMatrix", function () {

        var checkPlane = function (plane, n, d, desc) {
            expect(plane.normal, desc + ".normal").to.be.closeByComponents(n);
            expect(plane.distance, desc + ".distance").to.be.closeTo(d, M.EPSILON);
        };

        it("should set frustum from a matrix", function () {

            var frustum = makeFrustum(),
                mx = M.makeMatrix4().orthographic(300, 200, 10, 100);

            frustum.fromMatrix(mx);

            checkPlane(frustum.left, [1, 0, 0], -150, "left");
            checkPlane(frustum.right, [-1, 0, 0], -150, "right");
            checkPlane(frustum.top, [0, -1, 0], -100, "top");
            checkPlane(frustum.bottom, [0, 1, 0], -100, "bottom");
            checkPlane(frustum.near, [0, 0, -1], 10, "near");
            checkPlane(frustum.far, [0, 0, 1], -100, "far");
        });

        it("should not create a new object", function () {

            var frustum = makeFrustum(),
                mx = M.makeMatrix4().orthographic(300, 200, 10, 100);

            expect(frustum.fromMatrix(mx)).to.equal(frustum);
        });
    });

    describe("#cornerPoints", function () {

        var frustum = makeFrustum(
                makePlane(V3.X, -5),
                makePlane(V3.N_X, -2),
                makePlane(V3.N_Y, -3),
                makePlane(V3.Y, -4),
                makePlane(V3.Z, 0.01),
                makePlane(V3.N_Z, -100.0)),
            points = [],
            expected = [
                makeVector3(-5, -4, 0.01),
                makeVector3(-5, -4, 100),
                makeVector3(-5, 3, 0.01),
                makeVector3(-5, 3, 100),
                makeVector3(2, -4, 0.01),
                makeVector3(2, -4, 100),
                makeVector3(2, 3, 0.01),
                makeVector3(2, 3, 100)
            ],
            fn = function(p) {
                return expected.some(function(e) { return e.equal(p); });
            };

        beforeEach(function(done) {
            points.length = 0;
            done();
        });

        it("should return corner points of this frustum", function () {

            points = frustum.cornerPoints();

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

            points = [ makeVector3(), makeVector3(), makeVector3(), makeVector3(),
                makeVector3(), makeVector3(), makeVector3(), makeVector3() ];

            frustum.cornerPoints(points);

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

        it("should throw if frustum has invalid set of planes", function () {
            var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -2),
                    makePlane(V3.N_Y, -3),
                    makePlane(V3.X, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0)),
                fn = function () { points = frustum.cornerPoints(); };

            expect(fn).to.throw();

        });
    });

    describe("#contain", function () {

        describe("[point test]", function () {
            it("should return true if this frustum contains a point", function () {

                var frustum = makeFrustum(
                        makePlane(V3.X, -5),
                        makePlane(V3.N_X, -5),
                        makePlane(V3.N_Y, -5),
                        makePlane(V3.Y, -5),
                        makePlane(V3.Z, 0.01),
                        makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(makeVector3(1, 1, 1))).to.be.true;
            });

            it("should return false if frustum does not contain a point", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(makeVector3(-6, 1, -1)), "[-x]").to.be.false;
                expect(frustum.contain(makeVector3(6, 1, -1)), "[x]").to.be.false;
                expect(frustum.contain(makeVector3(1, -6, -1)), "[-y]").to.be.false;
                expect(frustum.contain(makeVector3(1, 6, -1)), "[y]").to.be.false;
                expect(frustum.contain(makeVector3(1, 1, 0)), "[-z]").to.be.false;
                expect(frustum.contain(makeVector3(1, 1, 101)), "[z]").to.be.false;
                expect(frustum.contain(makeVector3(-6, 6, -1)), "[-xy]").to.be.false;
                expect(frustum.contain(makeVector3(6, 6, -1)), "[xy]").to.be.false;
                expect(frustum.contain(makeVector3(-6, -6, -1)), "[-x-y]").to.be.false;
                expect(frustum.contain(makeVector3(6, -6, -1)), "[x-y]").to.be.false;
                expect(frustum.contain(makeVector3(-6, 1, 0)), "[-xz]").to.be.false;
                expect(frustum.contain(makeVector3(6, 1, 0)), "[xz]").to.be.false;
                expect(frustum.contain(makeVector3(6, 1, -101)), "[x-z]").to.be.false;
                expect(frustum.contain(makeVector3(-6, 1, -101)), "[-x-z]").to.be.false;
                expect(frustum.contain(makeVector3(1, -6, 101)), "[-yz]").to.be.false;
                expect(frustum.contain(makeVector3(1, -6, 0)), "[-yz]").to.be.false;
                expect(frustum.contain(makeVector3(1, 6, -101)), "[y-z]").to.be.false;
                expect(frustum.contain(makeVector3(1, 6, 0)), "[yz]").to.be.false;
                expect(frustum.contain(makeVector3(-6, 6, 0)), "[-xyz]").to.be.false;
                expect(frustum.contain(makeVector3(6, -6, 0)), "[x-yz]").to.be.false;
                expect(frustum.contain(makeVector3(6, 6, -101)), "[xy-z]").to.be.false;
                expect(frustum.contain(makeVector3(-6, -6, 0)), "[-x-yz]").to.be.false;
                expect(frustum.contain(makeVector3(-6, 6, -101)), "[-xy-z]").to.be.false;
                expect(frustum.contain(makeVector3(6, 6, -101)), "[x-y-z]").to.be.false;
                expect(frustum.contain(makeVector3(6, 6, 0)), "[xyz]").to.be.false;
                expect(frustum.contain(makeVector3(-6, -6, -101)), "[-x-y-z]").to.be.false;
            });
        });

        describe("[segment test]", function () {

            it("should return true if frustum contains a segment", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(
                    makeSegment(makeVector3(0, 0, 0), makeVector3(0, 10, 10)))
                ).to.be.true;
            });

            it("should return false if frustum does not contain a segment", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(
                    makeSegment(makeVector3(-5, 0, 0), makeVector3(5, 0, 0)))
                ).to.be.false;
            });
        });

        describe("[triangle test]", function () {

            it("should return true if frustum contains a triangle", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(makeTriangle(
                    makeVector3(0, 0, 0),makeVector3(0, 10, 10),makeVector3(0, 0, 100)))
                ).to.be.true;
            });

            it("should return false if frustum does not contain a triangle", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(
                    makeTriangle(makeVector3(-5, 0, 0), makeVector3(0, 5, 0), makeVector3(5, 0, 0)))
                ).to.be.false;
            });
        });

        describe("[aabox test]", function () {
            it("should return true if frustum contains an aabox", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(
                    makeAABox(makeVector3(-5, -5, 0), makeVector3(5, 5, 101)))
                ).to.be.true;
            });

            it("should return false if frustum does not contain an aabox", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(
                    makeAABox(makeVector3(-10, -10, -10), makeVector3(-5, -5, 0)))
                ).to.be.false;
            });
        });

        describe("[sphere test]", function () {

            it("should return true if frustum contains a sphere", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(makeSphere(makeVector3(0, 0, 0), 50))).to.be.true;
            });

            it("should return false if frustum does not contain a sphere", function () {

                var frustum = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0));

                expect(frustum.contain(makeSphere(makeVector3(0, 0, -5), 5))).to.be.false;
            });
        });

        it("should throw if the object argument has unsupported type", function () {

            var frustum = makeFrustum(),
                fn = function () { frustum.contain(5); };

            expect(fn).to.throw();
        });
    });

    describe("#equal", function () {

        it("should return true if frustums are equal", function () {

            var frustum1 = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0)),
                frustum2 = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100));

            expect(frustum1.equal(frustum2)).to.be.true;
        });

        it("should return false if frustums are not equal", function () {
            var frustum1 = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -100.0)),
                frustum2 = makeFrustum(
                    makePlane(V3.X, -5),
                    makePlane(V3.N_X, -5),
                    makePlane(V3.N_Y, -5),
                    makePlane(V3.Y, -5),
                    makePlane(V3.Z, 0.01),
                    makePlane(V3.N_Z, -10));

            expect(frustum1.equal(frustum2)).to.be.false;
        });
    });
});
