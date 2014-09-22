
describe("B.Render.Depth", function () {

    var R = B.Render,
        F = B.Render.Format,

        formats = [
            F.DEPTH,
            F.DEPTH_STENCIL
        ],
        canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.Depth).to.exist;
    });

    describe("#constructor", function () {

        it("should be created with all supported formats", function () {

            var i, l, format, depth;

            for (i = 0, l = formats.length; i < l; i += 1) {

                format = formats[i];
                depth = device.makeDepth(format, 256, 256);

                expect(depth.format(), "format").to.equal(format);
                expect(depth.width(), "width").to.equal(256);
                expect(depth.height(), "height").to.equal(256);
                expect(depth.size(), "size").to.equalByComponents(256, 256);
                expect(depth.readable(), "readable").to.equal(false);
            }
        });

        it("should throw if format is unknown or not supported", function () {

            var fn = function () {
                device.makeDepth(-1, 256, 256);
            };

            expect(fn).to.throw(R.Error);
        });

        it("should throw if width parameter is missed", function () {

            var fn = function () {
                device.makeDepth(F.DEPTH, undefined, 256);
            };

            expect(fn).to.throw(R.Error);
        });

        it("should throw if height parameter is missed", function () {

            var fn = function () {
                device.makeDepth(F.DEPTH, 256);
            };

            expect(fn).to.throw(R.Error);
        });

        it("should throw if width is not power of 2", function () {

            var fn = function () {
                device.makeDepth(F.DEPTH, 300, 256);
            };

            expect(fn).to.throw(R.Error);
        });

        it("should throw if height is not power of 2", function () {

            var fn = function () {
                device.makeDepth(F.DEPTH, 256, 200);
            };

            expect(fn).to.throw(R.Error);
        });

        it("should throw if width is greater than 'device.caps().depthMaxSize'", function () {

            var depthMaxSize = device.caps().depthMaxSize,
                fn = function () {
                    device.makeDepth(F.DEPTH, depthMaxSize * 2, 256);
                };

            expect(fn).to.throw(R.Error);
        });

        it("should throw if height is greater than 'device.caps().depthMaxSize'", function () {

            var depthMaxSize = device.caps().depthMaxSize,
                fn = function () {
                    device.makeDepth(F.DEPTH, 256, depthMaxSize * 2);
                };

            expect(fn).to.throw(R.Error);
        });

        it("should be created with all supported formats (readable)", function () {

            var i, l, format, depth;

            for (i = 0, l = formats.length; i < l; i += 1) {

                format = formats[i];
                depth = device.makeDepth(format, 256, 256, true);

                expect(depth.format(), "format").to.equal(format);
                expect(depth.width(), "width").to.equal(256);
                expect(depth.height(), "height").to.equal(256);
                expect(depth.size(), "size").to.equalByComponents(256, 256);
                expect(depth.readable(), "readable").to.equal(true);
            }
        });

        it("should throw if reading flag is true but reading is not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ readableDepth: false });

                expect(
                    function () {
                        device.makeDepth(F.DEPTH, 256, 256, true);
                    }
                ).to.throw(R.Error);
            })
        );
    });

    describe("#free", function () {

        it("should free depth and detach rendering device", function () {

            var depth = device.makeDepth(F.DEPTH, 256, 256);

            depth.free();
            expect(depth.device()).to.not.equal(device);
        });
    });

    describe("reading", function () {

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
                programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(1);
                programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

                attrStub.returns({});
                attrStub.withArgs(glProgram, 0).
                    returns({ type: gl.FLOAT_VEC3, name: "position" });

                uniformStub.withArgs(glProgram, 0).
                    returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform" });

                pass.compile(pass.source(R.Shader.VERTEX), pass.source(R.Shader.FRAGMENT));
            },

            device, pass, instance, mesh, material, stage1, stage2, target,
            programStub, attrStub, uniformStub,

            before = function (readableDepth) {

                device = R.makeDevice(canvas);

                pass = B.Test.makeTestPass(device);
                target = B.Test.makeTestTarget(device, readableDepth);
                stage1 = B.Test.makeTestStage(device, target, "1");
                stage2 = B.Test.makeTestStage(device, device.target(), "2");
                mesh = B.Test.makeTestMesh(device);
                material = device.material("material").pass(stage1, pass).pass(stage2, pass);
                instance = B.Test.makeTestInstance(device, "material", mesh);

                initStub(device);
                stubPass(pass);

                stage2.uniform("sampler2dUniform", target.depth());
            };

        afterEach(function () {

            programStub.restore();
            attrStub.restore();
            uniformStub.restore();

            target && target.free();
            stage1 && stage1.free();
            stage2 && stage2.free();
            pass && pass.free();
            mesh && mesh.free();
            material && material.free();

            device.free();
        });

        it("should make frame", function () {

            before(true);

            expect(
                function () {
                    device.frame();
                },
            "frame execution").to.not.throw();
        });

        it("should throw if the depth buffer wasn't created readable", function () {

            before(false);

            expect(
                function () {
                    device.frame();
                },
                "frame execution").to.throw(R.Error);
        });

        it("should throw if reading is not supported", sinon.test(function () {

            before(false);

            this.stub(device, "caps").returns({ readableDepth: false });

            expect(
                function () {
                    device.frame();
                },
            "frame execution").to.throw(R.Error);
        }));
    });
});