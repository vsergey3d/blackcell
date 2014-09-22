
/**
 * Rendering state type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.State = {

    /**
     * Polygon state.
     *
     * @constant
     */
    POLYGON: 0,

    /**
     * Multisample state.
     *
     * @constant
     */
    MULTISAMPLE: 1,

    /**
     * Color state.
     *
     * @constant
     */
    COLOR: 2,

    /**
     * Depth state.
     *
     * @constant
     */
    DEPTH: 3,

    /**
     * Stencil state.
     *
     * @constant
     */
    STENCIL: 4,

    /**
     * Blend state.
     *
     * @constant
     */
    BLEND: 5,

    /**
     * State count.
     *
     * @constant
     */
    COUNT: 6
};


/**
 * Polygon's face direction.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Face = {

    /**
     * Front.
     *
     * @constant
     */
    FRONT: 1,

    /**
     * Back.
     *
     * @constant
     */
    BACK: 2,

    /**
     * Front and back.
     *
     * @constant
     */
    BOTH: 3
};


/**
 * @ignore
 * @this B.Render.PolygonState
 */
B.Render.PolygonStateProto = function () {

    var R = B.Render,
        F = R.Face,

        toGLFace = function (gl, face) {

            var F = B.Render.Face;

            switch (face) {
            case F.FRONT:
                return gl.FRONT;
            case F.BACK:
                return gl.BACK;
            case F.BOTH:
                return gl.FRONT_AND_BACK;
            }
        };

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.PolygonState} this
     *
     * @example
     * // equivalent to
     * state.cull(B.Render.Face.BACK);
     * state.offset(false);
     */
    this.default = function () {

        this.cull(F.BACK);
        this.offset(false);

        return this;
    };

    /**
     * Sets polygon culling mode.
     *
     * @function B.Render.PolygonState#cull
     * @param {B.Render.Face | false} face pass false to disable polygon culling
     * @returns {B.Render.PolygonState} this
     */
    /**
     * Returns polygon culling mode.
     *
     * @function B.Render.PolygonState#cull
     * @returns {false | B.Render.Face} false if culling is disabled
     */
    this.cull = function (face) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._cull;
        }
        this._cull = face;
        this._glCull = face !== false ? toGLFace(gl, face) : false;

        return this;
    };

    /**
     * Describes polygon offset parameters.
     *
     * @typedef B.Render.PolygonState~Offset
     * @type {Object}
     * @property {number} factor a scale factor that is used to create a
     *  variable depth offset for each polygon.
     * @property {number} units is multiplied by an implementation-specific value
     *  to create a constant depth offset
     */

    /**
     * Set polygon offset.
     *
     * @function B.Render.PolygonState#offset
     * @param {B.Render.PolygonState~Offset | false} value
     *  pass false to disable polygon offset
     * @returns {B.Render.PolygonState} this
     */
    /**
     * Sets polygon offset parameters.
     *
     * @function B.Render.PolygonState#offset
     * @param {number} factor a scale factor that is used to create a
     *  variable depth offset for each polygon
     * @param {number} units is multiplied by an implementation-specific value
     *  to create a constant depth offset
     * @returns {B.Render.PolygonState} this
     */
    /**
     * Returns polygon offset parameters.
     *
     * @function B.Render.PolygonState#offset
     * @returns {B.Render.PolygonState~Offset | false} false if polygon offset is disabled
     */
    this.offset = function (factor, units) {

        if (arguments.length === 0) {
            return this._offset;
        }
        if (arguments.length === 1) {
            this._offset = arguments[0];
        } else {
            this._offset = {
                factor: factor,
                units: units
            };
        }
        return this;
    };

    this._apply = function (previous) {

        var gl = this._gl,
            thisOffset = this._offset,
            prevOffset = previous && previous._offset;

        if (!previous || previous._cull !== this._cull) {
            if (this._cull === false) {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(this._glCull);
            }
        }
        if (!previous || prevOffset !== thisOffset) {
            if (thisOffset === false) {
                gl.disable(gl.POLYGON_OFFSET_FILL);
            } else {
                gl.enable(gl.POLYGON_OFFSET_FILL);
            }
        }
        if (thisOffset !== false && (!previous ||
            thisOffset.factor !== prevOffset.factor ||
            thisOffset.units !== prevOffset.units)) {
            gl.polygonOffset(thisOffset.factor, thisOffset.units);
        }
    };
};

