
describe("B.Math.Triangle", function() {

    var makeVector3 = B.Math.makeVector3,
        makeMatrix4 = B.Math.makeMatrix4,
        makeTriangle = B.Math.makeTriangle,
        makePlane = B.Math.makePlane;

    it("should exist", function () {
        expect(B.Math.Triangle).to.exist;
    });

    describe("#constructor", function(){

        it("should initialized the triangle with default values if no params passed", function () {

            var tr = new B.Math.Triangle();

            expect(tr).to.have.property("a").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.ZERO);
            expect(tr).to.have.property("b").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.ZERO);
            expect(tr).to.have.property("c").that.is.instanceof(B.Math.Vector3).and.
                equalByComponents(B.Math.Vector3.ZERO);
        });

        it("should set passed a point", function () {

            var tr = new B.Math.Triangle(makeVector3(1, 0, 0));
            expect(tr).to.have.property("a").that.equalByComponents(1, 0, 0);
        });

        it("should set passed b point", function () {

            var tr = new B.Math.Triangle(makeVector3(), makeVector3(0, 1, 0));
            expect(tr).to.have.property("b").that.equalByComponents(0, 1, 0);
        });

        it("should set passed c point", function () {

            var tr = new B.Math.Triangle(makeVector3(), makeVector3(), makeVector3(0, 0, 1));
            expect(tr).to.have.property("c").that.equalByComponents(0, 0, 1);
        });
    });

    describe("#clone", function(){

        it("should clone a triangle", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                clone = tr.clone();

            expect(clone.a, "a").to.equalByComponents(tr.a);
            expect(clone.b, "b").to.equalByComponents(tr.b);
            expect(clone.c, "c").to.equalByComponents(tr.c);
        });

        it("should return a new object", function () {

            var tr = makeTriangle(),
                clone = tr.clone();

            expect(clone).to.not.equal(tr);
        });
    });

    describe("#copy", function(){

        it("should copy a triangle", function () {

            var tr1 = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0),
                    makeVector3(0, 0, 1)),
                tr2 = makeTriangle();

            tr2.copy(tr1);
            expect(tr2.a, "a").to.equalByComponents(tr1.a);
            expect(tr2.b, "b").to.equalByComponents(tr1.b);
            expect(tr2.c, "c").to.equalByComponents(tr1.c);
        });

        it("should not create a object", function () {

            var tr1 = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0),
                    makeVector3(0, 0, 1)),
                tr2 = makeTriangle();

            expect(tr2.copy(tr1)).to.equal(tr2);
        });
    });

    describe("#set", function(){

        it("should set triangle from three points", function () {

            var tr = makeTriangle();

            tr.set(makeVector3(1, 2, 3), makeVector3(4, 5, 6), makeVector3(7, 8, 9));
            expect(tr.a, "a").to.equalByComponents(1, 2, 3);
            expect(tr.b, "b").to.equalByComponents(4, 5, 6);
            expect(tr.c, "c").to.equalByComponents(7, 8, 9);
        });

        it("should not create a new object", function () {

            var tr = makeTriangle();
            expect(tr.set(makeVector3(1, 2, 3), makeVector3(4, 5, 6), makeVector3(7, 8, 9))).
                to.equal(tr);
        });
    });

    describe("#fromArray", function() {

        var tr = makeTriangle(),
            arr = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            offset = 2;

        it("should set triangle from an array", function () {

            tr.fromArray(arr);
            expect(tr.a, "a").to.equalByComponents(arr);
            expect(tr.b, "b").to.equalByComponents(arr.slice(3));
            expect(tr.c, "c").to.equalByComponents(arr.slice(6));
        });

        it("should set triangle from array with given offset", function () {

            tr.fromArray(arr, offset);
            expect(tr.a, "a").to.equalByComponents(arr.slice(offset));
            expect(tr.b, "b").to.equalByComponents(arr.slice(offset + 3));
            expect(tr.c, "c").to.equalByComponents(arr.slice(offset + 6));
        });

        it("should return 9 if offset is not passed", function () {

            expect(tr.fromArray(arr)).to.equal(9);
        });

        it("should return new offset", function () {

            expect(tr.fromArray(arr, offset)).to.equal(offset + 9);
        });
    });

    describe("#toArray", function(){

        var tr = makeTriangle(makeVector3(1, 2, 3), makeVector3(4, 5, 6),
                makeVector3(7, 8, 9)),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set triangle to an array", function () {

            tr.toArray(arr);
            expect(arr).to.have.length.at.least(9);
            expect(tr.a, "a").to.equalByComponents(arr);
            expect(tr.b, "b").to.equalByComponents(arr.slice(3));
            expect(tr.c, "c").to.equalByComponents(arr.slice(6));
        });

        it("should set segment to an array with given offset", function () {

            tr.toArray(arr, offset);
            expect(arr).to.have.length.at.least(9);
            expect(tr.a, "a").to.equalByComponents(arr.slice(offset));
            expect(tr.b, "b").to.equalByComponents(arr.slice(offset + 3));
            expect(tr.c, "c").to.equalByComponents(arr.slice(offset + 6));
        });

        it("should return 9 if offset is not passed", function () {

            expect(tr.toArray(arr)).to.equal(9);
        });

        it("should return new offset", function () {

            expect(tr.toArray(arr, offset)).to.equal(offset + 9);
        });
    });

    describe("#translate", function() {

        it("should translate triangle by given offset", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                offset = makeVector3(4, 5, -3);

            tr.translate(offset);
            expect(tr.a, "a").to.equalByComponents(5, 5, -3);
            expect(tr.b, "b").to.equalByComponents(4, 6, -3);
            expect(tr.c, "c").to.equalByComponents(4, 5, -2);
        });

        it("should not create a new object", function () {

            var tr = makeTriangle(),
                offset = makeVector3(4, 5, -3);

            expect(tr.translate(offset)).to.equal(tr);
        });
    });

    describe("#transform", function() {

        it("should transform triangle by given matrix [only rotation]", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            tr.transform(mx);
            expect(tr.a, "a").to.be.closeByComponents(0, 1, 0);
            expect(tr.b, "b").to.be.closeByComponents(-1, 0, 0);
            expect(tr.c, "c").to.be.closeByComponents(0, 0, 1);
        });

        it("should transform triangle by given matrix [only translation]", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                mx = makeMatrix4().translation(4, 5, -3);

            tr.transform(mx);
            expect(tr.a, "a").to.equalByComponents(5, 5, -3);
            expect(tr.b, "b").to.equalByComponents(4, 6, -3);
            expect(tr.c, "c").to.equalByComponents(4, 5, -2);
        });

        it("should transform triangle by given matrix", function () {

            var tr = makeTriangle(makeVector3(2, 2, 0), makeVector3(4, 4, 0), makeVector3(3, 1, 0)),
                mx = makeMatrix4().rotationZ(Math.PI * 0.5);

            tr.transform(mx);
            expect(tr.a, "a").to.be.closeByComponents(-2, 2, 0);
            expect(tr.b, "b").to.be.closeByComponents(-4, 4, 0);
            expect(tr.c, "c").to.be.closeByComponents(-1, 3, 0);
        });

        it("should not create a new object", function () {

            var tr = makeTriangle();
            expect(tr.transform(B.Math.Matrix4.IDENTITY)).to.equal(tr);
        });
    });

    describe("#normal", function(){

        it("should return a normal of the triangle", function () {

            var tr = makeTriangle(makeVector3(-1, 0, 0), makeVector3(0, 1, 0),
                    makeVector3(1, 0, 0)),
                n = tr.normal();

            expect(n).to.be.instanceof(B.Math.Vector3).and.equalByComponents(0, 0, -1);
        });

        it("should set a normal of the triangle to a given vector", function () {

            var tr = makeTriangle(makeVector3(-1, 0, 0), makeVector3(0, 1, 0),
                    makeVector3(1, 0, 0)),
                n = makeVector3();

            tr.normal(n);
            expect(n).to.be.instanceof(B.Math.Vector3).and.equalByComponents(0, 0, -1);
        });

        it("should return a normal of the triangle [xy]", function () {

            var tr = makeTriangle(makeVector3(0, 1, 0), makeVector3(-1, 0, 0),
                    makeVector3(1, 0, 0)),
                n = tr.normal();

            expect(n).to.equalByComponents(0, 0, 1);
        });

        it("should return a normal of the triangle [yz]", function () {

            var tr = makeTriangle(makeVector3(0, 0, -1), makeVector3(0, 1, 0),
                    makeVector3(0, 0, 1)),
                n = tr.normal();

            expect(n).to.equalByComponents(1, 0, 0);
        });

        it("should return a normal of the triangle [xz]", function () {

            var tr = makeTriangle(makeVector3(-1, 0, 0), makeVector3(0, 0, 1),
                    makeVector3(1, 0, 0)),
                n = tr.normal();

            expect(n).to.equalByComponents(0, 1, 0);
        });

        it("should return a normal of the triangle [-xy]", function () {

            var tr = makeTriangle(makeVector3(0, 1, 0), makeVector3(1, 0, 0),
                    makeVector3(-1, 0, 0)),
                n = tr.normal();

            expect(n).to.equalByComponents(0, 0, -1);
        });

        it("should return a normal of the triangle [-yz]", function () {

            var tr = makeTriangle(makeVector3(0, 0, 1), makeVector3(0, 1, 0),
                    makeVector3(0, 0, -1)),
                n = tr.normal();

            expect(n).to.equalByComponents(-1, 0, 0);
        });

        it("should return a normal of the triangle [-xz]", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 0, 1),
                    makeVector3(-1, 0, 0)),
                n = tr.normal();

            expect(n).to.equalByComponents(0, -1, 0);
        });
    });

    describe("#plane", function(){

        it("should return a plane of the triangle", function () {

            var tr = makeTriangle(makeVector3(0, 5, 3), makeVector3(4, 5, 0),
                    makeVector3(0, 5, -3)),
                p = tr.plane();

            expect(p).to.be.instanceof(B.Math.Plane);
            expect(p).to.have.property("normal").that.equalByComponents(0, 1, 0);
            expect(p).to.have.property("distance").that.equal(5);
        });

        it("should set a plane of the triangle to a passed plane", function () {

            var tr = makeTriangle(makeVector3(0, 5, 3), makeVector3(4, 5, 0),
                    makeVector3(0, 5, -3)),
                p = makePlane();

            tr.plane(p);
            expect(p).to.be.instanceof(B.Math.Plane);
            expect(p).to.have.property("normal").that.equalByComponents(0, 1, 0);
            expect(p).to.have.property("distance").that.equal(5);
        });
    });

    describe("#area", function(){

        it("should return an area of the triangle", function () {

            var tr = makeTriangle(makeVector3(3, 0, 0), makeVector3(0, 4, 0), makeVector3(0, 0, 0)),
                p = tr.area();

            expect(p).to.be.a("number").and.equal(6);
        });
    });

    describe("#perimeter", function(){

        it("should return a perimeter of the triangle", function () {

            var tr = makeTriangle(makeVector3(3, 0, 0), makeVector3(0, 4, 0), makeVector3(0, 0, 0)),
                p = tr.perimeter();

            expect(p).to.be.a("number").and.equal(12);
        });
    });

    describe("#centroid", function(){

        it("should return a centroid of the triangle", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                m = tr.centroid();

            expect(m).to.be.instanceof(B.Math.Vector3).and.be.closeByComponents(1/3, 1/3, 1/3);
        });

        it("should set a centroid of the triangle to a given vector", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                m = makeVector3();

            tr.centroid(m);
            expect(m).to.be.closeByComponents(1/3, 1/3, 1/3);
        });

        it("should cut every median in the ratio 2:1 [a]", function () {

            var a = makeVector3(1, 0, 0), b = makeVector3(0, 1, 0), c = makeVector3(0, 0, 1),
                tr = makeTriangle(a, b, c),
                m = tr.centroid(),
                d1 = a.distanceTo(m),
                x = c.clone().sub(b).normalize().mul(b.distanceTo(c) * 0.5).add(b),
                d2 = m.distanceTo(x);

            expect(d1/d2).to.equal(2);
        });

        it("should cut every median in the ratio 2:1 [b]", function () {

            var a = makeVector3(1, 0, 0), b = makeVector3(0, 1, 0), c = makeVector3(0, 0, 1),
                tr = makeTriangle(a, b, c),
                m = tr.centroid(),
                d1 = b.distanceTo(m),
                x = a.clone().sub(c).normalize().mul(c.distanceTo(a) * 0.5).add(c),
                d2 = m.distanceTo(x);

            expect(d1/d2).to.equal(2);
        });

        it("should cut every median in the ratio 2:1 [c]", function () {

            var a = makeVector3(1, 0, 0), b = makeVector3(0, 1, 0), c = makeVector3(0, 0, 1),
                tr = makeTriangle(a, b, c),
                m = tr.centroid(),
                d1 = c.distanceTo(m),
                x = b.clone().sub(a).normalize().mul(a.distanceTo(b) * 0.5).add(a),
                d2 = m.distanceTo(x);

            expect(d1/d2).to.equal(2);
        });
    });

    describe("#barycentric", function() {

        it("should return barycentric coordinates of point for this triangle", function () {

            var a = makeVector3(0, 1, 3), b = makeVector3(5, 0, 0), c = makeVector3(0, 2, 0),
                tr = makeTriangle(a, b, c);

            expect(tr.barycentric(a), "a").to.be.closeByComponents(1, 0, 0);
            expect(tr.barycentric(b), "b").to.be.closeByComponents(0, 1, 0);
            expect(tr.barycentric(c), "c").to.be.closeByComponents(0, 0, 1);
        });

        it("should return barycentric coordinates of centroid for this triangle", function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                p = tr.barycentric(makeVector3(1/3, 1/3, 1/3)),
                m = tr.centroid();

            expect(m).to.be.closeByComponents(p);
        });

        it("should return barycentric coordinates of medians for this triangle", function () {

            var a = makeVector3(0, 1, 3), b = makeVector3(5, 0, 0), c = makeVector3(0, 2, 0),
                tr = makeTriangle(a, b, c),

                ma = c.clone().sub(b).normalize().mul(b.distanceTo(c)*0.5).add(b),
                mb = a.clone().sub(c).normalize().mul(c.distanceTo(a)*0.5).add(c),
                mc = b.clone().sub(a).normalize().mul(a.distanceTo(b)*0.5).add(a);

            expect(tr.barycentric(ma), "a").to.be.closeByComponents(0, 0.5, 0.5);
            expect(tr.barycentric(mb), "b").to.be.closeByComponents(0.5, 0, 0.5);
            expect(tr.barycentric(mc), "c").to.be.closeByComponents(0.5, 0.5, 0);
        });

        it("should return barycentric coordinates outside [0,1] range " +
            "if point lies outside the triangle", function () {

            var a = makeVector3(0, 1, 3), b = makeVector3(5, 0, 0), c = makeVector3(0, 2, 0),
                tr = makeTriangle(a, b, c),

                p = tr.barycentric(makeVector3(10, 10, 10));

            expect(p.x, "x").to.not.be.within(0, 1);
            expect(p.y, "y").to.not.be.within(0, 1);
            expect(p.z, "z").to.not.be.within(0, 1);
        });

        it("should return barycentric coordinates which sum is 1", function () {

            var a = makeVector3(0, 1, 3), b = makeVector3(5, 0, 0), c = makeVector3(0, 2, 0),
                tr = makeTriangle(a, b, c),

                pa = tr.barycentric(a),
                pb = tr.barycentric(b),
                pc = tr.barycentric(c);

            expect(pa.x + pb.x + pc.x, "x").to.equal(1);
            expect(pa.y + pb.y + pc.y, "y").to.equal(1);
            expect(pa.z + pb.z + pc.z, "z").to.equal(1);
        });

        it("should return null if triangle is colinear", function () {

            var tr = makeTriangle(makeVector3(1, 1, 1), makeVector3(1, 1, 1), makeVector3(1, 1, 1)),
                func = function () { tr.barycentric(makeVector3(1/3, 1/3, 1/3)); };

            expect(func).to.throw();
        });

        it("should set barycentric coordinates of point for this triangle to a given vector",
            function () {

            var tr = makeTriangle(makeVector3(1, 0, 0), makeVector3(0, 1, 0), makeVector3(0, 0, 1)),
                m = makeVector3();

            tr.barycentric(makeVector3(1/3, 1/3, 1/3), m);
            expect(m).to.be.closeByComponents(1/3, 1/3, 1/3);
        });
    });

    describe("#equal", function(){

        it("should return true if triangles are equal", function () {

            var tr1 = makeTriangle(makeVector3(1, 2, 3), makeVector3(4, 5, 6),
                    makeVector3(7, 8, 9)),
                tr2 = makeTriangle(makeVector3(1, 2, 3), makeVector3(4, 5, 6),
                    makeVector3(7, 8, 9));

            expect(tr1.equal(tr2)).to.be.true;
        });

        it("should return false if triangles are not equal", function () {

            var tr1 = makeTriangle(makeVector3(1, 2, 3), makeVector3(4, 5, 6),
                    makeVector3(7, 8, 9)),
                tr2 = makeTriangle(makeVector3(1, 2, 3), makeVector3(3, 4, 5),
                    makeVector3(6, 8, 9));

            expect(tr1.equal(tr2)).to.be.false;
        });
    });
});