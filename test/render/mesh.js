
describe("B.Render.Mesh", function () {

    var M = B.Math,
        R = B.Render,
        F = R.Format,
        A = R.Attribute,
        P = R.Primitive,

        attributeToStr = B.Test.attributeToStr,
        
        canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {
        expect(R.Mesh).to.exist;
    });

    describe("create & free", function () {

        var mesh;

        it("should be created by device", function () {

            mesh = device.makeMesh();
            expect(mesh).to.be.instanceof(R.Mesh);
            expect(mesh.device()).to.equal(device);
        });

        it("should free mesh and detach rendering device", function () {

            mesh.free();
            expect(mesh.device()).to.not.equal(device);
        });
    });

    describe("#attribute", function () {

        var mesh,

            attributes = {
                "attr1": A.UINT,
                "attr2": A.FLOAT,
                "attr3": A.VECTOR2,
                "attr4": A.VECTOR3,
                "attr5": A.VECTOR4,
                "attr6": A.POSITION,
                "attr7": A.NORMAL,
                "attr8": A.TANGENT,
                "attr9": A.UV,
                "attr10": A.COLOR
            };

        before(function () {
            mesh = device.makeMesh();
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should return null if the attribute is not found", function () {

            expect(mesh.attribute("some")).to.equal(null);
        });

        it("should set/get all possible attributes", function () {

            var name, type;

            for(name in attributes) {

                type = attributes[name];
                mesh.attribute(name, type);
                expect(mesh.attribute(name), attributeToStr(type)).to.equal(type);
            }
        });

        it("should rename existing attribute", function () {

            var name = "attr1", newName = "attribute1",
                type = mesh.attribute(name);

            mesh.attribute(name, newName);

            expect(mesh.attribute(name), name).to.equal(null);
            expect(mesh.attribute(newName), newName).to.equal(type);
        });

        it("should do nothing if renaming attribute is not found", function () {

            var name = "unknown", newName = "some";

            mesh.attribute(name, newName);

            expect(mesh.attribute(name), name).to.equal(null);
            expect(mesh.attribute(newName), newName).to.equal(null);
        });

        it("should remove existing attribute", function () {

            var name = "attr2";

            mesh.attribute(name, null);

            expect(mesh.attribute(name)).to.equal(null);
        });

        it("should do nothing if removing attribute is not found", function () {

            var name = "unknown";

            mesh.attribute(name, null);

            expect(mesh.attribute(name)).to.equal(null);
        });

        it("should throw if attribute type is unknown", function () {

            var fn = function () { mesh.attribute("some", -1); };
            expect(fn).to.throw(B.Render.Error);
        });
    });

    describe("#attributes", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh();
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should return empty array if no attributes are set yet", function () {

            expect(mesh.attributes()).to.be.empty;
        });

        it("should return an array of names", function () {

            var names = ["position", "normal", "some"];

            mesh.attribute(names[0], A.POSITION).
                attribute(names[1], A.NORMAL).
                attribute(names[2], A.VECTOR4);

            expect(mesh.attributes()).to.deep.equal(names);
        });
    });

    describe("#vertices", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should return empty vertices list if data are set yet", function () {

            expect(mesh.vertices()).to.be.null;
            expect(mesh.vertexCount()).to.equal(0);
        });

        it("should allocate specified vertex count", function () {

            mesh.vertices(1);
            expect(mesh.vertices()).to.be.null;
            expect(mesh.vertexCount()).to.equal(1);
        });

        it("should throw if passed vertex count is 0", function () {

            var fn = function () { mesh.vertices(0); };
            expect(fn).to.throw(B.Render.Error);
        });

        it("should set vertex data from an array", function () {

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            expect(mesh.vertices()).not.to.be.null;
            expect(mesh.vertexCount()).to.equal(2);
        });

        it("should set vertex data from a Float32Array", function () {

            var data = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);

            mesh.vertices(data);
            expect(mesh.vertices()).to.equal(data);
            expect(mesh.vertexCount()).to.equal(2);
        });

        it("should throw if data source is invalid", function () {

            var fn = function () { mesh.vertices({ data: [0, 0, 0, 0, 1, 0] }); };
            expect(fn).to.throw(B.Render.Error);
        });

        it("should not link vertex data sources if usage pattern is B.Render.Usage.DYNAMIC",
            function () {

                mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], R.Usage.DYNAMIC);
                expect(mesh.vertices()).to.be.null;
                expect(mesh.vertexCount()).to.equal(2);
            }
        );
    });

    describe("#updateVertices", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should throw if vertices are not initialized", function () {

            var fn = function () { mesh.updateVertices(); };
            expect(fn).to.throw(B.Render.Error);
        });

        it("should update vertices from existent data source if no params passed", function () {

            var source;

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            source = new Float32Array(mesh.vertices());

            mesh.updateVertices();
            expect(mesh.vertices()).to.deep.equal(source);
        });

        it("should updates vertices from new array source", function () {

            var source;

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            source = new Float32Array(mesh.vertices());

            mesh.updateVertices([1, 1, 1, 0, -1, 0, 2, 0, 2, 0, -1, 0]);
            expect(mesh.vertices()).to.not.deep.equal(source);
        });

        it("should updates vertices from new array source with given offset", function () {

            var source;

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            source = new Float32Array(mesh.vertices());

            source.set([2, 3], 3);
            mesh.updateVertices([2, 3], 3);
            expect(mesh.vertices()).to.deep.equal(source);
        });

        it("should updates vertices from a new Float32Array source", function () {

            var source;

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            source = new Float32Array(mesh.vertices());

            mesh.updateVertices(new Float32Array([1, 1, 1, 0, -1, 0, 2, 0, 2, 0, -1, 0]));
            expect(mesh.vertices()).to.not.deep.equal(source);
        });

        it("should updates vertices from a new Float32Array source with given offset", function () {

            var source;

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            source = new Float32Array(mesh.vertices());

            source.set([2, 3], 3);
            mesh.updateVertices(new Float32Array([2, 3]), 3);
            expect(mesh.vertices()).to.deep.equal(source);
        });

        it("should update only gl buffer vertices from a new source data if " +
            "data is originally initialized to 0",
            function () {

                var source = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);

                mesh.vertices(2);
                mesh.updateVertices(source);
                expect(mesh.vertices()).to.be.null;
                expect(mesh.vertexCount()).to.equal(2);
            }
        );

        it("should throw if source data has invalid type", function () {

            var fn = function () { mesh.updateVertices(1, 3); };

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is not Float32Array", function () {

            var fn = function () { mesh.updateVertices(new Int32Array([1, 0], 3)); };

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is out of range", function () {

            var fn = function () { mesh.updateVertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 2]); };

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is out of range [offset]", function () {

            var fn = function () { mesh.updateVertices([1, 1], 12); };

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should do not update any buffer if no params passed and" +
            " source data is initialized with B.Render.Usage.DYNAMIC",
            function () {

                mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], R.Usage.DYNAMIC);
                mesh.updateVertices();
                expect(mesh.vertices()).to.be.null;
                expect(mesh.vertexCount()).to.equal(2);
            }
        );

        it("should update only gl buffer from new data source if source data is initialized " +
            "with B.Render.Usage.DYNAMIC",
            function () {

                mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], R.Usage.DYNAMIC);
                mesh.updateVertices([1, 1], 1);
                expect(mesh.vertices()).to.be.null;
                expect(mesh.vertexCount()).to.equal(2);
            }
        );
    });

    describe("#flushVertices", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should not throw if vertices are not initialized", function () {

            var fn = function () { mesh.flushVertices(); };
            expect(fn).to.not.throw();
        });

        it("should flush linked vertex data source", function () {

            mesh.vertices([0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
            expect(mesh.vertices(), "before flush").to.not.be.null;

            mesh.flushVertices();
            expect(mesh.vertices(), "after flush").to.be.null;
        });
    });

    describe("#indices", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should return empty indices list if data are set yet", function () {

            expect(mesh.indices()).to.be.null;
            expect(mesh.indexCount()).to.equal(0);
        });

        it("should allocate specified index count if number is passed", function () {

            mesh.indices(3);
            expect(mesh.indices()).to.be.null;
            expect(mesh.indexCount()).to.equal(3);
            expect(mesh.index()).to.equal(R.Index.USHORT);
        });

        it("should throw if passed index count is 0", function () {

            var fn = function () { mesh.indices(0); };
            expect(fn).to.throw(B.Render.Error);
        });

        it("should set index data from an array", function () {

            mesh.indices([0, 1, 2]);
            expect(mesh.indices()).not.to.be.null;
            expect(mesh.indexCount()).to.equal(3);
            expect(mesh.index()).to.equal(R.Index.USHORT);
        });

        it("should set index data from Uint16Array", function () {

            var data = new Uint16Array([0, 1, 2, 3, 4, 5]);

            mesh.indices(data);
            expect(mesh.indices()).to.equal(data);
            expect(mesh.indexCount()).to.equal(6);
            expect(mesh.index()).to.equal(R.Index.USHORT);
        });

        it("should set index data from an Uint32Array if 32-bit indices are supported",
            sinon.test(function () {

                var data = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);

                this.stub(device, "caps").returns({ indexUInt: true });
                mesh.indices(data);
                expect(mesh.indices()).to.equal(data);
                expect(mesh.indexCount()).to.equal(9);
                expect(mesh.index()).to.equal(R.Index.UINT);
            })
        );

        it("should throw if index data is set from an Uint32Array " +
            "but 32-bit indices are not supported",
            sinon.test(function () {

                var fn = function () { mesh.indices(new Uint32Array([0, 1, 2])); };

                this.stub(device, "caps").returns({ indexUInt: false });
                expect(fn).to.throw(B.Render.Error);
            })
        );

        it("should throw if data source is invalid", function () {

            var fn = function () { mesh.indices({ data: [0, 1, 2] }); };
            expect(fn).to.throw(B.Render.Error);
        });

        it("should not link index data sources if usage pattern is B.Render.Usage.DYNAMIC",
            function () {

                mesh.indices([0, 1, 2], R.Usage.DYNAMIC);
                expect(mesh.indices()).to.be.null;
                expect(mesh.indexCount()).to.equal(3);
                expect(mesh.index()).to.equal(R.Index.USHORT);
            }
        );
    });

    describe("#updateIndices", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should throw if indices are not initialized", function () {

            var fn = function () { mesh.updateIndices(); };
            expect(fn).to.throw(B.Render.Error);
        });

        it("should update indices from existent data source if no params passed", function () {

            var source;

            mesh.indices([0, 1, 2, 3, 4, 5]);
            source = new Uint16Array(mesh.indices());

            mesh.updateIndices();
            expect(mesh.indices()).to.deep.equal(source);
        });

        it("should updates indices from a new array source", function () {

            var source;

            mesh.indices([0, 1, 2, 3, 4, 5]);
            source = new Uint16Array(mesh.indices());

            mesh.updateIndices([0, 2, 1, 5, 4, 3]);
            expect(mesh.indices()).to.not.deep.equal(source);
        });

        it("should updates indices from a new array source with given offset", function () {

            var source;

            mesh.indices([0, 1, 2, 3, 4, 5]);
            source = new Uint16Array(mesh.indices());

            source.set([4, 3], 3);
            mesh.updateIndices([4, 3], 3);
            expect(mesh.indices()).to.deep.equal(source);
        });

        it("should updates indices from a new array source " +
            "[source data is initialized with B.Render.Index.UINT]",
            function () {

                var source;

                mesh.indices(new Uint32Array([0, 1, 2, 3, 4, 5]));
                source = new Uint32Array(mesh.indices());

                mesh.updateIndices([0, 2, 1, 5, 4, 3]);
                expect(mesh.indices()).to.not.deep.equal(source);
            }
        );

        it("should updates indices from a new array source with given offset " +
            "[source data is initialized with B.Render.Index.UINT",
            function () {

                var source;

                mesh.indices(new Uint32Array([0, 1, 2, 3, 4, 5]));
                source = new Uint32Array(mesh.indices());

                source.set([4, 3], 3);
                mesh.updateIndices([4, 3], 3);
                expect(mesh.indices()).to.deep.equal(source);
            }
        );

        it("should updates indices from a new Uint16Array source", function () {

            var source;

            mesh.indices([0, 1, 2, 3, 4, 5]);
            source = new Uint16Array(mesh.indices());

            mesh.updateIndices(new Uint16Array([0, 2, 1, 5, 4, 3]));
            expect(mesh.indices()).to.not.deep.equal(source);
        });

        it("should updates indices from a new Uint16Array source with given offset", function () {

            var source;

            mesh.indices([0, 1, 2, 3, 4, 5]);
            source = new Uint16Array(mesh.indices());

            source.set([4, 3], 3);
            mesh.updateIndices(new Uint16Array([4, 3]), 3);
            expect(mesh.indices()).to.deep.equal(source);
        });

        it("should updates indices from a new Uint32Array source", function () {

            var source;

            mesh.indices(new Uint32Array([0, 1, 2, 3, 4, 5]));
            source = new Uint32Array(mesh.indices());

            mesh.updateIndices(new Uint32Array([0, 2, 1, 5, 4, 3]));
            expect(mesh.indices()).to.not.deep.equal(source);
        });

        it("should updates indices from a new Uint32Array source with given offset", function () {

            var source;

            mesh.indices(new Uint32Array([0, 1, 2, 3, 4, 5]));
            source = new Uint32Array(mesh.indices());

            source.set([4, 3], 3);
            mesh.updateIndices(new Uint32Array([4, 3]), 3);
            expect(mesh.indices()).to.deep.equal(source);
        });

        it("should update only gl buffer indices from a new source data if " +
            "data is originally initialized to 0",
            function () {

                var source = new Uint16Array([0, 1, 2]);

                mesh.indices(3);
                mesh.updateIndices(source);
                expect(mesh.indices()).to.be.null;
                expect(mesh.indexCount()).to.equal(3);
            }
        );

        it("should throw if source data has invalid type", function () {

            var fn = function () { mesh.updateIndices(1, 3); };

            mesh.indices([0, 1, 2, 3, 4, 5]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is initialized with B.Render.Index.USHORT " +
            "but Uint32Array source is passed", function () {

            var fn = function () { mesh.updateIndices(new Uint32Array([1, 0], 3)); };

            mesh.indices([0, 1, 2, 3, 4, 5]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is initialized with B.Render.Index.UINT " +
            "but Uint16Array source is passed", function () {

            var fn = function () { mesh.updateIndices(new Uint16Array([1, 0], 3)); };

            mesh.indices(new Uint32Array([0, 1, 2, 3, 4, 5]));
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is out of range", function () {

            var fn = function () { mesh.updateIndices([0, 1, 2, 3, 4, 5, 6]); };

            mesh.indices([0, 1, 2, 3, 4, 5]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if source data is out of range [offset]", function () {

            var fn = function () { mesh.updateIndices([3, 6], 5); };

            mesh.indices([0, 1, 2, 3, 4, 5]);
            expect(fn).to.throw(B.Render.Error);
        });

        it("should do not update any buffer if no params passed and " +
            "source data is initialized with B.Render.Usage.DYNAMIC",
            function () {

                mesh.indices([0, 1, 2, 3, 4, 5], R.Usage.DYNAMIC);
                mesh.updateIndices();
                expect(mesh.indices()).to.be.null;
                expect(mesh.indexCount()).to.equal(6);
            }
        );

        it("should update only gl buffer from new data source if source data is initialized " +
            "with B.Render.Usage.DYNAMIC",
            function () {

                mesh.indices([0, 1, 2, 3, 4, 5], R.Usage.DYNAMIC);
                mesh.updateIndices([2, 1], 1);
                expect(mesh.indices()).to.be.null;
                expect(mesh.indexCount()).to.equal(6);
            }
        );
    });

    describe("#flushIndices", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should not throw if indices are not initialized", function () {

            var fn = function () { mesh.flushIndices(); };
            expect(fn).to.not.throw();
        });

        it("should flush linked index data source", function () {

            mesh.indices([0, 1, 2]);
            expect(mesh.indices(), "before flush").to.not.be.null;

            mesh.flushIndices();
            expect(mesh.indices(), "after flush").to.be.null;
        });
    });

    describe("#primitive", function () {

        var primitivesToStr = B.Test.primitivesToStr,
            primitives = [
                P.POINT,
                P.LINE,
                P.TRIANGLE
            ],
            mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should be B.Render.Primitive.TRIANGLE by default", function () {

            expect(mesh.primitive()).to.equal(P.TRIANGLE);
        });

        it("should set primitive", function () {

            var primitive, i, l;

            for(i = 0, l = primitives.length; i < l; i += 1) {

                primitive = primitives[i];
                mesh.primitive(primitive);
                expect(mesh.primitive(), primitivesToStr(mesh.primitive())).
                    to.equal(primitive, primitivesToStr(primitive));
            }
        });
    });

    describe("#primitiveCount", function () {

        var mesh;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should return 0 if no data is set yet", function () {

            expect(mesh.primitiveCount()).to.be.a("number").and.equal(0);
        });

        it("should recalculate primitive count when primitive type is changed", function () {

            mesh.indices([0, 1, 2, 3, 4, 5]);

            mesh.primitive(P.TRIANGLE);
            expect(mesh.primitiveCount(), "TRIANGLE").to.equal(2);

            mesh.primitive(P.LINE);
            expect(mesh.primitiveCount(), "LINE").to.equal(3);

            mesh.primitive(P.POINT);
            expect(mesh.primitiveCount(), "POINT").to.equal(6);
        });

        it("should recalculate primitive count when index data is set", function () {

            mesh.primitive(P.LINE);
            mesh.indices([0, 1, 2, 3, 4, 5]);
            expect(mesh.primitiveCount(), "6 indices").to.equal(3);
            mesh.indices([0, 1]);
            expect(mesh.primitiveCount(), "2 indices").to.equal(1);
            mesh.indices([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(mesh.primitiveCount(), "10 indices").to.equal(5);
        });
    });

    describe("#bounds", function () {

        var mesh, bounds;

        before(function () {
            mesh = device.makeMesh();
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should return empty bounds if no bounds are set or calculated yet", function () {

            bounds = mesh.bounds();
            expect(bounds).to.be.instanceof(M.AABox);
            expect(bounds, "min").to.have.property("min").that.equalByComponents(M.Vector3.INF);
            expect(bounds, "max").to.have.property("max").that.equalByComponents(M.Vector3.N_INF);
        });

        it("should set passed bounds", function () {

            var box = new M.makeAABox(M.makeVector3(-100, -20, -100), M.makeVector3(100, 20, 100));

            mesh.bounds(box);
            bounds = mesh.bounds();
            expect(bounds).to.be.instanceof(M.AABox);
            expect(bounds).to.equalByComponents(box);
        });
    });

    describe("#computeBounds", function () {

        var mesh, bounds;

        before(function () {
            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("normal", A.NORMAL).
                attribute("uv", A.UV).
                vertices([
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 5, 0, 0, 1, 0, 1, 0,
                    5, 5, 5, 0, 1, 1, 0, 1
                ]);
        });

        after(function () {
            mesh && mesh.free();
        });

        it("should compute bounds from vertex positions", function () {

            mesh.computeBounds();

            bounds = mesh.bounds();
            expect(bounds).to.be.instanceof(M.AABox);
            expect(bounds).to.equalByComponents(0, 0, 0, 5, 5, 5);
        });

        it("should throw if the position attribute is not found", function () {

            var fn = function () { mesh.computeBounds("someData"); };

            mesh.attribute("position", A.VECTOR3);

            expect(fn).to.throw(B.Render.Error);
        });

        it("should throw if a vertex data source is not linked", function () {

            var fn = function () { mesh.computeBounds("someData"); };

            mesh.attribute("position", A.POSITION);
            mesh.flushVertices();

            expect(fn).to.throw(B.Render.Error);
        });
    });

    describe("frame execution", function () {

        var
            vs = ""+
                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            makeFrame = function (mesh) {

                instance = device.instance("material", mesh).
                    transform(M.makeMatrix4().translation(100, 50, 50));

                expect(function () {
                    device.frame();
                },
                "frame execution").to.not.throw();
            },

            material, pass, stage, target, instance, mesh,
            glProgram, gl;

        before(function () {

            target = device.makeTarget(F.RGBA, F.DEPTH, 128, 128);
            stage = device.stage("new").
                view(M.makeMatrix4().lookAt(M.Vector3.ZERO, M.Vector3.Z, M.Vector3.Y)).
                proj(M.makeMatrix4().orthographic(300, 200, 10, 100)).
                output(target);
            pass = device.makePass(vs, fs);
            material = device.material("material").pass(stage, pass);

            glProgram = pass._glProgram;
            gl = device._gl;
        });

        afterEach(function () {
            mesh && mesh.free();
            instance && instance.free();
        });

        after(function () {
            target && target.free();
            stage && stage.free();
            pass && pass.free();
            material && material.free();
        });

        it("should throw if pass and mesh attributes do not match", sinon.test(function () {

            var programStub, attrStub;

            programStub = this.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub = this.stub(gl, "getActiveAttrib");
            attrStub.returns({});
            attrStub.withArgs(glProgram, 0).returns({ type: gl.FLOAT_VEC3, name: "float3Attr" });

            pass.compile(vs, fs);

            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                vertices([
                    0, 0, 0,
                    0, 5, 0,
                    5, 5, 5
                ]).
                indices([0, 1, 2]).
                computeBounds();
            instance = device.instance("material", mesh).
                transform(M.makeMatrix4().translation(100, 50, 50));

            expect(function () {
                device.frame();
            },
            "frame execution").to.throw(R.Error);
        }));

        it("should draw [pass and mesh attributes match]", sinon.test(function () {

            var programStub, attrStub;

            programStub = this.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(5);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub = this.stub(gl, "getActiveAttrib");
            attrStub.returns({});
            attrStub.withArgs(glProgram, 0).returns({ type: gl.FLOAT_VEC3, name: "position" });
            attrStub.withArgs(glProgram, 1).returns({ type: gl.FLOAT_VEC2, name: "uv" });
            attrStub.withArgs(glProgram, 2).returns({ type: gl.FLOAT, name: "factor" });
            attrStub.withArgs(glProgram, 3).returns({ type: gl.FLOAT_VEC4, name: "some" });
            attrStub.withArgs(glProgram, 4).returns({ type: gl.FLOAT_VEC4, name: "color" });

            pass.compile(vs, fs);

            mesh = device.makeMesh().
                attribute("position", A.POSITION).
                attribute("uv", A.UV).
                attribute("factor", A.FLOAT).
                attribute("some", A.VECTOR4).
                attribute("color", A.UINT).
                vertices([
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0
                ]).
                indices([0, 1, 2]).
                computeBounds();

            makeFrame(mesh);
        }));

        it("should draw with default pass attributes if not specified at mesh",
            sinon.test(function () {

                var programStub, attrStub;

                programStub = this.stub(gl, "getProgramParameter");
                programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(5);
                programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
                programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

                attrStub = this.stub(gl, "getActiveAttrib");
                attrStub.returns({});
                attrStub.withArgs(glProgram, 0).returns({ type: gl.FLOAT_VEC3, name: "position" });
                attrStub.withArgs(glProgram, 1).returns({ type: gl.FLOAT, name: "floatAttr" });
                attrStub.withArgs(glProgram, 2).returns({ type: gl.FLOAT_VEC2, name: "vec2Attr" });
                attrStub.withArgs(glProgram, 3).returns({ type: gl.FLOAT_VEC3, name: "vec3Attr" });
                attrStub.withArgs(glProgram, 4).returns({ type: gl.FLOAT_VEC4, name: "vec4Attr" });

                pass.compile(vs, fs);

                mesh = device.makeMesh().
                    attribute("position", A.POSITION).
                    vertices([
                        0, 0, 0,
                        0, 5, 0,
                        5, 5, 5
                    ]).
                    indices([0, 1, 2]).
                    computeBounds();

                makeFrame(mesh);
            })
        );
    });
});