/**
 * Represent a polygon rendering state.
 *
 * To get the object use [pass.state(B.Render.State.POLYGON)]{@link B.Render.Pass#state}.
 *
 * @class
 * @this B.Render.PolygonState
 */
B.Render.PolygonState = function (pass) {

    this._cull = 0;
    this._offset = 0;

    this._pass = pass;
    this._gl = pass.device()._gl;
    this._glCull = 0;

    this.default();
};

B.Render.PolygonState.prototype = new B.Render.PolygonStateProto();


/**
 * @ignore
 * @this B.Render.MultisampleState
 */
B.Render.MultisampleStateProto = function () {

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.MultisampleState} this
     *
     * @example
     * // equivalent to
     * state.coverage(false);
     * state.alpha(false);
     */
    this.default = function () {

        this.coverage(false);
        this.alpha(false);

        return this;
    };

    /**
     * Describes multisample coverage parameters.
     *
     * @typedef B.Render.MultisampleState~Coverage
     * @type {Object}
     * @property {number} value a floating-point sample coverage
     *  value (clamped to [0, 1])
     * @property {boolean} invert a boolean value representing if
     *  the coverage masks should be inverted
     */

    /**
     * Sets multisample coverage.
     *
     * @function B.Render.MultisampleState#coverage
     * @param {B.Render.MultisampleState~Coverage | false} value
     *  pass false to disable multisample coverage
     * @returns {B.Render.MultisampleState} this
     */
    /**
     * Sets multisample coverage parameters.
     *
     * @function B.Render.MultisampleState#coverage
     * @param {number} value a floating-point sample coverage
     *  value (clamped to range [0, 1])
     * @param {boolean} invert a boolean value representing if
     *  the coverage masks should be inverted
     * @returns {B.Render.MultisampleState} this
     */
    /**
     * Returns multisample coverage parameters.
     *
     * @function B.Render.MultisampleState#coverage
     * @returns {B.Render.MultisampleState~Coverage | false}
     *  false if multisample coverage is disabled
     */
    this.coverage = function (value, invert) {

        if (arguments.length === 0) {
            return this._coverage;
        }
        if (arguments.length === 1) {
            this._coverage = arguments[0];
        } else {
            this._coverage = {
                value: value,
                invert: invert
            };
        }
        return this;
    };

    /**
     * Sets alpha to coverage enable.
     *
     * @function B.Render.MultisampleState#alpha
     * @param {boolean} enable
     * @returns {B.Render.MultisampleState} this
     */
    /**
     * Gets alpha to coverage enable.
     *
     * @function B.Render.MultisampleState#alpha
     * @returns {boolean}
     */
    this.alpha = function (enable) {

        if (arguments.length === 0) {
            return this._alpha;
        }
        this._alpha = enable;

        return this;
    };

    this._apply = function (previous) {

        var gl = this._gl,
            thisCoverage = this._coverage,
            prevCoverage = previous && previous._coverage;

        if (!previous || prevCoverage !== thisCoverage) {
            if (thisCoverage === false) {
                gl.disable(gl.SAMPLE_COVERAGE);
            } else {
                gl.enable(gl.SAMPLE_COVERAGE);
            }
        }
        if (thisCoverage !== false && (!previous ||
            thisCoverage.value !== prevCoverage.value ||
            thisCoverage.invert !== prevCoverage.invert)) {
            gl.sampleCoverage(thisCoverage.value, thisCoverage.invert);
        }
        if (!previous || previous._alpha !== this._alpha) {
            if (this._alpha === true) {
                gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
            } else {
                gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
            }
        }
    };
};

