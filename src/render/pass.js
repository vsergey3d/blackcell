
/**
 * Shader type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Shader = {

    /**
     * Vertex shader.
     *
     * @constant
     */
    VERTEX: 0,

    /**
     * Fragment shader.
     *
     * @constant
     */
    FRAGMENT: 1,

    /**
     * Shader count.
     *
     * @constant
     */
    COUNT: 2
};

/**
 * @ignore
 * @this B.Render.Pass
 */
B.Render.PassProto = function () {

    var M = B.Math,
        R = B.Render,

        toGLShaderType = function (gl, type) {

            switch (type) {
            case R.Shader.VERTEX:
                return gl.VERTEX_SHADER;
            case R.Shader.FRAGMENT:
                return gl.FRAGMENT_SHADER;
            }
        };

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns vertex attributes.
     *
     * @returns {Object.<string, B.Render.Attribute>}
     */
    this.attributes = function () {

        return this._attributes;
    };

    /**
     * Returns uniforms.
     *
     * @returns {Object.<string, {type: B.Render.Uniform, count: number}>}
     */
    this.uniforms = function () {

        return this._uniforms;
    };

    /**
     * Returns sampler object by name.
     *
     * @param {string} name
     * @returns {B.Render.Sampler}
     */
    this.sampler = function (name) {

        var samplers = this._samplers, sampler = samplers[name];

        if (!sampler) {
            sampler = new R.Sampler(this);
            samplers[name] = sampler;
        }
        return sampler;
    };

    /**
     * Returns state object by type.
     *
     * @param {B.Render.State} type
     * @returns {B.Render.State | null} null if the state object doesn't exist
     */
    this.state = function (type) {

        return this._states[type] || null;
    };

    /**
     * Compile shaders.
     *
     * @function
     * @param {string} vs vertex shader source string
     * @param {string} fs fragment shader source string
     * @param {Object.<string, string>} [macros] shader macro defines
     * @returns {B.Render.Pass} this
     * @throws {B.Render.Error} if internal or linking error is occurred or shader source is invalid
     * @throws {B.Render.Pass.CompileError} if shader compilation is failed
     */
    this.compile = (function () {

        var U = R.Uniform,

            adjustMacros = function (that, code) {

                var name, macros = that._macros,
                    preCode = "";

                for (name in macros) {
                    preCode += "#define " + name + " " + macros[name] + "\n";
                }
                return preCode + "#line 0\n" + code;
            },

            adjustExts = (function () {

                var DERIVATIVES_EXT = /#extension\s+GL_OES_standard_derivatives\s*:/g,
                    DF = /(?:\s+|;)(?:(?:dFdx\s*\()|(?:dFdy\s*\()|(?:fwidth\s*\())/g,

                    FRAG_DEPTH_EXT = /#extension\s+GL_EXT_frag_depth\s*:/g,
                    FRAG_DEPTH = /(?:\s+|;)gl_FragDepthEXT\s*=/g,

                    DRAW_BUFFERS_EXT = /#extension\s+GL_EXT_draw_buffers\s*:/g,
                    FRAG_DATA = /(?:\s+|;)gl_FragData\s*\[\s*(\d+)\s*\]/g;

                return function (that, shaderType, code) {

                    var caps = that._device.caps(),
                        preCode = "", result;

                    if (shaderType === R.Shader.FRAGMENT) {

                        if (caps.derivatives === true && code.match(DF) &&
                            !code.match(DERIVATIVES_EXT)) {
                            preCode += "#extension GL_OES_standard_derivatives : enable\n";
                        }
                        if (caps.writableDepth === true && code.match(FRAG_DEPTH) &&
                            !code.match(FRAG_DEPTH_EXT)) {
                            preCode += "#extension GL_EXT_frag_depth : enable\n";
                        }
                        if (caps.colorTargetCount > 1 && !code.match(DRAW_BUFFERS_EXT)) {
                            do {
                                result = FRAG_DATA.exec(code);
                                if (result && result[1] > 0) {
                                    preCode += "#extension GL_EXT_draw_buffers : enable\n";
                                    break;
                                }
                            } while (result);
                        }
                    }
                    return preCode + "#line 0\n" + code;
                };
            }()),

            adjustPrecision = (function () {

                var PRECISION = /precision\s+(\w+)\s+float\s*;/g,

                    getMaxPrecision = function (gl, shaderType) {

                        var glType = toGLShaderType(gl, shaderType);

                        if (gl.getShaderPrecisionFormat(
                            glType, gl.HIGH_FLOAT).precision > 0) {
                            return "highp";
                        } else if (gl.getShaderPrecisionFormat(
                            glType, gl.MEDIUM_FLOAT).precision > 0) {
                            return "mediump";
                        }
                        return "lowp";
                    };

                return function (that, shaderType, code) {

                    if (code.match(PRECISION)) {
                        return code;
                    }
                    return "precision " + getMaxPrecision(that._gl, shaderType) +
                        " float;\n#line 0\n" + code;
                };
            }()),

            adjustUniforms = (function () {

                var COMPONENTS = ["x", "y", "z", "w"],

                    typeFromString = function (str) {

                        switch (str) {
                        case "float":
                            return U.FLOAT;
                        case "vec2":
                            return U.VECTOR2;
                        case "vec3":
                            return U.VECTOR3;
                        case "vec4":
                            return U.VECTOR4;
                        case "mat3":
                            return U.MATRIX3;
                        case "mat4":
                            return U.MATRIX4;
                        }
                    },

                    buildValueCode = function (type, register, component, bufferName) {

                        var result;

                        switch (type) {
                        case U.FLOAT:
                            result = bufferName + "[" + register + "]." +
                                COMPONENTS[component];
                            break;
                        case U.VECTOR2:
                            result = bufferName + "[" + register + "]." +
                                COMPONENTS[component] + COMPONENTS[component + 1];
                            break;
                        case U.VECTOR3:
                            result = bufferName + "[" + register + "].xyz";
                            break;
                        case U.VECTOR4:
                            result = bufferName + "[" + register + "]";
                            break;
                        case U.MATRIX3:
                            result = bufferName + "[" + register + "].xyz," +
                                bufferName + "[" + (register + 1) + "].xyz," +
                                bufferName + "[" + (register + 2) + "].xyz";
                            break;
                        case U.MATRIX4:
                            result = bufferName + "[" + register + "]," +
                                bufferName + "[" + (register + 1) + "]," +
                                bufferName + "[" + (register + 2) + "]," +
                                bufferName + "[" + (register + 3) + "]";
                            break;
                        }
                        return result;
                    },

                    buildUniformCode = function (type, name, uniform, bufferName) {

                        var uType = typeFromString(type),
                            register = uniform.register,
                            component = uniform.component;

                        return type + " " + name + " = " + type + "(" +
                            buildValueCode(uType, register, component, bufferName) + ");";
                    },

                    UNIFORM = /uniform\s+(\w+)\s+(\w+)\s*(?:\[\s*(\d+|\s+)\s*\])?\s*;/g,

                    ubPtr = null,
                    ubDeclared = false,

                    uniformReplacer = function(str, type, name, count) {

                        var ubName = ubPtr.name,
                            ubRegisters = ubPtr.registers,
                            uniform = ubPtr.mapping[name],
                            out = str;

                        if (uniform && !count) {
                            out = buildUniformCode(type, name, uniform, ubName);

                            if (!ubDeclared) {
                                out = "uniform vec4 " + ubName + "[" + ubRegisters + "];" + out;
                                ubDeclared = true;
                            }
                        }
                        return out;
                    };

                return function (that, code) {

                    ubPtr = that._uniformBuffer;
                    ubDeclared = false;

                    return code.replace(UNIFORM, uniformReplacer);
                };
            }()),

            compileShader = function (that, type, code) {

                var gl = that._gl,
                    log, shader = that._glShaders[type];

                if (!code || !code.length) {
                    throw new R.Error("can't compile Pass - invalid source code");
                }
                code = adjustMacros(that, code);
                code = adjustExts(that, type, code);
                code = adjustPrecision(that, type, code);

                if (that._uniformBuffer !== null) {
                    code = adjustUniforms(that, code);
                }
                gl.shaderSource(shader, code);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    log = gl.getShaderInfoLog(shader);
                    throw log ?
                        new R.Pass.CompileError("can't compile Pass", type, log) :
                        new R.Error("can't compile Pass - internal error");
                }

                return code;
            },

            compileProgram = function (that, source, translated) {

                var i, l, out = translated || [];

                for (i = 0, l = R.Shader.COUNT; i < l; i += 1) {
                    out[i] = compileShader(that, i, source[i]);
                }
            },

            linkProgram = function (that) {

                var gl = that._gl,
                    i, l, program = that._glProgram;

                for (i = 0, l = R.Shader.COUNT; i < l; i += 1) {
                    gl.attachShader(program, that._glShaders[i]);
                }
                gl.linkProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    throw new R.Error("can't compile Pass - " +
                        (gl.getProgramInfoLog(program) || "internal error"));
                }
            },

            unlinkProgram = function (that) {

                var gl = that._gl,
                    i, l, program = that._glProgram;

                for (i = 0, l = R.Shader.COUNT; i < l; i += 1) {
                    gl.detachShader(program, that._glShaders[i]);
                }
            },

            extractAttributes = function (that) {

                var gl = that._gl,
                    program = that._glProgram,
                    i, count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES), info,
                    name, type, location;

                that._attributes = {};
                that._glAttributes = {};

                for (i = 0; i < count; i += 1) {
                    info = gl.getActiveAttrib(program, i);

                    name = info.name;
                    type = R.fromGLAttributeActiveInfo(gl, info);
                    location = gl.getAttribLocation(program, name);

                    if (location !== -1) {
                        that._attributes[name] = type;
                        that._glAttributes[name] = {
                            type: type,
                            location: location
                        };
                    }
                }
            },

            extractUniforms = function (that) {

                var gl = that._gl,
                    program = that._glProgram,
                    i, count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS),
                    info, name, type, location, index;

                that._uniforms = {};
                that._glUniforms = {};

                for (i = 0; i < count; i += 1) {
                    info = gl.getActiveUniform(program, i);
                    index = info.name.search("[0]");
                    name = (index !== -1) ? info.name.slice(0, index - 1) : info.name;
                    type = R.fromGLUniformActiveInfo(gl, info);
                    if(!type) {
                        throw new R.Error("can't compile Pass - " +
                            "unsupported uniform type [" + name + "]");
                    }
                    location = gl.getUniformLocation(program, info.name);
                    if (location) {
                        that._uniforms[name] = {
                            type: type,
                            count: info.size
                        };
                        that._glUniforms[name] = {
                            type: type,
                            offset: 0,
                            location: location,
                            value: null,
                            array: (index !== -1)
                        };
                    }
                }
            },

            extractSamplers = function (that) {

                var uniforms = that._glUniforms, uniform,
                    samplers = that._samplers, sampler,
                    name, unit = 0;

                for (name in uniforms) {
                    uniform = uniforms[name];
                    if (uniform.type === U.SAMPLER_2D || uniform.type === U.SAMPLER_CUBE) {
                        sampler = samplers[name];
                        if (!sampler) {
                            samplers[name] = new R.Sampler(that);
                        }
                        uniform.offset = unit;
                        unit += 1;
                    }
                }
            },

            buildUniformBuffer = (function () {

                var TYPES = [U.MATRIX4, U.MATRIX3, U.VECTOR4, U.VECTOR3, U.VECTOR2, U.FLOAT],
                    SIZES = [16, 12, 4, 4, 2, 1],
                    REGISTER_SIZE = 4,

                    mapUniform = function (uniform, name, offset, size, mapping) {

                        var component = offset % REGISTER_SIZE;

                        mapping[name] = {
                            register: (offset && (offset - component)) / REGISTER_SIZE,
                            component: component
                        };
                        uniform.offset = offset;
                        return offset + size;
                    };

                return function (that) {

                    var i, l, type, size,
                        name, uniform, uniforms = that._glUniforms,
                        offset = 0, remainder, bufferSize, mapping = {};

                    for (i = 0, l = TYPES.length; i < l; i += 1) {

                        type = TYPES[i];
                        size = SIZES[i];

                        for (name in uniforms) {
                            uniform = uniforms[name];
                            if (uniform.type === type && !uniform.array) {
                                offset = mapUniform(uniform, name, offset, size, mapping);
                            }
                        }
                    }
                    remainder = offset % REGISTER_SIZE;
                    bufferSize = remainder ? (offset + REGISTER_SIZE - remainder) : offset;

                    that._uniformBuffer = (bufferSize > 0) ? {
                        name: "_ub",
                        location: 0,
                        registers: bufferSize / REGISTER_SIZE,
                        data: new Float32Array(bufferSize),
                        mapping: mapping
                    } : null;
                };
            }()),

            relocateUniforms = function (that) {

                var gl = that._gl, ub = that._uniformBuffer,
                    name, uniform, uniforms = that._glUniforms;

                for (name in uniforms) {
                    uniform = uniforms[name];
                    if (uniform.array ||
                        uniform.type === U.SAMPLER_2D || uniform.type === U.SAMPLER_CUBE) {
                        uniform.location = gl.getUniformLocation(that._glProgram, name);
                    }
                }
                if (ub !== null) {
                    ub.location = gl.getUniformLocation(that._glProgram, ub.name);
                }
            };

        return function (vs, fs, macros) {

            var source = this._shaders.source,
                translated = this._shaders.translated;

            source[R.Shader.VERTEX] = vs;
            source[R.Shader.FRAGMENT] = fs;
            this._macros = macros || {};
            this._uniformBuffer = null;

            compileProgram(this, source);
            linkProgram(this);
            extractAttributes(this);
            extractUniforms(this);
            extractSamplers(this);
            unlinkProgram(this);

            buildUniformBuffer(this);

            compileProgram(this, source, translated);
            linkProgram(this);
            relocateUniforms(this);

            return this;
        };
    }());

    /**
     * Returns shader source code.
     *
     * @param {B.Render.Shader} type
     * @param {boolean} [translated=false]
     * @returns {string | null}
     */
    this.source = function (type, translated) {

        var shaders = this._shaders;

        return (translated ? shaders.translated[type] : shaders.source[type]) || null;
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        var gl = this._gl, glShaders = this._glShaders,
            i, l, name, samplers = this._samplers, states = this._states;

        this._device._removePass(this);

        for (i = 0, l = R.Shader.COUNT; i < l; i += 1) {
            gl.deleteShader(glShaders[i]);
        }
        gl.deleteProgram(this._glProgram);

        for (name in samplers) {
            B.Std.freeObject(samplers[name]);
        }
        for (i = 0, l = R.State.COUNT; i < l; i += 1) {
            B.Std.freeObject(states[i]);
        }
        B.Std.freeObject(this);
    };

    this._make = function (vs, fs, macros) {

        var S = R.State,
            states = this._states;

        states[S.POLYGON] = new R.PolygonState(this);
        states[S.MULTISAMPLE] = new R.MultisampleState(this);
        states[S.COLOR] = new R.ColorState(this);
        states[S.DEPTH] = new R.DepthState(this);
        states[S.STENCIL] = new R.StencilState(this);
        states[S.BLEND] = new R.BlendState(this);

        this._adjust();
        this.compile(vs, fs, macros);
    };

    this._adjust = function () {

        var gl = this._gl, i, l, glShaders = this._glShaders;

        this._glProgram = gl.createProgram();
        for (i = 0, l = R.Shader.COUNT; i < l; i += 1) {
            glShaders[i] = gl.createShader(toGLShaderType(gl, i));
        }
        R.checkGLError(gl, "can't adjust Pass");
    };

    this._begin = function (previous) {

        var gl = this._gl,
            i, l, name, attributes = this._glAttributes,
            states = this._states;

        gl.useProgram(this._glProgram);

        for (i = 0, l = R.State.COUNT; i < l; i += 1) {
            states[i]._apply(previous && previous._states[i]);
        }

        for (name in attributes) {
            gl.enableVertexAttribArray(attributes[name].location);
        }
    };

    this._end = function () {

        var gl = this._gl,
            name, attributes = this._glAttributes;

        for (name in attributes) {
            gl.disableVertexAttribArray(attributes[name].location);
        }
    };

    this._uniform = function (name, value) {

        if (name in this._glUniforms) {
            this._glUniforms[name].value = value;
        }
    };

    this._resetUniforms = (function () {

        var U = R.Uniform,
            defaults = [];

        defaults[U.FLOAT] = 0.0;
        defaults[U.VECTOR2] = M.Vector2.ZERO;
        defaults[U.VECTOR3] = M.Vector3.ZERO;
        defaults[U.VECTOR4] = M.Vector4.ZERO;
        defaults[U.MATRIX3] = M.Matrix3.IDENTITY;
        defaults[U.MATRIX4] = M.Matrix4.IDENTITY;
        defaults[U.SAMPLER_2D] = null;
        defaults[U.SAMPLER_CUBE] = null;

        return function () {

            var name, uniform, uniforms = this._glUniforms;

            for (name in uniforms) {
                uniform = uniforms[name];
                if (!uniform.array) {
                    uniform.value = defaults[uniform.type];
                }
            }
        };
    }());

    this._applyUniforms = (function () {

        var U = R.Uniform,

            applyValue = (function () {

                var mx4 = M.makeMatrix4();

                return function (uniform, data) {

                    var type = uniform.type;

                    if (type === U.FLOAT) {
                        data[uniform.offset] = uniform.value;
                    } else if (type === U.MATRIX3) {
                        mx4.setMatrix3(uniform.value).toArray(data, uniform.offset);
                    } else {
                        uniform.value.toArray(data, uniform.offset);
                    }
                };
            }()),

            applyArray = (function () {

                var array = [],
                    glUniform = [];

                glUniform[U.VECTOR2] = function (gl, location, value) {
                    gl.uniform2fv(location, value);
                };
                glUniform[U.VECTOR3] = function (gl, location, value) {
                    gl.uniform3fv(location, value);
                };
                glUniform[U.VECTOR4] = function (gl, location, value) {
                    gl.uniform4fv(location, value);
                };
                glUniform[U.MATRIX3] = function (gl, location, value) {
                    gl.uniformMatrix3fv(location, value);
                };
                glUniform[U.MATRIX4] = function (gl, location, value) {
                    gl.uniformMatrix4fv(location, value);
                };

                return function (uniform, gl) {

                    var i, l, value = uniform.value,
                        offset = uniform.offset, type = uniform.type;

                    if (type === U.FLOAT) {
                        gl.uniform1fv(uniform.location, value);
                    } else {
                        array.length = 0;
                        for (i = 0, l = value.length; i < l; i += 1) {
                            offset = value[i].toArray(array, offset);
                        }
                        glUniform[type](gl, uniform.location, array);
                    }
                };
            }());

        return function () {

            var uniforms = this._glUniforms, samplers = this._samplers,
                ub = this._uniformBuffer, data = ub && ub.data,
                gl = this._gl, name, type, uniform;

            for (name in uniforms) {
                uniform = uniforms[name];
                type = uniform.type;

                if (type === U.SAMPLER_2D) {
                    samplers[name]._apply(gl.TEXTURE_2D, uniform.location,
                        uniform.offset, uniform.value);
                } else if (type === U.SAMPLER_CUBE) {
                    samplers[name]._apply(gl.TEXTURE_CUBE_MAP, uniform.location,
                        uniform.offset, uniform.value);
                } else if (uniform.array) {
                    if (uniform.value) {
                        applyArray(uniform, gl);
                    }
                } else {
                    applyValue(uniform, data);
                }
            }
            if (ub) {
                gl.uniform4fv(ub.location, data);
            }
        };
    }());

    this._bindMesh = function (mesh) {

        mesh._bind(this._glAttributes);
    };

    this._restore = function () {

        var source = this._shaders.source;

        this._adjust();

        this.compile(source[R.Shader.VERTEX],
            source[R.Shader.FRAGMENT], this._macros);
    };
};

