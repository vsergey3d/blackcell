
describe("B.Render.PolygonState", function () {

    var R = B.Render,
        F = R.Face,

        initStub = function (device) {

            programStub = sinon.stub(device._gl, "getProgramParameter");
            attrStub = sinon.stub(device._gl, "getActiveAttrib");
            attrStub.returns({});
        },
        stubPass = function (pass) {

            var glProgram = pass._glProgram,
                gl = pass._gl;

            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub.withArgs(glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
        },

        makeFrame = function (desc) {

            expect(function () {
                device.frame();
            },
            "frame execution: " + desc).to.not.throw();
        },

        canvas, device, pass, state,
        instance1, instance2, mesh, material1, material2, defaultPass, stage, target,
        programStub, attrStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        pass = B.Test.makeTestPass(device);
        defaultPass = B.Test.makeTestPass(device);
        initStub(device);
        stubPass(pass);
        stubPass(defaultPass);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        material1 = B.Test.makeTestMaterial(device, "1", stage, pass);
        instance1 = B.Test.makeTestInstance(device, "1", mesh);

        material2 = B.Test.makeTestMaterial(device, "2", stage, defaultPass);
        instance2 = B.Test.makeTestInstance(device, "2", mesh);
    });

    after(function () {

        programStub.restore();
        attrStub.restore();

        target && target.free();
        stage && stage.free();

        pass && pass.free();
        material1.free();
        material2.free();

        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.PolygonState).to.exist;
    });

    it("should be created by pass", function () {

        state = pass.state(R.State.POLYGON);

        expect(state).to.exist;
        expect(state).to.be.instanceof(B.Render.PolygonState);
        expect(state.pass()).to.equal(pass);
    });

    describe("#cull", function () {

        it("should be B.Render.Face.BACK by default", function () {
            expect(state.cull()).to.equal(F.BACK);
        });

        it("should set polygon culling mode", function () {

            var faces = [
                    F.FRONT,
                    F.BACK,
                    F.BOTH
                ],

                faceToStr = function (face) {

                    switch (face) {
                    case F.FRONT:
                        return "FRONT";
                    case F.BACK:
                        return "BACK";
                    case F.BOTH:
                        return "BOTH";
                    }
                    return "unknown";
                },
                face, i, l;

            for(i = 0, l = faces.length; i < l; i += 1) {

                face = faces[i];
                state.cull(face);
                expect(state.cull(), faceToStr(face)).to.equal(face);
                makeFrame(faceToStr(face));
            }
        });

        it("should disable culling if false is passed", function () {

            state.cull(false);
            expect(state.cull()).to.be.false;
            makeFrame("disable culling");
        });
    });

    describe("#offset", function () {

        it("should be disabled by default", function () {
            expect(state.offset()).to.be.false;
        });

        it("should set polygon offset parameters", function () {

            state.offset(0.1, 0.5);
            expect(state.offset()).to.deep.equal({ factor: 0.1, units: 0.5 });

            defaultPass.state(R.State.POLYGON).offset(0.1, 0.0);
            makeFrame("polygon offset");
            defaultPass.state(R.State.POLYGON).offset(false);
        });

        it("should set polygon offset structure", function () {

            state.offset({ factor: 0.1, units: 0.5 });
            expect(state.offset()).to.deep.equal({ factor: 0.1, units: 0.5 });

            defaultPass.state(R.State.POLYGON).offset({ factor: 0.1, units: 0.5 });
            makeFrame("polygon offset");
            defaultPass.state(R.State.POLYGON).offset(false);
        });

        it("should disable polygon offset if false is passed", function () {

            state.offset(false);
            expect(state.offset()).to.be.false;
            makeFrame("disable polygon offset");
        });
    });

    describe("#default", function () {

        it("should reset parameters to default values", function () {

            state.default();
            expect(state.cull(), "culling").to.equal(F.BACK);
            expect(state.offset(), "offset").to.be.false;
            makeFrame("default");
        });
    });
});