/**
 * Represent a multisampling rendering state.
 *
 * To get the object use [pass.state(B.Render.State.MULTISAMPLE)]{@link B.Render.Pass#state}.
 *
 * @class
 * @this B.Render.MultisampleState
 */
B.Render.MultisampleState = function (pass) {

    this._coverage = 0;
    this._alpha = 0;

    this._pass = pass;
    this._gl = pass.device()._gl;

    this.default();
};

B.Render.MultisampleState.prototype = new B.Render.MultisampleStateProto();


/**
 * @ignore
 * @this B.Render.ColorState
 */
B.Render.ColorStateProto = function () {

    var R = B.Render;

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.ColorState} this
     *
     * @example
     * // equivalent to
     * state.mask(B.Render.Mask.RGBA);
     */
    this.default = function () {

        this.write(R.Mask.RGBA);

        return this;
    };

    /**
     * Sets color write mask.
     *
     * @function B.Render.ColorState#write
     * @param {B.Render.Mask} mask
     * @returns {B.Render.ColorState} this
     */
    /**
     * Gets color write mask.
     *
     * @function B.Render.ColorState#write
     * @returns {B.Render.Mask}
     */
    this.write = function (mask) {

        if (arguments.length === 0) {
            return this._write;
        }
        this._write = mask;

        return this;
    };

    this._apply = function (previous) {

        var write = this._write;

        if (!previous || previous._write !== write) {
            R.applyColorMask(this._gl, write);
        }
    };
};

/**
 * Represent a color rendering state.
 *
 * To get the object use [pass.state(B.Render.State.COLOR)]{@link B.Render.Pass#state}.
 *
 * @class
 * @this B.Render.ColorState
 */
B.Render.ColorState = function (pass) {

    this._write = 0;

    this._pass = pass;
    this._gl = pass.device()._gl;

    this.default();
};

B.Render.ColorState.prototype = new B.Render.ColorStateProto();


/**
 * Compare function.
 *
 * @enum {number}
 * @readonly
 */
B.Render.CmpFunc = {

    /**
     * Never passes.
     *
     * @constant
     */
    NEVER: 1,

    /**
     * Always passes.
     *
     * @constant
     */
    ALWAYS: 2,

    /**
     * Passes if the incoming value is less than the current value.
     *
     * @constant
     */
    LESS: 3,

    /**
     * Passes if the incoming value is less than or equal to the current value.
     *
     * @constant
     */
    LESS_EQUAL: 4,

    /**
     * Passes if the incoming value is greater than the current value.
     *
     * @constant
     */
    GREATER: 5,

    /**
     * Passes if the incoming value is greater than or equal to the current value.
     *
     * @constant
     */
    GREATER_EQUAL: 6,

    /**
     * Passes if the incoming value is equal to the current value.
     *
     * @constant
     */
    EQUAL: 7,

    /**
     * Passes if the incoming value is not equal to the current value.
     *
     * @constant
     */
    NOT_EQUAL: 8
};


B.Render.toGLCmpFunc = function (gl, func) {

    var CF = B.Render.CmpFunc;

    switch (func) {
    case CF.NEVER:
        return gl.NEVER;
    case CF.ALWAYS:
        return gl.ALWAYS;
    case CF.LESS:
        return gl.LESS;
    case CF.LESS_EQUAL:
        return gl.LEQUAL;
    case CF.GREATER:
        return gl.GREATER;
    case CF.GREATER_EQUAL:
        return gl.GEQUAL;
    case CF.EQUAL:
        return gl.EQUAL;
    case CF.NOT_EQUAL:
        return gl.NOTEQUAL;
    }
};


/**
 * @ignore
 * @this B.Render.DepthState
 */
