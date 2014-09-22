
describe("B.Math.Vector3", function () {

    var M = B.Math,
        PI = Math.PI,
        HALF_PI = PI * 0.5,
        EPSILON = M.EPSILON,

        makeVector3 = M.makeVector3,
        makeMatrix3 = M.makeMatrix3,
        makeMatrix4 = M.makeMatrix4,
        makeAngles = M.makeAngles,
        makeQuaternion = M.makeQuaternion;

    it("should exist", function () {
        expect(M.Vector3).to.exist;
    });

    describe("#constructor", function () {

        it("should initialized by 0 if no arguments passed", function () {

            var v = new M.Vector3();

            expect(v).to.have.property("x").that.is.a("number").and.equal(0);
            expect(v).to.have.property("y").that.is.a("number").and.equal(0);
            expect(v).to.have.property("z").that.is.a("number").and.equal(0);
        });

        it("should set passed x value", function () {

            var v = new M.Vector3(1);

            expect(v).to.have.property("x").that.is.a("number").and.equal(1);
        });

        it("should set passed y value", function () {

            var v = new M.Vector3(0, 1);

            expect(v).to.have.property("y").that.is.a("number").and.equal(1);
        });

        it("should set passed z value", function () {

            var v = new M.Vector3(0, 0, 1);

            expect(v).to.have.property("z").that.is.a("number").and.equal(1);
        });
    });

    describe("#clone", function () {

        it("should clone the vector", function () {

            var v = makeVector3(3, -4, 5),
                clone = v.clone();

            expect(clone).to.equalByComponents(v);
        });

        it("should create a new vector", function () {

            var v = makeVector3(),
                clone = v.clone();

            expect(clone).to.not.equal(v);
        });
    });

    describe("#copy", function () {

        it("should copy this vector", function () {

            var v1 = makeVector3(3, -4, 5),
                v2 = makeVector3();

            v2.copy(v1);
            expect(v2).to.equalByComponents(v1);
        });

        it("should not create a new vector", function () {

            var v1 = makeVector3(3, -4, 5),
                v2 = makeVector3();

            expect(v2.copy(v1)).to.equal(v2);
        });
    });

    describe("#set", function () {

        it("should set vector components", function () {

            var v = makeVector3();

            v.set(9, 0, -1);
            expect(v).to.equalByComponents(9, 0, -1);
        });

        it("should not create a new vector", function () {

            var v = makeVector3();

            expect(v.set(3, -4, 5)).to.equal(v);
        });
    });

    describe("#get", function () {

        it("should return a vector element by its index", function () {

            var v = makeVector3(1, 0, -1);

            expect(v.get(0), "first element").to.be.a("number").and.equal(1);
            expect(v.get(1), "second element").to.be.a("number").and.equal(0);
            expect(v.get(2), "third element").to.be.a("number").and.equal(-1);
        });

        it("should throw if the index is out of range", function () {

            var v = makeVector3(1, 0, -1);

            expect(function () {
                v.get(3);
            }, "index > 2").to.throw();

            expect(function () {
                v.get(-1);
            }, "negative index").to.throw();
        });
    });

    describe("#fromArray", function () {

        var v = makeVector3(),
            arr = [555, -555, -1, 9.1, 1],
            offset = 2;

        it("should set vector components from array", function () {

            v.fromArray(arr);
            expect(v).to.equalByComponents(arr);
        });

        it("should set vector components from array with given offset", function () {

            v.fromArray(arr, offset);
            expect(v).to.equalByComponents(arr.slice(offset));
        });

        it("should return 3 if offset is not passed", function () {

            expect(v.fromArray(arr)).to.equal(3);
        });

        it("should return new offset", function () {

            expect(v.fromArray(arr, offset)).to.equal(offset + 3);
        });
    });

    describe("#toArray", function () {

        var v = makeVector3(1, -1, 1),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 3;

        it("should set vector components to an array", function () {

            v.toArray(arr);
            expect(v).to.equalByComponents(arr);
        });

        it("should set vector components to an array with given offset", function () {

            v.toArray(arr, offset);
            expect(v).to.equalByComponents(arr.slice(offset));
        });

        it("should return 3 if offset is not passed", function () {

            expect(v.toArray(arr)).to.equal(3);
        });

        it("should return new offset", function () {

            expect(v.toArray(arr, offset)).to.equal(offset + 3);
        });
    });

    describe("#length", function () {

        it("should return the length of the vector", function () {

            var v = makeVector3(4, 0, -3);

            expect(v.length()).to.be.a("number").and.equal(5);
        });

        it("should return x component of X-vector", function () {

            var v = makeVector3(4, 0, 0);

            expect(v.length()).to.equal(4);
        });

        it("should return y component of Y-vector", function () {

            var v = makeVector3(0, 1, 0);

            expect(v.length()).to.equal(1);
        });

        it("should return z component of Z-vector", function () {

            var v = makeVector3(0, 0, -3);

            expect(v.length()).to.equal(3);
        });

        it("should return zero length of zero vector", function () {

            var v = makeVector3();

            expect(v.length()).to.equal(0);
        });

        it("should return the same length for inverted vectors", function () {

            var v1 = makeVector3(4, 5, 3),
                v2 = v1.negate();

            expect(v1.length()).to.equal(v2.length());
        });
    });

    describe("#lengthSq", function () {

        it("should return the squared length of the vector", function () {

            var v = makeVector3(4, 0, -3);

            expect(v.lengthSq()).to.be.a("number").and.equal(25);
        });
    });

    describe("#normalize", function () {

        it("should normalize the vector", function () {

            var v = makeVector3(4, 0, -3);

            v.normalize();
            expect(v.length()).to.equal(1);
        });

        it("should not normalize if the vector is normalized already", function () {

            var v1 = makeVector3(4, 0, -3).normalize(),
                v2 = v1.clone();

            v1.normalize();
            expect(v1).to.equalByComponents(v2);
        });

        it("should not create a new object", function () {

            var v = makeVector3(1, 5, 1);
            expect(v.normalize()).to.equal(v);
        });
    });

    describe("#negate", function () {

        it("should invert the vector", function () {

            var v = makeVector3(4, 5, -3);

            v.negate();
            expect(v).to.equalByComponents(-4, -5, 3);
        });

        it("should not create a new object", function () {

            var v = makeVector3(4, 5, -3);

            expect(v.negate()).to.equal(v);
        });
    });

    describe("#clamp", function () {

        it("should clamp components of the vector within specific range " +
            "if greater than passed max value", function () {

            var v = makeVector3(2, 2, 2);

            v.clamp(0, 1.5);
            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(1.5);
        });

        it("should clamp components of the vector within specific range " +
            "if less than passed min value", function () {

            var v = makeVector3(0, 0, 0);

            v.clamp(0.5, 1);
            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(0.5);
        });

        it("should clamp components of the vector greater than 1 if no range set", function () {

            var v = makeVector3(1.5, 1.5, 1.5);

            v.clamp();
            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(1);
        });

        it("should not clamp components of the vector within a range [0, 1] if no range set",
            function () {

                var v = makeVector3(0.5, 0.5, 0.5);

                v.clamp();
                expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(0.5);
            }
        );

        it("should clamp components of the vector less than 0 if no range set", function () {

            var v = makeVector3(-1.5, -1.5, -1.5);

            v.clamp();
            expect(v.x).to.equal(v.y).to.equal(v.z).to.equal(0);
        });

        it("should not create a new object", function () {

            var v = makeVector3(-1.5, -1.5, -1.5);

            expect(v.clamp()).to.equal(v);
        });
    });

    describe("#add", function () {

        it("should add a scalar value to the vector", function () {

            var v = makeVector3(4, 5, -3),
                val = 9;

            v.add(val);
            expect(v).to.equalByComponents(13, 14, 6);
        });

        it("should add a vector to the vector", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6);

            v1.add(v2);
            expect(v1).to.equalByComponents(9, 14, 3);
        });

        it("should not create a new object", function () {

            var v = makeVector3(4, 5, -3),
                val = 9;

            expect(v.add(val)).to.equal(v);
        });
    });

    describe("#addVectors", function () {

        it("should add two given vectors and set the result to this vector", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(4, 5, -3),
                v3 = makeVector3(5, 9, 6);

            v1.addVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x + v3.x, v2.y + v3.y, v2.z + v3.z);
        });

        it("should not create a new object", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(4, 5, -3),
                v3 = makeVector3(5, 9, 6);

            expect(v1.addVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#sub", function () {

        it("should subtract a scalar value from the vector", function () {

            var v = makeVector3(4, 5, -3),
                val = 9;

            v.sub(val);
            expect(v).to.equalByComponents(-5, -4, -12);
        });

        it("should subtract a vector from the vector", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6);

            v1.sub(v2);
            expect(v1).to.equalByComponents(-1, -4, -9);
        });

        it("should not create a new object", function () {

            var v = makeVector3(4, 5, -3),
                val = 9;

            expect(v.sub(val)).to.equal(v);
        });
    });

    describe("#subVectors", function () {

        it("should subtract two given vectors and set the result to this vector", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(4, 5, -3),
                v3 = makeVector3(5, 9, 6);

            v1.subVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x - v3.x, v2.y - v3.y, v2.z - v3.z);
        });

        it("should not create a new object", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(4, 5, -3),
                v3 = makeVector3(5, 9, 6);

            expect(v1.subVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#mul", function () {

        it("should multiply the vector by a scalar value", function () {

            var v = makeVector3(4, 5, -3),
                val = 9;

            v.mul(val);
            expect(v).to.equalByComponents(36, 45, -27);
        });

        it("should multiply the vector by a given vector", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6);

            v1.mul(v2);
            expect(v1).to.equalByComponents(20, 45, -18);
        });

        it("should not create a new object", function () {

            var v = makeVector3(4, 5, -3),
                val = 9;

            expect(v.mul(val)).to.equal(v);
        });
    });

    describe("#mulVectors", function () {

        it("should multiply two given vectors and set the result to this vector", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(4, 5, -3),
                v3 = makeVector3(5, 9, 6);

            v1.mulVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x * v3.x, v2.y * v3.y, v2.z * v3.z);
        });

        it("should not create a new object", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(4, 5, -3),
                v3 = makeVector3(5, 9, 6);

            expect(v1.mulVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#div", function () {

        it("should divide the vector by a scalar value", function () {

            var v = makeVector3(36, 9, -27),
                val = 9;

            v.div(val);
            expect(v).to.equalByComponents(4, 1, -3);
        });

        it("should divide the vector by a given vector", function () {

            var v1 = makeVector3(20, 81, -18),
                v2 = makeVector3(5, 9, 6);

            v1.div(v2);
            expect(v1).to.equalByComponents(4, 9, -3);
        });

        it("should not create a new object", function () {

            var v = makeVector3(27, 9, -18),
                val = 9;

            expect(v.div(val)).to.equal(v);
        });
    });

    describe("#divVectors", function () {

        it("should divide two given vectors and set the result to this vector", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(20, 81, -18),
                v3 = makeVector3(5, 9, 6);

            v1.divVectors(v2, v3);
            expect(v1).to.equalByComponents(v2.x / v3.x, v2.y / v3.y, v2.z / v3.z);
        });

        it("should not create a new object", function () {

            var v1 = makeVector3(),
                v2 = makeVector3(20,81, -18),
                v3 = makeVector3(5, 9, 6);

            expect(v1.divVectors(v2, v3)).to.equal(v1);
        });
    });

    describe("#dot", function () {

        it("should calculate dot product of the vector and a given vector", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6),
                res = v1.dot(v2);

            expect(res).to.be.a("number").and.equal(47);
        });

        it("should return 0 if vectors are orthogonal", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0, 1, 0),
                res = v1.dot(v2);

            expect(res).to.equal(0);
        });

        it("should return 0 if vectors are orthogonal", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0, -1, 0),
                res = v1.dot(v2);

            expect(res).to.equal(0);
        });

        it("should return product of lengths if vectors are parallel", function () {

            var v1 = makeVector3(2, 0, 0),
                v2 = makeVector3(3, 0, 0),
                res = v1.dot(v2);

            expect(res).to.equal(6);
        });

        it("should return negative product of lengths if vectors are oppositely directed",
            function () {

            var v1 = makeVector3(2, 0, 0),
                v2 = makeVector3(-2, 0, 0),
                res = v1.dot(v2);

            expect(res).to.equal(-4);
        });

        it("should return a positive value if angle between vectors is less than 90", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0.5, 0.5, 0),
                res = v1.dot(v2);

            expect(res).to.be.above(0);
        });

        it("should return a positive value if angle between vectors is " +
            "greater than 270 and less than 360", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0.5, -0.5, 0),
                res = v1.dot(v2);

            expect(res).to.be.above(0);
        });

        it("should return a negative value if angle between vectors is " +
            "greater than 90 and less than 180", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(-0.5, 0.5, 0),
                res = v1.dot(v2);

            expect(res).to.be.below(0);
        });

        it("should return a negative value if angle between vectors is " +
            "greater than 180 and less than 270", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(-0.5, -0.5, 0),
                res = v1.dot(v2);

            expect(res).to.be.below(0);
        });

        it("should return square of the length of the vector with itself vector", function () {

            var v = makeVector3(4, 5, -3),
                ln = v.length(),
                res = v.dot(v);

            expect(res).to.be.closeTo(ln * ln, EPSILON);
        });

        it("should not change result if the order is changed (commutative property)", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6);

            expect(v1.dot(v2)).to.be.equal(v2.dot(v1));
        });

        it("should fulfil distributive law", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6),
                v3 = makeVector3(1, 0, 7),

                res1 = v1.dot(v2) + v1.dot(v3),
                res2 = v1.dot(v2.add(v3));

            expect(res1).to.be.equal(res2);
        });

        it("should obey the geometry definition of scalar product", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6),

                ln1 = v1.length(),
                ln2 = v2.length(),
                cos = Math.cos(v1.angleTo(v2)),

                dotRes = v1.dot(v2);

            expect(dotRes).to.be.closeTo(ln1 * ln2 * cos, EPSILON);
        });
    });

    describe("#cross", function () {

        it("should calculate cross product of vectors", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0, 0, 1),

                cross = v1.cross(v2);

            expect(cross).to.be.instanceof(M.Vector3);
            expect(cross).to.equalByComponents(0, -1, 0);
        });

        it("should equal square of parallelogram", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),

                ln = v1.dot(makeVector3(1, 0, 0)) * v2.length();

            v1.cross(v2);
            expect(v1.length()).to.be.closeTo(ln, EPSILON);
        });

        it("should obey the geometry definition of cross product", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),

                ln = v1.length() * v2.length() * Math.sin(v1.angleTo(v2));

            v1.cross(v2);
            expect(v1.length()).to.be.closeTo(ln, EPSILON);
        });

        it("should return vector that is orthogonal to given vectors", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),

                v3 = v1.clone().cross(v2);

            expect(v3.dot(v1)).to.equal(0);
            expect(v3.dot(v2)).to.equal(0);
        });

        it("should fulfil anticommutative property", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),

                v3 = v1.clone().cross(v2),
                v4 = v2.clone().cross(v1);

            expect(v3.length()).to.equal(v4.length());
            expect(v3.dot(v4)).to.be.below(0);
        });

        it("should fulfil distributive property", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),
                v3 = makeVector3(-3, 0, 0),

                v4 = v1.clone().cross(v2.clone().add(v3)),
                v5 = v1.clone().cross(v2).add(v1.clone().cross(v3));

            expect(v4).to.equalByComponents(v5);
        });

        it("should return zero vector with self cross product", function () {

            var v = makeVector3(3, 0, 5);

            v.cross(v);
            expect(v).to.equalByComponents(0, 0, 0);
        });

        it("should not create a new vector", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0, 0, 1);

            expect(v1.cross(v2)).to.equal(v1);
        });
    });

    describe("#crossVectors", function () {

        it("should calculate cross product of vectors", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0, 0, 1),

                cross = makeVector3().crossVectors(v1, v2);

            expect(cross).to.be.instanceof(M.Vector3);
            expect(cross).to.equalByComponents(0, -1, 0);
        });

        it("should equal square of parallelogram??", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),
                cross = makeVector3().crossVectors(v1, v2),

                ln = v1.dot(makeVector3(1, 0, 0)) * v2.length();

            expect(cross.length()).to.be.closeTo(ln, EPSILON);
        });

        it("should obey the geometry definition of cross product", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),
                cross = makeVector3().crossVectors(v1, v2),

                ln = v1.length() * v2.length() * Math.sin(v1.angleTo(v2));

            expect(cross.length()).to.be.closeTo(ln, EPSILON);
        });

        it("should return vector that is orthogonal to given vectors", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),

                cross = makeVector3().crossVectors(v1, v2);

            expect(cross.dot(v1)).to.equal(0);
            expect(cross.dot(v2)).to.equal(0);
        });

        it("should fulfil anticommutative property", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),

                v3 = makeVector3().crossVectors(v1, v2),
                v4 = makeVector3().crossVectors(v2, v1);

            expect(v3.length()).to.equal(v4.length());
            expect(v3.dot(v4)).to.be.below(0);
        });

        it("should fulfil distributive property", function () {

            var v1 = makeVector3(3, 0, 5),
                v2 = makeVector3(0, 0, 2),
                v3 = makeVector3(-3, 0, 0),

                v4 = makeVector3().crossVectors(v1, v2.clone().add(v3)),
                v5 = makeVector3().crossVectors(v1, v2).add(v1.clone().crossVectors(v1, v3));

            expect(v4).to.equalByComponents(v5);
        });

        it("should return zero vector with self cross product", function () {

            var v = makeVector3(3, 0, 5);

            v.crossVectors(v, v);
            expect(v).to.equalByComponents(0, 0, 0);
        });

        it("should not create a new vector", function () {

            var v1 = makeVector3(1, 0, 0),
                v2 = makeVector3(0, 0, 1),
                cross = makeVector3();

            expect(cross.crossVectors(v1, v2)).to.equal(cross);
        });
    });

    describe("#reflect", function () {

        it("should reflect vector by a normal vector", function () {

            var v = makeVector3(2, 3, 1);

            v.reflect(M.Vector3.X);
            expect(v, "pos x-axis").to.equalByComponents(-2, 3, 1);

            v.set(2, 3, 1);
            v.reflect(M.Vector3.Y);
            expect(v, "pos y-axis").to.equalByComponents(2, -3, 1);

            v.set(2, 3, 1);
            v.reflect(M.Vector3.Z);
            expect(v, "pos z-axis").to.equalByComponents(2, 3, -1);

            v.set(-2, -3, -1);
            v.reflect(M.Vector3.N_X);
            expect(v, "pos x-axis").to.equalByComponents(2, -3, -1);

            v.set(-2, -3, -1);
            v.reflect(M.Vector3.N_Y);
            expect(v, "pos y-axis").to.equalByComponents(-2, 3, -1);

            v.set(-2, -3, -1);
            v.reflect(M.Vector3.N_Z);
            expect(v, "pos z-axis").to.equalByComponents(-2, -3, 1);
        });

        it("should normalize the normal vector", function () {

            var v = makeVector3(2, 3, 1);

            v.reflect(makeVector3(100, 0, 0));
            expect(v).to.equalByComponents(-2, 3, 1);
        });

        it("should not create a new vector", function () {

            var v = makeVector3();

            expect(v.reflect(M.Vector3.X)).to.equal(v);
        });
    });

    describe("#transform3", function () {

        it("should transform vector by a 3x3 matrix", function () {

            var v = makeVector3(1, 0, 0),
                mx = makeMatrix3().rotationZ(HALF_PI);

            v.transform3(mx);
            expect(v).to.be.closeByComponents(0, 1, 0);
        });

        it("should not create a new vector", function () {

            var v = makeVector3(1, 0, 0);

            expect(v.transform3(M.Matrix3.IDENTITY)).to.equal(v);
        });
    });

    describe("#transform4", function () {

        it("should transform vector by matrix", function () {

            var v = makeVector3(1, 0, 0),
                mxR = makeMatrix4().rotationZ(HALF_PI),
                mxT = makeMatrix4().translation(1, 0, -1),
                mx = mxR.clone().mul(mxT);

            v.transform4(mx);
            expect(v).to.equalByComponents(1, 1, -1);
        });

        it("should ignore translation matrix if w=0", function () {

            var v0 = makeVector3(1, 0, 0),
                v1 = v0.clone(),

                mxS = makeMatrix4().scale(2, 2, 2),
                mxR = makeMatrix4().rotationZ(HALF_PI),
                mxT = makeMatrix4().translation(1, 0, -1),
                mx0 = mxS.clone().mul(mxR).mul(mxT),
                mx1 = mxS.clone().mul(mxR);

            v0.transform4(mx0, 0);
            v1.transform4(mx1, 0);
            expect(v0).to.be.closeByComponents(v1);
        });

        it("should not ignore translation matrix if w=1", function () {

            var v0 = makeVector3(1, 0, 0),
                v1 = v0.clone(),

                mxS = makeMatrix4().scale(2, 2, 2),
                mxR = makeMatrix4().rotationZ(HALF_PI),
                mxT = makeMatrix4().translation(1, 0, -1),
                mx0 = mxT.clone().mul(mxR).mul(mxS),
                mx1 = mxR.clone().mul(mxS);

            v0.transform4(mx0, 1);
            v1.transform4(mx1, 1);
            expect(v0).to.not.deep.equal(v1);
            expect(v0).to.not.deep.equal(v1);
        });

        it("should not create a new vector", function () {

            var v = makeVector3(1, 0, 0);

            expect(v.transform4(M.Matrix4.IDENTITY)).to.equal(v);
        });
    });

    describe("#transform", function () {

        it("should call M.Vector3.transform3 if M.Matrix3 is passed", function () {

            var v = makeVector3(),
                mx = makeMatrix3(),

                spy = sinon.spy(v, "transform3");

            v.transform(mx);
            expect(spy).to.be.calledWith(mx);
        });

        it("should call M.Vector3.transform4 if M.Matrix4 is passed", function () {

            var v = makeVector3(),
                mx = makeMatrix4(),
                w = 1,

                spy = sinon.spy(v, "transform4");

            v.transform(mx, w);
            expect(spy).to.be.calledWith(mx, w);
        });

        it("should not create a new object", function () {

            var v = makeVector3();

            expect(v.transform(makeMatrix3())).to.equal(v);
        });
    });

    describe("#rotate", function () {

        it("should rotate vector by a quaternion", function () {

            var q = makeQuaternion(),
                v = makeVector3(),

                check = function (axis, angle, vector, msg, refX, refY, refZ) {

                    vector.rotate(q.fromAxisAngle(axis, angle));
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(M.Vector3.X, HALF_PI, v.set(0, 1, 0), "X=Pi/2", 0, 0, 1);
            check(M.Vector3.X, PI, v.set(0, 1, 0), "X=Pi", 0, -1, 0);
            check(M.Vector3.X, -HALF_PI, v.set(0, 1, 0), "X=-Pi/2", 0, 0, -1);

            check(M.Vector3.Y, HALF_PI, v.set(0, 0, 1), "Y=Pi/2", 1, 0, 0);
            check(M.Vector3.Y, PI, v.set(0, 0, 1), "Y=Pi", 0, 0, -1);
            check(M.Vector3.Y, -HALF_PI, v.set(0, 0, 1), "Y=-Pi/2", -1, 0, 0);

            check(M.Vector3.Z, HALF_PI, v.set(1, 0, 0), "Z=Pi/2", 0, 1, 0);
            check(M.Vector3.Z, PI, v.set(1, 0, 0), "Z=Pi", -1, 0, 0);
            check(M.Vector3.Z, -HALF_PI, v.set(1, 0, 0), "Z=-Pi/2", 0, -1, 0);
        });

        it("should rotate vector by Euler angles", function() {

            var a = makeAngles(),
                v = makeVector3(),

                check = function (angles, vector, msg, refX, refY, refZ) {

                    vector.rotate(angles);
                    expect(vector, msg).to.be.closeByComponents(refX, refY, refZ);
                };

            check(a.set(HALF_PI, 0, 0), v.set(0, 0, 1), "yaw=Pi/2", 1, 0, 0);
            check(a.set(PI, 0, 0), v.set(0, 0, 1), "yaw=Pi", 0, 0, -1);
            check(a.set(-HALF_PI, 0, 0), v.set(0, 0, 1), "yaw=-Pi/2", -1, 0, 0);

            check(a.set(0, HALF_PI, 0), v.set(0, 0, 1), "pitch=Pi/2", 0, -1, 0);
            check(a.set(0, -HALF_PI, 0), v.set(0, 0, 1), "pitch=-Pi/2", 0, 1, 0);

            check(a.set(0, 0, HALF_PI), v.set(1, 0, 0), "roll=Pi/2", 0, 1, 0);
            check(a.set(0, 0, PI), v.set(1, 0, 0), "roll=Pi", -1, 0, 0);
            check(a.set(0, 0, -HALF_PI), v.set(1, 0, 0), "roll=-Pi/2", 0, -1, 0);

            check(a.set(HALF_PI, HALF_PI, 0), v.set(0, 0, 1), "yaw=Pi/2, pitch=Pi/2", 0, -1, 0);
            check(a.set(HALF_PI, 0, HALF_PI), v.set(1, 0, 0), "yaw=Pi/2, roll=Pi/2", 0, 1, 0);
            check(a.set(0, HALF_PI, HALF_PI), v.set(0, 1, 0), "pitch=Pi/2, roll=Pi/2", -1, 0, 0);

            check(a.set(HALF_PI, HALF_PI, HALF_PI), v.set(0, 1, 0),
                "yaw=Pi/2, pitch=Pi/2, roll=Pi/2", 0, 0, 1);
            check(a.set(HALF_PI, -HALF_PI, HALF_PI), v.set(0, 1, 0),
                "yaw=Pi/2, pitch=-Pi/2, roll=Pi/2", 0, 0, 1);
        });

        it("should not create a new vector", function () {

            var v = makeVector3(1, 0, 0);

            expect(v.rotate(makeQuaternion())).to.equal(v);
        });
    });

    describe("#angleTo", function () {

        it("should return angle between vectors", function () {

            var v1 = makeVector3(4, 0, 4),
                v2 = makeVector3(0, 4, 0);

            expect(v1.angleTo(v2)).to.be.a("number").and.to.equal(HALF_PI);
        });

        it("should return 0 with self vector", function () {

            var v = makeVector3(4, 5, -3);

            expect(v.angleTo(v)).to.be.closeTo(0, EPSILON);
        });

        it("should return 0 if vectors are parallel", function () {

            var v1 = makeVector3(2, 0, 0),
                v2 = makeVector3(4, 0, 0);

            expect(v1.angleTo(v2)).be.closeTo(0, EPSILON);
        });

        it("should return Pi/2 if vectors are orthogonal", function () {

            var v1 = makeVector3(0, 1, 0),
                v2 = makeVector3(0, 0, -1);

            expect(v1.angleTo(v2)).to.be.closeTo(HALF_PI, EPSILON);
        });

        it("should return Pi if vectors are oppositely directed", function () {

            var v1 = makeVector3(-1, 0, -1),
                v2 = makeVector3(1, 0, 1);

            expect(v1.angleTo(v2)).to.be.closeTo(PI, EPSILON);
        });
    });

    describe("#distanceTo", function () {

        it("should return distance between vectors", function () {

            var v1 = makeVector3(4, 0, 0),
                v2 = makeVector3(0, 3, 0);

            expect(v1.distanceTo(v2)).to.be.a("number").and.to.equal(5);
        });

        it("should be equal the length of vector connecting them", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(5, 9, 6),

                dist = v1.distanceTo(v2),
                res = v1.sub(v2).length();

            expect(dist).to.be.closeTo(res, EPSILON);
        });
    });

    describe("#distanceToSq", function () {

        it("should return squared distance between vectors", function () {

            var v1 = makeVector3(4, 0, 0),
                v2 = makeVector3(0, 3, 0);

            expect(v1.distanceToSq(v2)).to.be.a("number").and.to.equal(25);
        });
    });

    describe("#equal", function () {

        it("should return true if vectors are equal", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(4, 5, -3);

            expect(v1.equal(v2)).to.be.true;
        });

        it("should return false if vectors are not equal", function () {

            var v1 = makeVector3(4, 5, -3),
                v2 = makeVector3(4, -5, -3);

            expect(v1.equal(v2)).to.be.false;
        });
    });

    describe("ZERO", function () {

        it("should exist", function () {
            expect(M.Vector3.ZERO).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.ZERO).to.be.instanceof(M.Vector3);
        });

        it("should be zero vector", function () {
            expect(M.Vector3.ZERO.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector3.ZERO.y, "y").to.be.a("number").and.equal(0);
            expect(M.Vector3.ZERO.z, "z").to.be.a("number").and.equal(0);
        });
    });

    describe("INF", function () {

        it("should exist", function () {
            expect(M.Vector3.INF).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.INF).to.be.instanceof(M.Vector3);
        });

        it("should be positive direction along X-axis", function () {
            expect(M.Vector3.INF.x, "x").to.be.a("number").and.equal(Infinity);
            expect(M.Vector3.INF.y, "y").to.be.a("number").and.equal(Infinity);
            expect(M.Vector3.INF.z, "z").to.be.a("number").and.equal(Infinity);
        });
    });

    describe("N_INF", function () {

        it("should exist", function () {
            expect(M.Vector3.N_INF).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.N_INF).to.be.instanceof(M.Vector3);
        });

        it("should be positive direction along X-axis", function () {
            expect(M.Vector3.N_INF.x, "x").to.be.a("number").and.equal(-Infinity);
            expect(M.Vector3.N_INF.y, "y").to.be.a("number").and.equal(-Infinity);
            expect(M.Vector3.N_INF.z, "z").to.be.a("number").and.equal(-Infinity);
        });
    });

    describe("X", function () {

        it("should exist", function () {
            expect(M.Vector3.X).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.X).to.be.instanceof(M.Vector3);
        });

        it("should be positive direction along X-axis", function () {
            expect(M.Vector3.X.x, "x").to.be.a("number").and.equal(1);
            expect(M.Vector3.X.y, "y").to.be.a("number").and.equal(0);
            expect(M.Vector3.X.z, "z").to.be.a("number").and.equal(0);
        });
    });

    describe("Y", function () {

        it("should exist", function () {
            expect(M.Vector3.Y).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.Y).to.be.instanceof(M.Vector3);
        });

        it("should be positive direction along Y-axis", function () {
            expect(M.Vector3.Y.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector3.Y.y, "y").to.be.a("number").and.equal(1);
            expect(M.Vector3.Y.z, "z").to.be.a("number").and.equal(0);
        });
    });

    describe("Z", function () {

        it("should exist", function () {
            expect(M.Vector3.Z).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.Z).to.be.instanceof(M.Vector3);
        });

        it("should be positive direction along Z-axis", function () {
            expect(M.Vector3.Z.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector3.Z.y, "y").to.be.a("number").and.equal(0);
            expect(M.Vector3.Z.z, "z").to.be.a("number").and.equal(1);
        });
    });

    describe("N_X", function () {

        it("should exist", function () {
            expect(M.Vector3.N_X).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.N_X).to.be.instanceof(M.Vector3);
        });

        it("should be negative direction along X-axis", function () {
            expect(M.Vector3.N_X.x, "x").to.be.a("number").and.equal(-1);
            expect(M.Vector3.N_X.y, "y").to.be.a("number").and.equal(0);
            expect(M.Vector3.N_X.z, "z").to.be.a("number").and.equal(0);
        });
    });

    describe("N_Y", function () {

        it("should exist", function () {
            expect(M.Vector3.N_Y).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.N_Y).to.be.instanceof(M.Vector3);
        });

        it("should be negative direction along Y-axis", function () {
            expect(M.Vector3.N_Y.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector3.N_Y.y, "y").to.be.a("number").and.equal(-1);
            expect(M.Vector3.N_Y.z, "z").to.be.a("number").and.equal(0);
        });
    });

    describe("N_Z", function () {

        it("should exist", function () {
            expect(M.Vector3.N_Z).to.exist;
        });

        it("should be an instance of M.Vector3", function () {
            expect(M.Vector3.N_Z).to.be.instanceof(M.Vector3);
        });

        it("should be negative direction along Z-axis", function () {
            expect(M.Vector3.N_Z.x, "x").to.be.a("number").and.equal(0);
            expect(M.Vector3.N_Z.y, "y").to.be.a("number").and.equal(0);
            expect(M.Vector3.N_Z.z, "z").to.be.a("number").and.equal(-1);
        });
    });
});
