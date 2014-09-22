
describe("B.Render.Instance", function () {

    var M = B.Math,
        R = B.Render,
        F = R.Format,

        canvas, device, material, mesh;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        mesh = device.makeMesh().
            attribute("position", R.Attribute.POSITION).
            vertices([
                0, 0, 0,
                0, 5, 0,
                5, 5, 5
            ]).
            computeBounds();
        material = device.material("material");
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.Instance).to.exist;
    });

    describe("#constructor", function () {

        it("should be created by device", function () {

            var transform = M.makeMatrix4().translation(3.0, 4.0, 5.0),
                bounds = mesh.bounds().clone().transform(transform),
                instance;

            instance = device.instance("material", mesh, transform, false);

            expect(instance).to.be.instanceof(B.Render.Instance);
            expect(instance.device(), "device").to.equal(device);
            expect(instance.mesh(), "mesh").to.equal(mesh);
            expect(instance.bounds(), "bounds").to.equalByComponents(bounds);
            expect(instance.material(), "material").to.equal(material);
            expect(instance.transform(), "transform").to.equalByComponents(transform);
            expect(instance.culling(), "culling").to.equal(false);
        });

        it("should set transform to B.Math.Matrix4.IDENTITY and culling to true if not passed",
            function () {

                var instance = device.instance("material", mesh);
                expect(instance.transform(), "transform").to.equalByComponents(M.Matrix4.IDENTITY);
                expect(instance.culling(), "culling").to.equal(true);
            }
        );
    });

    describe("#free", function () {

        it("should free all internal data and detach linked rendering device", function () {

            var instance = device.instance("material", mesh);

            instance.free();
            expect(instance.device(), "device").to.not.equal(device);
        });
    });

    describe("#culling", function () {

        var instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        it("should be enabled by default", function () {
            expect(instance.culling()).to.be.true;
        });

        it("should disable frustum culling", function () {

            instance.culling(false);
            expect(instance.culling()).to.be.false;
        });

        it("should enable frustum culling", function () {

            instance.culling(true);
            expect(instance.culling()).to.be.true;
        });
    });

    describe("#transform", function () {

        var mxS = M.makeMatrix4().scale(2, 2, 2),
            mxR3 = M.makeMatrix3().rotationZ(Math.PI * 0.5),
            mxR = M.makeMatrix4().setMatrix3(mxR3),
            mxT = M.makeMatrix4().translation(1, 0, -1),
            mxSR = mxS.clone().mul(mxR),
            mxSRT = mxS.clone().mul(mxR).mul(mxT),

            instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        it("should be B.Math.Matrix4.IDENTITY by default", function () {
            expect(instance.transform()).to.equalByComponents(M.Matrix4.IDENTITY);
        });

        it("should add transformation", function () {

            instance.transform(mxS);
            expect(instance.transform(), "S").to.equalByComponents(mxS);

            instance.transform(mxR3);
            expect(instance.transform(), "S*R").to.equalByComponents(mxSR);

            instance.transform(mxT);
            expect(instance.transform(), "S*R*T").to.equalByComponents(mxSRT);
        });

        it("should recalculate bounds", function () {

            var bounds = mesh.bounds().clone().transform(mxSRT);

            expect(instance.bounds(), "bounds").to.equalByComponents(bounds);
        });
    });

    describe("#move", function () {

        var mxT1 = M.makeMatrix4().translation(1.5, 2.0, -10),
            mxT2 = M.makeMatrix4().translation(10, -2.0, 0.5).mul(mxT1),
            instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        afterEach(function () {
            instance.setTransform();
        });

        it("should move instance by a given offset vector", function () {

            instance.move(M.makeVector3(1.5, 2.0, -10));
            expect(instance.transform(), "1").to.equalByComponents(mxT1);

            instance.move(M.makeVector3(10, -2.0, 0.5));
            expect(instance.transform(), "2").to.equalByComponents(mxT2);
        });

        it("should move instance by given offsets", function () {

            instance.move(1.5, 2.0, -10);
            expect(instance.transform(), "1").to.equalByComponents(mxT1);

            instance.move(10, -2.0, 0.5);
            expect(instance.transform(), "2").to.equalByComponents(mxT2);
        });
    });

    describe("#rotate", function () {

        var HALF_PI = Math.PI * 0.5,
            mxR1 = M.makeMatrix4().rotationAxis(B.Math.Vector3.Y, HALF_PI),
            mxR2 = mxR1.clone().mul(M.makeMatrix4().rotationAxis(B.Math.Vector3.Z, -HALF_PI)),
            instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        afterEach(function () {
            instance.setTransform();
        });

        it("should rotate instance around an arbitrary axis", function () {

            instance.rotate(B.Math.Vector3.Y, HALF_PI);
            expect(instance.transform(), "1").to.be.closeByComponents(mxR1);

            instance.rotate(B.Math.Vector3.Z, -HALF_PI);
            expect(instance.transform(), "2").to.be.closeByComponents(mxR2);
        });

        it("should rotate instance by a canonized euler angles object", function () {

            instance.rotate(B.Math.makeAngles(HALF_PI, 0, 0));
            expect(instance.transform(), "1").to.be.closeByComponents(mxR1);

            instance.rotate(B.Math.makeAngles(0, 0, -HALF_PI));
            expect(instance.transform(), "2").to.be.closeByComponents(mxR2);
        });

        it("should rotate instance by a quaternion object", function () {

            instance.rotate(B.Math.makeQuaternion().fromAxisAngle(B.Math.Vector3.Y, HALF_PI));
            expect(instance.transform(), "1").to.be.closeByComponents(mxR1);

            instance.rotate(B.Math.makeQuaternion().fromAxisAngle(B.Math.Vector3.Z, -HALF_PI));
            expect(instance.transform(), "2").to.be.closeByComponents(mxR2);
        });
    });

    describe("#scale", function () {

        var mxS1 = M.makeMatrix4().scale(4, 1, 2),
            mxS2 = M.makeMatrix4().scale(1, 2, 0.5).mul(mxS1),
            mxSU = M.makeMatrix4().scale(5, 5, 5),
            instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        afterEach(function () {
            instance.setTransform();
        });

        it("should scale instance by a given coefficient vector", function () {

            instance.scale(M.makeVector3(4, 1, 2));
            expect(instance.transform(), "1").to.equalByComponents(mxS1);

            instance.scale(M.makeVector3(1, 2, 0.5));
            expect(instance.transform(), "2").to.equalByComponents(mxS2);
        });

        it("should scale instance by given coefficients", function () {

            instance.scale(4, 1, 2);
            expect(instance.transform(), "1").to.equalByComponents(mxS1);

            instance.scale(1, 2, 0.5);
            expect(instance.transform(), "2").to.equalByComponents(mxS2);
        });

        it("should scale uniformly instance by a given coefficient", function () {

            instance.scale(5);
            expect(instance.transform()).to.equalByComponents(mxSU);
        });
    });

    describe("#setTransform", function () {

        var mxS3 = M.makeMatrix3().scale(2, 2, 2),
            mxS = M.makeMatrix4().setMatrix3(mxS3),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            mxT = M.makeMatrix4().translation(1, 0, -1),

            instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        it("should set transformation", function () {

            instance.setTransform(mxS3);
            expect(instance.transform(), "S").to.equalByComponents(mxS);

            instance.setTransform(mxS);
            expect(instance.transform(), "S").to.equalByComponents(mxS);

            instance.setTransform(mxR);
            expect(instance.transform(), "R").to.equalByComponents(mxR);

            instance.setTransform(mxT);
            expect(instance.transform(), "T").to.equalByComponents(mxT);

            instance.setTransform();
            expect(instance.transform(), "identity").to.equalByComponents(M.Matrix4.IDENTITY);
        });
    });

    describe("#uniform", function () {

        var instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        it("should return null if uniform is not found", function () {

            expect(instance.uniform("unknown")).to.equal(null);
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

                instance.uniform(name, uniform);
                expect(instance.uniform(name), name).to.equal(uniform);
            }
        });

        it("should remove existing uniform", function () {

            instance.uniform("number", null);

            expect(instance.uniform("number")).to.equal(null);
        });
    });

    describe("#uniforms", function () {

        var instance;

        before(function () {
            instance = device.instance("material", mesh);
        });

        after(function () {
            instance && instance.free();
        });

        it("should return empty array if no uniforms are set yet", function () {

            expect(instance.uniforms()).to.be.empty;
        });

        it("should return an array of names", function () {

            var uniforms = ["u0", "u1", "u2", "u3"];

            uniforms.forEach(function (name) {
                instance.uniform(name, 1.0);
            });

            expect(instance.uniforms()).to.deep.equal(uniforms);
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
            mxS = M.makeMatrix4().scale(2, 2, 2),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            mxT = M.makeMatrix4().translation(1, 0, -1),
            transform = mxT.mul(mxR).mul(mxS),

            pass, instance, spy;

        before(function () {
            pass = device.makePass(vs, fs);
            instance = device.instance("material", mesh, transform);

            spy = sinon.spy(pass, "_uniform");
        });

        after(function () {
            instance && instance.free();
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

                instance.uniform("uniform", value);
                instance._bindUniforms(pass);
                expect(spy, name).to.be.calledWith("uniform", value);
                spy.reset();
            }
        });

        it("should set value automatically if uniform is one of defined placeholders", function () {

            var transform = instance.transform(),
                normalTransform = transform.getMatrix3().invert().transpose(),

                uniforms = [
                    {
                        "name": "TRANSFORM",
                        "placeholder": R.Instance.TRANSFORM,
                        "value": transform
                    },
                    {
                        "name": "NORMAL_TRANSFORM",
                        "placeholder": R.Instance.NORMAL_TRANSFORM,
                        "value": normalTransform
                    }
                ],
                uniform, i, l;

            for(i = 0, l = uniforms.length; i < l; i += 1) {

                uniform = uniforms[i];

                instance.uniform("uniform", uniform["placeholder"]);
                instance._bindUniforms(pass);
                expect(spy, uniform["name"]).to.be.calledWith("uniform", uniform["value"]);
                spy.reset();
            }
        });
    });
});