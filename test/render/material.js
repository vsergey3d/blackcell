
describe("B.Render.Material", function () {

    var M = B.Math,
        R = B.Render,
        F = R.Format,

        canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.Material).to.exist;
    });

    describe("#constructor", function () {

        it("should be created by device", function () {

            var material = device.material("newMaterial");

            expect(material).to.be.instanceof(R.Material);
            expect(material.device()).to.equal(device);
            expect(material.name()).to.equal("newMaterial");
        });
    });

    describe("#free", function () {

        it("should free all internal data and detach  from linked rendering device", function () {

            var material = device.material("newMaterial");

            material.free();
            expect(material.device()).to.not.equal(device);
        });
    });

    describe("#pass", function () {

        var vs = ""+
                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            material, pass0, pass1, stage0, stage1;

        before(function () {
            material = device.material("newMaterial");
            pass0 = device.makePass(vs, fs);
            pass1 = device.makePass(vs, fs);
            stage0 = device.stage("newStage");
            stage1 = device.stage("anotherStage");
        });

        after(function () {
            stage0 && stage0.free();
            stage1 && stage1.free();
            pass0 && pass0.free();
            material && material.free();
        });

        it("should return null if pass is not found", function () {

            expect(material.pass("unknown")).to.equal(null);
        });

        it("should set a pass to a stage by name", function () {

            material.pass("newStage", pass0);
            expect(material.pass("newStage")).to.equal(pass0);
            expect(material.pass(stage0)).to.equal(pass0);
        });

        it("should set a pass to a stage", function () {

            material.pass(stage1, pass1);
            expect(material.pass(stage1)).to.equal(pass1);
            expect(material.pass("anotherStage")).to.equal(pass1);
        });

        it("should replace old pass with a new one", function () {

            material.pass("anotherStage", pass0);
            expect(material.pass(stage1)).to.equal(pass0);
            expect(material.pass("anotherStage")).to.equal(pass0);
        });

        it("should detach pass from a stage if null passed", function () {

            material.pass("newStage", null);
            expect(material.pass("newStage")).to.equal(null);
            expect(material.pass(stage0)).to.equal(null);
        });

        it("should set an array of passes to a stage", function () {

            material.pass(["newStage", "anotherStage"], pass0);
            expect(material.pass("newStage")).to.equal(pass0);
            expect(material.pass("anotherStage")).to.equal(pass0);
        });
    });

    describe("#uniform", function () {

        var material;

        before(function () {
            material = device.material("newMaterial");
        });

        after(function () {
            material && material.free();
        });

        it("should return null if uniform is not found", function () {

            expect(material.uniform("unknown")).to.equal(null);
        });

        it("should set uniform value", function () {

            var uniforms = {
                    "number": 1.5,
                    "Vector2": M.makeVector2(0.1, 0.9),
                    "Vector3": M.makeVector3(1.0, 0.5, 1.0),
                    "Vector4": M.makeVector4(0.0, 0.0, 0.0, 1.0),
                    "Matrix3": M.makeMatrix3(
                        1.0, 0.0, 0.0,
                        0.0, 1.0, 0.0,
                        5.0, 5.0, 1.0),
                    "Matrix4": M.makeMatrix4(
                        1.0, 0.5, 0.0, 0.0,
                        0.5, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        5.0, 5.0, 5.0,1.0),
                    "Texture": device.makeTexture(F.RGBA, 128, 128, 1),
                    "Depth": device.makeDepth(F.DEPTH, 128, 128)
                },
                uniform;

            for (var name in uniforms) {

                uniform = uniforms[name];

                material.uniform(name, uniform);
                expect(material.uniform(name), name).to.equal(uniform);
            }
        });

        it("should remove existing uniform", function () {

            material.uniform("number", null);

            expect(material.uniform("number")).to.equal(null);
        });
    });

    describe("#uniforms", function () {

        var material;

        before(function () {
            material = device.material("newMaterial");
        });

        after(function () {
            material && material.free();
        });

        it("should return empty array if no uniforms are set yet", function () {

            expect(material.uniforms()).to.be.empty;
        });

        it("should return an array of names", function () {

            var uniforms = ["u0", "u1", "u2", "u3"];

            uniforms.forEach(function (name) {
                material.uniform(name, 1.0);
            });

            expect(material.uniforms()).to.deep.equal(uniforms);
        });
    });

    describe("uniforms binding", function () {

        var vs = ""+
                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            pass, material, spy;

        before(function () {
            pass = device.makePass(vs, fs);
            material = device.material("newMaterial");

            spy = sinon.spy(pass, "_uniform");
        });

        after(function () {
            material && material.free();
            pass && pass.free();
            spy.restore();
        });

        it("should bind uniforms", function () {

            var uniforms = {
                    "number": 1.5,
                    "Vector2": M.makeVector2(0.1, 0.9),
                    "Vector3": M.makeVector3(1.0, 0.5, 1.0),
                    "Vector4": M.makeVector4(0.0, 0.0, 0.0, 1.0),
                    "Matrix3": M.makeMatrix3(
                        1.0, 0.0, 0.0,
                        0.0, 1.0, 0.0,
                        5.0, 5.0, 1.0),
                    "Matrix4": M.makeMatrix4(
                        1.0, 0.5, 0.0, 0.0,
                        0.5, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        5.0, 5.0, 5.0,1.0),
                    "Texture": device.makeTexture(F.RGBA, 128, 128, 1),
                    "Depth": device.makeDepth(F.DEPTH, 128, 128)
                },
                value;

            for (var name in uniforms) {

                value = uniforms[name];

                material.uniform("uniform", value);
                material._bindUniforms(pass);
                expect(spy, name).to.be.calledWith("uniform", value);
                spy.reset();
            }
        });
    });
});