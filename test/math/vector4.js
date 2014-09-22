
describe("B.Math.Vector4", function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        makeVector4 = M.makeVector4,
        makeMatrix4 = M.makeMatrix4;

    it("should exist", function () {
        expect(M.Vector4).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized by 0 if no arguments passed", function () {

            var v = new M.Vector4();

            expect(v).to.have.property("x").that.is.a("number").and.equal(0);
            expect(v).to.have.property("y").that.is.a("number").and.equal(0);
            expect(v).to.have.property("z").that.is.a("number").and.equal(0);
            expect(v).to.have.property("w").that.is.a("number").and.equal(0);
        });

        it("should set passed x value", function () {

            var v = new M.Vector4(1);

            expect(v).to.have.property("x").that.is.a("number").and.equal(1);
        });

        it("should set passed y value", function () {

            var v = new M.Vector4(0, 1);

            expect(v).to.have.property("y").that.is.a("number").and.equal(1);
        });

        it("should set passed z value", function () {

            var v = new M.Vector4(0, 0, 1);

            expect(v).to.have.property("z").that.is.a("number").and.equal(1);
        });

        it("should set passed z value", function () {

            var v = new M.Vector4(0, 0, 0, 1);

            expect(v).to.have.property("w").that.is.a("number").and.equal(1);
        });
    });

    describe("#clone", function () {

        it("should clone the vector", function () {

            var v = makeVector4(3, -4, 5, 1),
                clone = v.clone();

            expect(clone).to.equalByComponents(v);
        });

        it("should create a new vector", function () {

            var v = makeVector4(),
                clone = v.clone();

            expect(clone).to.not.equal(v);
        });
    });

    describe("#copy", function () {

        it("should copy this vector", function () {

            var v1 = makeVector4(3, -4, 5, 1),
                v2 = makeVector4();

            v2.copy(v1);
            expect(v2).to.equalByComponents(v1);
        });

        it("should not create a new vector", function () {

            var v1 = makeVector4(3, -4, 5, 1),
                v2 = makeVector4();

            expect(v2.copy(v1)).to.equal(v2);
        });
    });

    describe("#set", function () {

        it("should set vector components", function () {

            var v = makeVector4();

            v.set(9, 0, -1.0, 4);
            expect(v).to.equalByComponents(9, 0, -1.0, 4);
        });

        it("should not create a new vector", function () {

            var v = makeVector4();

            expect(v.set(3, -4, 5, 1)).to.equal(v);
        });
    });

    describe("#get", function () {

        it("should return vector element by index", function () {

            var v = makeVector4(1, 2, 3, 4);

            expect(v.get(0), "first element").to.be.a("number").and.equal(1);
            expect(v.get(1), "second element").to.be.a("number").and.equal(2);
            expect(v.get(2), "third element").to.be.a("number").and.equal(3);
            expect(v.get(3), "fourth element").to.be.a("number").and.equal(4);
        });


        it("should throw if the index is out of range", function () {

            var v = makeVector4(1, 2, 3, 4);

            expect(function () {
                v.get(4);
            }, "index > 3").to.throw();

            expect(function () {
                v.get(-1);
            }, "negative index").to.throw();
        });
    });

    describe("#fromArray", function () {

        var v = makeVector4(),
            arr = [555, 0, -555, -1, 9.1, 1],
            offset = 2;

        it("should set vector components from array", function () {

            v.fromArray(arr);
            expect(v).to.equalByComponents(arr);
        });

        it("should set vector components from array with given offset", function () {

            v.fromArray(arr, offset);
            expect(v).to.equalByComponents(arr.slice(offset));
        });

        it("should return 4 if offset is not passed", function () {

            expect(v.fromArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(v.fromArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#toArray", function () {

        var v = makeVector4(1, -1, 1, 3),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 2;

        it("should set vector components to an array", function () {

            v.toArray(arr);
            expect(v).to.equalByComponents(arr);
        });

        it("should set vector components to an array with given offset", function () {

            v.toArray(arr, offset);
            expect(v).to.equalByComponents(arr.slice(offset));
        });

        it("should return 4 if offset is not passed", function () {

            expect(v.toArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(v.toArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#length", function () {

        it("should return the length of vector", function () {

            var v = makeVector4(4, 0, 0, -3);

            expect(v.length()).to.be.a("number").and.equal(5);
        });

        it("should return x component of X-vector", function () {

            var v = makeVector4(4, 0, 0, 0);

            expect(v.length()).to.equal(4);
        });

        it("should return y component of Y-vector", function () {

            var v = makeVector4(0, 1, 0, 0);

            expect(v.length()).to.equal(1);
        });

        it("should return z component of Z-vector", function () {

            var v = makeVector4(0, 0, -3, 0);

            expect(v.length()).to.equal(3);
        });

        it("should return w component of W-vector", function () {

            var v = makeVector4(0, 0, 0, 5);

            expect(v.length()).to.equal(5);
        });

        it("should return zero length with zero vector", function () {

            var v = makeVector4();

            expect(v.length()).to.equal(0);
        });

        it("should return the same length for inverted vectors", function () {

            var v1 = makeVector4(4, 5, 3, -1),
                v2 = v1.negate();

            expect(v1.length()).to.equal(v2.length());
        });
    });

    describe("#lengthSq", function () {

        it("should return the squared length of vector", function () {

            var v = makeVector4(6, 0, -8, 0);

            expect(v.lengthSq()).to.be.a("number").and.equal(100);
        });
    });

    describe("#normalize", function () {

        it("should normalize the vector", function () {

            var v = makeVector4(4, 0, -3, 1);

            v.normalize();
            expect(v.length()).to.equal(1);
        });

        it("should not normalize if the vector is normalized already", function () {

            var v1 = makeVector4(4, 0, -3, 1).normalize(),
                v2 = v1.clone();

            v1.normalize();
            expect(v1).to.equalByComponents(v2);
        });

        it("should not create a new object", function () {

            var v = makeVector4(4, 0, -3, 1);

            expect(v.normalize()).to.equal(v);
        });
    });

    describe("#negate", function () {

        it("should invert the vector", function () {

            var v = makeVector4(4, -5, -3, 1);

            v.negate();
            expect(v).to.equalByComponents(-4, 5, 3, -1);
        });

        it("should not create a new object", function () {

            var v = makeVector4(4, -5, -3, 1);

            expect(v.negate()).to.equal(v);
        });
    });

    describe("#clamp", function () {

        it("should clamp components of the vector within specific range " +
            "if greater than passed max value", function () {

            var v = makeVector4(2, 2, 2, 2);
            v.clamp(0.0, 1.5);

            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(v.w).to.equal(1.5);
        });

        it("should clamp components of the vector within specific range " +
            "if less than passed min value", function () {

            var v = makeVector4(0.0, 0.0, 0.0, 0.0);
            v.clamp(0.5, 1.0);

            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(v.w).to.equal(0.5);
        });

        it("should clamp components of the vector greater than 1.0 if no range set", function () {

            var v = makeVector4(1.5, 1.5, 1.5, 1.5);
            v.clamp();

            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(v.w).to.equal(1.0);
        });

        it("should not clamp components of the vector within a range [0.0, 1.0] if no range set",
            function () {

            var v = makeVector4(0.5, 0.5, 0.5, 0.5);
            v.clamp();

            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(v.w).to.equal(0.5);
        });

        it("should clamp components of the vector less than 0.0 if no range set", function () {

            var v = makeVector4(-1.5, -1.5, -1.5, -1.5);
            v.clamp();

            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(v.w).to.equal(0.0);
        });

        it("should not create a new object", function () {

            var v = makeVector4(-1.5, -1.5, -1.5, -1.5);
            expect(v.clamp()).to.equal(v);
        });
    });

    describe("#add", function () {

        it("should add a scalar value to the vector", function () {

            var v = makeVector4(4, 5, -3, 1),
                val = 9;

            v.add(val);
            expect(v).to.equalByComponents(13, 14, 6, 10);
        });

        it("should add a vector to the vector", function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(5, 9, 6, -1);

            v1.add(v2);
            expect(v1).to.equalByComponents(9, 14, 3, 0);
        });

        it("should not create a new object", function () {

            var v = makeVector4(4, 5, -3, 1),
                val = 9;

            expect(v.add(val)).to.equal(v);
        });
    });

    describe("#addVectors", function () {

        it("should add two given vectors and set the result to this vector", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(4, 5, -3, 1),
                v3 = makeVector4(5, 9, 6, -1);

            v1.addVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x + v3.x, v2.y + v3.y, v2.z + v3.z, v2.w + v3.w);
        });

        it("should not create a new object", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(4, 5, -3, 1),
                v3 = makeVector4(5, 9, 6, -1);

            expect(v1.addVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#sub", function () {

        it("should subtract a scalar value from the vector", function () {

            var v = makeVector4(4, 5, -3, 1),
                val = 9;

            v.sub(val);
            expect(v).to.equalByComponents(-5, -4, -12, -8);
        });

        it("should subtract a vector from the vector", function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(5, 9, 6, -1);

            v1.sub(v2);
            expect(v1).to.equalByComponents(-1, -4, -9, 2);
        });

        it("should not create a new object", function () {

            var v = makeVector4(4, 5, -3, 1),
                val = 9;

            expect(v.sub(val)).to.equal(v);
        });
    });

    describe("#subVectors", function () {

        it("should subtract two given vectors and set the result to this vector", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(4, 5, -3, 1),
                v3 = makeVector4(5, 9, 6, -1);

            v1.subVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x - v3.x, v2.y - v3.y, v2.z - v3.z, v2.w - v3.w);
        });

        it("should not create a new object", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(4, 5, -3, 1),
                v3 = makeVector4(5, 9, 6, -1);

            expect(v1.subVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#mul", function () {

        it("should multiply the vector by a scalar value", function () {

            var v = makeVector4(4, 5, -3, 1),
                val = 9;

            v.mul(val);
            expect(v).to.equalByComponents(36, 45, -27, 9);
        });

        it("should multiply the vector by a given vector", function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(5, 9, 6, -1);

            v1.mul(v2);
            expect(v1).to.equalByComponents(20, 45, -18, -1);
        });

        it("should not create a new object", function () {

            var v = makeVector4(4, 5, -3, 1),
                val = 9;

            expect(v.mul(val)).to.equal(v);
        });
    });

    describe("#mulVectors", function () {

        it("should multiply two given vectors and set the result to this vector", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(4, 5, -3, 1),
                v3 = makeVector4(5, 9, 6, -1);

            v1.mulVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x * v3.x, v2.y * v3.y, v2.z * v3.z, v2.w * v3.w);
        });

        it("should not create a new object", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(4, 5, -3, 1),
                v3 = makeVector4(5, 9, 6, -1);

            expect(v1.mulVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#div", function () {

        it("should divide the vector by a scalar value", function () {

            var v = makeVector4(36, 9, -27, 0),
                val = 9;

            v.div(val);
            expect(v).to.equalByComponents(4, 1, -3, 0);
        });

        it("should divide the vector by a given vector", function () {

            var v1 = makeVector4(20, 81, -18, 0),
                v2 = makeVector4(5, 9, 6, -1);

            v1.div(v2);
            expect(v1).to.equalByComponents(4, 9, -3, 0);
        });

        it("should not create a new object", function () {

            var v = makeVector4(27, 9, -18, 0),
                val = 9;

            expect(v.div(val)).to.equal(v);
        });
    });

    describe("#divVectors", function () {

        it("should divide two given vectors and set the result to this vector", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(20, 81, -18, 0),
                v3 = makeVector4(5, 9, 6, -1);

            v1.divVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x / v3.x, v2.y / v3.y, v2.z / v3.z, v2.w / v3.w);
        });

        it("should not create a new object", function () {

            var v1 = makeVector4(),
                v2 = makeVector4(20,81, -18, 0),
                v3 = makeVector4(5, 9, 6, 1);

            expect(v1.divVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#transform", function () {

        it("should transform vector by a matrix [w=0.0]", function () {

            var v0 = makeVector4(1, 0, 0, 0),
                v1 = v0.clone(),

                mxS = makeMatrix4().scale(2, 2, 2),
                mxR = makeMatrix4().rotationZ(Math.PI * 0.5),
                mxT = makeMatrix4().translation(1, 0, -1),
                mx0 = mxS.clone().mul(mxR).mul(mxT),
                mx1 = mxS.clone().mul(mxR);

            v0.transform(mx0);
            v1.transform(mx1);
            expect(v0).to.be.closeByComponents(v1);
        });

        it("should transform vector by a matrix [w=1.0]", function () {

            var v0 = makeVector4(1, 0, 0, 1),
                v1 = v0.clone(),

                mxS = makeMatrix4().scale(2, 2, 2),
                mxR = makeMatrix4().rotationZ(Math.PI * 0.5),
                mxT = makeMatrix4().translation(1, 0, -1),
                mx0 = mxS.clone().mul(mxR).mul(mxT),
                mx1 = mxS.clone().mul(mxR);

            v0.transform(mx0);
            v1.transform(mx1);
            expect(v0).to.not.deep.equal(v1);
        });

        it("should not create a new vector", function () {

            var v = makeVector4(1, 0, 0);

            expect(v.transform(M.Matrix4.IDENTITY)).to.equal(v);
        });
    });

    describe("#dot", function () {

        it("should calculate dot product of the vector and a given vector", function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(5, 9, 6, -1),
                res = v1.dot(v2);

            expect(res).to.be.a("number").and.equal(46);
        });

        it("should return square of the length of the vector with itself vector", function () {

            var v = makeVector4(4, 5, -3, 1),
                ln = v.length(),
                res = v.dot(v);

            expect(res).to.be.closeTo(ln * ln, EPSILON);
        });

        it("should not change result if the order is changed (commutative property)",
            function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(5, 9, 6, 1);

            expect(v1.dot(v2)).to.be.equal(v2.dot(v1));
        });

        it("should fulfil distributive law", function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(5, 9, 6, -1),
                v3 = makeVector4(1, 0, 7, 2),

                res1 = v1.dot(v2) + v1.dot(v3),
                res2 = v1.dot(v2.add(v3));

            expect(res1).to.be.equal(res2);
        });
    });

    describe("#equal", function () {

        it("should return true if vectors are equal", function () {

            var v1 = makeVector4(4, 5, -3, 1),
                v2 = makeVector4(4, 5, -3, 1);

            expect(v1.equal(v2)).to.be.true;
        });

        it("should return false if vectors are not equal", function () {

            var v1 = makeVector4(4, 5, -3, -1),
                v2 = makeVector4(4, 5, -3, 0);

            expect(v1.equal(v2)).to.be.false;
        });
    });


    describe("ZERO", function () {

        it("should exist", function () {
            expect(M.Vector4.ZERO).to.exist;
        });

        it("should be an instance of M.Vector4", function () {
            expect(M.Vector4.ZERO).to.be.instanceof(M.Vector4);
        });

        it("should be zero vector", function () {
            expect(M.Vector4.ZERO.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector4.ZERO.y, "y").to.be.a("number").and.equal(0);
            expect(M.Vector4.ZERO.z, "z").to.be.a("number").and.equal(0);
            expect(M.Vector4.ZERO.w, "w").to.be.a("number").and.equal(0);
        });
    });
});
