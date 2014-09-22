
describe("B.Render.Device", function () {

    var R = B.Render,
        F = R.Format,
        canvas;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
    });

    it("should exist", function () {
        expect(B.Render.Device).to.exist;
    });

    describe("create & free", function () {

        var device;

        it("should throw if webgl is not supported", sinon.test(function () {

            var fn = function () { R.makeDevice(canvas); };

            this.stub(canvas, "getContext").returns(null);
            expect(fn).to.throw(R.Error);
        }));

        it("should be possible to create webgl with 'experimental-webgl' flag",
            sinon.test(function () {

                var stub = this.stub(canvas, "getContext");

                stub.withArgs("webgl").returns(null);
                stub.withArgs("experimental-webgl").returns(new B.Test.FakeWebGLContext({}));

                expect(R.makeDevice(canvas)).to.be.instanceof(R.Device);
            })
        );

        it("should be possible to recognize mozilla extensions", sinon.test(function () {

            var gl = new B.Test.FakeWebGLContext({}),
                stub =  this.stub(canvas, "getContext").returns(gl),
                glStub = this.stub(gl, "getExtension"),
                device;

            glStub.withArgs("WEBGL_compressed_texture_s3tc").returns(undefined);
            glStub.withArgs("MOZ_WEBGL_compressed_texture_s3tc").returns({});
            glStub.withArgs("WEBGL_depth_texture").returns(undefined);
            glStub.withArgs("MOZ_WEBGL_depth_texture").returns({});
            glStub.withArgs("EXT_texture_filter_anisotropic").returns(undefined);
            glStub.withArgs("MOZ_EXT_texture_filter_anisotropic").returns({});

            device = R.makeDevice(canvas);
            expect(device).to.be.instanceof(R.Device);
            expect(device._ext("compressed_texture_s3tc")).to.exist;
            expect(device._ext("depth_texture")).to.exist;
            expect(device._ext("texture_filter_anisotropic")).to.exist;
        }));

        it("should be possible to recognize webkit extensions", sinon.test(function () {

            var gl = new B.Test.FakeWebGLContext({}),
                stub =  this.stub(canvas, "getContext").returns(gl),
                glStub = this.stub(gl, "getExtension"),
                device;

            glStub.withArgs("WEBGL_compressed_texture_s3tc").returns(undefined);
            glStub.withArgs("WEBKIT_WEBGL_compressed_texture_s3tc").returns({});
            glStub.withArgs("WEBGL_depth_texture").returns(undefined);
            glStub.withArgs("WEBKIT_WEBGL_depth_texture").returns({});
            glStub.withArgs("EXT_texture_filter_anisotropic").returns(undefined);
            glStub.withArgs("WEBKIT_EXT_texture_filter_anisotropic").returns({});

            device = R.makeDevice(canvas);
            expect(device).to.be.instanceof(R.Device);
            expect(device._ext("compressed_texture_s3tc")).to.exist;
            expect(device._ext("depth_texture")).to.exist;
            expect(device._ext("texture_filter_anisotropic")).to.exist;
        }));

        it("should set default value to 'samplerMaxAnisotropy' cap " +
            "if texture filter anisotropic ext is not supported",
            sinon.test(function () {

                var gl = new B.Test.FakeWebGLContext({}),
                    stub =  this.stub(canvas, "getContext").returns(gl),
                    glStub = this.stub(gl, "getExtension");

                glStub.withArgs("EXT_texture_filter_anisotropic").returns(undefined);

                expect(R.makeDevice(canvas).caps().samplerMaxAnisotropy).to.equal(1);
            }
        ));

        it("should set default value to 'colorTargetCount' cap " +
            "if draw buffers ext is not supported",
            sinon.test(function () {

                var gl = new B.Test.FakeWebGLContext({}),
                    stub =  this.stub(canvas, "getContext").returns(gl),
                    glStub = this.stub(gl, "getExtension");

                glStub.withArgs("WEBGL_draw_buffers").returns(undefined);

                expect(R.makeDevice(canvas).caps().colorTargetCount).to.equal(1);
            }
        ));

        it("should create a device", function () {

            device = R.makeDevice(canvas);
            expect(device).to.be.instanceof(R.Device);
        });

        it("should return canvas", function () {
            expect(device.canvas()).to.equal(canvas);
        });

        it("should return caps", function () {

            var caps = device.caps();

            expect(caps).to.have.property("indexUInt").that.is.a("boolean");
            expect(caps).to.have.property("textureMaxSize").that.is.a("number");
            expect(caps).to.have.property("cubemapMaxSize").that.is.a("number");
            expect(caps).to.have.property("depthMaxSize").that.is.a("number");
            expect(caps).to.have.property("textureDXT").that.is.a("boolean");
            expect(caps).to.have.property("textureFloat16").that.is.a("boolean");
            expect(caps).to.have.property("textureFloat32").that.is.a("boolean");
            expect(caps).to.have.property("textureFloat16Filter").that.is.a("boolean");
            expect(caps).to.have.property("textureFloat32Filter").that.is.a("boolean");
            expect(caps).to.have.property("colorTargetFloat16").that.is.a("boolean");
            expect(caps).to.have.property("colorTargetFloat32").that.is.a("boolean");
            expect(caps).to.have.property("colorTargetCount").that.is.a("number");
            expect(caps).to.have.property("samplerAnisotropy").that.is.a("boolean");
            expect(caps).to.have.property("samplerMaxAnisotropy").that.is.a("number");
            expect(caps).to.have.property("readableDepth").that.is.a("boolean");
            expect(caps).to.have.property("writableDepth").that.is.a("boolean");
            expect(caps).to.have.property("derivatives").that.is.a("boolean");
            expect(caps).to.have.property("attributeCount").that.is.a("number");
            expect(caps).to.have.property("varyingCount").that.is.a("number");
            expect(caps).to.have.property("vertexUniformCount").that.is.a("number");
            expect(caps).to.have.property("vertexTextureCount").that.is.a("number");
            expect(caps).to.have.property("fragmentUniformCount").that.is.a("number");
            expect(caps).to.have.property("fragmentTextureCount").that.is.a("number");
        });

        it("should free device", function () {

            expect(function () {
                device.free();
            }).to.not.throw();
        });
    });

    describe("creation with different color format", function () {

        var incorrectFormats = [
                F.A,
                F.RGB_DXT1,
                F.RGBA_DXT5,
                F.A_F16,
                F.RGB_F16,
                F.RGBA_F16,
                F.A_F32,
                F.RGB_F32,
                F.RGBA_F32,
                F.DEPTH,
                F.DEPTH_STENCIL
            ],
            correctFormats = [
                F.RGB,
                F.RGBA
            ],

            createFn = function (colorFormat) {
                return function () {
                    R.makeDevice(canvas, colorFormat);
                };
            };

        it("should throw if color format is neither B.Render.Format.RGB nor " +
            "B.Render.Format.RGBA",
            function () {

                for(var  i = 0, l = incorrectFormats.length; i < l; i += 1) {
                    expect(createFn(incorrectFormats[i])).to.throw(B.Render.Error);
                }
            }
        );

        it("should not throw if color format is B.Render.Format.RGB or B.Render.Format.RGBA",
            function () {

                for(var  i = 0, l = correctFormats.length; i < l; i += 1) {
                    expect(createFn(correctFormats[i])).to.not.throw(B.Render.Error);
                }
            }
        );
    });

    describe("creation with different depth format", function () {

        var incorrectFormats = [
                F.A,
                F.RGB,
                F.RGBA,
                F.RGB_DXT1,
                F.RGBA_DXT5,
                F.A_F16,
                F.RGB_F16,
                F.RGBA_F16,
                F.A_F32,
                F.RGB_F32,
                F.RGBA_F32
            ],
            correctFormats = [
                F.DEPTH,
                F.DEPTH_STENCIL
            ],
            formatToStr = B.Test.formatToStr,

            createFn = function (depthFormat) {
                return function () {
                    R.makeDevice(canvas, B.Render.Format.RGBA, depthFormat);
                };
            };

        it("should throw if depth format is neither B.Render.Format.DEPTH nor " +
            "B.Render.Format.DEPTH_STENCIL",
            function () {

                var format, i, l;

                for(i = 0, l = incorrectFormats.length; i < l; i += 1) {
                    format = incorrectFormats[i];
                    expect(createFn(format), formatToStr(format)).to.throw(B.Render.Error);
                }
            }
        );

        it("should not throw if depth format is B.Render.Format.DEPTH or " +
            "B.Render.Format.DEPTH_STENCIL",
            function () {

                var format, i, l;

                for(i = 0, l = correctFormats.length; i < l; i += 1) {
                    format = correctFormats[i];
                    expect(createFn(format), formatToStr(format)).to.not.throw(B.Render.Error);
                }
            }
        );

        it("should not throw if depth format is not set", function () {
            expect(createFn(null)).to.not.throw(B.Render.Error);
        });
    });

    describe("frame", function () {

        var device;

        before(function () {
            device = R.makeDevice(canvas);
        });

        after(function () {
            device.free();
        });

        it("should make frame and return frame info", function () {

            var frameInfo = device.frame();

            expect(frameInfo).to.have.property("fps").that.is.a("number");
            expect(frameInfo).to.have.property("vertexDrawn").that.is.a("number").and.equal(0);
            expect(frameInfo).to.have.property("vertexTotal").that.is.a("number").and.equal(0);
            expect(frameInfo).to.have.property("primitiveDrawn").that.is.a("number").and.equal(0);
            expect(frameInfo).to.have.property("primitiveTotal").that.is.a("number").and.equal(0);
            expect(frameInfo).to.have.property("instanceDrawn").that.is.a("number").and.equal(0);
            expect(frameInfo).to.have.property("instanceTotal").that.is.a("number").and.equal(0);
        });
    });

    describe("frame execution", function () {

        var colorFormats = [R.Format.RGB, R.Format.RGBA],
            depthFormats = [false, R.Format.DEPTH, R.Format.DEPTH_STENCIL],

            device, pass,
            instance1, instance2, instance3, instance4, instance5, mesh,
            material1, material2, stage1, stage2, target,
            programStub, attrStub,

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

            before = function (colorFmt, depthFmt) {

                device = R.makeDevice(canvas, colorFmt, depthFmt);

                pass = B.Test.makeTestPass(device);
                initStub(device);
                stubPass(pass);

                target = B.Test.makeTestTarget(device);
                stage1 = B.Test.makeTestStage(device, target, "1");
                stage2 = B.Test.makeTestStage(device, device.target(), "2");

                mesh = B.Test.makeTestMesh(device);

                material1 = B.Test.makeTestMaterial(device, "1", stage1, pass);
                material2 = B.Test.makeTestMaterial(device, "2", stage2, pass);

                instance1 = B.Test.makeTestInstance(device, "1", mesh);
                instance2 = B.Test.makeTestInstance(device, "2", mesh);
                instance3 = B.Test.makeTestInstance(device, "1", mesh);
                instance4 = B.Test.makeTestInstance(device, "2", mesh);
                instance5 = B.Test.makeTestInstance(device, "2", mesh).
                    transform(B.Math.makeMatrix4().translation(-100, -100, -100));
            },

            after = function () {

                programStub.restore();
                attrStub.restore();

                target && target.free();
                stage1 && stage1.free();
                stage2 && stage2.free();

                pass && pass.free();
                material1 && material1.free();
                material2 && material2.free();
                device && device.free();
            };

        it("should make frame", function () {

            expect(function () {
                colorFormats.forEach(function (colorFmt) {
                    depthFormats.forEach(function (depthFmt) {
                        before(colorFmt, depthFmt);
                        device.frame();
                        after();
                    });
                });
            },
            "frame execution").to.not.throw();
        });
    });

    describe("resize", function () {

        var canvasWidth, canvasHeight, device;

        before(function () {

            canvasWidth = canvas.clientWidth;
            canvasHeight = canvas.clientHeight;
            device = R.makeDevice(canvas);
        });

        after(function () {

            device.free();
            canvas.clientWidth = canvasWidth;
            canvas.clientHeight = canvasHeight;
        });

        it("should raise resize event", function () {

            var resizeHandler = sinon.spy(),
                e;

            device.on("resize", resizeHandler);
            device.frame();

            canvas.clientWidth = 800;
            canvas.clientHeight = 600;
            device.frame();

            expect(resizeHandler).to.be.calledOnce;
            e = resizeHandler.getCall(0).args[0];
            expect(e).to.be.instanceof(B.Std.Event);
            expect(e.type).to.equal("resize");
            expect(e.data).to.deep.equal({ width: 800, height: 600 });
        });
    });

    describe("lost & restore", function () {

        var
            initStub = function (device) {

                programStub = sinon.stub(device._gl, "getProgramParameter");
                attrStub = sinon.stub(device._gl, "getActiveAttrib");
                attrStub.returns({});
                uniformStub = sinon.stub(device._gl, "getActiveUniform");
                uniformStub.returns({});
            },
            stubPass = function (pass) {

                var glProgram = pass._glProgram,
                    gl = pass._gl;

                programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
                programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(2);
                programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

                attrStub.returns({});
                attrStub.withArgs(glProgram, 0).
                    returns({ type: gl.FLOAT_VEC3, name: "position" });

                uniformStub.withArgs(glProgram, 0).
                    returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform1" });
                uniformStub.withArgs(glProgram, 1).
                    returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform2" });

                pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
            },

            device, pass, instance, mesh1, mesh2, mesh3, material, stage, target,
            texture1, texture2, depth,
            programStub, attrStub, uniformStub;

        before(function () {

            device = R.makeDevice(canvas);

            pass = B.Test.makeTestPass(device);
            target = B.Test.makeTestTarget(device);
            stage = B.Test.makeTestStage(device, target);
            mesh1 = B.Test.makeTestMesh(device);
            mesh2 = device.makeMesh().attribute("position", R.Attribute.POSITION).
                vertices(9).indices(3);
            mesh3 = device.makeMesh();
            material = B.Test.makeTestMaterial(device, "material", stage, pass);
            instance = B.Test.makeTestInstance(device, "material", mesh1);

            texture1 = B.Test.makeTestTexture(device, 2).buildMips();
            texture2 = B.Test.makeTestTexture(device, 2);
            texture2.mip(0).source(B.Test.makeImageElement(128, 128));
            texture2.mip(1).source(B.Test.makeImageElement(64, 64));

            depth = B.Test.makeTestDepth(device);

            initStub(device);
            stubPass(pass);
        });

        after(function () {

            programStub.restore();
            attrStub.restore();
            uniformStub.restore();

            texture1 & texture1.free();
            texture2 & texture2.free();
            depth & depth.free();
            target && target.free();
            stage && stage.free();
            pass && pass.free();
            mesh1 && mesh1.free();
            mesh2 && mesh2.free();
            mesh3 && mesh3.free();
            material && material.free();

            device.free();
        });

        it("should trigger 'lose' event if context is lost", function () {

            var lostHandler = sinon.spy(),
                e;

            device.on("lose", lostHandler);
            canvas.dispatchEvent("webglcontextlost");

            expect(lostHandler).to.be.calledOnce;
            e = lostHandler.getCall(0).args[0];
            expect(e).to.be.instanceof(B.Std.Event);
            expect(e.type).to.equal("lose");
        });

        it("should trigger 'restore' event if context is restored", function () {

            var restoreHandler = sinon.spy(),
                e;

            device.on("restore", restoreHandler);
            canvas.dispatchEvent("webglcontextrestored");

            expect(restoreHandler).to.be.calledOnce;
            e = restoreHandler.getCall(0).args[0];
            expect(e).to.be.instanceof(B.Std.Event);
            expect(e.type).to.equal("restore");
        });

        it("should restore all resources", sinon.test(function () {

            var passSpy = this.spy(pass, "_restore"),
                meshSpy = this.spy(mesh1, "_restore"),
                targetSpy = this.spy(target, "_restore"),
                textureSpy = this.spy(texture1, "_restore"),
                mipSpy = this.spy(texture1.mip(0), "_restore"),
                depthSpy = this.spy(depth, "_restore");

            canvas.dispatchEvent("webglcontextrestored");
            expect(passSpy).to.be.calledOnce;
            expect(meshSpy).to.be.calledOnce;
            expect(targetSpy).to.be.calledOnce;
            expect(textureSpy).to.be.calledOnce;
            expect(mipSpy).to.be.calledOnce;
            expect(depthSpy).to.be.calledOnce;
        }));

        it("should not throw when context lost but frame executed", function () {

            expect(function () {
                canvas.dispatchEvent("webglcontextlost");
                device.frame();
                canvas.dispatchEvent("webglcontextrestored");
            },
            "frame execution").to.not.throw();
        });
    });

    describe("#_ext", function () {

        var extensions = [
                "compressed_texture_s3tc",
                "depth_texture",
                "texture_filter_anisotropic",
                "texture_half_float",
                "texture_float",
                "texture_half_float_linear",
                "texture_float_linear",
                "color_buffer_half_float",
                "color_buffer_float",
                "draw_buffers",
                "element_index_uint",
                "standard_derivatives",
                "frag_depth"
            ],
            device;

        before(function () {
            device = R.makeDevice(canvas);
        });

        after(function () {
            device.free();
        });

        it("should return extension by name", function () {

            var i, l, ext;

            for(i = 0, l = extensions.length; i < l; i += 1) {
                ext = extensions[i];
                expect(device._ext(ext), ext).to.exist;
            }
        });

        it("should return undefined if extension is unknown", function () {

            expect(device._ext("ext")).to.equal(undefined);
        });
    });

    describe("#target", function () {

        var
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

                attrStub.returns({});
                attrStub.withArgs(glProgram, 0).
                    returns({ type: gl.FLOAT_VEC3, name: "position" });

                pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
            },

            device, target,
            pass, instance, mesh, material, stage,
            programStub, attrStub;

        before(function () {

            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
            target = device.target();

            pass = B.Test.makeTestPass(device);
            stage = B.Test.makeTestStage(device, device.target());
            mesh = B.Test.makeTestMesh(device);
            material = B.Test.makeTestMaterial(device, "material", stage, pass);
            instance = B.Test.makeTestInstance(device, "material", mesh);

            initStub(device);
            stubPass(pass);
        });

        after(function () {

            programStub.restore();
            attrStub.restore();

            stage && stage.free();
            pass && pass.free();
            mesh && mesh.free();
            material && material.free();

            device.free();
        });

        it("should exist", function () {
            expect(R.Device.Target).to.exist;
        });

        it("should be created by a device", function () {

            expect(target).to.be.instanceof(R.Device.Target);
            expect(target.device()).to.equal(device);
        });

        it("should have the same color and depth format as a device", function () {

            expect(target.colorFormat(), "colorFormat").to.equal(F.RGBA);
            expect(target.depthFormat(), "depth").to.equal(F.DEPTH);
        });

        it("should return multisample coverage mask size", function () {

            expect(target.multisamples()).to.be.a("number");
        });

        it("should have the same sizes as canvas", function () {

            expect(target.width(), "width").to.be.a("number").and.equal(canvas.clientWidth);
            expect(target.height(), "height").to.be.a("number").and.equal(canvas.clientHeight);
            expect(target.size(), "size").to.be.instanceof(B.Math.Vector2).and.
                equalByComponents(canvas.clientWidth, canvas.clientHeight);
        });

        it("should clone the target to a new target object", function () {

            var clone = target.clone(),
                cloneWidth = R.toPowerOfTwo(target.width()),
                cloneHeight = R.toPowerOfTwo(target.height());

            expect(clone).to.be.instanceof(R.Target).and.not.to.equal(target);
            expect(clone.device(), "device").to.equal(target.device());
            expect(clone.width(), "width").to.equal(cloneWidth);
            expect(clone.height(), "height").to.equal(cloneHeight);
            expect(clone.size(), "size").to.equalByComponents(cloneWidth, cloneHeight);
        });

        it("should clone the target to a new target object using scale factor", function () {

            var clone = target.clone(0.5),
                cloneWidth = R.toPowerOfTwo(target.width() * 0.5),
                cloneHeight = R.toPowerOfTwo(target.height() * 0.5);

            expect(clone).to.be.instanceof(R.Target).and.not.to.equal(target);
            expect(clone.device(), "device").to.equal(target.device());
            expect(clone.width(), "width").to.equal(cloneWidth);
            expect(clone.height(), "height").to.equal(cloneHeight);
            expect(clone.size(), "size").to.equalByComponents(cloneWidth, cloneHeight);
        });

        it("should make frame with device target as output", function () {

            expect(function () {
                device.frame();
            },
            "frame execution").to.not.throw();
        });
    });

    describe("antialiasing support", function () {

        var device;

        afterEach(function () {
            device && device.free();
        });

        it("should not add antialiasing support if parameter is set to false", function () {

            device = R.makeDevice(
                canvas,
                F.RGBA,
                F.DEPTH,
                { antialias : false }
            );

            expect(device.target().multisamples()).to.equal(0);
        });

        it("should add antialiasing support if parameter is set", function () {

            device = R.makeDevice(
                canvas,
                F.RGBA,
                F.DEPTH,
                { antialias : true }
            );

            expect(device.target().multisamples()).to.be.above(0);
        });
    });

    describe("makers", function () {

        var device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        describe("#makeMesh", function () {

            it("should create a new mesh object", function () {

                var spy = sinon.spy(B.Render, "Mesh");

                device.makeMesh();
                expect(spy).to.be.calledWith(device);
            });
        });

        describe("#makeTexture", function () {

            it("should create a new texture object", function () {

                var spy = sinon.spy(B.Render, "Texture");

                device.makeTexture(F.RGBA, 128, 128, 1, 1);
                expect(spy).to.be.calledWith(device, F.RGBA, 128, 128, 1, 1);
            });
        });

        describe("#makeDepth", function () {

            it("should create a new depth object", function () {

                var spy = sinon.spy(B.Render, "Depth");

                device.makeDepth(F.DEPTH, 128, 128);
                expect(spy).to.be.calledWith(device, F.DEPTH, 128, 128);
            });
        });

        describe("#makeTarget", function () {

            it("should create a new target object", function () {

                var spy = sinon.spy(B.Render, "Target");

                device.makeTarget(F.RGBA, F.DEPTH, 128, 128);
                expect(spy).to.be.calledWith(device, F.RGBA, F.DEPTH, 128, 128);
            });
        });

        describe("#makePass", function () {

            it("should create a new pass object", function () {

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
                    spy = sinon.spy(B.Render, "Pass");

                device.makePass(vs, fs, {});
                expect(spy).to.be.calledWith(device, vs, fs, {});
            });
        });
    });

    describe("#stage", function () {

        var stage0, stage1, stages,
            device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        it("should add a new stage object", function () {

            var spy = sinon.spy(B.Render, "Stage");

            stage0 = device.stage("new");
            expect(spy).to.be.calledWith(device, "new");
        });

        it("should return existing stage by name", function () {
            expect(device.stage("new")).to.equal(stage0);
        });

        it("should add new stage before existing stage", function () {

            stage1 = device.stage("pre-new", "new");
            expect(device.stage("pre-new")).to.equal(stage1);

            stages = device.stages();
            expect(stages.indexOf("pre-new")).to.be.below(stages.indexOf("new"));
        });
    });

    describe("#stages", function () {

        var stages, device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        it("should return empty array if no stage is added yet", function () {
            expect(device.stages()).to.be.an("array").and.be.empty;
        });

        it("should return ordered array of all stage names", function () {

            device.stage("2");
            device.stage("1", "2");
            device.stage("0", "1");

            stages = device.stages();
            expect(stages).to.be.not.empty;
            expect(stages.indexOf("0")).to.be.below(stages.indexOf("1"));
            expect(stages.indexOf("1")).to.be.below(stages.indexOf("2"));
        });
    });

    describe("#material", function () {

        var mtrl0, mtrl1, materials,
            device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        it("should add a new material object", function () {

            var spy = sinon.spy(B.Render, "Material");

            mtrl0 = device.material("new");
            expect(spy).to.be.calledWith(device, "new");
        });

        it("should return existing material by name", function () {
            expect(device.material("new")).to.equal(mtrl0);
        });

        it("should add new material before existing stage", function () {

            mtrl1 = device.material("pre-new", "new");
            expect(device.material("pre-new")).to.equal(mtrl1);

            materials = device.materials();
            expect(materials.indexOf("pre-new")).to.be.below(materials.indexOf("new"));
        });
    });

    describe("#materials", function () {

        var materials, device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        it("should return empty array if no material is added yet", function () {
            expect(device.materials()).to.be.an("array").and.be.empty;
        });

        it("should return ordered array of all material names", function () {

            device.material("2");
            device.material("1", "2");
            device.material("0", "1");

            materials = device.materials();
            expect(materials).to.be.not.empty;
            expect(materials.indexOf("0")).to.be.below(materials.indexOf("1"));
            expect(materials.indexOf("1")).to.be.below(materials.indexOf("2"));
        });
    });

    describe("#instance", function () {

        var material, mesh, device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
            mesh = device.makeMesh();
            material = device.material("material");
        });

        after(function () {
            device.free();
        });

        it("should throw if material is not found", function () {

            expect(function () {
                device.instance("unknown", mesh, B.Math.Matrix4.IDENTITY, true);
            }).to.throw(R.Error);
        });

        it("should create and add a new instance to the rendering", function () {

            var spy = sinon.spy(B.Render, "Instance");

            device.instance(material, mesh, B.Math.Matrix4.IDENTITY, true);
            expect(spy).to.be.calledWith(device, material, mesh, B.Math.Matrix4.IDENTITY, true);
        });
    });

    describe("#uniform", function () {

        var M = B.Math, V3 = M.Vector3,
            device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        it("should return null if uniform is not found", function () {

            expect(device.uniform("unknown")).to.equal(null);
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

                device.uniform(name, uniform);
                expect(device.uniform(name), name).to.equal(uniform);
            }
        });

        it("should remove existing uniform", function () {

            device.uniform("number", null);

            expect(device.uniform("number")).to.equal(null);
        });
    });

    describe("#uniforms", function () {

        var device;

        before(function () {
            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
        });

        after(function () {
            device.free();
        });

        it("should return empty array if no uniforms are set yet", function () {

            expect(device.uniforms()).to.be.empty;
        });

        it("should return an array of names", function () {

            var uniforms = ["u0", "u1", "u2", "u3"];

            uniforms.forEach(function (name) {
                device.uniform(name, 1.0);
            });

            expect(device.uniforms()).to.deep.equal(uniforms);
        });
    });

    describe("uniforms binding", function () {

        var M = B.Math, V3 = M.Vector3,
            pass, stage, spy, device;

        before(function () {

            device = R.makeDevice(canvas, F.RGBA, F.DEPTH);
            pass = B.Test.makeTestPass(device);

            stage = device.stage("new").
                view(M.makeMatrix4().lookAt(V3.ZERO, V3.Z, V3.Y)).
                proj(M.makeMatrix4().orthographic(300, 200, 10, 100));

            spy = sinon.spy(pass, "_uniform");
        });

        after(function () {
            stage && stage.free();
            pass && pass.free();
            device.free();
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

                device.uniform("uniform", value);
                device._bindUniforms(pass);
                expect(spy, name).to.be.calledWith("uniform", value);
                spy.reset();
            }
        });

        it("should set value automatically if uniform is one of defined placeholders", function () {

            var uniforms = [
                    {"name": "TIME", "placeholder": R.Device.TIME},
                    {"name": "DELTA_TIME", "placeholder": R.Device.DELTA_TIME}
                ],
                uniform, i, l;

            for(i = 0, l = uniforms.length; i < l; i += 1) {

                uniform = uniforms[i];

                device.uniform("uniform", uniform["placeholder"]);
                device._bindUniforms(pass);

                expect(spy, uniform["name"]).to.be.called;
                expect(spy.getCall(0).args[0]).to.equal("uniform");
                expect(spy.getCall(0).args[1]).a("number");

                spy.reset();
            }
        });
    });
});