/**
 * Defines a rendering configuration (shaders, samplers, states).
 *
 * To create the object use [device.makePass()]{@link B.Render.Device#makePass}.
 *
 * @class
 * @this B.Render.Pass
 */
B.Render.Pass = function (device, vs, fs, macros) {

    this._device = device;

    this._shaders = {
        source: [],
        translated: []
    };
    this._macros = {};
    this._attributes = {};
    this._uniforms = {};
    this._samplers = {};
    this._states = [];
    this._uniformBuffer = null;

    this._gl = device._gl;
    this._glProgram = null;
    this._glShaders = [];
    this._glAttributes = {};
    this._glUniforms = {};

    this._id = -1;

    this._make(vs, fs, macros);
};

B.Render.Pass.prototype = new B.Render.PassProto();


/**
 * Describes a shader compilation error reason.
 *
 * @typedef B.Render.Pass.CompileError~Reason
 * @type {Object}
 * @property {string} type
 * @property {number} line
 * @property {string} reason
 */

/**
 * @ignore
 * @this B.Render.Pass.CompileError
 */
B.Render.Pass.CompileErrorProto = function () {

    var ERROR_LINE = /(\w+): \d+:(\d+): (.*)/,
        FIRST_ERROR = /ERROR\: (.+)/g;

    this._extract = function (log) {

        var i, l, lines = log.split("\n"),
            match, reasons = this.reasons;

        this.message += " - " + FIRST_ERROR.exec(log)[1];

        for (i = 0, l = lines.length; i < l; i += 1) {

            match = lines[i].match(ERROR_LINE);
            if (match) {
                reasons.push({
                    "type": match[1],
                    "line": parseInt(match[2], 10),
                    "reason": match[3]
                });
            }
        }
    };
};

B.Render.Pass.CompileErrorProto.prototype = B.Render.Error.prototype;

/**
 * Represents a [pass]{@link B.Render.Pass} compilation error.
 *
 * @class
 * @this B.Render.Pass.CompileError
 * @param {string} message
 * @param {B.Render.Shader} location
 * @param {string} log shader compiler output
 */
B.Render.Pass.CompileError = function (message, location, log) {

    B.Render.Error.call(this, message, "B.Render.Pass.CompileError");

    /**
     * Location of the error.
     *
     * @type {B.Render.Shader}
     */
    this.location = location;

    /**
     * List of reasons.
     *
     * @type {Array.<B.Render.Pass.CompileError~Reason>}
     */
    this.reasons = [];

    if(log) {
        this._extract(log);
    }
};

B.Render.Pass.CompileError.prototype = new B.Render.Pass.CompileErrorProto();