describe("#B.Render.MultisampleState", function () {

    var R = B.Render,

        initStub = function (device) {

            programStub = sinon.stub(device._gl, "getProgramParameter");
            attrStub = sinon.stub(device._gl, "getActiveAttrib");
            attrStub.returns({});
        },
        stubPass = function (pass) {

            var glProgram = pass._glProgram,
                gl = pass._gl;

            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub.withArgs(glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
        },

        makeFrame = function () {

            expect(function () {
                device.frame();
            },
            "frame execution").to.not.throw();
        },

        canvas, device, pass, state,
        instance1, instance2, mesh, material1, material2, defaultPass, stage, target,
        programStub, attrStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        pass = B.Test.makeTestPass(device);
        defaultPass = B.Test.makeTestPass(device);
        initStub(device);
        stubPass(pass);
        stubPass(defaultPass);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        material1 = B.Test.makeTestMaterial(device, "1", stage, pass);
        instance1 = B.Test.makeTestInstance(device, "1", mesh);

        material2 = B.Test.makeTestMaterial(device, "2", stage, defaultPass);
        instance2 = B.Test.makeTestInstance(device, "2", mesh);
    });

    after(function () {

        programStub.restore();
        attrStub.restore();

        target && target.free();
        stage && stage.free();

        pass && pass.free();
        material1 && material1.free();
        material2 && material2.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.MultisampleState).to.exist;
    });

    it("should be created by pass", function () {

        state = pass.state(R.State.MULTISAMPLE);

        expect(state).to.exist;
        expect(state).to.be.instanceof(B.Render.MultisampleState);
        expect(state.pass()).to.equal(pass);
    });

    describe("#coverage", function () {

        it("should be disabled by default", function () {
            expect(state.coverage()).to.be.false;
        });

        it("should set multisample coverage parameters", function () {

            state.coverage(0.2, true);
            expect(state.coverage()).to.deep.equal({ value: 0.2, invert: true });

            defaultPass.state(R.State.MULTISAMPLE).coverage(0.2, false);
            makeFrame();
            defaultPass.state(R.State.MULTISAMPLE).coverage(false);
        });

        it("should set multisample coverage structure", function () {

            state.coverage({ value: 0.2, invert: true });
            expect(state.coverage()).to.deep.equal({ value: 0.2, invert: true });

            defaultPass.state(R.State.MULTISAMPLE).coverage({ value: 0.2, invert: true });
            makeFrame();
            defaultPass.state(R.State.MULTISAMPLE).coverage(false);
        });

        it("should disable multisample coverage if false is passed", function () {

            state.coverage(false);
            expect(state.coverage()).to.be.false;
            makeFrame();
        });
    });

    describe("#alpha", function () {

        it("should be disabled by default", function () {
            expect(state.alpha()).to.be.false;
            makeFrame();
        });

        it("should set alpha to coverage enable", function () {

            state.alpha(true);
            expect(state.alpha()).to.be.true;
            makeFrame();
        });
    });

    describe("#default", function () {

        it("should reset parameters to default values", function () {

            state.default();
            expect(state.coverage(), "coverage").to.be.false;
            expect(state.alpha(), "alpha").to.be.false;
            makeFrame();
        });
    });
});

