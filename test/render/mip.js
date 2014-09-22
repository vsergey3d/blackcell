
describe("B.Render.Mip", function () {

    var R = B.Render,
        F = R.Format,
        CF = R.CubeFace,

        colorFormats = [
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
        formatToStr = B.Test.formatToStr,

        canvas, device;

    it("should exist", function () {
        expect(B.Render.Mip).to.exist;
    });

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    it("should be created by texture [Texture2D]", function () {

        var sizePerMip = [ 16, 8, 4, 2, 1 ],

            buildMsg = function (format, index, method) {
                return "[" + format + "] mip(" + index + ")." + method;
            },
            checkMips = function (texture) {

                var format = texture.format(),
                    formatStr = formatToStr(format),
                    mipCount = texture.mipCount(),
                    size, pitch, row, mip, i;

                for(i = 0; i < mipCount; i += 1) {

                    mip = texture.mip(i);
                    size = sizePerMip[i];
                    pitch = R.imagePitch(format, size);
                    row = R.imageRows(format, size);

                    expect(mip).to.be.instanceof(B.Render.Mip);
                    expect(mip.device(), buildMsg(formatStr, i, "device")).to.equal(device);
                    expect(mip.texture(), buildMsg(formatStr, i, "texture")).to.equal(texture);
                    expect(mip.format(), buildMsg(formatStr, i, "format")).to.equal(format);
                    expect(mip.count(), buildMsg(formatStr, i, "count")).to.equal(mipCount);
                    expect(mip.index(), buildMsg(formatStr, i, "index")).to.equal(i);
                    expect(mip.faceCount(), buildMsg(formatStr, i, "faceCount")).to.equal(1);
                    expect(mip.face(), buildMsg(formatStr, i, "face")).to.equal(0);
                    expect(mip.width(), buildMsg(formatStr, i, "width")).to.equal(size);
                    expect(mip.height(), buildMsg(formatStr, i, "height")).to.equal(size);
                    expect(mip.size(), buildMsg(formatStr, i, "size")).
                        to.equalByComponents(size, size);
                    expect(mip.pitch(), buildMsg(formatStr, i, "pitch")).to.equal(pitch);
                    expect(mip.rows(), buildMsg(formatStr, i, "rows")).to.equal(row);
                    expect(mip.byteSize(), buildMsg(formatStr, i, "byteSize")).
                        to.equal(pitch * row);
                }
            },

            format, texture, i, l;

        for (i = 0, l = colorFormats.length; i < l; i+= 1) {

            format = colorFormats[i];

            texture = device.makeTexture(format, 16, 16);
            checkMips(texture);
            texture.free();
        }
    });

    it("should be created by texture [TextureCube]", function () {

        var sizePerMip = [ 16, 8, 4, 2, 1 ],

            buildMsg = function (format, index, face, method) {
                return "[" + format + "] mip(" + index + ", " + face + ")." + method;
            },
            checkMips = function (texture) {

                var format = texture.format(),
                    formatStr = formatToStr(format),
                    mipCount = texture.mipCount(),
                    size, pitch, row, mip, iMip, iFace;

                for(iMip = 0; iMip < mipCount; iMip += 1) {

                    size = sizePerMip[iMip];
                    pitch = R.imagePitch(format, size);
                    row = R.imageRows(format, size);

                    for(iFace = 0; iFace < CF.COUNT; iFace += 1) {

                        mip = texture.mip(iMip, iFace);

                        expect(mip).to.be.instanceof(B.Render.Mip);
                        expect(mip.device(), buildMsg(formatStr, iMip, iFace, "device")).
                            to.equal(device);
                        expect(mip.texture(), buildMsg(formatStr, iMip, iFace, "texture")).
                            to.equal(texture);
                        expect(mip.format(), buildMsg(formatStr, iMip, iFace, "format")).
                            to.equal(format);
                        expect(mip.count(), buildMsg(formatStr, iMip, iFace, "count")).
                            to.equal(mipCount);
                        expect(mip.index(), buildMsg(formatStr, iMip, iFace, "index")).
                            to.equal(iMip);
                        expect(mip.faceCount(), buildMsg(formatStr, iMip, iFace, "faceCount")).
                            to.equal(CF.COUNT);
                        expect(mip.face(), buildMsg(formatStr, iMip, iFace, "face")).
                            to.equal(iFace);
                        expect(mip.width(), buildMsg(formatStr, iMip, iFace, "width")).
                            to.equal(size);
                        expect(mip.height(), buildMsg(formatStr, iMip, iFace, "height")).
                            to.equal(size);
                        expect(mip.size(), buildMsg(formatStr, iMip, iFace, "size")).
                            to.equalByComponents(size, size);
                        expect(mip.pitch(), buildMsg(formatStr, iMip, iFace, "pitch")).
                            to.equal(pitch);
                        expect(mip.rows(), buildMsg(formatStr, iMip, iFace, "rows")).
                            to.equal(row);
                        expect(mip.byteSize(), buildMsg(formatStr, iMip, iFace, "byteSize")).
                            to.equal(pitch * row);
                    }
                }
            },

            format, texture, i, l;

        for (i = 0, l = colorFormats.length; i < l; i+= 1) {

            format = colorFormats[i];

            texture = device.makeTexture(format, 16, 16, 0, CF.COUNT);
            checkMips(texture);
            texture.free();
        }
    });

    describe("#source", function () {

        describe("[null]", function () {

            it("should set null as data source", function () {

                var format, texture, mip, i, l;

                for (i = 0, l = colorFormats.length; i < l; i+= 1) {

                    format = colorFormats[i];

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    mip.source(null);
                    expect(mip.source(), formatToStr(format)).to.be.null;
                    texture.free();
                }
            });
        });

        describe("[Uint8Array|Float32Array]", function () {

            var formats = [
                    F.A,
                    F.RGB,
                    F.RGBA,
                    F.RGB_DXT1,
                    F.RGBA_DXT5
                ],
                float32 = [
                    F.A_F32,
                    F.RGB_F32,
                    F.RGBA_F32
                ],
                float16 = [
                    F.A_F16,
                    F.RGB_F16,
                    F.RGBA_F16
                ];

            it("should throw if format is one of [B.Render.Format.A, B.Render.Format.RGB, " +
                "B.Render.Format.RGBA, B.Render.Format.RGB_DXT1, B.Render.Format.RGBA_DXT5] " +
                "but data source isn't Uint8Array",function () {

                var
                    checkFn = function (data) {
                        return function () {
                            mip.source(data);
                        };
                    },

                    format, byteSize, texture, mip, i, l;

                for (i = 0, l = formats.length; i < l; i+= 1) {

                    format = formats[i];
                    byteSize = R.imageByteSize(format, 16, 16);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    expect(
                        checkFn(new Float32Array(new ArrayBuffer(byteSize))), formatToStr(format)
                    ).to.throw(R.Error);
                    texture.free();
                }
            });

            it("should throw if format is Float32 [B.Render.Format.A_F32, " +
                "B.Render.Format.RGB_F32, B.Render.Format.RGBA_F32] " +
                "but data source isn't Float32Array",function () {

                var
                    checkFn = function (data) {
                        return function () {
                            mip.source(data);
                        };
                    },

                    format, byteSize, texture, mip, i, l;

                for (i = 0, l = float32.length; i < l; i+= 1) {

                    format = float32[i];
                    byteSize = R.imageByteSize(format, 16, 16);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    expect(
                        checkFn(new Uint8Array(new ArrayBuffer(byteSize))), formatToStr(format)
                    ).to.throw(R.Error);
                    texture.free();
                }
            });

            it("should throw if format is one of [B.Render.Format.A, B.Render.Format.RGB, " +
                "B.Render.Format.RGBA, B.Render.Format.RGB_DXT1, B.Render.Format.RGBA_DXT5] " +
                "but data source has invalid size",function () {

                var
                    checkFn = function (data) {
                        return function () {
                            mip.source(data);
                        };
                    },

                    format, byteSize, texture, mip, i, l;

                for (i = 0, l = formats.length; i < l; i+= 1) {

                    format = formats[i];
                    byteSize = R.imageByteSize(format, 16, 15);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    expect(checkFn(new Uint8Array(new ArrayBuffer(byteSize))), formatToStr(format)).
                        to.throw(R.Error);
                    texture.free();
                }
            });

            it("should throw if format is Float32 [B.Render.Format.A_F32, " +
                "B.Render.Format.RGB_F32, B.Render.Format.RGBA_F32] " +
                "but data source has invalid size",function () {

                var
                    checkFn = function (data) {
                        return function () {
                            mip.source(data);
                        };
                    },

                    format, byteSize, texture, mip, i, l;

                for (i = 0, l = float32.length; i < l; i+= 1) {

                    format = float32[i];
                    byteSize = R.imageByteSize(format, 16, 15);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    expect(
                        checkFn(new Float32Array(new ArrayBuffer(byteSize))), formatToStr(format)
                    ).to.throw(R.Error);
                    texture.free();
                }
            });

            it("should set data source [B.Render.Format.A, B.Render.Format.RGB, " +
                "B.Render.Format.RGBA, B.Render.Format.RGB_DXT1, B.Render.Format.RGBA_DXT5]",
                function () {

                    var dataSource, byteSize,
                        format, texture, mip, i, l;

                    for (i = 0, l = formats.length; i < l; i+= 1) {

                        format = formats[i];
                        byteSize = R.imageByteSize(format, 16, 16);
                        dataSource = new Uint8Array(new ArrayBuffer(byteSize));

                        texture = device.makeTexture(format, 16, 16, 1);
                        mip = texture.mip(0);
                        mip.source(dataSource);
                        expect(mip.source(), formatToStr(format)).to.equal(dataSource);
                        texture.free();
                    }
                }
            );

            it("should set data source [B.Render.Format.A_F32, B.Render.Format.RGB_F32, " +
                "B.Render.Format.RGBA_F32]",
                function () {

                    var dataSource, byteSize,
                        format, texture, mip, i, l;

                    for (i = 0, l = float32.length; i < l; i+= 1) {

                        format = float32[i];
                        byteSize = R.imageByteSize(format, 16, 16);
                        dataSource = new Float32Array(new ArrayBuffer(byteSize));

                        texture = device.makeTexture(format, 16, 16, 1);
                        mip = texture.mip(0);
                        mip.source(dataSource);
                        expect(mip.source(), formatToStr(format)).to.equal(dataSource);
                        texture.free();
                    }
                }
            );

            it("should throw if format is Float16 [B.Render.Format.A_F16, " +
                "B.Render.Format.RGB_F16, B.Render.Format.RGBA_F16]",
                function () {

                    var
                        buildMsg = function (format, dataType) {
                            return "[" + format + "] " + dataType;
                        },
                        checkFn = function (data) {
                            return function () {
                                mip.source(data);
                            };
                        },

                        format, formatStr, byteSize, texture, mip, i, l;

                    for (i = 0, l = float16.length; i < l; i+= 1) {

                        format = float16[i];
                        formatStr = formatToStr(format);
                        byteSize = R.imageByteSize(format, 16, 16);

                        texture = device.makeTexture(format, 16, 16, 1);
                        mip = texture.mip(0);
                        expect(checkFn(new Uint8Array(new ArrayBuffer(byteSize))),
                            buildMsg(formatStr, "Uint8Array")).to.throw(R.Error);
                        expect(checkFn(new Float32Array(new ArrayBuffer(byteSize))),
                            buildMsg(formatStr, "Float32Array")).to.throw(R.Error);
                        texture.free();
                    }
                }
            );
        });

        describe("[ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement]", function () {

            var correct = [
                    F.A,
                    F.RGB,
                    F.RGBA,
                    F.A_F16,
                    F.RGB_F16,
                    F.RGBA_F16,
                    F.A_F32,
                    F.RGB_F32,
                    F.RGBA_F32
                ],
                incorrect = [
                    F.RGB_DXT1,
                    F.RGBA_DXT5
                ],

                checkSources = B.Test.checkSources;

            it("should throw if object width is not equal mip width", function () {

                var
                    checkFn = function (source) {
                        expect(
                            function () {
                                mip.source(source);
                            },
                            "[" + formatStr + "] " + source.name
                        ).to.throw(R.Error);
                    },

                    format, formatStr, texture, mip, i, l;

                for (i = 0, l = colorFormats.length; i < l; i+= 1) {

                    format = colorFormats[i];
                    formatStr = formatToStr(format);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    checkSources(8, 16, checkFn);
                    texture.free();
                }
            });

            it("should throw if object height is not equal mip height", function () {

                var
                    checkFn = function (source) {
                        expect(
                            function () {
                                mip.source(source);
                            },
                            "[" + formatStr + "] " + source.name
                        ).to.throw(R.Error);
                    },

                    format, formatStr, texture, mip, i, l;

                for (i = 0, l = colorFormats.length; i < l; i+= 1) {

                    format = colorFormats[i];
                    formatStr = formatToStr(format);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    checkSources(16, 8, checkFn);
                    texture.free();
                }
            });

            it("should throw if compressed format", function () {

                var
                    checkFn = function (source) {
                        expect(
                            function () {
                                mip.source(source);
                            },
                            "[" + formatStr + "] " + source.name
                        ).to.throw(R.Error);
                    },

                    format, formatStr, texture, mip, i, l;

                for (i = 0, l = incorrect.length; i < l; i+= 1) {

                    format = incorrect[i];
                    formatStr = formatToStr(format);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    checkSources(16, 16, checkFn);
                    texture.free();
                }
            });

            it("should set data source from source object", function () {

                var
                    checkFn = function (source) {
                        mip.source(source);
                        expect(mip.source(), source.name).to.equal(source);
                    },

                    format, formatStr, texture, mip, i, l;

                for (i = 0, l = correct.length; i < l; i+= 1) {

                    format = correct[i];
                    formatStr = formatToStr(format);

                    texture = device.makeTexture(format, 16, 16, 1);
                    mip = texture.mip(0);
                    checkSources(16, 16, checkFn);
                    texture.free();
                }
            });

        });
    });

    describe("#flush", function () {

        var texture;

        before(function () {
            texture = device.makeTexture(F.RGBA, 256, 256, 1);
        });

        after(function () {
            texture && texture.free();
        });

        it("should flush linked data source", function () {

            var mip = texture.mip(0);

            mip.source(B.Test.makeImageElement(256, 256));
            mip.flush();
            expect(mip.source()).to.be.null;
        });
    });

});