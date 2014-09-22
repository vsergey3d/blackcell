
describe("B.Render.Texture", function () {

    var R = B.Render,
        F = R.Format,
        CF = R.CubeFace,

        makeVideoElement = B.Test.makeVideoElement,
        makeImageElement = B.Test.makeImageElement,
        makeCanvasElement = B.Test.makeCanvasElement,

        checkSources = B.Test.checkSources,
        checkArraySources = B.Test.checkArraySources,

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

        canvas, device,

        makeTextureFmt = function (format) {

            return function () {
                device.makeTexture(format, 256, 256);
            };
        };

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.Texture).to.exist;
    });

    describe("#constructor", function () {

        it("should be created by device", function () {

            var texture = device.makeTexture(F.RGBA, 256, 256);

            expect(texture).to.be.instanceof(B.Render.Texture);
            expect(texture.device()).to.equal(device);
        });

        describe("[format]", function () {

            describe("[Texture2D]", function () {

                it("should create texture from source object with RGBA format",
                    function () {

                        checkSources(256, 256, function (source) {

                            var texture = device.makeTexture(source);
                            expect(texture.format(), source.name).to.equal(F.RGBA);
                        });
                    }
                );

                it("should throw if the source object is invalid", function () {

                    var fn = function () {
                        device.makeTexture(null);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should create texture from parameters with color format", function () {

                    var texture, format, i, l;

                    for(i = 0, l = color.length; i < l; i += 1) {

                        format = color[i];
                        texture = device.makeTexture(format, 256, 256);
                        expect(texture.format(), formatToStr(format)).to.equal(format);
                    }
                });

                it("should create texture from parameters with compressed format", function () {

                    var texture, format, i, l;

                    for(i = 0, l = compressed.length; i < l; i += 1) {

                        format = compressed[i];
                        texture = device.makeTexture(format, 256, 256);
                        expect(texture.format(), formatToStr(format)).to.equal(format);
                    }
                });

                it("should throw if format is compressed but " +
                    "compressed textures are not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ textureDXT: false });

                        for(i = 0, l = compressed.length; i < l; i += 1) {

                            format = compressed[i];
                            expect(makeTextureFmt(format), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is float16 but " +
                    "16-bit floating point textures are not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ textureFloat16: false });

                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            expect(makeTextureFmt(format), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is float32 but " +
                    "32-bit floating point textures are not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ textureFloat32: false });

                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            expect(makeTextureFmt(format), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is unknown or not supported", function () {

                    var fn = function () {
                        device.makeTexture(-1, 256, 256);
                    };
                    expect(fn).to.throw(R.Error);
                });
            });

            describe("[TextureCube]", function () {

                it("should create TextureCube from array of six source objects with RGBA format",
                    function () {

                        checkArraySources(256, 256, function (source) {

                            var texture = device.makeTexture(source);
                            expect(texture.format(), source[0].name).to.equal(F.RGBA);
                        });
                    }
                );

                it("should create texture from parameters with color formats", function () {

                    var texture, format, i, l;

                    for(i = 0, l = color.length; i < l; i += 1) {

                        format = color[i];
                        texture = device.makeTexture(format, 256, 256, 1, CF.COUNT);
                        expect(texture.format(), formatToStr(format)).to.equal(format);
                    }
                });

                it("should throw if format is compressed but " +
                    "compressed textures are not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ textureDXT: false });

                        for(i = 0, l = compressed.length; i < l; i += 1) {

                            format = compressed[i];
                            expect(makeTextureFmt(format), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is float16 but " +
                    "16-bit floating point textures are not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ textureFloat16: false });

                        for(i = 0, l = float16.length; i < l; i += 1) {

                            format = float16[i];
                            expect(makeTextureFmt(format), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is float32 but " +
                    "32-bit floating point textures are not supported",
                    sinon.test(function () {

                        var format, i, l;

                        this.stub(device, "caps").returns({ textureFloat32: false });

                        for(i = 0, l = float32.length; i < l; i += 1) {

                            format = float32[i];
                            expect(makeTextureFmt(format), formatToStr(format)).to.throw(R.Error);
                        }
                    })
                );

                it("should throw if format is unknown or not supported", function () {

                    var fn = function () {
                        device.makeTexture(-1, 256, 256, 1, CF.COUNT);
                    };
                    expect(fn).to.throw(R.Error);
                });
            });
        });

        describe("[width & height]", function () {

            describe("[Texture2D]", function () {

                it("should throw if width parameter is missed", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, undefined, 256, 1, 1);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if width parameter is missed [source objects]", function () {

                    checkSources(undefined, 256, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source.name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if height parameter is missed", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 256, undefined, 1, 1);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if height parameter is missed [source objects]", function () {

                    checkSources(256, undefined, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source.name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if width is not power of 2", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 300, 256, 1, 1);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if width is not power of 2 [source objects]", function () {

                    checkSources(300, 256, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source.name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if height is not power of 2", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 256, 200, 1, 1);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if height is not power of 2 [source objects]", function () {

                    checkSources(256, 200, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source.name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if compressed format and width is less than one block",
                    function () {

                        var format, i, l,

                            fn = function (format) {
                                return function () {
                                    device.makeTexture(format, 2, 4);
                                };
                            };

                        for(i = 0, l = compressed.length; i < l; i += 1) {

                            format = compressed[i];
                            expect(fn(format), formatToStr(format)).to.throw(R.Error);
                        }
                    }
                );

                it("should throw if compressed format and height is less than one block",
                    function () {

                        var format, i, l,

                            fn = function (format) {
                                return function () {
                                    device.makeTexture(format, 4, 2);
                                };
                            };

                        for(i = 0, l = compressed.length; i < l; i += 1) {

                            format = compressed[i];
                            expect(fn(format), formatToStr(format)).to.throw(R.Error);
                        }
                    }
                );

                it("should throw if width is greater than 'device.caps().textureMaxSize'",
                    function () {

                        var textureMaxSize = device.caps().textureMaxSize,
                            fn = function () {
                                device.makeTexture(F.RGBA, textureMaxSize * 2, 256);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should throw if width is greater than 'device.caps().textureMaxSize' " +
                    "[source objects]",
                    function () {

                        var textureMaxSize = device.caps().textureMaxSize;

                        checkSources(textureMaxSize * 2, 256, function (source) {

                            expect(
                                function () {
                                    device.makeTexture(source);
                                },
                                source.name
                            ).to.throw(R.Error);
                        });
                    }
                );

                it("should throw if height is greater than 'device.caps().textureMaxSize'",
                    function () {

                        var textureMaxSize = device.caps().textureMaxSize,
                            fn = function () {
                                device.makeTexture(F.RGBA, 256, textureMaxSize * 2);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should throw if height is greater than " +
                    "'device.caps().textureMaxSize' [source objects]",
                    function () {

                        var textureMaxSize = device.caps().textureMaxSize;

                        checkSources(256, textureMaxSize * 2, function (source) {

                            expect(
                                function () {
                                    device.makeTexture(source);
                                },
                                source.name
                            ).to.throw(R.Error);
                        });
                    }
                );

                it("should create texture from parameters with passed sizes", function () {

                    var texture = device.makeTexture(F.RGBA, 256, 256);

                    expect(texture.width(), "width").to.equal(256);
                    expect(texture.height(), "height").to.equal(256);
                    expect(texture.size(), "size").to.equalByComponents(256, 256);
                });

                it("should create texture from source object with passed sizes", function () {

                    checkSources(256, 256, function (source) {

                        var texture = device.makeTexture(source);

                        expect(texture.width(), source.name + " width").to.equal(256);
                        expect(texture.height(), source.name + " height").to.equal(256);
                        expect(texture.size(), source.name + " size").
                            to.equalByComponents(256, 256);
                    });
                });
            });

            describe("TextureCube", function () {

                it("should throw if width parameter is missed", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, undefined, 256, 1, CF.COUNT);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if width parameter is missed [array of source objects]",
                    function () {

                        checkArraySources(undefined, 256, function (source) {

                            expect(
                                function () {
                                    device.makeTexture(source);
                                },
                                source[0].name
                            ).to.throw(R.Error);
                        });
                    }
                );

                it("should throw if height parameter is missed", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 256, undefined, 1, CF.COUNT);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if height parameter is missed [source objects]", function () {

                    checkArraySources(256, undefined, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source[0].name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if width is not power of 2", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 300, 256, 1, CF.COUNT);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if width is not power of 2 [source objects]", function () {

                    checkArraySources(300, 256, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source[0].name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if height is not power of 2", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 256, 200, 1, CF.COUNT);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should throw if height is not power of 2 [source objects]", function () {

                    checkArraySources(256, 200, function (source) {

                        expect(
                            function () {
                                device.makeTexture(source);
                            },
                            source[0].name
                        ).to.throw(R.Error);
                    });
                });

                it("should throw if width is greater than 'device.caps().cubemapMaxSize'",
                    function () {

                        var cubemapMaxSize = device.caps().cubemapMaxSize,
                            fn = function () {
                                device.makeTexture(F.RGBA, cubemapMaxSize * 2, 256, 1, CF.COUNT);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should throw if width is greater than 'device.caps().cubemapMaxSize' " +
                    "[source objects]",
                    function () {

                        var cubemapMaxSize = device.caps().cubemapMaxSize;

                        checkArraySources(cubemapMaxSize * 2, 256, function (source) {

                            expect(
                                function () {
                                    device.makeTexture(source);
                                },
                                source[0].name
                            ).to.throw(R.Error);
                        });
                    }
                );

                it("should throw if height is greater than 'device.caps().cubemapMaxSize'",
                    function () {

                        var cubemapMaxSize = device.caps().cubemapMaxSize,
                            fn = function () {
                                device.makeTexture(F.RGBA, 256, cubemapMaxSize * 2, 1, CF.COUNT);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should throw if height is greater than 'device.caps().cubemapMaxSize' " +
                    "[source objects]",
                    function () {

                        var cubemapMaxSize = device.caps().cubemapMaxSize;

                        checkArraySources(256, cubemapMaxSize * 2, function (source) {

                            expect(
                                function () {
                                    device.makeTexture(source);
                                },
                                source[0].name
                            ).to.throw(R.Error);
                        });
                    }
                );

                it("should throw if face sizes is not equal [array of ImageData/HTMLCanvasElement]",
                    function () {

                        var sourceObjects = [
                                makeCanvasElement(256, 256),
                                makeCanvasElement(128, 128),
                                makeCanvasElement(64, 64),
                                makeCanvasElement(32, 32),
                                makeCanvasElement(16, 16),
                                makeCanvasElement(1, 1)
                            ],
                            fn = function () {
                                device.makeTexture(sourceObjects);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should create texture from parameters with passed sizes", function () {

                    var texture = device.makeTexture(F.RGBA, 256, 256, 1, CF.COUNT);

                    expect(texture.width(), "width").to.equal(256);
                    expect(texture.height(), "height").to.equal(256);
                    expect(texture.size(), "size").to.equalByComponents(256, 256);
                });

                it("should create texture from source object with passed sizes", function () {

                    checkArraySources(256, 256, function (source) {

                        var texture = device.makeTexture(source);

                        expect(texture.width(), source[0].name + " width").to.equal(256);
                        expect(texture.height(), source[0].name + " height").to.equal(256);
                        expect(texture.size(), source[0].name + " size").
                            to.equalByComponents(256, 256);
                    });
                });
            });
        });

        describe("[mipCount]", function () {

            describe("[Texture2D]", function () {

                it("should throw if mip count is invalid", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 16, 16, 100, 1);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should build full mip levels chain by default", function () {

                    var texture = device.makeTexture(F.RGBA, 16, 16);
                    expect(texture.mipCount(), "mipCount").to.equal(5);
                });

                it("should build full mip levels chain if mipCount parameter is 0", function () {

                    var texture = device.makeTexture(F.RGBA, 16, 16, 0, 1);
                    expect(texture.mipCount(), "mipCount").to.equal(5);
                });

                it("should create Texture2D with passed mip count", function () {

                    var texture = device.makeTexture(F.RGBA, 16, 16, 1, 1);
                    expect(texture.mipCount(), "mipCount").to.equal(1);
                });

                it("should create Texture2D from source object with only 1 mip by default",
                    function () {

                        checkSources(16, 16, function (source) {

                            var texture = device.makeTexture(source);
                            expect(texture.mipCount(), source.name).to.equal(1);
                        });
                    }
                );
            });

            describe("[TextureCube]", function () {

                it("should throw if mip count is invalid", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 16, 16, 100, CF.COUNT);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should build full mip levels chain by default",
                    function ()
                    {
                        var texture = device.makeTexture(F.RGBA, 16, 16, 0, CF.COUNT);
                        expect(texture.mipCount(), "mipCount").to.equal(5);
                    }
                );

                it("should create TextureCube with passed mip count", function () {

                    var texture = device.makeTexture(F.RGBA, 16, 16, 1, CF.COUNT);
                    expect(texture.mipCount(), "mipCount").to.equal(1);
                });

                it("should create TextureCube from array of six source objects " +
                    "with only 1 mip by default",
                    function () {

                        checkArraySources(16, 16, function (source) {

                            var texture = device.makeTexture(source);
                            expect(texture.mipCount(), source[0].name).to.equal(1);
                        });
                    }
                );
            });
        });

        describe("[faceCount]", function () {

            describe("[Texture2D]", function () {

                it("should throw if face count is invalid", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 256, 256, 1, 2);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should create texture from parameters with 1 face by default", function () {

                    var texture = device.makeTexture(F.RGBA, 256, 256, 1);
                    expect(texture.faceCount()).to.equal(1);
                });

                it("should create texture from source object with 1 face by default", function () {

                    checkSources(256, 256, function (source) {

                        var texture = device.makeTexture(source);
                        expect(texture.faceCount(), source.name).to.equal(1);
                    });
                });
            });

            describe("[TextureCube]", function () {

                it("should throw if face count is not equal B.Render.CubeFace.COUNT", function () {

                    var fn = function () {
                        device.makeTexture(F.RGBA, 256, 256, 1, CF.COUNT + 1);
                    };
                    expect(fn).to.throw(R.Error);
                });

                it("should create texture from parameters only with B.Render.CubeFace.COUNT",
                    function () {

                        var texture = device.makeTexture(F.RGBA, 256, 256, 1, CF.COUNT);
                        expect(texture.faceCount()).to.equal(CF.COUNT);
                    }
                );

                it("should throw if face count is not equal B.Render.CubeFace.COUNT " +
                    "[array of HTMLVideoElement]",
                    function () {

                        var sourceObjects = [
                                makeVideoElement(256, 256),
                                makeVideoElement(256, 256),
                                makeVideoElement(256, 256),
                                makeVideoElement(256, 256),
                                makeVideoElement(256, 256)
                            ],
                            fn = function () {
                                device.makeTexture(sourceObjects);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should throw if face count is not equal B.Render.CubeFace.COUNT " +
                    "[array of HTMLImageElement]",
                    function () {

                        var sourceObjects = [
                                makeImageElement(256, 256),
                                makeImageElement(256, 256),
                                makeImageElement(256, 256)
                            ],
                            fn = function () {
                                device.makeTexture(sourceObjects);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should throw if face count is not equal B.Render.CubeFace.COUNT " +
                    "[array of ImageData/HTMLCanvasElement]",
                    function () {

                        var sourceObjects = [
                                makeCanvasElement(256, 256),
                                makeCanvasElement(256, 256),
                                makeCanvasElement(256, 256),
                                makeCanvasElement(256, 256),
                                makeCanvasElement(256, 256),
                                makeCanvasElement(256, 256),
                                makeCanvasElement(256, 256)
                            ],
                            fn = function () {
                                device.makeTexture(sourceObjects);
                            };

                        expect(fn).to.throw(R.Error);
                    }
                );

                it("should create texture from source object only with B.Render.CubeFace.COUNT",
                    function () {

                        checkArraySources(256, 256, function (source) {

                            var texture = device.makeTexture(source);
                            expect(texture.faceCount(), source[0].name).to.equal(CF.COUNT);
                        });
                    }
                );
            });
        });
    });

    describe("#mip", function () {

        describe("[Texture2D]", function () {

            var texture, mipCount;

            before(function () {
                texture = device.makeTexture(F.RGBA, 256, 256, 0, 1);
                mipCount = texture.mipCount();
            });

            after(function () {
                texture.free();
            });

            it("should return mip object by index", function () {

                var mip, i, l;

                for(i = 0, l = mipCount; i < l; i += 1) {

                    mip = texture.mip(i);
                    expect(mip).to.exist;
                    expect(mip).to.be.instanceof(B.Render.Mip);
                }
            });

            it("should return null if mip isn't found", function () {

                expect(texture.mip(mipCount + 1), "invalid mip index").to.be.null;
                expect(texture.mip(0, 1), "invalid face index").to.be.null;
            });
        });

        describe("[TextureCube]", function () {

            var texture, mipCount;

            before(function () {
                texture = device.makeTexture(F.RGBA, 256, 256, 0, CF.COUNT);
                mipCount = texture.mipCount();
            });

            after(function () {
                texture.free();
            });

            it("should return mip object by index", function () {

                var mip, iMip, iFace, l;

                for(iMip = 0, l = mipCount; iMip < l; iMip += 1) {

                    for(iFace = 0; iFace < CF.COUNT; iFace += 1) {

                        mip = texture.mip(iMip, iFace);
                        expect(mip).to.exist;
                        expect(mip).to.be.instanceof(B.Render.Mip);
                    }
                }
            });

            it("should return null if mip isn't found", function () {

                expect(texture.mip(mipCount + 1, 0), "invalid mip index").to.be.null;
                expect(texture.mip(0, CF.COUNT + 1), "invalid face index").to.be.null;
            });
        });
    });

    describe("#buildMips", function () {

        describe("[Texture2D]", function () {

            it("should build mip levels chain", function () {

                var texture = device.makeTexture(F.RGBA, 16, 16, 1, 1);

                expect(texture.mipCount(), "before buildMips").to.equal(1);
                texture.buildMips();
                expect(texture.mipCount(), "after buildMips").to.equal(5);
            });

            it("should build mip levels chain [source objects]", function () {

                checkSources(16, 16, function (source) {

                    var texture = device.makeTexture(source);

                    expect(texture.mipCount(), source.name + " before buildMips").to.equal(1);
                    texture.buildMips();
                    expect(texture.mipCount(), source.name + " after buildMips").to.equal(5);
                });
            });
        });

        describe("[TextureCube]", function () {

            it("should build mip levels chain", function () {

                var texture = device.makeTexture(F.RGBA, 16, 16, 1, CF.COUNT);

                expect(texture.mipCount(), "before buildMips").to.equal(1);
                texture.buildMips();
                expect(texture.mipCount(), "after buildMips").to.equal(5);
            });

            it("should build mip levels chain [source objects]", function () {

                checkArraySources(16, 16, function (source) {

                    var texture = device.makeTexture(source);
                    expect(texture.mipCount(), source[0].name + " before buildMips").to.equal(1);
                    texture.buildMips();
                    expect(texture.mipCount(), source[0].name + " after buildMips").to.equal(5);
                });
            });
        });
    });

    describe("#flush", function () {

        it("should flush all mip data sources", function () {

            var makeImageElement = B.Test.makeImageElement,
                texture = device.makeTexture(F.RGBA, 256, 256, 3),
                mipCount = texture.mipCount(),
                i;

            texture.mip(0).source(makeImageElement(256, 256));
            texture.mip(1).source(makeImageElement(128, 128));
            texture.mip(2).source(makeImageElement(64, 64));

            texture.flush();
            for(i = 0; i < mipCount; i += 1) {
                expect(texture.mip(i).source(), i).to.be.null;
            }
        });
    });

    describe("#free", function () {

        it("should free texture and detach rendering device", function () {

            var texture = device.makeTexture(F.RGBA, 256, 256);

            texture.free();
            expect(texture.device()).to.not.equal(device);
        });
    });
});