B.Render.DepthStateProto = function () {

    var R = B.Render,
        CF = R.CmpFunc;

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.DepthState} this
     *
     * @example
     * // equivalent to
     * state.test(B.Render.CmpFunc.LESS_EQUAL);
     * state.write(true);
     */
    this.default = function () {

        this.test(CF.LESS_EQUAL);
        this.write(true);

        return this;
    };

    /**
     * Sets depth test compare function.
     *
     * @function B.Render.DepthState#test
     * @param {B.Render.CmpFunc | false} func pass false to disable depth test
     * @returns {B.Render.DepthState} this
     */
    /**
     * Returns depth test compare function.
     *
     * @function B.Render.DepthState#test
     * @returns {false | B.Render.CmpFunc} false if depth test is disabled
     */
    this.test = function (func) {

        if (arguments.length === 0) {
            return this._test;
        }
        this._test = func;
        this._glFunc = func && R.toGLCmpFunc(this._gl, func);

        return this;
    };

    /**
     * Sets depth write mask.
     *
     * @function B.Render.DepthState#write
     * @param {boolean} mask
     * @returns {B.Render.DepthState} this
     */
    /**
     * Gets depth write mask.
     *
     * @function B.Render.DepthState#write
     * @returns {boolean}
     */
    this.write = function (mask) {

        if (arguments.length === 0) {
            return this._write;
        }
        this._write = mask;

        return this;
    };

    this._apply = function (previous) {

        var gl = this._gl,
            write = this._write,
            thisFunc = this._glFunc,
            prevFunc = previous && previous._glFunc;

        if (!previous || prevFunc !== thisFunc) {
            if (thisFunc === false) {
                gl.disable(gl.DEPTH_TEST);
            } else if (previous && prevFunc !== false) {
                gl.depthFunc(thisFunc);
            } else {
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(thisFunc);
            }
        }
        if (!previous || previous._write !== write) {
            gl.depthMask(write);
        }
    };
};

/**
 * Represent a depth rendering state.
 *
 * To get the object use [pass.state(B.Render.State.DEPTH)]{@link B.Render.Pass#state}.
 *
 * @class
 * @this B.Render.DepthState
 */
B.Render.DepthState = function (pass) {

    this._test = 0;
    this._write = 0;

    this._pass = pass;
    this._gl = pass.device()._gl;
    this._glFunc = 0;

    this.default();
};

B.Render.DepthState.prototype = new B.Render.DepthStateProto();


/**
 * Stencil-buffer operation.
 *
 * @enum {number}
 * @readonly
 */
B.Render.StencilOp = {

    /**
     * Keeps the current value.
     *
     * @constant
     */
    KEEP: 1,

    /**
     * Sets the value to 0.
     *
     * @constant
     */
    ZERO: 2,

    /**
     * Sets the value to **ref**, as specified by
     * [stencilState.test(func, ref, mask)]{@link B.Render.StencilState#test}
     *
     * @constant
     */
    REPLACE: 3,

    /**
     * Increments the current value. Clamps to the maximum representable unsigned value.
     *
     * @constant
     */
    INCR: 4,

    /**
     * Increments the current value. Wraps the value to zero when incrementing
     *  the maximum representable unsigned value.
     *
     * @constant
     */
    INCR_WRAP: 5,

    /**
     * Decrements the current value. Clamps to zero.
     *
     * @constant
     */
    DECR: 6,

    /**
     * Decrements the current value. Wraps the value to the maximum representable
     *  unsigned value when decrementing a value of zero.
     *
     * @constant
     */
    DECR_WRAP: 7,

    /**
     * Bitwise inverts the current value.
     *
     * @constant
     */
    INVERT: 8
};


/**
 * @ignore
 * @this B.Render.StencilState
 */
