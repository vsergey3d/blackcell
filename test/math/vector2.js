
describe("B.Math.Vector2", function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        makeVector2 = M.makeVector2;

    it("should exist", function () {
        expect(M.Vector2).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized components with 0 if no params passed", function () {

            var v = new M.Vector2();

            expect(v).to.have.property("x").that.is.a("number").and.equal(0);
            expect(v).to.have.property("y").that.is.a("number").and.equal(0);
        });

        it("should set passed x value", function () {

            var v = new M.Vector2(1, 0);

            expect(v).to.have.property("x").that.equal(1);
        });

        it("should set passed y value", function () {

            var v = new M.Vector2(0, 1);

            expect(v).to.have.property("y").that.equal(1);
        });
    });

    describe("#clone", function () {

        it("should clone a vector", function () {

            var v = makeVector2(-900, 1000),
                clone = v.clone();

            expect(clone).to.equalByComponents(v);
        });

        it("should return a new object", function () {

            var v = makeVector2(),
                clone = v.clone();

            expect(clone).to.not.equal(v);
        });
    });

    describe("#copy", function () {

        it("should copy a vector", function () {

            var v1 = makeVector2(-900, 1000),
                v2 = makeVector2();

            v2.copy(v1);
            expect(v2).to.deep.equal(v1);
        });

        it("should not create a new object", function () {

            var v1 = makeVector2(100, 100),
                v2 = makeVector2();

            expect(v2.copy(v1)).to.equal(v2);
        });
    });

    describe("#set", function () {

        it("should set vector components", function () {

            var v = makeVector2();

            v.set(899, -1.0);
            expect(v).to.equalByComponents(899, -1.0);
        });

        it("should not create a new object", function () {

            var v = makeVector2(100, 100);

            expect(v.set(-100, -100)).to.equal(v);
        });
    });

    describe("#get", function () {

        it("should return vector element by index", function () {

            var v = makeVector2(1, -1);

            expect(v.get(0), "first element").to.be.a("number").and.equal(1);
            expect(v.get(1), "second element").to.be.a("number").and.equal(-1);
        });

        it("should throw if the index is out of range", function () {

            var v = makeVector2(1, -1);

            expect(function () {
                v.get(2);
            }, "index > 1").to.throw();

            expect(function () {
                v.get(-1);
            }, "negative index").to.throw();
        });
    });

    describe("#fromArray", function () {

        var v = makeVector2(),
            arr = [555, -555, -1, 9.1],
            offset = 2;

        it("should set vector components from array", function () {

            v.fromArray(arr);
            expect(v).to.equalByComponents(arr[0], arr[1]);
        });

        it("should set vector components from array with given offset", function () {

            v.fromArray(arr, offset);
            expect(v).to.equalByComponents(arr[offset], arr[offset + 1]);
        });

        it("should return 2 if offset is not passed", function () {

            expect(v.fromArray(arr)).to.equal(2);
        });

        it("should return new offset", function () {

            expect(v.fromArray(arr, offset)).to.equal(offset + 2);
        });
    });

    describe("#toArray", function () {

        var v = makeVector2(1, -1),
            arr = [10, 52.9, 38, -18, 100],
            offset = 3;

        it("should set vector components to an array", function () {

            v.toArray(arr);
            expect(v).to.equalByComponents(arr);
        });

        it("should set vector components to an array with given offset", function () {

            v.toArray(arr, offset);
            expect(v).to.equalByComponents(arr.slice(offset));
        });

        it("should return 2 if offset is not passed", function () {

            expect(v.toArray(arr)).to.equal(2);
        });

        it("should return new offset", function () {

            expect(v.toArray(arr, offset)).to.equal(offset + 2);
        });
    });

    describe("#length", function () {

        it("should return the length of vector", function () {

            var v = makeVector2(4, -3);

            expect(v.length()).to.be.a("number").and.equal(5);
        });

        it("should return x component of X-vector", function () {

            var v = makeVector2(4, 0);

            expect(v.length()).to.equal(4);
        });

        it("should return y component with Y-vector", function () {

            var v = makeVector2(0, -3);

            expect(v.length()).to.equal(3);
        });

        it("should return zero length with zero vector", function () {

            var v = makeVector2();

            expect(v.length()).to.equal(0);
        });

        it("should return the same length with inverted vectors", function () {

            var v1 = makeVector2(4, -3),
                v2 = v1.negate();

            expect(v1.length()).to.equal(v2.length());
        });
    });

    describe("#lengthSq", function () {

        it("should return the squared length of vector", function () {

            var v = makeVector2(4, -3);

            expect(v.lengthSq()).to.be.a("number").and.equal(25);
        });
    });

    describe("#normalize", function () {

        it("should normalize the vector", function () {

            var v = makeVector2(4, -3);

            v.normalize();
            expect(v.length()).to.equal(1);
        });

        it("should not normalize if the vector is normalized already", function () {

            var v1 = makeVector2(4, -3).normalize(),
                v2 = v1.clone();

            v1.normalize();
            expect(v1).to.equalByComponents(v2);
        });

        it("should not create a new object", function () {

            var v = makeVector2(1, 1);

            expect(v.normalize()).to.equal(v);
        });
    });

    describe("#negate", function () {

        it("should invert the vector", function () {

            var v = makeVector2(4, -3);

            v.negate();
            expect(v).to.equalByComponents(-4, 3);
        });

        it("should not create a new object", function () {

            var v = makeVector2(4, -3);

            expect(v.negate()).to.equal(v);
        });
    });

    describe("#clamp", function () {

        it("should clamp components of the vector within specific range " +
            "if greater than passed max value", function () {

            var v = makeVector2(2, 2);

            v.clamp(0.0, 1.5);
            expect(v.x).to.equal(v.y).to.equal(1.5);
        });

        it("should clamp components of the vector within specific range " +
            "if less than passed min value", function () {

            var v = makeVector2(0.0, 0.0);

            v.clamp(0.5, 1.0);
            expect(v.x).to.equal(v.y).to.equal(0.5);
        });

        it("should clamp components of the vector greater than 1.0 if no range set", function () {

            var v = makeVector2(1.5, 1.5);

            v.clamp();
            expect(v.x).to.equal(v.y).to.equal(1.0);
        });

        it("should not clamp components of the vector within a range [0.0, 1.0] if no range set",
            function () {

                var v = makeVector2(0.5, 0.5);

                v.clamp();
                expect(v.x).to.equal(v.y).to.equal(0.5);
            });

        it("should clamp components of the vector less than 0.0 if no range set", function () {

            var v = makeVector2(-1.5, -1.5);

            v.clamp();
            expect(v.x).to.equal(v.y).to.equal(0.0);
        });

        it("should not create a new object", function () {

            var v = makeVector2(-1.5, -1.5);

            expect(v.clamp()).to.equal(v);
        });
    });

    describe("#add", function () {

        it("should add a scalar value to the vector", function () {

            var v = makeVector2(4, -3),
                val = 9;

            v.add(val);
            expect(v).to.equalByComponents(13, 6);
        });

        it("should add a vector to the vector", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6);

            v1.add(v2);
            expect(v1).to.equalByComponents(9, 3);
        });

        it("should not create a new object", function () {

            var v = makeVector2(4, -3),
                val = 9;

            expect(v.add(val)).to.equal(v);
        });
    });

    describe("#addVectors", function () {

        it("should add two given vectors and set the result to this vector", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(4, -3),
                v3 = makeVector2(5, 6);

            v1.addVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x + v3.x, v2.y + v3.y);
        });

        it("should not create a new object", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(4, -3),
                v3 = makeVector2(5, 6);

            expect(v1.addVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#sub", function () {

        it("should subtract a scalar value from the vector", function () {

            var v = makeVector2(4, -3),
                val = 9;

            v.sub(val);
            expect(v).to.equalByComponents(-5, -12);
        });

        it("should subtract a vector from the vector", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6);

            v1.sub(v2);
            expect(v1).to.equalByComponents(-1, -9);
        });

        it("should not create a new object", function () {

            var v = makeVector2(4, -3),
                val = 9;

            expect(v.sub(val)).to.equal(v);
        });
    });

    describe("#subVectors", function () {

        it("should subtract two given vectors and set the result to this vector", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(4, -3),
                v3 = makeVector2(5, 6);

            v1.subVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x - v3.x, v2.y - v3.y);
        });

        it("should not create a new object", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(4, -3),
                v3 = makeVector2(5, 6);

            expect(v1.subVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#mul", function () {

        it("should multiply the vector by a scalar value", function () {

            var v = makeVector2(4, -3),
                val = 9;

            v.mul(val);
            expect(v).to.equalByComponents(36, -27);
        });

        it("should multiply the vector by a given vector", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6);

            v1.mul(v2);
            expect(v1).to.equalByComponents(20, -18);
        });

        it("should not create a new object", function () {

            var v = makeVector2(4, -3),
                val = 9;

            expect(v.mul(val)).to.equal(v);
        });
    });

    describe("#mulVectors", function () {

        it("should multiply two given vectors and set the result to this vector", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(4, -3),
                v3 = makeVector2(5, 6);

            v1.mulVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x * v3.x, v2.y * v3.y);
        });

        it("should not create a new object", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(4, -3),
                v3 = makeVector2(5, 6);

            expect(v1.mulVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#div", function () {

        it("should divide the vector by a scalar value", function () {

            var v = makeVector2(36, -27),
                val = 9;

            v.div(val);
            expect(v).to.equalByComponents(4, -3);
        });

        it("should divide the vector by a given vector", function () {

            var v1 = makeVector2(20, -18),
                v2 = makeVector2(5, 6);

            v1.div(v2);
            expect(v1).to.equalByComponents(4, -3);
        });

        it("should not create a new object", function () {

            var v = makeVector2(20, -18),
                val = 9;

            expect(v.div(val)).to.equal(v);
        });
    });

    describe("#divVectors", function () {

        it("should divide two given vectors and set the result to this vector", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(20, -18),
                v3 = makeVector2(5, 6);

            v1.divVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x / v3.x, v2.y / v3.y);
        });

        it("should not create a new object", function () {

            var v1 = makeVector2(),
                v2 = makeVector2(20, -18),
                v3 = makeVector2(5, 6);

            expect(v1.divVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#dot", function () {

        it("should calculate dot product of the vector and a given vector", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6),

                res = v1.dot(v2);

            expect(res).to.be.a("number").and.equal(2);
        });

        it("should return 0 if vectors are orthogonal", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(0, 1),

                res = v1.dot(v2);

            expect(res).to.equal(0);
        });

        it("should return 0 if vectors are orthogonal", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(0, -1),

                res = v1.dot(v2);

            expect(res).to.equal(0);
        });

        it("should return product of lengths  if vectors are parallel", function () {

            var v1 = makeVector2(2, 0),
                v2 = makeVector2(1, 0),

                res = v1.dot(v2);

            expect(res).to.equal(2);
        });

        it("should return negative product of lengths if vectors are oppositely directed",
            function () {

            var v1 = makeVector2(2, 0),
                v2 = makeVector2(-3, 0),

                res = v1.dot(v2);

            expect(res).to.equal(-6);
        });

        it("should return a positive value if angle between vectors is less than 90", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(0.5, 0.5),

                res = v1.dot(v2);

            expect(res).to.be.above(0);
        });

        it("should return a positive value if angle between vectors is " +
            "greater than 270 and less than 360", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(0.5, -0.5),

                res = v1.dot(v2);

            expect(res).to.be.above(0);
        });

        it("should return a negative value if angle between vectors is " +
            "greater than 90 and less than 180", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(-0.5, 0.5),

                res = v1.dot(v2);

            expect(res).to.be.below(0);
        });

        it("should return a negative value if angle between vectors is " +
            "greater than 180 and less than 270", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(-0.5, -0.5),

                res = v1.dot(v2);

            expect(res).to.be.below(0);
        });

        it("should return squared length of the vector with self scalar product", function () {

            var v = makeVector2(4, -3),
                ln = v.length(),
                res = v.dot(v);

            expect(res).to.be.equal(ln * ln);
        });

        it("should not change result if the order is changed (commutative property)", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6);

            expect(v1.dot(v2)).to.be.equal(v2.dot(v1));
        });

        it("should fulfil distributive law", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6),
                v3 = makeVector2(1, 7),

                res1 = v1.dot(v2) + v1.dot(v3),
                res2 = v1.dot(v2.add(v3));

            expect(res1).to.be.equal(res2);
        });

        it("should obey the geometry definition of scalar product", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6),

                ln1 = v1.length(),
                ln2 = v2.length(),
                cos = Math.cos(v1.angleTo(v2)),

                dotRes = v1.dot(v2);

            expect(dotRes).to.be.closeTo(ln1 * ln2 * cos, EPSILON);
        });
    });

    describe("#angleTo", function () {

        it("should return angle between vectors", function () {

            var v1 = makeVector2(4, 0),
                v2 = makeVector2(0, 4);

            expect(v1.angleTo(v2)).to.be.a("number").and.equal(Math.PI * 0.5);
        });

        it("should return 0 with self vector", function () {

            var v = makeVector2(4, -3);

            expect(v.angleTo(v)).to.be.closeTo(0, EPSILON);
        });

        it("should return 0 if vectors are parallel", function () {

            var v1 = makeVector2(1, 0),
                v2 = makeVector2(0.5, 0);

            expect(v1.angleTo(v2)).to.equal(0);
        });

        it("should return Pi/2 if vectors are orthogonal", function () {

            var v1 = makeVector2(0, 1),
                v2 = makeVector2(1, 0);

            expect(v1.angleTo(v2)).to.equal(Math.PI * 0.5);
        });

        it("should return Pi if vectors are oppositely directed", function () {

            var v1 = makeVector2(0, -1),
                v2 = makeVector2(0, 1);

            expect(v1.angleTo(v2)).to.equal(Math.PI);
        });
    });

    describe("#distanceTo", function () {

        it("should return distance between vectors", function () {

            var v1 = makeVector2(4, 0),
                v2 = makeVector2(0, 3);

            expect(v1.distanceTo(v2)).to.be.a("number").and.to.equal(5);
        });

        it("should be equal the length of vector connecting them", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, 6),

                dist = v1.distanceTo(v2),
                res = v1.sub(v2).length();

            expect(dist).to.equal(res);
        });
    });

    describe("#distanceToSq", function () {

        it("should return squared distance between vectors", function () {

            var v1 = makeVector2(4, 0),
                v2 = makeVector2(0, 3);

            expect(v1.distanceToSq(v2)).to.be.a("number").and.equal(25);
        });
    });

    describe("#equal", function () {

        it("should return true if a given vector is equal to the vector", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(4, -3);

            expect(v1.equal(v2)).to.be.true;
        });

        it("should return false if a given vector is not equal to the vector", function () {

            var v1 = makeVector2(4, -3),
                v2 = makeVector2(5, -3);

            expect(v1.equal(v2)).to.be.false;
        });
    });

    describe("ZERO", function () {

        it("should exist", function () {
            expect(M.Vector2.ZERO).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.ZERO).to.be.instanceof(M.Vector2);
        });

        it("should be zero vector", function () {
            expect(M.Vector2.ZERO.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector2.ZERO.y, "y").to.be.a("number").and.equal(0);
        });
    });

    describe("INF", function () {

        it("should exist", function () {
            expect(M.Vector2.INF).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.INF).to.be.instanceof(M.Vector2);
        });

        it("should be positive along X-axis and zero on Y-axis", function () {
            expect(M.Vector2.INF.x, "x").to.be.a("number").and.equal(Infinity);
            expect(M.Vector2.INF.y, "y").to.be.a("number").and.equal(Infinity);
        });
    });

    describe("N_INF", function () {

        it("should exist", function () {
            expect(M.Vector2.N_INF).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.N_INF).to.be.instanceof(M.Vector2);
        });

        it("should be positive along X-axis and zero on Y-axis", function () {
            expect(M.Vector2.N_INF.x, "x").to.be.a("number").and.equal(-Infinity);
            expect(M.Vector2.N_INF.y, "y").to.be.a("number").and.equal(-Infinity);
        });
    });

    describe("X", function () {

        it("should exist", function () {
            expect(M.Vector2.X).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.X).to.be.instanceof(M.Vector2);
        });

        it("should be positive along X-axis and zero on Y-axis", function () {
            expect(M.Vector2.X.x, "x").to.be.a("number").and.equal(1);
            expect(M.Vector2.X.y, "y").to.be.a("number").and.equal(0);
        });
    });

    describe("Y", function () {

        it("should exist", function () {
            expect(M.Vector2.Y).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.Y).to.be.instanceof(M.Vector2);
        });

        it("should be positive along Y-axis and zero on X-axis", function () {
            expect(M.Vector2.Y.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector2.Y.y, "y").to.be.a("number").and.equal(1);
        });
    });

    describe("N_X", function () {

        it("should exist", function () {
            expect(M.Vector2.N_X).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.N_X).to.be.instanceof(M.Vector2);
        });

        it("should be negative along X-axis and zero on Y-axis", function () {
            expect(M.Vector2.N_X.x, "x").to.be.a("number").and.equal(-1);
            expect(M.Vector2.N_X.y, "y").to.be.a("number").and.equal(0);
        });
    });

    describe("N_Y", function () {

        it("should exist", function () {
            expect(M.Vector2.N_Y).to.exist;
        });

        it("should be an instance of M.Vector2", function () {
            expect(M.Vector2.N_Y).to.be.instanceof(M.Vector2);
        });

        it("should be negative along X-axis and zero on Y-axis", function () {
            expect(M.Vector2.N_Y.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector2.N_Y.y, "y").to.be.a("number").and.equal(-1);
        });
    });
});
