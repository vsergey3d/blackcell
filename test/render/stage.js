
describe("B.Render.Stage", function () {

    var M = B.Math,
        R = B.Render,
        F = R.Format,

        V3 = M.Vector3,

        makeFrame = function (stage) {

            stage && target && stage.output(target);
            expect(function () {
                device.frame();
            },
            "frame execution").to.not.throw();
        },
        canvas, device, target;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
        target = device.makeTarget(F.RGBA, F.DEPTH, 128, 128);
    });

    after(function () {
        target && target.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.Stage).to.exist;
    });

    describe("#constructor", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should be created by device", function () {

            expect(stage).to.be.instanceof(R.Stage);
            expect(stage.device()).to.equal(device);
            expect(stage.name()).to.equal("new");
        });
    });

    describe("#free", function () {

        it("should free mesh and detach rendering device", function () {

            var stage = device.stage("new");

            stage.free();
            expect(stage.device()).to.not.equal(device);
        });
    });

    describe("#output", function () {

        var targetColor, targetDepth, targetStencil, stage;

        before(function () {
            targetColor = device.makeTarget(F.RGBA, null, 128, 128);
            targetDepth = device.makeTarget(F.RGBA, F.DEPTH, 128, 128);
            targetStencil = device.makeTarget(F.RGBA, F.DEPTH_STENCIL, 128, 128);
            stage = device.stage("new");
        });

        after(function () {
            targetColor && targetColor.free();
            targetDepth && targetDepth.free();
            targetStencil && targetStencil.free();
            stage && stage.free();
        });

        it("should be null by default", function () {
            expect(stage.output()).to.be.null;
            makeFrame();
        });

        it("should set output target [color target]", function () {

            stage.output(targetColor);
            expect(stage.output()).to.equal(targetColor);
            makeFrame();
        });

        it("should set output target [depth target]", function () {

            stage.output(targetDepth);
            expect(stage.output()).to.equal(targetDepth);
            makeFrame();
        });

        it("should set output target [stencil target]", function () {

            stage.output(targetStencil);
            expect(stage.output()).to.equal(targetStencil);
            makeFrame();
        });
    });

    describe("#culling", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return true by default", function () {
            expect(stage.culling()).to.be.true;
        });

        it("should disable frustum culling", function () {

            stage.culling(false);
            expect(stage.culling()).to.be.false;
            makeFrame(stage);
        });

        it("should enable frustum culling", function () {

            stage.culling(true);
            expect(stage.culling()).to.be.true;
            makeFrame(stage);
        });
    });

    describe("#view", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should be identity matrix by default", function () {
            expect(stage.view()).to.equalByComponents(M.Matrix4.IDENTITY);
        });

        it("should set view matrix", function () {

            var mx = M.makeMatrix4().lookAt(V3.ZERO, V3.N_Z, V3.Y);

            stage.view(mx);
            expect(stage.view(), "view").to.equalByComponents(mx);
            expect(stage.viewInv(), "viewInv").to.equalByComponents(mx.clone().invert());
            expect(stage.viewPos(), "viewPos").to.equalByComponents(mx.getPosition());
            expect(stage.viewDir(), "viewDir").to.equalByComponents(
                mx.getAxisZ().negate().normalize());
            makeFrame(stage);
        });

        it("should set view matrix (culling disabled)", function () {

            var mx = M.makeMatrix4().lookAt(V3.ZERO, V3.N_Z, V3.Y);

            stage.culling(false).view(mx);
            expect(stage.view(), "view").to.equalByComponents(mx);
            expect(stage.viewInv(), "viewInv").to.equalByComponents(mx.clone().invert());
            expect(stage.viewPos(), "viewPos").to.equalByComponents(mx.getPosition());
            expect(stage.viewDir(), "viewDir").to.equalByComponents(
                mx.getAxisZ().negate().normalize());
            makeFrame(stage);
        });
    });

    describe("#proj", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should be identity matrix by default", function () {
            expect(stage.proj()).to.equalByComponents(M.Matrix4.IDENTITY);
        });

        it("should set projection matrix", function () {

            var mx = M.makeMatrix4().perspective(Math.PI * 0.5, 320, 0.1, 100);

            stage.proj(mx);
            expect(stage.proj()).to.equalByComponents(mx);
            makeFrame(stage);
        });

        it("should set projection matrix (culling disabled)", function () {

            var mx = M.makeMatrix4().perspective(Math.PI * 0.5, 320, 0.1, 100);

            stage.culling(false).proj(mx);
            expect(stage.proj()).to.equalByComponents(mx);
            makeFrame(stage);
        });
    });

    describe("#viewProj", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should be identity matrix by default", function () {
            expect(stage.viewProj()).to.equalByComponents(M.Matrix4.IDENTITY);
        });

        it("should return view-projection matrix", function () {

            var view = M.makeMatrix4().lookAt(V3.ZERO, V3.N_Z, V3.Y),
                proj = M.makeMatrix4().perspective(Math.PI*0.5, 320, 0.1, 100),
                viewProj = M.makeMatrix4().copy(view).mul(proj);

            stage.view(view).proj(proj);
            expect(stage.viewProj()).to.be.closeByComponents(viewProj);
        });
    });

    describe("#unproject", function () {

        var width = 300,
            height = 200,
            zNear = 10,
            zFar = 100,

            view, proj,
            target, stage;

        before(function () {

            view = M.makeMatrix4().lookAt(V3.ZERO, V3.N_Z, V3.Y);
            proj = M.makeMatrix4().orthographic(width, height, zNear, zFar);

            target = device.makeTarget(F.RGBA, F.DEPTH, 128, 128);
            stage = device.stage("new");

            stage.view(view).proj(proj);
            stage.output(target);
        });

        after(function () {
            target && target.free();
            stage && stage.free();
        });

        it("should return null if the point is outside of the drawable area", function () {

            expect(stage.unproject(-10, 100), "x < vx").to.be.null;
            expect(stage.unproject(130, 100), "x > vx + vw").to.be.null;
            expect(stage.unproject(100, -10), "y < vy").to.be.null;
            expect(stage.unproject(100, 130), "y > vy + vh").to.be.null;
        });

        it("should return 3D-coordinates of pixel position", function () {

            expect(stage.unproject(0, 0), "top-left").
                to.be.closeByComponents(-width / 2, height / 2, -zFar);
            expect(stage.unproject(0, 128), "bottom-left").
                to.be.closeByComponents(-width / 2, -height / 2, -zFar);
            expect(stage.unproject(128, 0), "top-right").
                to.be.closeByComponents(width / 2, height / 2, -zFar);
            expect(stage.unproject(128, 128), "bottom-right").
                to.be.closeByComponents(width / 2, -height / 2, -zFar);
            expect(stage.unproject(64, 64), "center").to.be.closeByComponents(0, 0, -zFar);
        });

        it("should return null if viewport is set and the point is outside of the viewport rect",
            function () {

                stage.viewport(30, 30, 70, 70);
                expect(stage.unproject(20, 100), "x < vx").to.be.null;
                expect(stage.unproject(110, 100), "x > vx + vw").to.be.null;
                expect(stage.unproject(100, 20), "y < vy").to.be.null;
                expect(stage.unproject(100, 110), "y > vy + vh").to.be.null;
                stage.viewport(false);
            }
        );

        it("should return 3D-coordinates of pixel position [viewport]", function () {

            stage.viewport(32, 32, 64, 64);
            expect(stage.unproject(32, 32), "top-left").
                to.be.closeByComponents(-width / 2, height / 2, -zFar);
            expect(stage.unproject(32, 96), "bottom-left").
                to.be.closeByComponents(-width / 2, -height / 2, -zFar);
            expect(stage.unproject(96, 32), "top-right").
                to.be.closeByComponents(width / 2, height / 2, -zFar);
            expect(stage.unproject(96, 96), "bottom-right").
                to.be.closeByComponents(width / 2, -height / 2, -zFar);
            expect(stage.unproject(64, 64), "center").to.be.closeByComponents(0, 0, -zFar);
            stage.viewport(false);
        });

        it("should return null if scissor is enabled and the point is outside of the scissor rect",
            function () {

                stage.scissor(30, 30, 70, 70);
                expect(stage.unproject(20, 100), "x < vx").to.be.null;
                expect(stage.unproject(110, 100), "x > vx + vw").to.be.null;
                expect(stage.unproject(100, 20), "y < vy").to.be.null;
                expect(stage.unproject(100, 110), "y > vy + vh").to.be.null;
                stage.scissor(false);
            }
        );

        it("should set 3D-coordinates of pixel position to passed vector", function () {

            var res = M.makeVector3();

            stage.unproject(0, 0, res);
            expect(res).to.be.closeByComponents(-width / 2, height / 2, -zFar);
        });

        it("should return null if output target is not specified", function () {

            stage.output(null);
            expect(stage.unproject()).to.be.null;
        });
    });

    describe("#viewport", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return false by default", function () {
            expect(stage.viewport()).to.be.false;
            makeFrame(stage);
        });

        it("should set viewport", function () {

            stage.viewport(100, 100, 500, 500);
            expect(stage.viewport()).to.deep.equal({ x: 100, y: 100, width: 500, height: 500 });
            makeFrame(stage);
        });

        it("should set default viewport if false passed", function () {

            stage.viewport(false);
            expect(stage.viewport()).to.be.false;
            makeFrame(stage);
        });
    });

    describe("#depthRange", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return false by default", function () {
            expect(stage.depthRange()).to.be.false;
            makeFrame(stage);
        });

        it("should set depth range", function () {

            stage.depthRange(0.1, 0.5);
            expect(stage.depthRange()).to.deep.equal({ near: 0.1, far: 0.5 });
            makeFrame(stage);
        });

        it("should set default depth range if false passed", function () {

            stage.depthRange(false);
            expect(stage.depthRange()).to.be.false;
            makeFrame(stage);
        });
    });

    describe("#scissor", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should be disabled by default", function () {
            expect(stage.scissor()).to.be.false;
        });

        it("should set scissor rect", function () {

            stage.scissor(100, 100, 500, 500);
            expect(stage.scissor()).to.deep.equal({ x: 100, y: 100, width: 500, height: 500 });
            makeFrame(stage);
        });

        it("should disable scissor if false passed", function () {

            stage.scissor(false);
            expect(stage.scissor()).to.be.false;
            makeFrame(stage);
        });
    });

    describe("#write", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return {color: B.Render.Mask.RGBA, depth: true, stencil: 1} by default",
            function () {
                expect(stage.write()).to.deep.equal(
                    { color: B.Render.Mask.RGBA, depth: true, stencil: 1 }
                );
                makeFrame(stage);
            }
        );

        it("should set write masks", function () {

            stage.write(B.Render.Mask.R | B.Render.Mask.G, false, 0);
            expect(stage.write()).to.deep.equal(
                { color: B.Render.Mask.R | B.Render.Mask.G, depth: false, stencil: 0 }
            );
            makeFrame(stage);
        });
    });

    describe("#cleanup", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return { color: B.Math.Color.WHITE, depth: 1, stencil: 0 } by default",
            function () {
                expect(stage.cleanup()).to.deep.equal(
                    { color: M.Color.WHITE, depth: 1, stencil: 0 }
                );
            }
        );

        it("should set cleanup values", function () {

            stage.cleanup(M.Color.BLACK, 0, 1);
            expect(stage.cleanup()).to.deep.equal({ color: M.Color.BLACK, depth: 0, stencil: 1 });
            makeFrame(stage);
        });

        it("should disable cleanup if false passed", function () {

            stage.cleanup(false);
            expect(stage.cleanup()).to.be.false;
            makeFrame(stage);
        });
    });

    describe("#before & #after", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should set/get before & after handlers", function () {

            var beforeHandler = sinon.spy(),
                afterHandler = sinon.spy();

            stage.before(beforeHandler);
            stage.after(afterHandler);

            expect(stage.before()).to.equal(beforeHandler);
            expect(stage.after()).to.equal(afterHandler);

            makeFrame(stage);

            expect(beforeHandler).to.be.called;
            expect(beforeHandler.getCall(0).args[0]).to.equal(stage);

            expect(afterHandler, "node1").to.be.called.and.calledAfter(beforeHandler);
            expect(afterHandler.getCall(0).args[0]).to.equal(stage);
        });

        it("should remove before handler", function () {

            var beforeHandler = sinon.spy();

            stage.before(beforeHandler);
            stage.before(null);

            expect(stage.before()).to.equal(null);

            makeFrame(stage);

            expect(beforeHandler).not.to.be.called;
        });

        it("should remove after handler", function () {

            var afterHandler = sinon.spy();

            stage.after(afterHandler);
            stage.after(null);

            expect(stage.after()).to.equal(null);

            makeFrame(stage);

            expect(afterHandler).not.to.be.called;
        });
    });

    describe("#uniform", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return null if uniform is not found", function () {

            expect(stage.uniform("unknown")).to.equal(null);
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

                stage.uniform(name, uniform);
                expect(stage.uniform(name), name).to.equal(uniform);
            }
        });

        it("should remove existing uniform", function () {

            stage.uniform("number", null);

            expect(stage.uniform("number")).to.equal(null);
        });
    });

    describe("#uniforms", function () {

        var stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should return empty array if no uniforms are set yet", function () {

            expect(stage.uniforms()).to.be.empty;
        });

        it("should return an array of names", function () {

            var uniforms = ["u0", "u1", "u2", "u3"];

            uniforms.forEach(function (name) {
                stage.uniform(name, 1.0);
            });

            expect(stage.uniforms()).to.deep.equal(uniforms);
        });
    });

    describe("uniforms binding", function () {

        var pass, stage, spy;

        before(function () {

            pass = B.Test.makeTestPass(device);

            stage = device.stage("new").
                view(M.makeMatrix4().lookAt(V3.ZERO, V3.N_Z, V3.Y)).
                proj(M.makeMatrix4().orthographic(300, 200, 10, 100));

            spy = sinon.spy(pass, "_uniform");
        });

        after(function () {
            stage && stage.free();
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

                stage.uniform("uniform", value);
                stage._bindUniforms(pass);
                expect(spy, name).to.be.calledWith("uniform", value);
                spy.reset();
            }
        });

        it("should set value automatically if uniform is one of defined placeholders", function () {

            var view = stage.view(),
                proj = stage.proj(),
                viewProj = stage.viewProj(),
                viewInv = view.clone().invert(),
                viewPos = view.getPosition(),
                viewDir = view.getAxisZ().negate().normalize(),

                uniforms = [
                    {"name": "VIEW", "placeholder": R.Stage.VIEW, "value": view},
                    {"name": "PROJ", "placeholder": R.Stage.PROJ, "value": proj},
                    {"name": "VIEW_PROJ", "placeholder": R.Stage.VIEW_PROJ, "value": viewProj},
                    {"name": "VIEW_INV", "placeholder": R.Stage.VIEW_INV, "value": viewInv},
                    {"name": "VIEW_POS", "placeholder": R.Stage.VIEW_POS, "value": viewPos},
                    {"name": "VIEW_DIR", "placeholder": R.Stage.VIEW_DIR, "value": viewDir}
                ],
                uniform, i, l;

            for(i = 0, l = uniforms.length; i < l; i += 1) {

                uniform = uniforms[i];

                stage.uniform("uniform", uniform["placeholder"]);
                stage._bindUniforms(pass);
                expect(spy, uniform["name"]).to.be.calledWith("uniform", uniform["value"]);
                spy.reset();
            }
        });
    });

    describe("frustum culling", function () {

        var pass, mesh, material, instance, stage,
            programStub, attrStub;

        before(function () {

            var gl = device._gl;

            pass = B.Test.makeTestPass(device);

            programStub = programStub || sinon.stub(gl, "getProgramParameter");
            programStub.withArgs(pass._glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(pass._glProgram, gl.LINK_STATUS).returns(true);

            attrStub = attrStub || sinon.stub(gl, "getActiveAttrib");
            attrStub.returns({});
            attrStub.withArgs(pass._glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));

            mesh = B.Test.makeTestMesh(device);

            stage = device.stage("new").
                view(M.makeMatrix4().lookAt(V3.ZERO, V3.Z, V3.Y)).
                proj(M.makeMatrix4().orthographic(300, 200, 10, 100));
            material = device.material("material").pass("new", pass);

            instance = device.instance("material", mesh);
        });

        after(function () {

            instance && instance.free();
            stage && stage.free();

            programStub.restore();
            attrStub.restore();
        });

        it("should draw if instance is out of the frustum but stage's frustum " +
            "culling flag is disabled", function () {

            stage.culling(false);
            instance.setTransform(M.makeMatrix4().translation(-200, -200, -200)).culling(true);
            expect(device.frame().instanceDrawn).to.equal(1);
        });

        it("should draw if instance is out of the frustum but instance's frustum " +
            "culling flag is disabled", function () {

            stage.culling(true);
            instance.setTransform(M.makeMatrix4().translation(120, 60, 50)).culling(false);
            expect(device.frame().instanceDrawn).to.equal(1);
        });

        it("should draw if instance is in the frustum", function () {

            stage.culling(true);
            instance.setTransform(M.makeMatrix4().translation(120, 60, 50)).culling(true);
            expect(device.frame().instanceDrawn).to.equal(1);
        });

        it("should not draw if instance is out of the frustum", function () {

            stage.culling(true);
            instance.setTransform(M.makeMatrix4().translation(-200, -200, -200)).culling(true);
            expect(device.frame().instanceDrawn).to.equal(0);
        });
    });

    describe("stage execution sequence", function () {

        var stage1, stage2, stage3,
            spyBegin1, spyBegin2, spyBegin3,
            spyEnd1, spyEnd2, spyEnd3;

        before(function () {
            stage1 = device.stage("1").output(target);
            stage2 = device.stage("2").output(target);
            stage3 = device.stage("3").output(target);

            spyBegin1 = sinon.spy(stage1, "_begin");
            spyBegin2 = sinon.spy(stage2, "_begin");
            spyBegin3 = sinon.spy(stage3, "_begin");

            spyEnd1 = sinon.spy(stage1, "_end");
            spyEnd2 = sinon.spy(stage2, "_end");
            spyEnd3 = sinon.spy(stage3, "_end");
        });

        after(function () {
            stage1 && stage1.free();
            stage2 && stage2.free();
            stage3 && stage3.free();

            spyBegin1.restore();
            spyBegin2.restore();
            spyBegin3.restore();

            spyEnd1.restore();
            spyEnd2.restore();
            spyEnd3.restore();
        });

        it("should execute stages by order", function () {

            device.frame();
            expect(spyBegin1).to.be.calledBefore(spyBegin2);
            expect(spyBegin2).to.be.calledBefore(spyBegin3);

            expect(spyEnd1).to.be.calledBefore(spyEnd2);
            expect(spyEnd2).to.be.calledBefore(spyEnd3);
        });
    });
});