B.Render.StencilStateProto = function () {

    var R = B.Render,
        SO = R.StencilOp,

        toGLStencilOp = function (gl, op) {

            switch (op) {
            case SO.KEEP:
                return gl.KEEP;
            case SO.ZERO:
                return gl.ZERO;
            case SO.REPLACE:
                return gl.REPLACE;
            case SO.INCR:
                return gl.INCR;
            case SO.INCR_WRAP:
                return gl.INCR_WRAP;
            case SO.DECR:
                return gl.DECR;
            case SO.DECR_WRAP:
                return gl.DECR_WRAP;
            case SO.INVERT:
                return gl.INVERT;
            }
        };

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.StencilState} this
     *
     * @example
     * // equivalent to
     * state.test(false);
     * state.ref(0);
     * state.mask(1);
     * state.op(B.Render.StencilOp.KEEP, B.Render.StencilOp.KEEP, B.Render.StencilOp.KEEP);
     * state.write(1);
     */
    this.default = function () {

        this.test(false);
        this.ref(0);
        this.mask(1);
        this.op(SO.KEEP, SO.KEEP, SO.KEEP);
        this.write(1);

        return this;
    };

    /**
     * Sets stencil test compare function.
     *
     * @function B.Render.StencilState#test
     * @param {B.Render.CmpFunc} func pass false to disable stencil test
     * @returns {B.Render.StencilState} this
     */
    /**
     * Returns stencil test compare function.
     *
     * @function B.Render.StencilState#test
     * @returns {false | B.Render.CmpFunc} false if stencil test is disabled
     */
    this.test = function (func) {

        if (arguments.length === 0) {
            return this._test;
        }
        this._test = func;
        this._glFunc = func && R.toGLCmpFunc(this._gl, func);

        return this;
    };

    /**
     * Sets stencil test reference value.
     *
     * @function B.Render.StencilState#ref
     * @param {number} value
     * @returns {B.Render.StencilState} this
     */
    /**
     * Gets stencil test reference value.
     *
     * @function B.Render.StencilState#ref
     * @returns {number}
     */
    this.ref = function (value) {

        if (arguments.length === 0) {
            return this._ref;
        }
        this._ref = value;

        return this;
    };

    /**
     * Sets stencil test mask.
     *
     * @function B.Render.StencilState#mask
     * @param {number} value the mask is ANDed with both the reference value and
     *  the stored stencil value
     * @returns {B.Render.StencilState} this
     */
    /**
     * Gets stencil test mask.
     *
     * @function B.Render.StencilState#mask
     * @returns {number}
     */
    this.mask = function (value) {

        if (arguments.length === 0) {
            return this._mask;
        }
        this._mask = value;

        return this;
    };

    /**
     * Describes stencil operations.
     *
     * @typedef B.Render.StencilState~Op
     * @type {Object}
     * @property {B.Render.StencilOp} failStencil the action when the stencil test fails
     * @property {B.Render.StencilOp} failDepth the action when the stencil test passes,
     *  but the depth test fails
     * @property {B.Render.StencilOp} passAll the action when both the stencil test and
     *  the depth test pass, or when the stencil test passes and either there is no depth
     *  buffer or depth testing is not enabled
     */

    /**
     * Sets stencil operations.
     *
     * @function B.Render.StencilState#op
     * @param {B.Render.StencilState~Op} value
     * @returns {B.Render.StencilState} this
     */
    /**
     * Sets stencil operations parameters.
     *
     * @function B.Render.StencilState#op
     * @param {B.Render.StencilOp} failStencil the action when the stencil test fails
     * @param {B.Render.StencilOp} failDepth the action when the stencil test passes,
     *  but the depth test fails
     * @param {B.Render.StencilOp} passAll the action when both the stencil test and
     *  the depth test pass, or when the stencil test passes and either there is no depth
     *  buffer or depth testing is not enabled
     * @returns {B.Render.StencilState} this
     */
    /**
     * Gets stencil operations.
     *
     * @function B.Render.StencilState#op
     * @returns {B.Render.StencilState~Op}
     */
    this.op = function (failStencil, failDepth, passAll) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._op;
        }
        if (arguments.length === 1) {
            this._op = arguments[0];
        } else {
            this._op = {
                failStencil: failStencil,
                failDepth: failDepth,
                passAll: passAll
            };
            this._glOp = {
                failStencil: toGLStencilOp(gl, failStencil),
                failDepth: toGLStencilOp(gl, failDepth),
                passAll: toGLStencilOp(gl, passAll)
            };
        }
        return this;
    };

    /**
     * Sets stencil write mask.
     *
     * @function B.Render.StencilState#write
     * @param {number} mask
     * @returns {B.Render.StencilState} this
     */
    /**
     * Gets stencil write mask.
     *
     * @function B.Render.StencilState#write
     * @returns {number}
     */
    this.write = function (mask) {

        if (arguments.length === 0) {
            return this._write;
        }
        this._write = mask;

        return this;
    };

    this._apply = function (previous) {

        var gl = this._gl,
            tf = this._glFunc, pf = previous && previous._glFunc,
            to = this._glOp, po = previous && previous._glOp,
            write = this._write;

        if (!previous || pf !== tf) {
            if (tf === false) {
                gl.disable(gl.STENCIL_TEST);
            } else if (previous && pf !== false) {
                gl.stencilFunc(tf, this._ref, this._mask);
            } else {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(tf, this._ref, this._mask);
            }
        }
        if (!previous || po.failStencil !== to.failStencil ||
            po.failDepth !== to.failDepth || po.passAll !== to.passAll) {
            gl.stencilOp(to.failStencil, to.failDepth, to.passAll);
        }
        if (!previous || previous._write !== write) {
            gl.stencilMask(write);
        }
    };
};

