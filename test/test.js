
B.Test = B.Test || {};

B.Test.FakeEvent = function (event) {

    this.type = event;

    this.stopPropagation = function () {};
    this.preventDefault = function () {};
};

B.Test.checkEvent = function (spy, caster, type, data) {

    var e = spy.getCall(0).args[0];

    expect(spy).to.be.calledOnce;
    expect(e).to.be.instanceof(B.Std.Event);
    expect(e.caster).to.equal(caster);
    expect(e.type).to.equal(type);
    expect(e.data).to.deep.equal((data === undefined) ? null : data);
};

B.Test.FakeWebGLContext = function (settings) {

    var _exts = {},
        _params = {};

    this.DEPTH_BUFFER_BIT = 0x00000100;
    this.STENCIL_BUFFER_BIT = 0x00000400;
    this.COLOR_BUFFER_BIT = 0x00004000;

    this.POINTS = 0x0000;
    this.LINES = 0x0001;
    this.TRIANGLES = 0x0004;

    this.ZERO = 0;
    this.ONE = 1;
    this.SRC_COLOR = 0x0300;
    this.ONE_MINUS_SRC_COLOR = 0x0301;
    this.SRC_ALPHA = 0x0302;
    this.ONE_MINUS_SRC_ALPHA = 0x0303;
    this.DST_ALPHA = 0x0304;
    this.ONE_MINUS_DST_ALPHA = 0x0305;

    this.DST_COLOR = 0x0306;
    this.ONE_MINUS_DST_COLOR = 0x0307;
    this.SRC_ALPHA_SATURATE = 0x0308;

    this.FUNC_ADD = 0x8006;

    this.FUNC_SUBTRACT = 0x800A;
    this.FUNC_REVERSE_SUBTRACT = 0x800B;

    this.CONSTANT_COLOR = 0x8001;
    this.ONE_MINUS_CONSTANT_COLOR = 0x8002;
    this.CONSTANT_ALPHA = 0x8003;
    this.ONE_MINUS_CONSTANT_ALPHA = 0x8004;

    this.ARRAY_BUFFER = 0x8892;
    this.ELEMENT_ARRAY_BUFFER = 0x8893;

    this.STATIC_DRAW = 0x88E4;
    this.DYNAMIC_DRAW = 0x88E8;

    this.FRONT = 0x0404;
    this.BACK = 0x0405;
    this.FRONT_AND_BACK = 0x0408;

    this.CULL_FACE = 0x0B44;
    this.BLEND = 0x0BE2;
    this.STENCIL_TEST = 0x0B90;
    this.DEPTH_TEST = 0x0B71;
    this.SCISSOR_TEST = 0x0C11;
    this.POLYGON_OFFSET_FILL = 0x8037;
    this.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
    this.SAMPLE_COVERAGE = 0x80A0;

    this.NO_ERROR = 0;
    this.INVALID_ENUM = 0x0500;
    this.INVALID_VALUE = 0x0501;
    this.INVALID_OPERATION = 0x0502;
    this.OUT_OF_MEMORY = 0x0505;

    this.DEPTH_WRITEMASK = 0x0B72;
    this.COLOR_WRITEMASK = 0x0C23;
    this.SAMPLES = 0x80A9;

    this.UNSIGNED_BYTE = 0x1401;
    this.UNSIGNED_SHORT = 0x1403;
    this.UNSIGNED_INT = 0x1405;
    this.FLOAT = 0x1406;

    this.DEPTH_COMPONENT = 0x1902;
    this.ALPHA = 0x1906;
    this.RGB = 0x1907;
    this.RGBA = 0x1908;

    this.FRAGMENT_SHADER = 0x8B30;
    this.VERTEX_SHADER = 0x8B31;
    this.LINK_STATUS = 0x8B82;
    this.VALIDATE_STATUS = 0x8B83;
    this.ACTIVE_UNIFORMS = 0x8B86;
    this.ACTIVE_ATTRIBUTES = 0x8B89;

    this.NEVER = 0x0200;
    this.LESS = 0x0201;
    this.EQUAL = 0x0202;
    this.LEQUAL = 0x0203;
    this.GREATER = 0x0204;
    this.NOTEQUAL = 0x0205;
    this.GEQUAL = 0x0206;
    this.ALWAYS = 0x0207;

    this.KEEP = 0x1E00;
    this.REPLACE = 0x1E01;
    this.INCR = 0x1E02;
    this.DECR = 0x1E03;
    this.INVERT = 0x150A;
    this.INCR_WRAP = 0x8507;
    this.DECR_WRAP = 0x8508;

    this.MAX_TEXTURE_SIZE = 0x0D33;
    this.MAX_VERTEX_ATTRIBS = 0x8869;
    this.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
    this.MAX_VARYING_VECTORS = 0x8DFC;
    this.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
    this.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
    this.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;

    this.NEAREST = 0x2600;
    this.TEXTURE_MAG_FILTER = 0x2800;
    this.TEXTURE_MIN_FILTER = 0x2801;
    this.TEXTURE_WRAP_S = 0x2802;
    this.TEXTURE_WRAP_T = 0x2803;
    this.TEXTURE_2D = 0x0DE1;
    this.TEXTURE = 0x1702;
    this.TEXTURE_CUBE_MAP = 0x8513;
    this.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;
    this.TEXTURE0 = 0x84C0;
    this.REPEAT = 0x2901;

    this.FLOAT_VEC2 = 0x8B50;
    this.FLOAT_VEC3 = 0x8B51;
    this.FLOAT_VEC4 = 0x8B52;
    this.FLOAT_MAT2 = 0x8B5A;
    this.FLOAT_MAT3 = 0x8B5B;
    this.FLOAT_MAT4 = 0x8B5C;
    this.SAMPLER_2D = 0x8B5E;
    this.SAMPLER_CUBE = 0x8B60;

    this.COLOR_ATTACHMENT0 = 0x8CE0;

    this.COMPILE_STATUS = 0x8B81;

    this.LOW_FLOAT = 0x8DF0;
    this.MEDIUM_FLOAT = 0x8DF1;
    this.HIGH_FLOAT = 0x8DF2;

    this.FRAMEBUFFER = 0x8D40;
    this.RENDERBUFFER = 0x8D41;

    this.DEPTH_COMPONENT16 = 0x81A5;
    this.DEPTH_STENCIL = 0x84F9;

    this.DEPTH_ATTACHMENT = 0x8D00;
    this.DEPTH_STENCIL_ATTACHMENT = 0x821A;

    this.FRAMEBUFFER_COMPLETE = 0x8CD5;
    this.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
    this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
    this.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
    this.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;

    this.MAX_RENDERBUFFER_SIZE = 0x84E8;

    this.INVALID_FRAMEBUFFER_OPERATION = 0x0506;

    this.UNPACK_FLIP_Y_WEBGL = 0x9240;
    this.CONTEXT_LOST_WEBGL = 0x9242;

    this.getExtension = function (name) {

        return _exts[name];
    };

    this.activeTexture = function (texture) {
    };

    this.attachShader = function (program, shader) {
    };

    this.bindBuffer = function (target, buffer) {
    };

    this.bindFramebuffer = function (target, buffer) {
    };

    this.bindRenderbuffer = function (target, renderbuffer) {
    };

    this.bindTexture = function (target, texture) {
    };

    this.blendColor = function (red, green, blue, alpha) {
    };

    this.blendEquation = function (mode) {
    };

    this.blendEquationSeparate = function (modeRGB, modeAlpha) {
    };

    this.blendFunc = function (sfactor, dfactor) {
    };

    this.blendFuncSeparate = function (srcRGB, dstRGB, srcAlpha, dstAlpha) {
    };

    this.bufferData = function (target, data, usage) {
    };

    this.bufferSubData = function (target, offset, data) {
    };

    this.checkFramebufferStatus = function (target) {
        return this.FRAMEBUFFER_COMPLETE;
    };

    this.clear = function (mask) {
    };

    this.clearColor = function (red, green, blue, alpha) {
    };

    this.clearDepth = function (depth) {
    };

    this.clearStencil = function (s) {
    };

    this.colorMask = function (red, green, blue, alpha) {
    };

    this.compileShader = function (shader) {
    };

    this.compressedTexImage2D = function (target, level, internalformat,
        width, height, border, data) {
    };

    this.createBuffer = function () {
        return {};
    };

    this.createFramebuffer = function () {
        return {};
    };

    this.createProgram = function () {
        return {};
    };

    this.createRenderbuffer = function() {
        return {};
    };

    this.createShader = function (type) {
        return {};
    };

    this.createTexture = function () {
        return {};
    };

    this.cullFace = function (mode) {
    };

    this.deleteBuffer = function (buffer) {
    };

    this.deleteFramebuffer = function (framebuffer) {
    };

    this.deleteProgram = function (program) {
    };

    this.deleteRenderbuffer = function (renderbuffer) {
    };

    this.deleteShader = function (shader) {
    };

    this.deleteTexture = function (texture) {
    };

    this.depthFunc = function (func) {
    };

    this.depthMask = function (flag) {
    };

    this.depthRange = function (zNear, zFar) {
    };

    this.detachShader = function (program, shader) {
    };

    this.disable = function (cap) {
    };

    this.disableVertexAttribArray = function (index) {
    };

    this.drawElements = function (mode, count, type, offset) {
    };

    this.enable = function (cap) {
    };

    this.enableVertexAttribArray = function (index) {
    };

    this.framebufferTexture2D = function (target, attachment, textarget, texture, level) {
    };

    this.framebufferRenderbuffer = function (target, attachment, renderbuffertarget, renderbuffer) {
    };

    this.generateMipmap = function (target) {
    };

    this.getActiveAttrib = function (program, index) {
        return {
            size: 0,
            type: 0,
            name: ""
        };
    };

    this.getActiveUniform = function (program, index) {
        return {
            size: 0,
            type: 0,
            name: ""
        };
    };

    this.getAttribLocation = function (program, name) {
        return 0;
    };

    this.getParameter = function (pname) {
        return _params[pname];
    };

    this.getError = function () {
        return this.NO_ERROR;
    };

    this.getProgramParameter = function (program, pname) {

        if(pname === this.DELETE_STATUS || pname === this.LINK_STATUS ||
            name === this.VALIDATE_STATUS) {
            return true;
        }

        return 0;
    };

    this.getProgramInfoLog = function (program) {
        return "";
    };

    this.getShaderParameter = function (shader, pname) {
        return true;
    };

    this.getShaderPrecisionFormat = function (shadertype, precisiontype) {
        return { precision: 0 };
    };

    this.getShaderInfoLog = function (shader) {
        return "";
    };

    this.getUniformLocation = function (program, name) {
        return {};
    };

    this.linkProgram = function (program) {
    };

    this.pixelStorei = function (pname, param) {
    };

    this.polygonOffset = function (factor, units) {
    };

    this.renderbufferStorage = function (target, internalformat, width, height) {
    };

    this.sampleCoverage = function (value, invert) {
    };

    this.scissor = function (x, y, width, height) {
    };

    this.shaderSource = function (shader, source) {
    };

    this.stencilFunc = function (func, ref, mask) {
    };

    this.stencilMask = function (mask) {
    };

    this.stencilOp = function (fail, zfail, zpass) {
    };

    this.texImage2D = function (target, level, internalformat, width, height, border,
        format, type, pixels) {
    };

    this.texParameteri = function (target, pname, param) {
    };

    this.uniform1i = function (location, x) {
    };

    this.uniform1fv = function (location, v) {
    };

    this.uniform2fv = function (location, v) {
    };

    this.uniform3fv = function (location, v) {
    };

    this.uniform4fv = function (location, v) {
    };

    this.uniformMatrix3fv = function (location, v) {
    };

    this.uniformMatrix4fv = function (location, v) {
    };

    this.useProgram = function (program) {
    };

    this.vertexAttrib1f = function (indx, x) {
    };

    this.vertexAttrib2f = function (indx, x, y) {
    };

    this.vertexAttrib3f = function (indx, x, y, z) {
    };

    this.vertexAttrib4f = function (indx, x, y, z, w) {
    };

    this.vertexAttribPointer = function (indx, size, type, normalized, stride, offset) {
    };

    this.viewport = function (x, y, width, height) {
    };

    var _make = function (that) {

        _exts["WEBGL_compressed_texture_s3tc"] = {
            COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
            COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3
        };
        _exts["WEBGL_depth_texture"] = { UNSIGNED_INT_24_8_WEBGL: 0x84FA };
        _exts["EXT_texture_filter_anisotropic"] = {
            TEXTURE_MAX_ANISOTROPY_EXT: 0x84FE,
            MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF
        };
        _exts["OES_texture_half_float"] = { HALF_FLOAT_OES: 0x8D61 };
        _exts["OES_texture_float"] = {};
        _exts["OES_texture_half_float_linear"] = {};
        _exts["OES_texture_float_linear"] = {};
        _exts["EXT_color_buffer_half_float"] = {};
        _exts["WEBGL_color_buffer_float"] = {};
        _exts["WEBGL_draw_buffers"] = { MAX_COLOR_ATTACHMENTS_WEBGL: 0x8CDF };
        _exts["OES_element_index_uint"] = {};
        _exts["OES_standard_derivatives"] = {};
        _exts["EXT_frag_depth"] = {};

        _params[that.COLOR_WRITEMASK] = [true, true, true, true];
        _params[that.DEPTH_WRITEMASK] = true;
        _params[that.SAMPLES] = settings.antialias ? 1 : 0;
        _params[that.MAX_TEXTURE_SIZE] = 512;
        _params[that.MAX_VERTEX_ATTRIBS] = 1;
        _params[that.MAX_VERTEX_UNIFORM_VECTORS] = 1;
        _params[that.MAX_VARYING_VECTORS] = 1;
        _params[that.MAX_VERTEX_TEXTURE_IMAGE_UNITS] = 1;
        _params[that.MAX_TEXTURE_IMAGE_UNITS] = 1;
        _params[that.MAX_FRAGMENT_UNIFORM_VECTORS] = 1;
        _params[that.MAX_CUBE_MAP_TEXTURE_SIZE] = 512;
        _params[that.MAX_RENDERBUFFER_SIZE] = 512;

        _params[_exts["EXT_texture_filter_anisotropic"].MAX_TEXTURE_MAX_ANISOTROPY_EXT] = 16;
        _params[_exts["WEBGL_draw_buffers"].MAX_COLOR_ATTACHMENTS_WEBGL] = 4;
    };

    _make(this);
};

B.Test.FakeCanvas = function (width, height) {

    var _events = {};

    this.getContext = function (contextID, settings) {

        return new B.Test.FakeWebGLContext(settings);
    };

    this.addEventListener = function (event, listener, useCapture) {

        _events[event] = listener;
    };

    this.removeEventListener = function (event, listener, useCapture) {

        delete _events[event];
    };

    this.dispatchEvent = function (event) {

        var handler = _events[event];

        handler && handler(new B.Test.FakeEvent(event));
    };

    this.clientWidth = width;
    this.clientHeight = height;
    this.width = width;
    this.height = height;
};