describe("B.Render.ColorState", function () {

    var R = B.Render,
        Mask = R.Mask,

        initStub = function (device) {

            programStub = sinon.stub(device._gl, "getProgramParameter");
            attrStub = sinon.stub(device._gl, "getActiveAttrib");
            attrStub.returns({});
        },
        stubPass = function (pass) {

            var glProgram = pass._glProgram,
                gl = pass._gl;

            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub.withArgs(glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
        },
        makeFrame = function () {

            expect(function () {
                device.frame();
            },
            "frame execution").to.not.throw();
        },

        canvas, device, pass, state,
        instance1, instance2, mesh, material1, material2, defaultPass, stage, target,
        programStub, attrStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        pass = B.Test.makeTestPass(device);
        defaultPass = B.Test.makeTestPass(device);
        initStub(device);
        stubPass(pass);
        stubPass(defaultPass);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        material1 = B.Test.makeTestMaterial(device, "1", stage, pass);
        instance1 = B.Test.makeTestInstance(device, "1", mesh);

        material2 = B.Test.makeTestMaterial(device, "2", stage, defaultPass);
        instance2 = B.Test.makeTestInstance(device, "2", mesh);
    });

    after(function () {

        programStub.restore();
        attrStub.restore();

        target && target.free();
        stage && stage.free();

        pass && pass.free();
        material1 && material1.free();
        material2 && material2.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.ColorState).to.exist;
    });

    it("should be created by pass", function () {

        state = pass.state(R.State.COLOR);

        expect(state).to.exist;
        expect(state).to.be.instanceof(B.Render.ColorState);
        expect(state.pass()).to.equal(pass);
    });

    describe("#write", function () {

        it("should be enabled by default", function () {
            expect(state.write()).to.deep.equal(Mask.RGBA);
            makeFrame();
        });

        it("should enable red-component writing", function () {

            state.write(Mask.R);
            expect(state.write()).to.deep.equal(Mask.R);
            makeFrame();
        });

        it("should enable green-component writing", function () {

            state.write(Mask.G);
            expect(state.write()).to.deep.equal(Mask.G);
            makeFrame();
        });

        it("should enable blue-component writing", function () {

            state.write(Mask.B);
            expect(state.write()).to.deep.equal(Mask.B);
            makeFrame();
        });

        it("should enable alpha-component writing", function () {

            state.write(Mask.A);
            expect(state.write()).to.deep.equal(Mask.A);
            makeFrame();
        });

        it("should enable red, green, blue components writing", function () {

            state.write(Mask.R | Mask.G | Mask.B);
            expect(state.write()).to.deep.equal(Mask.RGB);
            makeFrame();
        });

        it("should enable red, green, blue, alpha components writing", function () {

            state.write(Mask.R | Mask.G | Mask.B | Mask.A);
            expect(state.write()).to.deep.equal(Mask.RGBA);
            makeFrame();
        });
    });

    describe("#default", function () {

        it("should reset parameters to default values", function () {

            state.default();
            expect(state.write()).to.deep.equal(Mask.RGBA);
            makeFrame();
        });
    });
});

describe("B.Render.toGLCmpFunc", function () {

    var R = B.Render,
        CF = R.CmpFunc,

        fnToStr = B.Test.cmpFuncToStr,
        funcs = [
            CF.NEVER,
            CF.ALWAYS,
            CF.LESS,
            CF.LESS_EQUAL,
            CF.GREATER,
            CF.GREATER_EQUAL,
            CF.EQUAL,
            CF.NOT_EQUAL
        ],
        gl;

    before(function () {

        gl = new B.Test.FakeWebGLContext({});
    });

    it("should return non-zero value for B.Render.CmpFunc", function () {

        var fn, i, l;

        for(i = 0, l = funcs.length; i < l; i += 1) {

            fn = funcs[i];
            expect(R.toGLCmpFunc(gl, fn), fnToStr(fn)).to.not.equal(0);
        }
    });

    it("should return undefined value for unknown function type", function () {

        expect(R.toGLCmpFunc(-1)).to.equal(undefined);
        expect(R.toGLCmpFunc(10000)).to.equal(undefined);
    });
});