/**
 * Represent a stencil rendering state.
 *
 * To get the object use [pass.state(B.Render.State.STENCIL)]{@link B.Render.Pass#state}.
 *
 * @class
 * @this B.Render.StencilState
 */
B.Render.StencilState = function (pass) {

    this._enabled = 0;
    this._test = 0;
    this._ref = 0;
    this._mask = 0;
    this._op = 0;
    this._write = 0;

    this._pass = pass;
    this._gl = pass.device()._gl;
    this._glFunc = 0;
    this._glOp = 0;

    this.default();
};

B.Render.StencilState.prototype = new B.Render.StencilStateProto();


/**
 * Blending factor.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Blend = {

    /**
     * Factor is (0, 0, 0, 0).
     *
     * @constant
     */
    ZERO: 1,

    /**
     * Factor is (1, 1, 1, 1).
     *
     * @constant
     */
    ONE: 2,

    /**
     * Factor is (SrcR, SrcG, SrcB, SrcA).
     *
     * @constant
     */
    SRC_COLOR: 3,

    /**
     * Factor is (1 - SrcR, 1 - SrcG, 1 - SrcB, 1 - SrcA).
     *
     * @constant
     */
    INV_SRC_COLOR: 4,

    /**
     * Factor is (DestR, DestG, DestB, DestA).
     *
     * @constant
     */
    DEST_COLOR: 5,

    /**
     * Factor is (1 - DestR, 1 - DestG, 1 - DestB, 1 - DestA).
     *
     * @constant
     */
    INV_DEST_COLOR: 6,

    /**
     * Factor is (SrcA, SrcA, SrcA, SrcA).
     *
     * @constant
     */
    SRC_ALPHA: 7,

    /**
     * Factor is (1 - SrcA, 1 - SrcA, 1 - SrcA, 1 - SrcA).
     *
     * @constant
     */
    INV_SRC_ALPHA: 8,

    /**
     * Factor is (DestA, DestA, DestA, DestA).
     *
     * @constant
     */
    DEST_ALPHA: 9,

    /**
     * Factor is (1 - DestA, 1 - DestA, 1 - DestA, 1 - DestA).
     *
     * @constant
     */
    INV_DEST_ALPHA: 10,

    /**
     * Factor is (ConstR, ConstG, ConstB, ConstA).
     *
     * @constant
     */
    CONST_COLOR: 11,

    /**
     * Factor is (1 - ConstR, 1 - ConstG, 1 - ConstB, 1 - ConstA).
     *
     * @constant
     */
    INV_CONST_COLOR: 12,

    /**
     * Factor is (ConstA, ConstA, ConstA, ConstA).
     *
     * @constant
     */
    CONST_ALPHA: 13,

    /**
     * Factor is (1 - ConstA, 1 - ConstA, 1 - ConstA, 1 - ConstA).
     *
     * @constant
     */
    INV_CONST_ALPHA: 14,

    /**
     * Factor is (f, f, f, 1) where f = min(SrcA, 1 - DestA).
     *
     * @constant
     */
    SRC_ALPHA_SAT: 15
};


