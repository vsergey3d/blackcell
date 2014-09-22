
describe("B.Render.Pass", function () {

    var R = B.Render,
        A = R.Attribute,
        U = R.Uniform,
        S = R.State,

        shaderToStr = function (type) {

            switch (type) {
            case R.Shader.VERTEX:
                return "VERTEX";
            case R.Shader.FRAGMENT:
                return "FRAGMENT";
            }
            return "unknown";
        },

        canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {
        expect(R.Pass).to.exist;
    });

    describe("create & free", function () {

        var pass;

        before(function () {
            pass = B.Test.makeTestPass(device);
        });

        it("should be created by device", function () {

            expect(pass).to.be.instanceof(R.Pass);
            expect(pass.device()).to.equal(device);
        });

        it("should free pass and detach rendering device", function () {

            pass.free();
            expect(pass.device()).to.not.equal(device);
        });
    });

    describe("#state", function () {

        var pass;

        before(function () {
            pass = B.Test.makeTestPass(device);
        });

        after(function () {
            pass.free();
        });

        it("should return state object by type", function () {

            var states = [
                    S.POLYGON,
                    S.MULTISAMPLE,
                    S.COLOR,
                    S.DEPTH,
                    S.STENCIL,
                    S.BLEND
                ],
                statesToStr = function (state) {
                    switch(state){
                    case S.POLYGON:
                        return "POLYGON";
                    case S.MULTISAMPLE:
                        return "MULTISAMPLE";
                    case S.COLOR:
                        return "COLOR";
                    case S.DEPTH:
                        return "DEPTH";
                    case S.STENCIL:
                        return "STENCIL";
                    case S.BLEND:
                        return "BLEND";
                    }
                    return "unknown";
                },

                state, i, l;

            for(i = 0, l = states.length; i < l; i += 1){

                state = states[i];
                expect(pass.state(state), statesToStr(state)).to.exist;
            }
        });

        it("should return null if state isn't found", function () {

            expect(pass.state(-1)).to.be.null;
        });
    });

    describe("#source", function () {

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

            pass;

        before(function () {
            pass = device.makePass(vs, fs);
        });

        it("should return source code", function () {

            expect(pass.source(R.Shader.VERTEX)).to.equal(vs);
            expect(pass.source(R.Shader.FRAGMENT)).to.equal(fs);
        });

        it("should return translated code", function () {

            expect(pass.source(R.Shader.VERTEX, true)).to.be.a("string").
                and.not.be.empty;
            expect(pass.source(R.Shader.FRAGMENT, true)).to.a("string").
                and.not.be.empty;
        });

        it("should return null if shader type is unknown", function () {

            expect(pass.source(-1)).to.be.null;
        });
    });

    describe("#compile", function () {

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
            pass, glProgram, gl;

        before(function () {
            pass = device.makePass(vs, fs);
            glProgram = pass._glProgram;
            gl = device._gl;
        });

        after(function () {
            pass.free();
        });

        it("should compile shaders", function () {

            var fn = function () {
                pass.compile(vs, fs);
            };

            expect(fn).to.not.throw();
        });

        it("should throw render error if" +
            "vertex shader source is invalid", sinon.test(function () {

            var
                fn = function () {
                    pass.compile(null, fs);
                };

            expect(fn).to.throw(R.Error);
        }));

        it("should throw render error if" +
            "fragment shader source is invalid", sinon.test(function () {

            var
                fn = function () {
                    pass.compile(vs, null);
                };

            expect(fn).to.throw(R.Error);
        }));

        it("should throw render error if linking program is failed", sinon.test(function () {

            var
                fn = function () {
                    pass.compile(vs, fs);
                };

            this.stub(gl, "getProgramInfoLog").returns(null);
            this.stub(gl, "getProgramParameter").withArgs(glProgram, gl.LINK_STATUS).returns(false);

            expect(fn).to.throw(R.Error);
        }));

        it("should throw render error if linking program is failed", sinon.test(function () {

            var
                fn = function () {
                    pass.compile(vs, fs);
                };

            this.stub(gl, "getProgramInfoLog").returns("linking error");
            this.stub(gl, "getProgramParameter").withArgs(glProgram, gl.LINK_STATUS).returns(false);

            expect(fn).to.throw(R.Pass.Error);
        }));

        it("should throw compilation error if shader compilation is failed",
            sinon.test(function () {

                var
                    msg = "" +
                        "ERROR: 0:0: error message one\n"+
                        "ERROR: 0:1: error message two'\n"+
                        "ERROR: 0:2: error message three\n"+
                        "ERROR: 0:10: error message four",

                    fn = function () {
                        pass.compile(vs, fs);
                    };

                this.stub(gl, "getShaderInfoLog").returns(msg);
                this.stub(gl, "getShaderParameter").returns(false);

                expect(fn).to.throw(R.Pass.CompileError);
            })
        );

        it("should throw render error if shader compilation is failed", sinon.test(function () {

            var
                fn = function () {
                    pass.compile(vs, fs);
                };

            this.stub(gl, "getShaderParameter").returns(false);

            expect(fn).to.throw(R.Error);
        }));

        it("should throw if uniform type defined in shader is not supported",
            sinon.test(function () {

            var vsUniform = ""+
                    "uniform mat2 mx;"+
                    "void main()"+
                    "{"+
                    "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                    "}",

                fsUniform = ""+
                    "uniform mat2 mx;"+
                    "void main()"+
                    "{"+
                    "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                    "}",

                fn = function (vs, fs) {
                        return function () {
                            pass.compile(vs, fs);
                        };
                    },
                programStub, uniformStub;

            programStub = this.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(0);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(1);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            uniformStub = this.stub(gl, "getActiveUniform");
            uniformStub.returns({});
            uniformStub.withArgs(glProgram, 0).
                returns({ size: 1, type: gl.FLOAT_MAT2, name: "mx" });

            expect(fn(vsUniform, fs), "VERTEX").to.throw(R.Error);
            expect(fn(vs, fsUniform), "FRAGMENT").to.throw(R.Error);
        }));

        it("should define macros if passed", function () {

            var reg = /#define (\w+) (\w+)\n/g,
                macros = { macros1: "SPECIAL_MACROS", macros2: "25", macros3: "MACROS_3" },
                translated, src, matches,
                i, l;

            pass.compile(vs, fs, macros);

            for(i = 0, l = R.Shader.COUNT; i < l; i+=1) {

                src = pass.source(i, true);
                translated = {};
                while ((matches = reg.exec(src)) !== null) {
                    translated[matches[1]] = matches[2];
                }

                expect(translated, shaderToStr(i)).to.deep.equal(macros);
            }
        });

        describe("precision", function () {

            var reg = /precision\s+(\w+)\s+float\s*;/g;

            it("should not add precision if defined", function () {

                var translated, src, matches,
                    i, l;

                pass.compile("precision highp float;" + vs, "precision highp float;" + fs);

                for(i = 0, l = R.Shader.COUNT; i < l; i+=1) {

                    src = pass.source(i, true);
                    translated = [];
                    while ((matches = reg.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated, shaderToStr(i)).to.have.length(1);
                    expect(translated[0], shaderToStr(i)).to.equal("highp");
                }
            });

            it("should add high precision if not defined and high precision format is supported",
                sinon.test(function () {

                    var src, matches, translated,
                        stub,
                        i, l;

                    stub = this.stub(gl, "getShaderPrecisionFormat");
                    stub.withArgs(gl.VERTEX_SHADER, gl.HIGH_FLOAT).returns({precision: 1});
                    stub.withArgs(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).returns({precision: 1});

                    pass.compile(vs, fs);

                    for(i = 0, l = R.Shader.COUNT; i < l; i+=1) {

                        src = pass.source(i, true);
                        translated = [];
                        while ((matches = reg.exec(src)) !== null) {
                            translated.push(matches[1]);
                        }

                        expect(translated, shaderToStr(i)).to.have.length(1);
                        expect(translated[0], shaderToStr(i)).to.equal("highp");
                    }
                })
            );

            it("should add medium precision if not defined and " +
                "high precision format is not supported", sinon.test(function () {

                    var src, matches, translated,
                        stub,
                        i, l;

                    stub = this.stub(gl, "getShaderPrecisionFormat");
                    stub.withArgs(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).returns({precision: 1});
                    stub.withArgs(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).returns({precision: 1});
                    stub.returns({precision: 0});

                    pass.compile(vs, fs);

                    for(i = 0, l = R.Shader.COUNT; i < l; i+=1) {

                        src = pass.source(i, true);
                        translated = [];
                        while ((matches = reg.exec(src)) !== null) {
                            translated.push(matches[1]);
                        }

                        expect(translated, shaderToStr(i)).to.have.length(1);
                        expect(translated[0], shaderToStr(i)).to.equal("mediump");
                    }
                })
            );

            it("should add low precision if not defined and " +
                "high and medium precision format is not supported", sinon.test(function () {

                    var src, matches, translated,
                        stub,
                        i, l;

                    stub = this.stub(gl, "getShaderPrecisionFormat");
                    stub.withArgs(gl.VERTEX_SHADER, gl.LOW_FLOAT).returns({precision: 1});
                    stub.withArgs(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).returns({precision: 1});
                    stub.returns({precision: 0});

                    pass.compile(vs, fs);

                    for(i = 0, l = R.Shader.COUNT; i < l; i+=1) {

                        src = pass.source(i, true);
                        translated = [];
                        while ((matches = reg.exec(src)) !== null) {
                            translated.push(matches[1]);
                        }

                        expect(translated, shaderToStr(i)).to.have.length(1);
                        expect(translated[0], shaderToStr(i)).to.equal("lowp");
                    }
                })
            );
        });

        describe("extensions", function () {

            var DERIVATIVES_EXT = /#extension\s+GL_OES_standard_derivatives\s*:/g,
                FRAG_DEPTH_EXT = /#extension\s+GL_EXT_frag_depth\s*:/g,
                DRAW_BUFFERS_EXT = /#extension\s+GL_EXT_draw_buffers\s*:/g,

                fsDerivative = {

                    "dFdx":
                        "void main()"+
                        "{" +
                        "    float dx = dFdx(value);" +
                        "    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);" +
                        "}",

                    "dFdy":
                        "void main()"+
                        "{" +
                        "    float dy = dFdy(value);" +
                        "    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);" +
                        "}",

                    "fwidth":
                        "void main()"+
                        "{" +
                        "    float dw = fwidth(value);" +
                        "    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);" +
                        "}",

                    "all":
                        "void main()"+
                        "{" +
                        "    vec3 dV = vec3(dFdx(value), dFdy(value), fwidth(value));" +
                        "    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);" +
                        "}"
                },
                fsFragDepth = ""+
                    "void main()"+
                    "{"+
                    "    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);"+
                    "    gl_FragDepthEXT = 1.0;"+
                    "}",
                fsFragData = ""+
                    "void main()"+
                    "{"+
                    "    gl_FragData[0] = vec4(1.0, 0.0, 0.0, 1.0);"+
                    "    gl_FragData[1] = vec4(0.0, 1.0, 0.0, 1.0);"+
                    "    gl_FragData[2] = vec4(0.0, 0.0, 1.0, 1.0);"+
                    "    gl_FragData[3] = vec4(1.0, 1.0, 1.0, 1.0);"+
                    "}";


            it("should not enable [GL_OES_standard_derivatives] extension " +
                "if standard derivative is not supported", sinon.test(function () {

                    var fs, translated, src, matches;

                    this.stub(device, "caps").returns({derivatives: false});

                    for(var desc in fsDerivative) {

                        fs = fsDerivative[desc];
                        pass.compile(vs, fs);

                        src = pass.source(R.Shader.FRAGMENT, true);
                        translated = [];
                        while ((matches = DERIVATIVES_EXT.exec(src)) !== null) {
                            translated.push(matches[1]);
                        }

                        expect(translated, desc).to.have.length(0);
                    }
                })
            );

            it("should not enable [GL_OES_standard_derivatives] extension " +
                "if already defined in shader",
                sinon.test(function () {

                    var fs, translated, src, matches;

                    this.stub(device, "caps").returns({derivatives: true});

                    for(var desc in fsDerivative) {

                        fs =  "#extension GL_OES_standard_derivatives : enable" +
                            fsDerivative[desc];
                        pass.compile(vs, fs);

                        src = pass.source(R.Shader.FRAGMENT, true);
                        translated = [];
                        while ((matches = DERIVATIVES_EXT.exec(src)) !== null) {
                            translated.push(matches[1]);
                        }

                        expect(translated, desc).to.have.length(1);
                    }
                })
            );

            it("should enable [GL_OES_standard_derivatives] extension if used in shader and " +
                    "standard derivative is supported",
                sinon.test(function () {

                    var fs, translated, src, matches;

                    this.stub(device, "caps").returns({derivatives: true});

                    for(var desc in fsDerivative) {

                        fs = fsDerivative[desc];
                        pass.compile(vs, fs);

                        src = pass.source(R.Shader.FRAGMENT, true);
                        translated = [];
                        while ((matches = DERIVATIVES_EXT.exec(src)) !== null) {
                            translated.push(matches[1]);
                        }

                        expect(translated, desc).to.have.length(1);
                    }
                })
            );

            it("should not enable [GL_OES_standard_derivatives] extension " +
                "if standard derivative is supported but not used in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({derivatives: true});
                    pass.compile(vs, fs);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DERIVATIVES_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_OES_standard_derivatives] extension " +
                "if standard derivative is not supported and not used in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({derivatives: false});
                    pass.compile(vs, fs);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DERIVATIVES_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_EXT_frag_depth] extension " +
                "if per-fragment depth is not supported",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({writableDepth: false});
                    pass.compile(vs, fsFragDepth);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = FRAG_DEPTH_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_EXT_frag_depth] extension if already defined in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({writableDepth: true});
                    pass.compile(vs, "#extension GL_EXT_frag_depth : enable" + fsFragDepth);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = FRAG_DEPTH_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(1);
                })
            );

            it("should enable [GL_EXT_frag_depth] extension if used in shader and " +
                "per-fragment depth is supported", sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({writableDepth: true});
                    pass.compile(vs, fsFragDepth);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = FRAG_DEPTH_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(1);
                })
            );

            it("should not enable [GL_EXT_frag_depth] extension " +
                "if per-fragment depth is supported but not used in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({writableDepth: true});
                    pass.compile(vs, fs);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = FRAG_DEPTH_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_EXT_frag_depth] extension " +
                "if per-fragment depth is not supported and not used in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({writableDepth: false});
                    pass.compile(vs, fs);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = FRAG_DEPTH_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_EXT_draw_buffers] extension " +
                "if multiple color output is not supported",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({colorTargetCount: 1});
                    pass.compile(vs, fsFragData);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DRAW_BUFFERS_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_EXT_draw_buffers] extension if already defined in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({colorTargetCount: 4});
                    pass.compile(vs, "#extension GL_EXT_draw_buffers : enable" + fsFragData);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DRAW_BUFFERS_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(1);
                })
            );

            it("should enable [GL_EXT_draw_buffers] extension if used in shader and " +
                "multiple color output is supported", sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({colorTargetCount: 4});
                    pass.compile(vs, fsFragData);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DRAW_BUFFERS_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(1);
                })
            );

            it("should not enable [GL_EXT_draw_buffers] extension " +
                "if multiple color output is supported but not used in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({colorTargetCount: 4});
                    pass.compile(vs, fs);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DRAW_BUFFERS_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );

            it("should not enable [GL_EXT_draw_buffers] extension " +
                "if multiple color output is not supported and not used in shader",
                sinon.test(function () {

                    var translated, src, matches;

                    this.stub(device, "caps").returns({colorTargetCount: 1});
                    pass.compile(vs, fs);

                    src = pass.source(R.Shader.FRAGMENT, true);
                    translated = [];
                    while ((matches = DRAW_BUFFERS_EXT.exec(src)) !== null) {
                        translated.push(matches[1]);
                    }

                    expect(translated).to.have.length(0);
                })
            );
        });
    });

    describe("#attributes", function () {

        var vs = ""+
                "attribute float floatAttr;"+
                "attribute vec2 vec2Attr;"+
                "attribute vec3 vec3Attr;"+
                "attribute vec4 vec4Attr;"+

                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}"+
                "",

            pass, glProgram, gl,
            programStub, attrStub, attrLocStub;

        before(function () {

            pass = B.Test.makeTestPass(device);
            glProgram = pass._glProgram;
            gl = device._gl;

            programStub = sinon.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(5);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(0);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub = sinon.stub(gl, "getActiveAttrib");
            attrStub.returns({});
            attrStub.withArgs(glProgram, 0).returns({ type: gl.FLOAT, name: "floatAttr" });
            attrStub.withArgs(glProgram, 1).returns({ type: gl.FLOAT_VEC2, name: "vec2Attr" });
            attrStub.withArgs(glProgram, 2).returns({ type: gl.FLOAT_VEC3, name: "vec3Attr" });
            attrStub.withArgs(glProgram, 3).returns({ type: gl.FLOAT_VEC4, name: "vec4Attr" });
            attrStub.withArgs(glProgram, 4).returns({ type: gl.FLOAT_VEC4, name: "invalidAttr" });

            attrLocStub = sinon.stub(gl, "getAttribLocation");
            attrLocStub.returns(0);
            attrLocStub.withArgs(glProgram, "invalidAttr").returns(-1);
        });

        after(function () {

            programStub.restore();
            attrStub.restore();
            attrLocStub.restore();

            pass.free();
        });

        it("should return attributes created during compilation", function () {

            var attributes = {
                "floatAttr": A.FLOAT,
                "vec2Attr": A.VECTOR2,
                "vec3Attr": A.VECTOR3,
                "vec4Attr": A.VECTOR4
            };

            pass.compile(vs, fs);
            expect(pass.attributes()).to.deep.equal(attributes);
        });
    });

    describe("#uniforms", function () {

        var vs = ""+
                "uniform float floatUniform;"+
                "uniform vec2 vec2Uniform;"+
                "uniform vec3 vec3Uniform;"+
                "uniform vec4 vec4Uniform;"+
                "uniform mat3 mat3Uniform;"+
                "uniform mat4 mat4Uniform;"+
                "uniform float floatArrayUniform[2];"+
                "uniform vec2 vec2ArrayUniform[2];"+
                "uniform vec3 vec3ArrayUniform[2];"+
                "uniform vec4 vec4ArrayUniform[2];"+
                "uniform mat3 mat3ArrayUniform[2];"+
                "uniform mat4 mat4ArrayUniform[2];"+

                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "uniform sampler2D sampler2dUniform;"+
                "uniform samplerCube samplerCubeUniform;"+

                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}"+
                "",

            pass, glProgram, gl,
            programStub, uniformStub, uniformLocStub;

        before(function () {

            pass = B.Test.makeTestPass(device);
            glProgram = pass._glProgram;
            gl = device._gl;

            programStub = sinon.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(0);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(15);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            uniformStub = sinon.stub(gl, "getActiveUniform");
            uniformStub.returns({});

            uniformLocStub = sinon.stub(gl, "getUniformLocation");
            uniformLocStub.returns({});
            uniformLocStub.withArgs(glProgram, "invalidUniform").returns(null);
        });

        after(function () {

            programStub.restore();
            uniformStub.restore();
            uniformLocStub.restore();

            pass.free();
        });

        it("should return uniforms created during compilation", function () {

            var uniforms = {
                "floatUniform": {
                    type: U.FLOAT,
                    count: 1
                },
                "vec2Uniform": {
                    type: U.VECTOR2,
                    count: 1
                },
                "vec3Uniform": {
                    type: U.VECTOR3,
                    count: 1
                },
                "vec4Uniform": {
                    type: U.VECTOR4,
                    count: 1
                },
                "mat3Uniform": {
                    type: U.MATRIX3,
                    count: 1
                },
                "mat4Uniform": {
                    type: U.MATRIX4,
                    count: 1
                },
                "floatArrayUniform": {
                    type: U.FLOAT,
                    count: 2
                },
                "vec2ArrayUniform": {
                    type: U.VECTOR2,
                    count: 2
                },
                "vec3ArrayUniform": {
                    type: U.VECTOR3,
                    count: 2
                },
                "vec4ArrayUniform": {
                    type: U.VECTOR4,
                    count: 2
                },
                "mat3ArrayUniform": {
                    type: U.MATRIX3,
                    count: 2
                },
                "mat4ArrayUniform": {
                    type: U.MATRIX4,
                    count: 2
                },
                "sampler2dUniform": {
                    type: U.SAMPLER_2D,
                    count: 1
                },
                "samplerCubeUniform": {
                    type: U.SAMPLER_CUBE,
                    count: 1
                }
            };

            uniformStub.withArgs(glProgram, 0).
                returns({ size: 1, type: gl.FLOAT, name: "floatUniform" });
            uniformStub.withArgs(glProgram, 1).
                returns({ size: 1, type: gl.FLOAT_VEC2, name: "vec2Uniform" });
            uniformStub.withArgs(glProgram, 2).
                returns({ size: 1, type: gl.FLOAT_VEC3, name: "vec3Uniform" });
            uniformStub.withArgs(glProgram, 3).
                returns({ size: 1, type: gl.FLOAT_VEC4, name: "vec4Uniform" });
            uniformStub.withArgs(glProgram, 4).
                returns({ size: 1, type: gl.FLOAT_MAT3, name: "mat3Uniform" });
            uniformStub.withArgs(glProgram, 5).
                returns({ size: 1, type: gl.FLOAT_MAT4, name: "mat4Uniform" });
            uniformStub.withArgs(glProgram, 6).
                returns({ size: 2, type: gl.FLOAT, name: "floatArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 7).
                returns({ size: 2, type: gl.FLOAT_VEC2, name: "vec2ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 8).
                returns({ size: 2, type: gl.FLOAT_VEC3, name: "vec3ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 9).
                returns({ size: 2, type: gl.FLOAT_VEC4, name: "vec4ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 10).
                returns({ size: 2, type: gl.FLOAT_MAT3, name: "mat3ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 11).
                returns({ size: 2, type: gl.FLOAT_MAT4, name: "mat4ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 12).
                returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform" });
            uniformStub.withArgs(glProgram, 13).
                returns({ size: 1, type: gl.SAMPLER_CUBE, name: "samplerCubeUniform" });
            uniformStub.withArgs(glProgram, 14).
                returns({ size: 1, type: gl.FLOAT, name: "invalidUniform" });

            pass.compile(vs, fs);
            expect(pass.uniforms()).to.deep.equal(uniforms);
        });
    });

    describe("#sampler", function () {

        var vs = ""+
                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "uniform sampler2D sampler2dUniform;"+
                "uniform samplerCube samplerCubeUniform;"+

                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}"+
                "",

            pass, glProgram, gl,
            programStub, uniformStub, uniformLocStub;

        before(function () {

            pass = B.Test.makeTestPass(device);
            glProgram = pass._glProgram;
            gl = device._gl;

            programStub = sinon.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(0);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(2);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            uniformStub = sinon.stub(gl, "getActiveUniform");
            uniformStub.returns({});
            uniformStub.withArgs(glProgram, 0).
                returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform" });
            uniformStub.withArgs(glProgram, 1).
                returns({ size: 1, type: gl.SAMPLER_CUBE, name: "samplerCubeUniform" });

            uniformLocStub = sinon.stub(gl, "getUniformLocation");
            uniformLocStub.returns({});
        });

        after(function () {

            programStub.restore();
            uniformStub.restore();
            uniformLocStub.restore();

            pass.free();
        });

        it("should return samplers created during compilation", function () {

            pass.compile(vs, fs);
            expect(pass.sampler("sampler2dUniform")).to.exist;
            expect(pass.sampler("samplerCubeUniform")).to.exist;
        });

        it("should not throw if sampler isn't found", function () {

            expect(function () {
                pass.sampler("unknownSampler");
            },
            "after uniform applying").to.not.throw();
        });
    });

    describe("uniforms applying", function () {

        var M = B.Math,

            vs = ""+
                "uniform float floatUniform;"+
                "uniform vec2 vec2Uniform;"+
                "uniform vec3 vec3Uniform;"+
                "uniform vec4 vec4Uniform;"+
                "uniform mat3 mat3Uniform;"+
                "uniform mat4 mat4Uniform;"+
                "uniform float floatArrayUniform[2];"+
                "uniform vec2 vec2ArrayUniform[2];"+
                "uniform vec3 vec3ArrayUniform[2];"+
                "uniform vec4 vec4ArrayUniform[2];"+
                "uniform mat3 mat3ArrayUniform[2];"+
                "uniform mat4 mat4ArrayUniform[2];"+

                "void main()"+
                "{"+
                "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}",

            fs = ""+
                "uniform sampler2D sampler2dUniform;"+
                "uniform samplerCube samplerCubeUniform;"+

                "void main()"+
                "{"+
                "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
                "}"+
                "",

            pass, material, mesh, instance, stage,
            glProgram, gl, programStub, uniformStub, attrStub;

        before(function () {

            pass = B.Test.makeTestPass(device);
            stage = B.Test.makeTestStage(device, device.target(), "new");
            material = B.Test.makeTestMaterial(device, "material", stage, pass);
            mesh = B.Test.makeTestMesh(device);
            instance = B.Test.makeTestInstance(device, "material", mesh);

            glProgram = pass._glProgram;
            gl = device._gl;

            programStub = sinon.stub(gl, "getProgramParameter");
            programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
            programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(14);
            programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

            attrStub = sinon.stub(gl, "getActiveAttrib");
            attrStub.returns({});
            attrStub.withArgs(glProgram, 0).returns({ type: gl.FLOAT_VEC3, name: "position" });

            uniformStub = sinon.stub(gl, "getActiveUniform");
            uniformStub.returns({});
            uniformStub.withArgs(glProgram, 0).
                returns({ size: 1, type: gl.FLOAT, name: "floatUniform" });
            uniformStub.withArgs(glProgram, 1).
                returns({ size: 1, type: gl.FLOAT_VEC2, name: "vec2Uniform" });
            uniformStub.withArgs(glProgram, 2).
                returns({ size: 1, type: gl.FLOAT_VEC3, name: "vec3Uniform" });
            uniformStub.withArgs(glProgram, 3).
                returns({ size: 1, type: gl.FLOAT_VEC4, name: "vec4Uniform" });
            uniformStub.withArgs(glProgram, 4).
                returns({ size: 1, type: gl.FLOAT_MAT3, name: "mat3Uniform" });
            uniformStub.withArgs(glProgram, 5).
                returns({ size: 1, type: gl.FLOAT_MAT4, name: "mat4Uniform" });
            uniformStub.withArgs(glProgram, 6).
                returns({ size: 2, type: gl.FLOAT, name: "floatArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 7).
                returns({ size: 2, type: gl.FLOAT_VEC2, name: "vec2ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 8).
                returns({ size: 2, type: gl.FLOAT_VEC3, name: "vec3ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 9).
                returns({ size: 2, type: gl.FLOAT_VEC4, name: "vec4ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 10).
                returns({ size: 2, type: gl.FLOAT_MAT3, name: "mat3ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 11).
                returns({ size: 2, type: gl.FLOAT_MAT4, name: "mat4ArrayUniform[0]" });
            uniformStub.withArgs(glProgram, 12).
                returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform" });
            uniformStub.withArgs(glProgram, 13).
                returns({ size: 1, type: gl.SAMPLER_CUBE, name: "samplerCubeUniform" });
        });

        after(function () {
            instance && instance.free();
            stage && stage.free();
            pass && pass.free();
        });

        it("should apply uniforms", function () {

            pass.compile(vs, fs);

            expect(function () {
                device.frame();
            },
            "before uniform applying").to.not.throw();

            stage.uniform("floatUniform", 1.5);
            stage.uniform("vec2Uniform", M.makeVector2(0.1, 0.9));
            stage.uniform("vec3Uniform", M.makeVector3(1.0, 0.5, 1.0));
            stage.uniform("vec4Uniform", M.makeVector4(0.0, 0.0, 0.0, 1.0));
            stage.uniform("mat3Uniform", M.makeMatrix3(
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                5.0, 5.0, 1.0));
            stage.uniform("mat4Uniform", M.makeMatrix4(
                1.0, 0.5, 0.0, 0.0,
                0.5, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                5.0, 5.0, 5.0,1.0));
            material.uniform("floatArrayUniform", [1.5, 2.5]);
            material.uniform("vec2ArrayUniform", [
                M.makeVector2(0.1, 0.9),
                M.makeVector2(1.1, 1.9)
            ]);
            material.uniform("vec3ArrayUniform", [
                M.makeVector3(1.0, 0.5, 1.0),
                M.makeVector3(2.0, 1.5, 2.0)
            ]);
            material.uniform("vec4ArrayUniform", [
                M.makeVector4(0.0, 0.0, 0.0, 1.0),
                M.makeVector4(1.0, 1.0, 1.0, 2.0)
            ]);
            material.uniform("mat3ArrayUniform", [
                M.makeMatrix3(
                    1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0,
                    5.0, 5.0, 1.0),
                M.makeMatrix3(
                    1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0,
                    6.0, 6.0, 1.0)
            ]);
            material.uniform("mat4ArrayUniform", [
                M.makeMatrix4(
                    1.0, 0.5, 0.0, 0.0,
                    0.5, 1.0, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    5.0, 5.0, 5.0,1.0),
                M.makeMatrix4(
                    1.0, 0.5, 0.0, 0.0,
                    0.5, 1.0, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    6.0, 6.0, 6.0,1.0)
            ]);
            instance.uniform("sampler2dUniform", device.makeTexture(R.Format.RGBA, 128, 128, 1));
            instance.uniform("samplerCubeUniform",
                device.makeTexture(R.Format.RGBA, 128, 128, 1, R.CubeFace.COUNT));

            expect(function () {
                device.frame();
            },
            "after uniform applying").to.not.throw();
        });
    });
});

describe("B.Render.Pass.CompileError", function () {

    var R = B.Render;

    it("should exist", function () {
        expect(R.Pass.CompileError).to.exist;
    });

    it("should be instanceof Error", function () {

        var err = new R.Pass.CompileError("compile error", 0, "");

        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property("name").that.equal("B.Render.Pass.CompileError");
        expect(err).to.have.property("message").that.equal("compile error");
    });

    it("should preserve passed location", function () {

        var error, i, l;

        for (i = 0, l = R.Shader.COUNT; i < l; i += 1) {
            error = new R.Pass.CompileError("compile error", i, "");
            expect(error).to.have.property("location").that.equal(i);
        }
    });

    it("should extract list of reasons from log", function () {

        var location = R.Shader.VERTEX,

            log = "" +
                "ERROR: 0:12: 'const' :  non-matching types for const initializer\n"+
                "ERROR: 0:17: '=' :  cannot convert from '-component vector of float' to " +
                    "'-component vector of float'\n"+
                "ERROR: 0:23: 'const' :  non-matching types for const initializer\n"+
                "ERROR: 0:40: '*' :  wrong operand types  no operation '*' exists " +
                    "that takes a left-hand operand of type '-component vector of float' and " +
                    "a right operand of type '-component vector of float' " +
                    "(or there is no acceptable conversion)\n",

            reasons = [
                {
                    "type": "ERROR",
                    "line": 12,
                    "reason": "'const' :  non-matching types for const initializer"
                },
                {
                    "type": "ERROR",
                    "line": 17,
                    "reason": "'=' :  cannot convert from '-component vector of float' to " +
                        "'-component vector of float'"
                },

                {
                    "type": "ERROR",
                    "line": 23,
                    "reason": "'const' :  non-matching types for const initializer"
                },
                {
                    "type": "ERROR",
                    "line": 40,
                    "reason": "'*' :  wrong operand types  no operation '*' exists " +
                        "that takes a left-hand operand of type '-component vector of float' and " +
                        "a right operand of type '-component vector of float' " +
                        "(or there is no acceptable conversion)"
                }
            ];

        expect(new R.Pass.CompileError("compile error", location, log)).
            to.have.property("reasons").that.deep.equal(reasons);
    });

    it("should not extract list of reasons if log is missed", function () {

        expect(new R.Pass.CompileError("compile error", R.Shader.VERTEX)).
            to.have.property("reasons").that.is.empty;
    });
});