describe("B.Render.DepthState", function () {

    var R = B.Render,
        CF = R.CmpFunc,

        initStub = function (device) {

            programStub = sinon.stub(device._gl, "getProgramParameter");
            attrStub = sinon.stub(device._gl, "getActiveAttrib");
            attrStub.returns({});
        },
        stubPass = function (pass) {

            var glProgram = pass._glProgram,
                gl = pass._gl;

            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub.withArgs(glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
        },
        makeFrame = function (desc) {

            expect(function () {
                device.frame();
            },
            "frame execution: " + desc).to.not.throw();
        },

        canvas, device, pass, state,
        instance1, instance2, mesh, material1, material2, defaultPass, stage, target,
        programStub, attrStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        pass = B.Test.makeTestPass(device);
        defaultPass = B.Test.makeTestPass(device);
        initStub(device);
        stubPass(pass);
        stubPass(defaultPass);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        material1 = B.Test.makeTestMaterial(device, "1", stage, pass);
        instance1 = B.Test.makeTestInstance(device, "1", mesh);

        material2 = B.Test.makeTestMaterial(device, "2", stage, defaultPass);
        instance2 = B.Test.makeTestInstance(device, "2", mesh);
    });

    after(function () {

        programStub.restore();
        attrStub.restore();

        target && target.free();
        stage && stage.free();

        pass && pass.free();
        material1 && material1.free();
        material2 && material2.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.DepthState).to.exist;
    });

    it("should be created by pass", function () {

        state = pass.state(R.State.DEPTH);

        expect(state).to.exist;
        expect(state).to.be.instanceof(B.Render.DepthState);
        expect(state.pass()).to.equal(pass);
    });

    describe("#test", function () {

        it("should be B.Render.CmpFunc.LESS_EQUAL by default", function () {
            expect(state.test()).to.equal(CF.LESS_EQUAL);
        });

        it("should set depth compare function", function () {

            var fnToStr = B.Test.cmpFuncToStr,
                funcs = [
                    CF.NEVER,
                    CF.ALWAYS,
                    CF.LESS,
                    CF.LESS_EQUAL,
                    CF.GREATER,
                    CF.GREATER_EQUAL,
                    CF.EQUAL,
                    CF.NOT_EQUAL
                ],
                fn, i, l;

            for(i = 0, l = funcs.length; i < l; i += 1) {

                fn = funcs[i];
                state.test(fn);
                expect(state.test(), fnToStr(fn)).to.equal(fn);
                makeFrame(fnToStr(fn));
            }
        });

        it("should disable depth test if false is passed", function () {

            state.test(false);
            expect(state.test()).to.be.false;
            makeFrame("disable depth test");
        });
    });

    describe("#write", function () {

        it("should be enabled by default", function () {
            expect(state.write()).to.be.true;
            makeFrame("default write mask");
        });

        it("should set depth write mask", function () {

            state.write(false);
            expect(state.write()).to.be.false;
            makeFrame("disable write mask");
        });
    });

    describe("#default", function () {

        it("should reset parameters to default values", function () {

            state.default();
            expect(state.test()).to.equal(CF.LESS_EQUAL);
            expect(state.write()).to.be.true;
            makeFrame("default");
        });
    });
});