/**
 * Blending equation.
 *
 * @enum {number}
 * @readonly
 */
B.Render.BlendEq = {

    /**
     * Result = Src \* SrcFactor + Dst \* DstFactor
     *
     * @constant
     */
    ADD: 1,

    /**
     * Result = Src \* SrcFactor - Dst \* DstFactor
     *
     * @constant
     */
    SUBTRACT: 2,

    /**
     * Result = Dst \* DstFactor - Src \* SrcFactor
     *
     * @constant
     */
    REV_SUBTRACT: 3
};


/**
 * @ignore
 * @this B.Render.BlendState
 */
B.Render.BlendStateProto = function () {

    var M = B.Math,
        R = B.Render,
        BL = R.Blend,
        BE = R.BlendEq,
        DEFAULT_COLOR = M.makeColor(0.0, 0.0, 0.0, 0.0),

        toGLBlendEq = function (gl, eq) {

            switch (eq) {
            case BE.ADD:
                return gl.FUNC_ADD;
            case BE.SUBTRACT:
                return gl.FUNC_SUBTRACT;
            case BE.REV_SUBTRACT:
                return gl.FUNC_REVERSE_SUBTRACT;
            }
        },

        toGLBlendFactor = function (gl, blend) {

            var BL = B.Render.Blend;

            switch (blend) {
            case BL.ZERO:
                return gl.ZERO;
            case BL.ONE:
                return gl.ONE;
            case BL.SRC_COLOR:
                return gl.SRC_COLOR;
            case BL.INV_SRC_COLOR:
                return gl.ONE_MINUS_SRC_COLOR;
            case BL.DEST_COLOR:
                return gl.DST_COLOR;
            case BL.INV_DEST_COLOR:
                return gl.ONE_MINUS_DST_COLOR;
            case BL.SRC_ALPHA:
                return gl.SRC_ALPHA;
            case BL.INV_SRC_ALPHA:
                return gl.ONE_MINUS_SRC_ALPHA;
            case BL.DEST_ALPHA:
                return gl.DST_ALPHA;
            case BL.INV_DEST_ALPHA:
                return gl.ONE_MINUS_DST_ALPHA;
            case BL.CONST_COLOR:
                return gl.CONSTANT_COLOR;
            case BL.INV_CONST_COLOR:
                return gl.ONE_MINUS_CONSTANT_COLOR;
            case BL.CONST_ALPHA:
                return gl.CONSTANT_ALPHA;
            case BL.INV_CONST_ALPHA:
                return gl.ONE_MINUS_CONSTANT_ALPHA;
            case BL.SRC_ALPHA_SAT:
                return gl.SRC_ALPHA_SATURATE;
            }
        };

    /**
     * Returns linked pass.
     *
     * @returns {B.Render.Pass}
     */
    this.pass = function () {

        return this._pass;
    };

    /**
     * Resets to default values.
     *
     * @returns {B.Render.BlendState} this
     *
     * @example
     * // equivalent to
     * state.const(B.Math.makeColor(0, 0, 0, 0));
     * state.src(B.Render.Blend.ONE);
     * state.dest(B.Render.Blend.ZERO);
     * state.eq(B.Render.BlendEq.ADD);
     * state.enabled(false);
     */
    this.default = function () {

        this.const(DEFAULT_COLOR);
        this.src(BL.ONE);
        this.dest(BL.ZERO);
        this.eq(BE.ADD);
        this.enabled(false);

        return this;
    };

    /**
     * Enables/disables the blending state.
     *
     * @function B.Render.BlendState#enabled
     * @param {boolean} value
     * @returns {B.Render.BlendState} this
     */
    /**
     * Gets the blending state enable.
     *
     * @function B.Render.BlendState#enabled
     * @returns {boolean}
     */
    this.enabled = function (value) {

        if (arguments.length === 0) {
            return this._enabled;
        }
        this._enabled = value;

        return this;
    };

    /**
     * Sets blend constant color.
     *
     * @function B.Render.BlendState#const
     * @param {B.Math.Color} color
     * @returns {B.Render.BlendState} this
     */
    /**
     * Gets blend constant color.
     *
     * @function B.Render.BlendState#const
     * @returns {B.Math.Color}
     */
    this.const = function (color) {

        if (arguments.length === 0) {
            return this._const;
        }
        this._const.copy(color);

        return this;
    };

    /**
     * Sets source blending factor.
     *
     * @function B.Render.BlendState#src
     * @param {B.Render.Blend} factor
     * @returns {B.Render.BlendState} this
     */
    /**
     * Gets source blending factor.
     *
     * @function B.Render.BlendState#src
     * @returns {B.Render.Blend}
     */
    this.src = function (factor) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._src;
        }
        this._src = factor;
        this._glSrc = toGLBlendFactor(gl, factor);

        return this;
    };

    /**
     * Sets destination blending factor.
     *
     * @function B.Render.BlendState#dest
     * @param {B.Render.Blend} factor
     * @returns {B.Render.BlendState} this
     */
    /**
     * Gets destination blending factor.
     *
     * @function B.Render.BlendState#dest
     * @returns {B.Render.Blend}
     */
    this.dest = function (factor) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._dest;
        }
        this._dest = factor;
        this._glDest = toGLBlendFactor(gl, factor);

        return this;
    };

    /**
     * Sets blending equation.
     *
     * @function B.Render.BlendState#eq
     * @param {B.Render.BlendEq} equation
     * @returns {B.Render.BlendState} this
     */
    /**
     * Gets blending equation.
     *
     * @function B.Render.BlendState#eq
     * @returns {B.Render.BlendEq}
     */
    this.eq = function (equation) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._eq;
        }
        this._eq = equation;
        this._glEq = toGLBlendEq(gl, equation);

        return this;
    };

    this._apply = function (previous) {

        var gl = this._gl, c = this._const, enabled = this._enabled,
            tEq = this._glEq, pEq = previous && previous._glEq,
            tSrc = this._glSrc, pSrc = previous && previous._glSrc,
            tDest = this._glDest, pDest = previous && previous._glDest;

        if (!previous || previous._enabled !== enabled) {
            if (enabled) {
                gl.disable(gl.BLEND);
            } else {
                gl.enable(gl.BLEND);
            }
        }
        if (!previous || !previous._const.equal(c)) {
            gl.blendColor(c.r, c.g, c.b, c.a);
        }
        if (!previous || pEq !== tEq) {
            gl.blendEquation(tEq);
        }
        if (!previous || pSrc !== tSrc || pDest !== tDest) {
            gl.blendFunc(tSrc, tDest);
        }
    };
};

/**
 * Represent a blending state.
 *
 * To get the object use [pass.state(B.Render.State.BLEND)]{@link B.Render.Pass#state}.
 *
 * @class
 * @this B.Render.BlendState
 */
B.Render.BlendState = function (pass) {

    this._const = B.Math.makeColor();
    this._src = 0;
    this._dest = 0;
    this._eq = 0;

    this._pass = pass;
    this._gl = pass.device()._gl;
    this._glEq = 0;
    this._glSrc = 0;
    this._glDest = 0;

    this.default();
};

B.Render.BlendState.prototype = new B.Render.BlendStateProto();