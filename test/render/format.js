
describe("B.Render.Format", function () {

    var R = B.Render,
        F = R.Format,

        formatToStr = B.Test.formatToStr,
        formats = [
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
            F.RGBA_F32,
            F.DEPTH,
            F.DEPTH_STENCIL
        ];

    it("should exist", function () {
        expect(B.Render.Format).to.exist;
    });

    describe("B.Render.formatBitSize", function () {

        it("should return non-zero value for B.Render.Format", function () {

            var format, i, l;

            for(i = 0, l = formats.length; i < l; i += 1) {

                format = formats[i];
                expect(R.formatBitSize(format), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return zero value for unknown format type", function () {

            expect(R.formatBitSize(-1)).to.equal(0);
            expect(R.formatBitSize(10000)).to.equal(0);
        });
    });

    describe("B.Render.formatBlockByteSize", function () {

        var correct = [
                F.RGB_DXT1,
                F.RGBA_DXT5
            ],
            incorrect = [
                F.A,
                F.RGB,
                F.RGBA,
                F.A_F16,
                F.RGB_F16,
                F.RGBA_F16,
                F.A_F32,
                F.RGB_F32,
                F.RGBA_F32,
                F.DEPTH,
                F.DEPTH_STENCIL
            ];

        it("should return non-zero value if compressed format", function () {

            var format, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                format = correct[i];
                expect(R.formatBlockByteSize(format), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return false if format is not compressed format", function () {

            var format, i, l;

            for(i = 0, l = incorrect.length; i < l; i += 1) {

                format = incorrect[i];
                expect(R.formatBlockByteSize(format), formatToStr(format)).to.equal(0);
            }
        });

        it("should return zero value if format is unknown", function () {

            expect(R.formatBlockByteSize(-1)).to.equal(0);
            expect(R.formatBlockByteSize(10000)).to.equal(0);
        });
    });

    describe("B.Render.formatBlockTexelSize", function () {

        var correct = [
                F.RGB_DXT1,
                F.RGBA_DXT5
            ],
            incorrect = [
                F.A,
                F.RGB,
                F.RGBA,
                F.A_F16,
                F.RGB_F16,
                F.RGBA_F16,
                F.A_F32,
                F.RGB_F32,
                F.RGBA_F32,
                F.DEPTH,
                F.DEPTH_STENCIL
            ];

        it("should return non-zero value if compressed format", function () {

            var format, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                format = correct[i];
                expect(R.formatBlockTexelSize(format), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return false if format is not compressed format", function () {

            var format, i, l;

            for(i = 0, l = incorrect.length; i < l; i += 1) {

                format = incorrect[i];
                expect(R.formatBlockTexelSize(format), formatToStr(format)).to.equal(0);
            }
        });

        it("should return zero value if format is unknown", function () {

            expect(R.formatBlockTexelSize(-1)).to.equal(0);
            expect(R.formatBlockTexelSize(10000)).to.equal(0);
        });
    });

    describe("B.Render.imagePitch", function () {

        it("should return non-zero value for B.Render.Format", function () {

            var format, i, l;

            for(i = 0, l = formats.length; i < l; i += 1) {

                format = formats[i];
                expect(R.imagePitch(format, 256), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return zero value for unknown format type", function () {

            expect(R.imagePitch(-1, 256)).to.equal(0);
            expect(R.imagePitch(10000, 256)).to.equal(0);
        });
    });

    describe("B.Render.imageRows", function () {

        it("should return non-zero value for B.Render.Format", function () {

            var format, i, l;

            for(i = 0, l = formats.length; i < l; i += 1) {

                format = formats[i];
                expect(R.imageRows(format, 256), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return zero value for unknown format type", function () {

            expect(R.imageRows(-1, 256)).to.equal(0);
            expect(R.imageRows(10000, 256)).to.equal(0);
        });
    });

    describe("B.Render.imageByteSize", function () {

        it("should return non-zero value for B.Render.Format", function () {

            var format, i, l;

            for(i = 0, l = formats.length; i < l; i += 1) {

                format = formats[i];
                expect(R.imageByteSize(format, 256, 256), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return zero value for unknown format type", function () {

            expect(R.imageByteSize(-1, 256, 256)).to.equal(0);
            expect(R.imageByteSize(10000, 256, 256)).to.equal(0);
        });
    });

    describe("B.Render.checkColorFormat", function () {

        var device;

        before(function () {
            device = R.makeDevice(new B.Test.FakeCanvas(300, 200));
        });

        after(function () {
            device && device.free();
        });

        it("should always return true if format is B.Render.Format.A, B.Render.Format.RGB or " +
            "B.Render.Format.RGBA",
            function () {

                expect(R.checkColorFormat(device, F.A), formatToStr(F.A)).to.be.true;
                expect(R.checkColorFormat(device, F.RGB), formatToStr(F.RGB)).to.be.true;
                expect(R.checkColorFormat(device, F.RGBA), formatToStr(F.RGBA)).to.be.true;
            }
        );

        it("should always return true if format is B.Render.Format.A, B.Render.Format.RGB or " +
            "B.Render.Format.RGBA regardless of whether 'renderable' flag is set",
            function () {

                expect(R.checkColorFormat(device, F.A, true), formatToStr(F.A)).to.be.true;
                expect(R.checkColorFormat(device, F.RGB, true), formatToStr(F.RGB)).to.be.true;
                expect(R.checkColorFormat(device, F.RGBA, true), formatToStr(F.RGBA)).to.be.true;
            }
        );

        it("should return true if format is B.Render.Format.RGB_DXT1 or " +
            "B.Render.Format.RGBA_DXT5 and compressed texture formats are supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureDXT: true });

                expect(R.checkColorFormat(device, F.RGB_DXT1), formatToStr(F.RGB_DXT1)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGBA_DXT5), formatToStr(F.RGBA_DXT5)).
                    to.be.true;
            })
        );

        it("should return false if format is B.Render.Format.RGB_DXT1 or " +
            "B.Render.Format.RGBA_DXT5 but compressed texture formats are not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureDXT: false });

                expect(R.checkColorFormat(device, F.RGB_DXT1), formatToStr(F.RGB_DXT1)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_DXT5), formatToStr(F.RGBA_DXT5)).
                    to.be.false;
            })
        );

        it("should always return false if format is B.Render.Format.RGB_DXT1 or " +
            "B.Render.Format.RGBA_DXT5 and 'renderable' flag is set " +
            "regardless of whether compressed texture formats are supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureDXT: true });

                expect(R.checkColorFormat(device, F.RGB_DXT1, true), formatToStr(F.RGB_DXT1)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_DXT5, true), formatToStr(F.RGBA_DXT5)).
                    to.be.false;
            })
        );

        it("should always return false if format is B.Render.Format.RGB_DXT1 or " +
            "B.Render.Format.RGBA_DXT5 and 'renderable' flag is set " +
            "regardless of whether compressed texture formats are not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureDXT: false });

                expect(R.checkColorFormat(device, F.RGB_DXT1, true), formatToStr(F.RGB_DXT1)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_DXT5, true), formatToStr(F.RGBA_DXT5)).
                    to.be.false;
            })
        );

        it("should return false if format is B.Render.Format.A_F16, B.Render.Format.RGB_F16 or "+
            "B.Render.Format.RGBA_F16 and 16-bit floating point texture formats are not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureFloat16: false });

                expect(R.checkColorFormat(device, F.A_F16), formatToStr(F.A_F16)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGB_F16), formatToStr(F.RGB_F16)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_F16), formatToStr(F.RGBA_F16)).
                    to.be.false;
            })
        );

        it("should return true if format is B.Render.Format.A_F16, B.Render.Format.RGB_F16 or " +
            "B.Render.Format.RGBA_F16 and 16-bit floating point texture formats are supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureFloat16: true });

                expect(R.checkColorFormat(device, F.A_F16), formatToStr(F.A_F16)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGB_F16), formatToStr(F.RGB_F16)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGBA_F16), formatToStr(F.RGBA_F16)).
                    to.be.true;
            })
        );

        it("should return false if format is B.Render.Format.A_F16, B.Render.Format.RGB_F16 or " +
            "B.Render.Format.RGBA_F16 and 'renderable' flag is set but " +
            "rendering to 16-bit floating point texture is not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ colorTargetFloat16: false });

                expect(R.checkColorFormat(device, F.A_F16, true), formatToStr(F.A_F16)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGB_F16, true), formatToStr(F.RGB_F16)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_F16, true), formatToStr(F.RGBA_F16)).
                    to.be.false;
            })
        );

        it("should return true if format is B.Render.Format.A_F16, B.Render.Format.RGB_F16 " +
            "or B.Render.Format.RGBA_F16, 'renderable' flag is set and " +
            "rendering to 16-bit floating point texture is supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ colorTargetFloat16: true });

                expect(R.checkColorFormat(device, F.A_F16, true), formatToStr(F.A_F16)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGB_F16, true), formatToStr(F.RGB_F16)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGBA_F16, true), formatToStr(F.RGBA_F16)).
                    to.be.true;
            })
        );

        it("should return false if format is B.Render.Format.A_F32, " +
            "B.Render.Format.RGB_F32 or B.Render.Format.RGBA_F32 and " +
            "32-bit floating point texture formats are not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureFloat32: false });

                expect(R.checkColorFormat(device, F.A_F32), formatToStr(F.A_F32)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGB_F32), formatToStr(F.RGB_F32)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_F32), formatToStr(F.RGBA_F32)).
                    to.be.false;
            })
        );

        it("should return true if format is B.Render.Format.A_F32, " +
            "B.Render.Format.RGB_F32 or B.Render.Format.RGBA_F32 and " +
            "32-bit floating point texture formats are supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ textureFloat32: true });

                expect(R.checkColorFormat(device, F.A_F32), formatToStr(F.A_F32)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGB_F32), formatToStr(F.RGB_F32)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGBA_F32), formatToStr(F.RGBA_F32)).
                    to.be.true;
            })
        );

        it("should return false if format is B.Render.Format.A_F32, " +
            "B.Render.Format.RGB_F32 or B.Render.Format.RGBA_F32 and 'renderable' flag is set " +
            "but rendering to 32-bit floating point texture is not supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ colorTargetFloat32: false });

                expect(R.checkColorFormat(device, F.A_F32, true), formatToStr(F.A_F32)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGB_F32, true), formatToStr(F.RGB_F32)).
                    to.be.false;
                expect(R.checkColorFormat(device, F.RGBA_F32, true), formatToStr(F.RGBA_F32)).
                    to.be.false;
            })
        );

        it("should return true if format is B.Render.Format.A_F32, " +
            "B.Render.Format.RGB_F32 or B.Render.Format.RGBA_F32, 'renderable' flag is set " +
            "and rendering to 32-bit floating point texture is supported",
            sinon.test(function () {

                this.stub(device, "caps").returns({ colorTargetFloat32: true });

                expect(R.checkColorFormat(device, F.A_F32, true), formatToStr(F.A_F32)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGB_F32, true), formatToStr(F.RGB_F32)).
                    to.be.true;
                expect(R.checkColorFormat(device, F.RGBA_F32, true), formatToStr(F.RGBA_F32)).
                    to.be.true;
            })
        );

        it("should always return false if format is B.Render.Format.DEPTH or " +
            "B.Render.Format.DEPTH_STENCIL",
            function () {

                expect(R.checkColorFormat(device, F.DEPTH), formatToStr(F.DEPTH)).to.be.false;
                expect(R.checkColorFormat(device, F.DEPTH_STENCIL), formatToStr(F.DEPTH_STENCIL)).
                    to.be.false;
            }
        );

        it("should always return false if format is B.Render.Format.DEPTH or " +
            "B.Render.Format.DEPTH_STENCIL regardless of whether 'renderable' flag is set",
            function () {

                expect(R.checkColorFormat(device, F.DEPTH, true), formatToStr(F.DEPTH)).to.be.false;
                expect(R.checkColorFormat(device, F.DEPTH_STENCIL, true),
                    formatToStr(F.DEPTH_STENCIL)).to.be.false;
            }
        );
    });

    describe("B.Render.checkDepthFormat", function () {

        var incorrect = [
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
            correct = [
                F.DEPTH,
                F.DEPTH_STENCIL
            ],

            device;

        before(function () {
            device = R.makeDevice(new B.Test.FakeCanvas(300, 200));
        });

        after(function () {
            device && device.free();
        });

        it("should return true if format is depth/stencil",
            function () {

            var format, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                format = correct[i];
                expect(R.checkDepthFormat(device, format), formatToStr(format)).to.be.true;
            }
        });

        it("should return false if format is not depth/stencil", function () {

            var format, i, l;

            for(i = 0, l = incorrect.length; i < l; i += 1) {

                format = incorrect[i];
                expect(R.checkDepthFormat(device, format), formatToStr(format)).to.be.false;
            }
        });
    });

    describe("B.Render.toGLColorFormat", function () {

        var correct = [
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
            incorrect = [
                F.DEPTH,
                F.DEPTH_STENCIL
            ],

            device;

        before(function () {
            device = R.makeDevice(new B.Test.FakeCanvas(300, 200));
        });

        after(function () {
            device && device.free();
        });

        it("should return non-zero value if format is not depth/stencil",
            function () {

                var format, i, l;

                for(i = 0, l = correct.length; i < l; i += 1) {

                    format = correct[i];
                    expect(R.toGLColorFormat(device, format), formatToStr(format)).to.not.equal(0);
                }
            }
        );

        it("should return undefined value if format is B.Render.Format.RGB_DXT1 or " +
            "B.Render.Format.RGBA_DXT5 and compressed textures are not supported", 
            sinon.test(function () {

                this.stub(device, "_ext").returns(undefined);
    
                expect(R.toGLColorFormat(device, F.RGB_DXT1),
                    formatToStr(F.RGB_DXT1)).to.equal(undefined);
                expect(R.toGLColorFormat(device, F.RGBA_DXT5),
                    formatToStr(F.RGBA_DXT5)).to.equal(undefined);
            })
        );

        it("should return undefined value if format is depth/stencil", function () {

            var format, i, l;

            for(i = 0, l = incorrect.length; i < l; i += 1) {

                format = incorrect[i];
                expect(R.toGLColorFormat(device, format), formatToStr(format)).to.equal(undefined);
            }
        });
    });

    describe("B.Render.toGLDepthFormat", function () {

        var incorrect = [
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
            correct = [
                F.DEPTH,
                F.DEPTH_STENCIL
            ],

            device;

        before(function () {
            device = R.makeDevice(new B.Test.FakeCanvas(300, 200));
        });

        after(function () {
            device && device.free();
        });

        it("should return non-zero value if format is depth/stencil", function () {

            var format, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                format = correct[i];
                expect(R.toGLDepthFormat(device, format), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return non-zero value if format is depth/stencil and 'sampleable' flag is set",
            function () {

                var format, i, l;

                for(i = 0, l = correct.length; i < l; i += 1) {

                    format = correct[i];
                    expect(R.toGLDepthFormat(device, format, true), formatToStr(format)).
                        to.not.equal(0);
                }
            }
        );

        it("should return undefined value if format is not depth/stencil", function () {

            var format, i, l;

            for(i = 0, l = incorrect.length; i < l; i += 1) {

                format = incorrect[i];
                expect(R.toGLDepthFormat(device, format), formatToStr(format)).to.equal(undefined);
            }
        });
    });

    describe("B.Render.toGLType", function () {

        var correct = [
                F.A,
                F.RGB,
                F.RGBA,
                F.A_F16,
                F.RGB_F16,
                F.RGBA_F16,
                F.A_F32,
                F.RGB_F32,
                F.RGBA_F32,
                F.DEPTH,
                F.DEPTH_STENCIL
            ],

            device;

        before(function () {
            device = R.makeDevice(new B.Test.FakeCanvas(300, 200));
        });

        after(function () {
            device && device.free();
        });

        it("should return non-zero value for B.Render.Format", function () {
            var format, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                format = correct[i];
                expect(R.toGLType(device, format), formatToStr(format)).to.not.equal(0);
            }
        });

        it("should return undefined value if format is B.Render.Format.A_F16, " +
            "B.Render.Format.RGB_F16 or B.Render.Format.RGBA_F16 but" +
            "texture half float is not supported",
            sinon.test(function () {

                this.stub(device, "_ext").returns(undefined);

                expect(R.toGLType(device, F.A_F16), formatToStr(F.A_F16)).to.equal(undefined);
                expect(R.toGLType(device, F.RGB_F16), formatToStr(F.RGB_F16)).to.equal(undefined);
                expect(R.toGLType(device, F.RGBA_F16), formatToStr(F.RGBA_F16)).to.equal(undefined);
            })
        );

        it("should return undefined value if format is B.Render.Format.DEPTH_STENCIL but" +
            "depth texture is not supported",
            sinon.test(function () {

                this.stub(device, "_ext").returns(undefined);

                expect(R.toGLType(device, F.DEPTH_STENCIL), formatToStr(F.DEPTH_STENCIL)).
                    to.equal(undefined);
            })
        );

        it("should return undefined value if format is unknown", function () {

            expect(R.toGLType(device, -1)).to.equal(undefined);
            expect(R.toGLType(device, 1000)).to.equal(undefined);
        });
    });
});