describe("B.Render.StencilState", function () {

    var R = B.Render,
        CF = R.CmpFunc,
        SO = R.StencilOp,

        initStub = function (device) {

            programStub = sinon.stub(device._gl, "getProgramParameter");
            attrStub = sinon.stub(device._gl, "getActiveAttrib");
            attrStub.returns({});
        },
        stubPass = function (pass) {

            var glProgram = pass._glProgram,
                gl = pass._gl;

            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub.withArgs(glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
        },
        makeFrame = function (desc) {

            expect(function () {
                device.frame();
            },
            "frame execution: " + desc).to.not.throw();
        },

        canvas, device, pass, state,
        instance1, instance2, mesh, material1, material2, defaultPass, stage, target,
        programStub, attrStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        pass = B.Test.makeTestPass(device);
        defaultPass = B.Test.makeTestPass(device);
        initStub(device);
        stubPass(pass);
        stubPass(defaultPass);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        material1 = B.Test.makeTestMaterial(device, "1", stage, pass);
        instance1 = B.Test.makeTestInstance(device, "1", mesh);

        material2 = B.Test.makeTestMaterial(device, "2", stage, defaultPass);
        instance2 = B.Test.makeTestInstance(device, "2", mesh);
    });

    after(function () {

        programStub.restore();
        attrStub.restore();

        target && target.free();
        stage && stage.free();

        pass && pass.free();
        material1 && material1.free();
        material2 && material2.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.StencilState).to.exist;
    });

    it("should be created by pass", function () {

        state = pass.state(R.State.STENCIL);

        expect(state).to.exist;
        expect(state).to.be.instanceof(B.Render.StencilState);
        expect(state.pass()).to.equal(pass);
    });

    describe("#test", function () {

        var fnToStr = B.Test.cmpFuncToStr,
            funcs = [
                CF.NEVER,
                CF.ALWAYS,
                CF.LESS,
                CF.LESS_EQUAL,
                CF.GREATER,
                CF.GREATER_EQUAL,
                CF.EQUAL,
                CF.NOT_EQUAL
            ];

        it("should be disabled by default", function () {

            state.default();
            expect(state.test()).to.be.false;
        });

        it("should set stencil test compare function", function () {

            var fn, i, l;

            defaultPass.state(R.State.STENCIL).test(CF.EQUAL);

            for(i = 0, l = funcs.length; i < l; i += 1) {

                fn = funcs[i];
                state.test(fn);
                expect(state.test(), fnToStr(fn)).to.equal(fn);

                makeFrame(fnToStr(fn));
            }

            defaultPass.state(R.State.STENCIL).test(false);
        });

        it("should disable stencil test if false is passed", function () {

            state.test(false);
            expect(state.test()).to.be.false;
            makeFrame("disable stencil test");
        });
    });

    describe("#ref", function () {

        it("should be zero by default", function () {

            state.default();
            expect(state.ref()).to.equal(0);
            makeFrame("default stencil ref");
        });

        it("should set stencil test reference value", function () {

            state.ref(0.5);
            expect(state.ref()).to.equal(0.5);
            makeFrame("stencil ref");
        });
    });

    describe("#mask", function () {

        it("should be zero by default", function () {

            state.default();
            expect(state.mask()).to.equal(1);
            makeFrame("default stencil mask");
        });

        it("should set stencil test mask", function () {

            state.mask(0x12);
            expect(state.mask()).to.equal(0x12);
            makeFrame("stencil ref");
        });
    });

    describe("#op", function () {

        var stencilOps = [
                SO.KEEP,
                SO.ZERO,
                SO.REPLACE,
                SO.INCR,
                SO.INCR_WRAP,
                SO.DECR,
                SO.DECR_WRAP,
                SO.INVERT
            ],
            stencilOpToStr = function (op) {
                switch (op) {
                case SO.KEEP:
                    return "KEEP";
                case SO.ZERO:
                    return "ZERO";
                case SO.REPLACE:
                    return "REPLACE";
                case SO.INCR:
                    return "INCR";
                case SO.INCR_WRAP:
                    return "INCR_WRAP";
                case SO.DECR:
                    return "DECR";
                case SO.DECR_WRAP:
                    return "DECR_WRAP";
                case SO.INVERT:
                    return "INVERT";
                }
                return "unknown";
            };

        it("should be set to B.Render.StencilOp.KEEP by default", function () {

            state.default();
            expect(state.op()).
                to.deep.equal({ failStencil: SO.KEEP, failDepth: SO.KEEP, passAll: SO.KEEP });
        });

        it("should set stencil operations", function () {

            var
                buildMsg = function (sOp, dOp, allOp) {

                    return  "failStencil: " + stencilOpToStr(sOp) +
                        ", failDepth: " + stencilOpToStr(dOp) +
                        ", passAll: " + stencilOpToStr(allOp);
                },

                forEachOp = function (handler) {

                    var lStencilOp = stencilOps.length,
                        sOp, dOp, allOp, iStencil, iDepth, iAll, msg;

                    for(iStencil = 0; iStencil < lStencilOp; iStencil += 1) {
                        sOp = stencilOps[iStencil];

                        for(iDepth = 0; iDepth < lStencilOp; iDepth += 1) {
                            dOp = stencilOps[iDepth];

                            for(iAll = 0; iAll < lStencilOp; iAll += 1) {
                                allOp = stencilOps[iAll];

                                handler(sOp, dOp, allOp);
                            }
                        }
                    }
                },

                msg;

            forEachOp(function (sOp, dOp, allOp) {

                state.op(sOp, dOp, allOp);
                msg = buildMsg(sOp, dOp, allOp);

                expect(state.op(), msg).
                    to.deep.equal({ failStencil: sOp, failDepth: dOp, passAll: allOp });

                makeFrame(msg);
            });

            forEachOp(function (sOp, dOp, allOp) {

                state.op({ failStencil: sOp, failDepth: dOp, passAll: allOp });
                msg = buildMsg(sOp, dOp, allOp);

                expect(state.op(), msg).
                    to.deep.equal({ failStencil: sOp, failDepth: dOp, passAll: allOp });

                makeFrame(msg);
            });
        });
    });

    describe("#write", function () {

        it("should be 1 by default", function () {

            state.default();
            expect(state.write()).to.equal(1);
            makeFrame("default write mask");
        });

        it("should set stencil write mask", function () {

            state.write(0x12);
            expect(state.write()).to.equal(0x12);
            makeFrame("write mask");
        });
    });

    describe("#default", function () {

        it("should reset parameters to default values", function () {

            state.default();
            expect(state.test(), "test").to.be.false;
            expect(state.write(), "write").to.equal(1);
            expect(state.op(), "op").
                to.deep.equal({ failStencil: SO.KEEP, failDepth: SO.KEEP, passAll: SO.KEEP });
            makeFrame("default");
        });
    });
});

