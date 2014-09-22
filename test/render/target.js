
describe("B.Render.Target", function () {

    var R = B.Render,
        F = R.Format,

        formatToStr = B.Test.formatToStr,
        color = [
            F.A,
            F.RGB,
            F.RGBA
        ],
        compressed = [
            F.RGB_DXT1,
            F.RGBA_DXT5
        ],
        float16 = [
            F.A_F16,
            F.RGB_F16,
            F.RGBA_F16
        ],
        float32 = [
            F.A_F32,
            F.RGB_F32,
            F.RGBA_F32
        ],
        depthFormat = [
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
        expect(B.Render.Target).to.exist;
    });

    describe("#constructor", function () {

        var
            createFn = function (color, depth, width, height) {
                return function () {
                    device.makeTarget(color, depth, width, height);
                };
            },
            makeFrame = function (target, desc) {

                stage.output(target);
                expect(function () {
                    device.frame();
                },
                "frame execution: " + desc).to.not.throw();
            },

            stage;

        before(function () {
            stage = device.stage("new");
        });

        after(function () {
            stage && stage.free();
        });

        it("should be created by device", function () {

            var target = device.makeTarget(F.RGBA, F.DEPTH, 128, 128);

            expect(target).to.be.instanceof(B.Render.Target);
            expect(target.device()).to.equal(device);
        });

        describe("[color]", function () {

            describe("[format]", function () {

                it("should create target if format is color",
                    function () {

                        var target, colorTarget, format, i, l;

                        for(i = 0, l = color.length; i < l; i += 1) {

                            format = color[i];
                            target = device.makeTarget(format, null, 128, 128);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    });

                it("should throw if color format is compressed",
                    function () {

                        var format, i, l;

                        for(i = 0, l = compressed.length; i < l; i += 1) {
                            format = compressed[i];
                            expect(createFn(format, null, 128, 128), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    }
                );

                it("should create target if format is float16 and " +
                    "rendering to 16-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, i, l;

                        this.stub(device, "caps").returns(
                            { colorTargetFloat16: true, textureFloat16: true }
                        );
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            target = device.makeTarget(format, null, 128, 128);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if format is float16 but " +
                    "rendering to 16-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns(
                            { colorTargetFloat16: false, textureFloat16: true }
                        );
                        for(i = 0, l = float16.length; i < l; i += 1) {
                            format = float16[i];
                            expect(createFn(format, null, 128, 128), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should create target if format is float32 and " +
                    "rendering to 32-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, i, l;

                        this.stub(device, "caps").returns(
                            { colorTargetFloat32: true, textureFloat32: true }
                        );
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            target = device.makeTarget(format, null, 128, 128);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if format is float32 but " +
                    "rendering to 32-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns(
                            { colorTargetFloat32: true, textureFloat32: false }
                        );
                        for(i = 0, l = float32.length; i < l; i += 1) {
                            format = float32[i];
                            expect(createFn(format, null, 128, 128), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is unknown or not supported", function () {

                    expect(createFn(-1, null, 128, 128)).to.throw(R.Error);
                });
            });

            describe("[texture]", function () {

                it("should create target if texture format is color",
                    function () {

                        var target, colorTarget, format, texture, i, l;

                        for(i = 0, l = color.length; i < l; i += 1) {

                            format = color[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            target = device.makeTarget(texture);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    }
                );

                it("should throw if texture format is compressed",
                    sinon.test(function () {

                        var format, texture, i, l;

                        this.stub(device, "caps").returns({ textureDXT: true });
                        for(i = 0, l = compressed.length; i < l; i += 1) {
                            format = compressed[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            expect(createFn(texture), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should create target if texture format is float16 and " +
                    "rendering to 16-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: true,
                            textureFloat16: true});
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            target = device.makeTarget(texture);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if texture format is float16 and " +
                    "rendering to 16-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: false,
                            textureFloat16: true});
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            expect(createFn(texture), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should create target if format is float32 and " +
                    "rendering to 32-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: true,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            target = device.makeTarget(texture);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if format is float32 but " +
                    "rendering to 32-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: false,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            expect(createFn(texture), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );
            });

            describe("[mip]", function () {

                it("should create target if format is color",
                    function () {

                        var target, colorTarget, format, mip, i, l;

                        for(i = 0, l = color.length; i < l; i += 1) {

                            format = color[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            target = device.makeTarget(mip);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    }
                );

                it("should throw if format is compressed",
                    sinon.test(function () {

                        var format, mip, i, l;

                        this.stub(device, "caps").returns({ textureDXT: true });
                        for(i = 0, l = compressed.length; i < l; i += 1) {
                            format = compressed[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            expect(createFn(mip), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should create target if format is float16 and " +
                    "rendering to 16-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: true,
                            textureFloat16: true});
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            target = device.makeTarget(mip);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should create target if format is float16 and " +
                    "rendering to 16-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: false,
                            textureFloat16: true});
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            expect(createFn(mip), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );


                it("should create target if format is float32 and " +
                    "rendering to 32-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: true,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            target = device.makeTarget(mip);
                            colorTarget = target.color();
                            expect(colorTarget.format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if format is float32 but " +
                    "rendering to 32-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: false,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            expect(createFn(mip), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );
            });

            describe("[array of formats]", function () {

                it("should create target if format is array of color formats",
                    function () {

                        var target, colorTarget, format, i, l;

                        target = device.makeTarget(color, null, 128, 128);
                        colorTarget = target.color();
                        expect(colorTarget).to.be.an("array").with.length(color.length);

                        for(i = 0, l = colorTarget.length; i < l; i += 1) {
                            format = colorTarget[i].format();
                            expect(format, formatToStr(format)).to.equal(color[i]);
                        }
                        makeFrame(target, formatToStr(format));
                    }
                );

                it("should throw if array of color formats contains compressed format",
                    function () {

                        var format, i, l;

                        for(i = 0, l = compressed.length; i < l; i += 1) {
                            format = compressed[i];
                            expect(createFn([F.A, F.RGB, F.RGBA, format], null, 128, 128),
                                formatToStr(format)).to.throw(R.Error);
                        }
                    }
                );

                it("should create target if array of color formats contains float16 format and " +
                    "rendering to 16-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: true,
                            textureFloat16: true});
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            target = device.makeTarget(
                                [F.A, F.RGB, F.RGBA, format], null, 128, 128
                            );
                            colorTarget = target.color();
                            expect(colorTarget).to.be.an("array").with.length(4);
                            expect(colorTarget[3].format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if array of color formats contains float16 format and " +
                    "rendering to 16-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: false,
                            textureFloat16: true });
                        for(i = 0, l = float16.length; i < l; i += 1) {
                            format = float16[i];
                            expect(createFn([F.A, F.RGB, F.RGBA, format], null, 128, 128),
                                formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should create target if array of color formats contains float32 format " +
                    "and rendering to 32-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: true,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            target = device.makeTarget(
                                [F.A, F.RGB, F.RGBA, format], null, 128, 128
                            );
                            colorTarget = target.color();
                            expect(colorTarget).to.be.an("array").with.length(4);
                            expect(colorTarget[3].format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if array of color formats contains float32 format and " +
                    "rendering to 32-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: false,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {
                            format = float32[i];
                            expect(createFn([F.A, F.RGB, F.RGBA, format], null, 128, 128),
                                formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if color target count is greater than " +
                    "device.caps().colorTargetCount",
                    sinon.test(function () {

                        this.stub(device, "caps").returns({ colorTargetCount: 4 });
                        expect(createFn([F.A, F.RGB, F.RGBA, F.RGB, F.A], null, 128, 128)).
                            to.throw(R.Error);
                    })
                );

                it("should throw if format is unknown or not supported", function () {
                    expect(createFn([F.A, F.RGB, F.RGBA, -1], null, 128, 128)).to.throw(R.Error);
                });

                it("should throw if multiple color targets are not supported but " +
                    "array of color formats is passed",
                    sinon.test(function () {

                        this.stub(device, "caps").returns({ colorTargetCount: 1 });
                        expect(createFn([F.RGBA, F.RGBA], null, 128, 128)).to.throw(R.Error);
                    })
                );
            });

            describe("[array of textures]", function () {

                var colorTexture;

                before(function () {
                    colorTexture = device.makeTexture(F.RGB, 128, 128, 1);
                });

                after(function () {
                    colorTexture && colorTexture.free();
                });

                it("should create target if color is array of color format textures",
                    function () {

                        var textures = [],
                            target, colorTarget, format, i, l;

                        for(i = 0, l = color.length; i < l; i += 1) {
                            textures.push(device.makeTexture(color[i], 128, 128, 1));
                        }

                        target = device.makeTarget(textures);
                        colorTarget = target.color();
                        expect(colorTarget).to.be.an("array").with.length(textures.length);

                        for(i = 0, l = colorTarget.length; i < l; i += 1) {
                            format = colorTarget[i].format();
                            expect(format, formatToStr(format)).to.equal(color[i]);
                        }
                        makeFrame(target, formatToStr(format));
                    }
                );

                it("should throw if array of textures contains texture with compressed format",
                    sinon.test(function () {

                        var format, texture, i, l;

                        this.stub(device, "caps").returns({ textureDXT: true });
                        for(i = 0, l = compressed.length; i < l; i += 1) {

                            format = compressed[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            expect(createFn([colorTexture, texture]), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should create target if array of textures contains texture with float16 " +
                    "format and rendering to 16-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: true,
                            textureFloat16: true });
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            target = device.makeTarget([colorTexture, texture]);
                            colorTarget = target.color();
                            expect(colorTarget).to.be.an("array").with.length(2);
                            expect(colorTarget[1].format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if array of textures contains texture with float16 format " +
                    "and rendering to 16-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: false,
                            textureFloat16: true });
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            expect(createFn([colorTexture, texture]), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should create target if array of textures contains texture with float16 " +
                    "format and rendering to 32-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: true,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            target = device.makeTarget([colorTexture, texture]);
                            colorTarget = target.color();
                            expect(colorTarget).to.be.an("array").with.length(2);
                            expect(colorTarget[1].format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if array of textures contains texture with float32 format " +
                    "but rendering to 32-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, texture, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: false,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            texture = device.makeTexture(format, 128, 128, 1);
                            expect(createFn([colorTexture, texture]), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should throw if multiple color targets are not supported but " +
                    "array of textures is passed",
                    sinon.test(function () {

                        this.stub(device, "caps").returns({ colorTargetCount: 1 });
                        expect(createFn([colorTexture, colorTexture])).to.throw(R.Error);
                    })
                );
            });

            describe("[array of mips]", function () {

                var colorTexture, colorMip;

                before(function () {
                    colorTexture = device.makeTexture(F.RGB, 128, 128, 1);
                    colorMip = colorTexture.mip(0);
                });

                after(function () {
                    colorTexture && colorTexture.free();
                });

                it("should create target if color is array of color format mips",
                    function () {

                        var mips = [],
                            target, colorTarget, format, i, l;

                        for(i = 0, l = color.length; i < l; i += 1) {

                            mips.push(device.makeTexture(color[i], 128, 128, 1).mip(0));
                        }

                        target = device.makeTarget(mips);
                        colorTarget = target.color();
                        expect(colorTarget).to.be.an("array").with.length(mips.length);

                        for(i = 0, l = colorTarget.length; i < l; i += 1) {
                            format = colorTarget[i].format();
                            expect(format, formatToStr(format)).to.equal(color[i]);
                        }
                        makeFrame(target, formatToStr(format));
                    }
                );

                it("should throw if array of mips contains compressed format",
                    sinon.test(function () {

                        var format, mip, i, l;

                        this.stub(device, "caps").returns({ textureDXT: true });
                        for(i = 0, l = compressed.length; i < l; i += 1) {

                            format = compressed[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            expect(createFn([colorMip, mip]), formatToStr(format)).
                                to.throw(R.Error);
                        }

                    })
                );

                it("should create target if array of mips contains mip with float16 format " +
                    "and rendering to 16-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: true,
                            textureFloat16: true });
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            target = device.makeTarget([colorMip, mip]);
                            colorTarget = target.color();
                            expect(colorTarget).to.be.an("array").with.length(2);
                            expect(colorTarget[1].format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if array of mips contains mip with float16 format " +
                    "and rendering to 16-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat16: false,
                            textureFloat16: true });
                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            expect(createFn([colorMip, mip]), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should create target if array of mips contains mip with float32 format " +
                    "and rendering to 32-bit floating point texture formats is supported",
                    sinon.test(function () {

                        var target, colorTarget, format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: true,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            target = device.makeTarget([colorMip, mip]);
                            colorTarget = target.color();
                            expect(colorTarget).to.be.an("array").with.length(2);
                            expect(colorTarget[1].format(), formatToStr(format)).to.equal(format);
                            makeFrame(target, formatToStr(format));
                        }
                    })
                );

                it("should throw if array of mips contains mip with float32 format " +
                    "but rendering to 32-bit floating point texture formats is not supported",
                    sinon.test(function () {

                        var format, mip, i, l;

                        this.stub(device, "caps").returns({ colorTargetFloat32: false,
                            textureFloat32: true });
                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            mip = device.makeTexture(format, 128, 128, 1).mip(0);
                            expect(createFn([colorMip, mip]), formatToStr(format)).
                                to.throw(R.Error);
                        }
                    })
                );

                it("should throw if multiple color targets are not supported but " +
                    "array of mips is passed",
                    sinon.test(function () {

                        this.stub(device, "caps").returns({ colorTargetCount: 1 });
                        expect(createFn([colorMip, colorMip])).to.throw(R.Error);
                    })
                );

                it("should throw if not all color targets are specified in passed array",
                    function () {
                        expect(createFn([colorMip, undefined, colorMip])).to.throw(R.Error);
                    }
                );
            });
        });

        describe("[depth]", function () {

            it("should create target if depth format is not specified", function () {

                var target = device.makeTarget(F.RGB, null, 128, 128);
                expect(target.depth()).to.be.null;
                makeFrame(target, "no depth");
            });

            it("should create target with passed format of depth", function () {

                var target, depth, format, i, l;

                for(i = 0, l = depthFormat.length; i < l; i += 1) {

                    format = depthFormat[i];
                    target = device.makeTarget(F.RGB, format, 128, 128);
                    depth = target.depth();
                    expect(depth.format(), formatToStr(format)).to.equal(format);
                    makeFrame(target, formatToStr(format));
                }
            });

            it("should create target if depth object is not specified", function () {

                var texture = device.makeTexture(F.RGB, 128, 128, 1),
                    target = device.makeTarget(texture);

                expect(target.depth()).to.be.null;
                makeFrame(target, "no depth");
            });

            it("should create target with passed depth object", function () {

                var texture = device.makeTexture(F.RGB, 128, 128, 1),
                    target, depth, format, i, l;

                for(i = 0, l = depthFormat.length; i < l; i += 1) {

                    format = depthFormat[i];
                    depth = device.makeDepth(format, 128, 128);
                    target = device.makeTarget(texture, depth);
                    expect(target.depth(), formatToStr(format)).to.equal(depth);
                    makeFrame(target, formatToStr(format));
                }
            });
        });

        describe("[width & height]", function () {

            it("should throw if depth size is not equal color size", function () {

                var texture = device.makeTexture(F.RGB, 256, 256, 1),
                    depth = device.makeDepth(F.DEPTH, 128, 128);

                expect(createFn(texture, depth)).to.throw(R.Error);
            });

            it("should throw if color objects have different size", function () {

                var tex1 = device.makeTexture(F.RGB, 128, 128, 1),
                    tex2 = device.makeTexture(F.RGB, 64, 64, 1);

                expect(createFn([tex1, tex2])).to.throw(R.Error);
            });

            it("should create target with specified sizes", function () {

                var target = device.makeTarget(F.RGB, F.DEPTH, 128, 128);

                expect(target.width()).to.equal(128);
                expect(target.height()).to.equal(128);
                expect(target.size()).to.equalByComponents(128, 128);
            });
        });
    });

    describe("#free", function () {

        it("should free all internal data and detach linked rendering device", function () {

            var target = device.makeTarget(F.RGB, F.DEPTH, 128, 128);

            target.free();
            expect(target.device()).to.not.equal(device);
        });
    });

    describe("#multisamples", function () {

        var target, device;

        afterEach(function () {
            target && target.free();
            device && device.free();
        });

        it("should return non-zero value if antialiasing is supported", function () {

            device = R.makeDevice(
                canvas,
                F.RGBA,
                F.DEPTH,
                { antialias : true }
            );

            target = device.makeTarget(F.RGB, F.DEPTH, 128, 128);
            expect(target.multisamples()).to.be.above(0);
        });

        it("should return zero value if antialiasing is not supported", function () {

            device = R.makeDevice(
                canvas,
                F.RGBA,
                F.DEPTH,
                { antialias : false }
            );

            target = device.makeTarget(F.RGB, F.DEPTH, 128, 128);
            expect(target.multisamples()).to.equal(0);
        });
    });

    describe("#color", function () {

        var target;

        before(function () {
            target = device.makeTarget([F.RGB, F.RGBA], null, 128, 128);
        });

        after(function () {
            target && target.free();
        });

        it("should return color target array", function () {
            expect(target.color()).to.be.an("array");
        });

        it("should return color target by index", function () {

            var colors = target.color(),
                i, l;

            for(i = 0, l = colors.length; i < l; i += 1) {
                expect(target.color(i)).to.be.instanceof(R.Mip);
            }
        });

        it("should return null if color target is not found", function () {
            expect(target.color(100)).to.be.null;
        });
    });

    describe("#color", function () {

        var
            setFn = function (target, object) {
                return function () {
                    target.color(object);
                };
            },

            target;

        before(function () {
            target = device.makeTarget(F.RGB, null, 128, 128);
        });

        after(function () {
            target && target.free();
        });

        describe("[texture]", function () {

            it("should set texture as color target with color format",
                function () {

                    var format, i, l;

                    for(i = 0, l = color.length; i < l; i += 1) {

                        format = color[i];
                        target.color(device.makeTexture(format, 128, 128, 1));
                        expect(target.color().format(), formatToStr(format)).to.equal(format);
                    }
                }
            );

            it("should throw if texture format is compressed",
                sinon.test(function () {

                    var format, texture, i, l;

                    this.stub(device, "caps").returns({ textureDXT: true });
                    for(i = 0, l = compressed.length; i < l; i += 1) {

                        format = compressed[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, texture), formatToStr(format)).to.throw(R.Error);
                    }

                })
            );

            it("should set texture as color target with float16 format and " +
                "rendering to 16-bit floating point texture formats is supported",
                sinon.test(function () {

                    var format, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: true,
                        textureFloat16: true});
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        target.color(device.makeTexture(format, 128, 128, 1));
                        expect(target.color().format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if texture format is float16 and " +
                "rendering to 16-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: false,
                        textureFloat16: true});
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, texture), formatToStr(format)).to.throw(R.Error);
                    }
                })
            );

            it("should set texture as color target with float32 format and " +
                "rendering to 32-bit floating point texture formats is supported",
                sinon.test(function () {

                    var format, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: true,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        target.color(device.makeTexture(format, 128, 128, 1));
                        expect(target.color().format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if format is float32 but " +
                "rendering to 32-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: false,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, texture), formatToStr(format)).to.throw(R.Error);
                    }
                })
            );
        });

        describe("[mip]", function () {

            it("should set texture mip as color target with texture color format",
                function () {

                    var format, i, l;

                    for(i = 0, l = color.length; i < l; i += 1) {

                        format = color[i];
                        target.color(device.makeTexture(format, 128, 128, 1).mip(0));
                        expect(target.color().format(), formatToStr(format)).to.equal(format);
                    }
                }
            );

            it("should throw if texture mip format is compressed",
                sinon.test(function () {

                    var format, texture, i, l;

                    this.stub(device, "caps").returns({ textureDXT: true });
                    for(i = 0, l = compressed.length; i < l; i += 1) {

                        format = compressed[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, texture.mip(0)), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should set texture mip as color target with float16 format and " +
                "rendering to 16-bit floating point texture formats is supported",
                sinon.test(function () {

                    var format, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: true,
                        textureFloat16: true});
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        target.color(device.makeTexture(format, 128, 128, 1).mip(0));
                        expect(target.color().format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if format is float16 but " +
                "rendering to 16-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: false,
                        textureFloat16: true});
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, texture.mip(0)), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should set texture as color target with float32 format and " +
                "rendering to 32-bit floating point texture formats is supported",
                sinon.test(function () {

                    var format, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: true,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        target.color(device.makeTexture(format, 128, 128, 1).mip(0));
                        expect(target.color().format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if format is float32 but " +
                "rendering to 32-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: false,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, texture.mip(0)), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );
        });

        describe("[array of textures]", function () {

            it("should set array of textures as color target with color format",
                function () {

                    var textures = [],
                        colorTarget, format, i, l;

                    for(i = 0, l = color.length; i < l; i += 1) {
                        textures.push(device.makeTexture(color[i], 128, 128, 1));
                    }

                    target.color(textures);
                    colorTarget = target.color();
                    expect(colorTarget).to.be.an("array").with.length(textures.length);

                    for(i = 0, l = colorTarget.length; i < l; i += 1) {
                        format = colorTarget[i].format();
                        expect(format, formatToStr(format)).to.equal(color[i]);
                    }
                }
            );

            it("should throw if array of textures contains texture with compressed format",
                sinon.test(function () {

                    var color = device.makeTexture(F.RGB, 128, 128, 1),
                        format, texture, i, l;

                    this.stub(device, "caps").returns({ textureDXT: true });
                    for(i = 0, l = compressed.length; i < l; i += 1) {

                        format = compressed[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, [color, texture]), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should set array of textures as color target if array contains texture " +
                "with float16 format and rendering to 16-bit floating point texture " +
                "formats is supported",
                sinon.test(function () {

                    var color = device.makeTexture(F.RGB, 128, 128, 1),
                        format, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: true,
                        textureFloat16: true });
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        target.color([color, device.makeTexture(format, 128, 128, 1)]);
                        expect(target.color()).to.be.an("array").with.length(2);
                        expect(target.color(1).format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if array of textures contains texture with float16 format " +
                "but rendering to 16-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var color = device.makeTexture(F.RGB, 128, 128, 1),
                        format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: false,
                        textureFloat16: true });
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, [color, texture]), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should set array of textures as color target if array contains texture with " +
                "float32 format and rendering to 32-bit floating point texture formats " +
                "is supported",
                sinon.test(function () {

                    var color = device.makeTexture(F.RGB, 128, 128, 1),
                        colorTarget, format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: true,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        colorTarget = device.makeTarget([color, texture]).color();
                        expect(colorTarget).to.be.an("array").with.length(2);
                        expect(colorTarget[1].format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if array of textures contains texture with float32 format " +
                "but rendering to 32-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var color = device.makeTexture(F.RGB, 128, 128, 1),
                        format, texture, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: false,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        texture = device.makeTexture(format, 128, 128, 1);
                        expect(setFn(target, [color, texture]), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should throw if multiple color targets are not supported but " +
                "array of textures is passed",
                sinon.test(function () {

                    var color = device.makeTexture(F.RGB, 128, 128, 1);

                    this.stub(device, "caps").returns({ colorTargetCount: 1 });
                    expect(setFn(target, [color, color])).to.throw(R.Error);
                })
            );
        });

        describe("[array of mips]", function () {

            var colorTexture, colorMip;

            before(function () {
                colorTexture = device.makeTexture(F.RGB, 128, 128, 1);
                colorMip = colorTexture.mip(0);
            });

            after(function () {
                colorTexture && colorTexture.free();
            });

            it("should set array of mips as color target with color format",
                function () {

                    var mips = [],
                        colorTarget, format, i, l;

                    for(i = 0, l = color.length; i < l; i += 1) {
                        mips.push(device.makeTexture(color[i], 128, 128, 1).mip(0));
                    }

                    target.color(mips);
                    colorTarget = target.color();
                    expect(colorTarget).to.be.an("array").with.length(mips.length);

                    for(i = 0, l = colorTarget.length; i < l; i += 1) {
                        format = colorTarget[i].format();
                        expect(format, formatToStr(format)).to.equal(color[i]);
                    }
                }
            );

            it("should throw if array of mips contains compressed format",
                sinon.test(function () {

                    var format, mip, i, l;

                    this.stub(device, "caps").returns({ textureDXT: true });
                    for(i = 0, l = compressed.length; i < l; i += 1) {

                        format = compressed[i];
                        mip = device.makeTexture(format, 128, 128, 1).mip(0);
                        expect(setFn(target, [colorMip, mip]), formatToStr(format)).
                            to.throw(R.Error);
                    }

                })
            );

            it("should set array of mips as color target with array contains mip with float16 " +
                "format and rendering to 16-bit floating point texture formats is supported",
                sinon.test(function () {

                    var format, mip, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: true,
                        textureFloat16: true });
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        mip = device.makeTexture(format, 128, 128, 1).mip(0);
                        target.color([colorMip, mip]);
                        expect(target.color()).to.be.an("array").with.length(2);
                        expect(target.color(1).format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if array of textures contains mip with float16 format " +
                "but rendering to 16-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var format, mip, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat16: false,
                        textureFloat16: true });
                    for(i = 0, l = float16.length; i < l; i += 1) {

                        format = float16[i];
                        mip = device.makeTexture(format, 128, 128, 1).mip(0);
                        expect(setFn(target, [colorMip, mip]), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should set array of mips as color target with array contains mip with float32 " +
                "format and rendering to 32-bit floating point texture formats is supported",
                sinon.test(function () {

                    var colorTarget, format, mip, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: true,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        mip = device.makeTexture(format, 128, 128, 1).mip(0);
                        colorTarget = device.makeTarget([colorMip, mip]).color();
                        expect(colorTarget).to.be.an("array").with.length(2);
                        expect(colorTarget[1].format(), formatToStr(format)).to.equal(format);
                    }
                })
            );

            it("should throw if array of textures contains mip with float32 format " +
                "but rendering to 32-bit floating point texture formats is not supported",
                sinon.test(function () {

                    var format, mip, i, l;

                    this.stub(device, "caps").returns({ colorTargetFloat32: false,
                        textureFloat32: true });
                    for(i = 0, l = float32.length; i < l; i += 1) {

                        format = float32[i];
                        mip = device.makeTexture(format, 128, 128, 1).mip(0);
                        expect(setFn(target, [colorMip, mip]), formatToStr(format)).
                            to.throw(R.Error);
                    }
                })
            );

            it("should throw if multiple color targets are not supported but " +
                "array of mips is passed",
                sinon.test(function () {

                    this.stub(device, "caps").returns({ colorTargetCount: 1 });
                    expect(setFn(target, [colorMip, colorMip])).to.throw(R.Error);
                })
            );

            it("should throw if not all color targets are specified in passed array", function () {
                expect(setFn(target, [colorMip, undefined, colorMip])).to.throw(R.Error);
            });
        });
    });

    describe("#depth", function () {

        var target;

        before(function () {
            target = device.makeTarget(F.RGB, null, 128, 128);
        });

        after(function () {
            target && target.free();
        });

        it("should set depth target", function () {

            var depth, format, i, l;

            for(i = 0, l = depthFormat.length; i < l; i += 1) {

                format = depthFormat[i];
                depth = device.makeDepth(format, 128, 128);

                target.depth(depth);
                expect(target.depth(), formatToStr(format)).to.equal(depth);
            }
        });

        it("should set readable depth target", function () {

            var depth, format, i, l;

            for(i = 0, l = depthFormat.length; i < l; i += 1) {

                format = depthFormat[i];
                depth = device.makeDepth(format, 128, 128, true);

                target.depth(depth);
                expect(target.depth(), formatToStr(format)).to.equal(depth);
            }
        });

        it("should throw if depth size is not equal color size", function () {

            expect(function () {
                target.depth(device.makeDepth(F.DEPTH, 256, 256));
            }).to.throw(R.Error);
        });

        it("should set null as depth target", function () {

            target.depth(null);
            expect(target.depth()).to.be.null;
        });
    });

    describe("#clone", function () {

        it("should clone the target to a new target object", function () {

            var texture = device.makeTexture(F.RGBA, 128, 128, 1),
                target = device.makeTarget(texture),
                clone;

            clone = target.clone();
            expect(clone.width(), "width").to.equal(target.width());
            expect(clone.height(), "height").to.equal(target.height());
            expect(clone.size(), "size").to.equalByComponents(target.size());
            expect(clone.depth()).to.be.null;
            expect(clone.color().format(), "color[0]").to.equal(target.color().format());
        });

        it("should clone the target to a new target object using scale factor", function () {

            var texture = device.makeTexture(F.RGBA, 128, 128, 1),
                target = device.makeTarget(texture),
                clone;

            clone = target.clone(0.5);
            expect(clone.width(), "width").to.equal(target.width() * 0.5);
            expect(clone.height(), "height").to.equal(target.height() * 0.5);
            expect(clone.size(), "size").to.equalByComponents(target.size().clone().mul(0.5));
            expect(clone.depth()).to.be.null;
            expect(clone.color().format(), "color[0]").to.equal(target.color().format());
        });

        it("should clone the target (multiple color) to a new target object", function () {

            var target = device.makeTarget([F.RGB, F.RGBA], F.DEPTH, 128, 128),
                clone;

            clone = target.clone();
            expect(clone.width(), "width").to.equal(target.width());
            expect(clone.height(), "height").to.equal(target.height());
            expect(clone.size(), "size").to.equalByComponents(target.size());
            expect(clone.depth().format(), "depth").to.equal(target.depth().format());
            expect(clone.color(), "color").to.have.length(target.color().length);
            expect(clone.color(0).format(), "color[0]").to.equal(target.color(0).format());
            expect(clone.color(1).format(), "color[1]").to.equal(target.color(1).format());
        });
    });
});