describe("B.Render.BlendState", function () {

    var M = B.Math,
        R = B.Render,
        BL = R.Blend,
        BE = R.BlendEq,

        factors = [
            BL.ZERO,
            BL.ONE,
            BL.SRC_COLOR,
            BL.INV_SRC_COLOR,
            BL.DEST_COLOR,
            BL.INV_DEST_COLOR,
            BL.SRC_ALPHA,
            BL.INV_SRC_ALPHA,
            BL.DEST_ALPHA,
            BL.INV_DEST_ALPHA,
            BL.CONST_COLOR,
            BL.INV_CONST_COLOR,
            BL.CONST_ALPHA,
            BL.INV_CONST_ALPHA,
            BL.SRC_ALPHA_SAT
        ],
        factorToStr = function (factor) {

            switch (factor) {
            case BL.ZERO:
                return "ZERO";
            case BL.ONE:
                return "ONE";
            case BL.SRC_COLOR:
                return "SRC_COLOR";
            case BL.INV_SRC_COLOR:
                return "INV_SRC_COLOR";
            case BL.DEST_COLOR:
                return "DEST_COLOR";
            case BL.INV_DEST_COLOR:
                return "INV_DEST_COLOR";
            case BL.SRC_ALPHA:
                return "SRC_ALPHA";
            case BL.INV_SRC_ALPHA:
                return "INV_SRC_ALPHA";
            case BL.DEST_ALPHA:
                return "DEST_ALPHA";
            case BL.INV_DEST_ALPHA:
                return "INV_DEST_ALPHA";
            case BL.CONST_COLOR:
                return "CONST_COLOR";
            case BL.INV_CONST_COLOR:
                return "INV_CONST_COLOR";
            case BL.CONST_ALPHA:
                return "CONST_ALPHA";
            case BL.INV_CONST_ALPHA:
                return "INV_CONST_ALPHA";
            case BL.SRC_ALPHA_SAT:
                return "SRC_ALPHA_SAT";
            }
            return "unknown";
        },

        initStub = function (device) {

            programStub = sinon.stub(device._gl, "getProgramParameter");
            attrStub = sinon.stub(device._gl, "getActiveAttrib");
            attrStub.returns({});
        },
        stubPass = function (pass) {

            var glProgram = pass._glProgram,
                gl = pass._gl;

            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub.withArgs(glProgram, 0).
                returns({ type: gl.FLOAT_VEC3, name: "position" });

            pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
        },
        makeFrame = function (desc) {

            expect(function () {
                device.frame();
            },
            "frame execution: " + desc).to.not.throw();
        },

        canvas, device, pass, state,
        instance1, instance2, mesh, material1, material2, defaultPass, stage, target,
        programStub, attrStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);

        pass = B.Test.makeTestPass(device);
        defaultPass = B.Test.makeTestPass(device);
        initStub(device);
        stubPass(pass);
        stubPass(defaultPass);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        material1 = B.Test.makeTestMaterial(device, "1", stage, pass);
        instance1 = B.Test.makeTestInstance(device, "1", mesh);

        material2 = B.Test.makeTestMaterial(device, "2", stage, defaultPass);
        instance2 = B.Test.makeTestInstance(device, "2", mesh);
    });

    after(function () {

        programStub.restore();
        attrStub.restore();

        target && target.free();
        stage && stage.free();

        pass && pass.free();
        material1 && material1.free();
        material2 && material2.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.BlendState).to.exist;
    });

    it("should be created by pass", function () {

        state = pass.state(R.State.BLEND);

        expect(state).to.exist;
        expect(state).to.be.instanceof(B.Render.BlendState);
        expect(state.pass()).to.equal(pass);
    });

    describe("#enabled", function () {

        it("should be disabled by default", function () {

            state.default();
            expect(state.enabled()).to.be.false;
            makeFrame("default const color");
        });

        it("should enable the blending state", function () {

            state.enabled(true);
            expect(state.enabled()).to.be.true;
            makeFrame("enable blending");
        });

        it("should disable the blending state", function () {

            state.enabled(false);
            expect(state.enabled()).to.be.false;
            makeFrame("disable blending");
        });
    });

    describe("#const", function () {

        it("should be (0.0, 0.0, 0.0, 0.0) by default", function () {

            state.default();
            expect(state.const()).to.equalByComponents(0.0, 0.0, 0.0, 0.0);
            makeFrame("default const color");
        });

        it("should blend constant color", function () {

            state.const(M.Color.GREEN);
            expect(state.const()).to.equalByComponents(M.Color.GREEN);
            makeFrame("blend constant color");
        });
    });

    describe("#src", function () {

        it("should be B.Render.Blend.ONE by default", function () {
            state.default();
            expect(state.src()).to.equal(BL.ONE);
        });

        it("should set source blending factor", function () {

            var factor, i, l;

            for(i = 0, l = factors.length; i < l; i += 1) {

                factor = factors[i];
                state.src(factor);
                expect(state.src(), factorToStr(factor)).to.equal(factor);

                makeFrame(factorToStr(factor));
            }
        });
    });

    describe("#dest", function () {

        it("should be B.Render.Blend.ZERO by default", function () {
            state.default();
            expect(state.dest()).to.equal(BL.ZERO);
        });

        it("should set destination source blending factor", function () {

            var factor, i, l;

            for(i = 0, l = factors.length; i < l; i += 1) {

                factor = factors[i];
                state.dest(factor);
                expect(state.dest(), factorToStr(factor)).to.equal(factor);
                makeFrame(factorToStr(factor));
            }
        });
    });

    describe("#eq", function () {

        var eq = [
                BE.ADD,
                BE.SUBTRACT,
                BE.REV_SUBTRACT
            ],
            eqToStr = function (factor) {

                switch (factor) {
                case BE.ADD:
                    return "ADD";
                case BE.SUBTRACT:
                    return "SUBTRACT";
                case BE.REV_SUBTRACT:
                    return "REV_SUBTRACT";
                }
                return "unknown";
            };

        it("should be B.Render.BlendEq.ADD by default", function () {
            state.default();
            expect(state.eq()).to.equal(BE.ADD);
        });

        it("should set blending equations", function () {

            var func, i, l;

            for(i = 0, l = eq.length; i < l; i += 1) {

                func = eq[i];
                state.eq(func);
                expect(state.eq(), eqToStr(func)).to.equal(func);
                makeFrame(eqToStr(func));
            }
        });

        it("should disable blending if false is passed", function () {

            state.eq(false);
            expect(state.eq()).to.be.false;
            makeFrame("disable blending");
        });
    });

    describe("#default", function () {

        it("should reset parameters to default values", function () {

            state.default();
            expect(state.const(), "const").to.equalByComponents(0.0, 0.0, 0.0, 0.0);
            expect(state.src(), "src").to.equal(BL.ONE);
            expect(state.dest(), "dest").to.equal(BL.ZERO);
            expect(state.eq(), "eq").to.equal(BE.ADD);
            makeFrame("default");
        });
    });
});