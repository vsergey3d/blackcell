
/**
 * Describes pixel rect.
 *
 * @typedef B.Render.Stage~Rect
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */


/**
 * @ignore
 * @this B.Render.Stage
 */
B.Render.StageProto = function () {

    var R = B.Render,
        Stage = R.Stage,

        VIEW = Stage.VIEW,
        VIEW_INV = Stage.VIEW_INV,
        VIEW_POS = Stage.VIEW_POS,
        VIEW_DIR = Stage.VIEW_DIR,
        PROJ = Stage.PROJ,
        VIEW_PROJ = Stage.VIEW_PROJ;

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns string name.
     *
     * @returns {string}
     */
    this.name = function () {

        return this._name;
    };

    /**
     * Sets output target.
     *
     * @function B.Render.Stage#output
     * @param {B.Render.Target | B.Render.Device.Target} target
     * @returns {B.Render.Stage} this
     */
    /**
     * Gets output target.
     *
     * @function B.Render.Stage#output
     * @returns {B.Render.Target | B.Render.Device.Target}
     */
    this.output = function (target) {

        if (arguments.length === 0) {
            return this._output;
        }
        this._output = target;
        return this;
    };

    /**
     * Sets frustum culling enable.
     *
     * @function B.Render.Stage#culling
     * @param {boolean} enable
     * @returns {B.Render.Stage} this
     */
    /**
     * Gets frustum culling enable.
     *
     * @function B.Render.Stage#culling
     * @returns {boolean}
     */
    this.culling = function (enable) {

        if (arguments.length === 0) {
            return this._culling;
        }
        this._culling = enable;
        if (this._culling) {
            this._frustum.fromMatrix(this._viewProj);
        }
        return this;
    };

    /**
     * Sets view matrix.
     *
     * @function B.Render.Stage#view
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Render.Stage} this
     */
    /**
     * Gets view matrix.
     *
     * @function B.Render.Stage#view
     * @returns {B.Math.Matrix4}
     */
    this.view = function (matrix) {

        if (arguments.length === 0) {
            return this._view;
        }
        this._view.copy(matrix);
        this._viewInv.copy(matrix).invert();
        this._viewInv.getAxisZ(this._viewDir).negate().normalize();
        this._viewInv.getPosition(this._viewPos);
        this._viewProj.copy(matrix).mul(this._proj);
        if (this._culling) {
            this._frustum.fromMatrix(this._viewProj);
        }
        return this;
    };

    /**
     * Sets projection matrix.
     *
     * @function B.Render.Stage#proj
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Render.Stage} this
     */
    /**
     * Gets projection matrix.
     *
     * @function B.Render.Stage#proj
     * @returns {B.Math.Matrix4}
     */
    this.proj = function (matrix) {

        if (arguments.length === 0) {
            return this._proj;
        }
        this._proj.copy(matrix);
        this._viewProj.copy(this._view).mul(matrix);
        if (this._culling) {
            this._frustum.fromMatrix(this._viewProj);
        }
        return this;
    };

    /**
     * Returns view-projection matrix.
     *
     * @returns {B.Math.Matrix4}
     */
    this.viewProj = function () {

        return this._viewProj;
    };

    /**
     * Returns view inverse matrix.
     *
     * @returns {B.Math.Matrix4}
     */
    this.viewInv = function () {

        return this._viewInv;
    };

    /**
     * Returns view position.
     *
     * @returns {B.Math.Vector3}
     */
    this.viewPos = function () {

        return this._viewPos;
    };

    /**
     * Returns view direction.
     *
     * @returns {B.Math.Vector3}
     */
    this.viewDir = function () {

        return this._viewDir;
    };

    /**
     * Finds 3D-coordinates of pixel position ([viewport]{@link B.Render.Stage#viewport}
     *  and [scissor]{@link B.Render.Stage#scissor} are taking into account).
     *
     * @function
     * @param {number} x
     * @param {number} y
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3 | null} null if the point is outside of the drawable area or
     *  the output target is not specified
     */
    this.unproject = (function () {

        var M = B.Math,
            v4 = M.makeVector4(),
            inv = M.makeMatrix4();

        return function (x, y, result) {

            var v = result || M.makeVector3(),
                target = this._output,
                scissor = this._scissor,
                viewport = this._viewport,
                vx, vy, vw, vh;

            if (!target) {
                return null;
            }
            if (scissor !== false && (
                x < scissor.x || x > scissor.x + scissor.width ||
                y < scissor.y || y > scissor.y + scissor.height)) {
                return null;
            }
            if (viewport === false) {
                vx = 0;
                vy = 0;
                vw = target.width();
                vh = target.height();
            } else {
                vx = viewport.x;
                vy = viewport.y;
                vw = viewport.width;
                vh = viewport.height;
            }
            if (x < vx || x > vx + vw || y < vy || y > vy + vh) {
                return null;
            }
            v4.set((x - vx) / vw * 2 - 1, (1 - (y - vy) / vh) * 2 - 1, 1, 1);
            v4.transform(inv.copy(this._viewProj).invert());

            return v.set(v4.x, v4.y, v4.z).mul(1 / v4.w);
        };
    }());

    /**
     * Sets viewport.
     *
     * @function B.Render.Stage#viewport
     * @param {B.Render.Stage~Rect | false} rect
     *  pass false to use default viewport (entire output area)
     * @return {B.Render.Stage}
     */
    /**
     * Sets viewport parameters.
     *
     * @function B.Render.Stage#viewport
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @return {B.Render.Stage}
     */
    /**
     * Gets viewport.
     *
     * @function B.Render.Stage#viewport
     * @return {B.Render.Stage~Rect}
     */
    this.viewport = function (x, y, width, height) {

        if (arguments.length === 0) {
            return this._viewport;
        }
        if (arguments.length === 1) {
            this._viewport = arguments[0];
        } else {
            this._viewport = {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }
        return this;
    };

    /**
     * Describes depth range.
     *
     * @typedef B.Render.Stage~DepthRange
     * @type {Object}
     * @property {number} near range [0, 1]
     * @property {number} far range [0, 1]
     */

    /**
     * Sets depth range.
     *
     * @function B.Render.Stage#depthRange
     * @param {B.Render.Stage~DepthRange | false} range
     *  pass false to use default depth range (near = 0, far = 1)
     * @return {B.Render.Stage}
     */
    /**
     * Sets depth range parameters.
     *
     * Near must be less than or equal to far.
     *
     * @function B.Render.Stage#depthRange
     * @param {number} near range [0, 1]
     * @param {number} far range [0, 1]
     * @return {B.Render.Stage}
     */
    /**
     * Gets depth range.
     *
     * @function B.Render.Stage#depthRange
     * @return {B.Render.Stage~DepthRange}
     */
    this.depthRange = function (near, far) {

        if (arguments.length === 0) {
            return this._depthRange;
        }
        if (arguments.length === 1) {
            this._depthRange = arguments[0];
        } else {
            this._depthRange = {
                near: near,
                far: far
            };
        }
        return this;
    };

    /**
     * Sets scissor rect.
     *
     * @function B.Render.Stage#scissor
     * @param {B.Render.Stage~Rect | false} rect pass false to disable scissor
     * @return {B.Render.Stage}
     */
    /**
     * Sets scissor rect parameters.
     *
     * @function B.Render.Stage#scissor
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @return {B.Render.Stage}
     */
    /**
     * Returns scissor rect.
     *
     * @function B.Render.Stage#scissor
     * @return {B.Render.Stage~Rect | false} false if scissor is disabled
     */
    this.scissor = function (x, y, width, height) {

        if (arguments.length === 0) {
            return this._scissor;
        }
        if (arguments.length === 1) {
            this._scissor = arguments[0];
        } else {
            this._scissor = {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }
        return this;
    };

    /**
     * Describes color, depth and stencil cleanup values.
     *
     * @typedef B.Render.Stage~Cleanup
     * @type {Object}
     * @property {B.Math.Color} color
     * @property {number} depth
     * @property {number} stencil
     */

    /**
     * Sets output target cleanup.
     *
     * Initial value is {color: {@link B.Math.Color.WHITE}, depth: 1, stencil: 0}.
     *
     * @function B.Render.Stage#cleanup
     * @param {B.Render.Stage~Cleanup | false} cleanup pass false to disable cleanup
     * @return {B.Render.Stage}
     */
    /**
     * Sets output target cleanup parameters.
     *
     * @function B.Render.Stage#cleanup
     * @param {B.Math.Color} color
     * @param {number} depth
     * @param {number} stencil
     * @return {B.Render.Stage}
     */
    /**
     * Returns output target cleanup or false if cleanup is disabled.
     *
     * @function B.Render.Stage#cleanup
     * @return {B.Render.Stage~Cleanup | false}
     */
    this.cleanup = function (color, depth, stencil) {

        if (arguments.length === 0) {
            return this._cleanup;
        }
        if (arguments.length === 1) {
            this._cleanup = arguments[0];
        } else {
            this._cleanup = {
                color: color,
                depth: depth,
                stencil: stencil
            };
        }
        return this;
    };

    /**
     * Describes color, depth and stencil write masks.
     *
     * @typedef B.Render.Stage~WriteMasks
     * @type {Object}
     * @property {B.Render.Mask} color
     * @property {boolean} depth
     * @property {number} stencil
     */

    /**
     * Sets output target write masks.
     *
     * Initial value is {color: {@link B.Render.Mask.RGBA}, depth: true, stencil: 1}.
     *
     * @function B.Render.Stage#write
     * @param {B.Render.Stage~WriteMasks} mask
     * @return {B.Render.Stage}
     */
    /**
     * Sets output target write masks parameters.
     *
     * @function B.Render.Stage#write
     * @param {B.Render.Mask} color
     * @param {boolean} depth
     * @param {number} stencil
     * @return {B.Render.Stage}
     */
    /**
     * Gets output target write masks.
     *
     * @function B.Render.Stage#write
     * @return {B.Render.Stage~WriteMasks}
     */
    this.write = function (color, depth, stencil) {

        if (arguments.length === 0) {
            return this._write;
        } else {
            this._write = {
                color: color,
                depth: depth,
                stencil: stencil
            };
        }
        return this;
    };

    /**
     * Returns array of uniforms names.
     *
     * @returns {Array.<string>}
     */
    this.uniforms = function () {

        return Object.keys(this._uniforms);
    };

    /**
     * Sets uniform value.
     *
     * @function B.Render.Stage#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @returns {B.Render.Stage} this
     *
     * @example
     * stage.
     *     uniform("someNumber", 1.5).
     *     uniform("someVector2", B.Math.makeVector2(1, 2)).
     *     uniform("someVector3", B.Math.makeVector3(1, 2, 3)).
     *     uniform("someVector4", B.Math.makeVector4(1, 2, 3, 4)).
     *     uniform("someColor", B.Math.makeColor(1, 0, 0, 0.5)).
     *     uniform("someMatrix3", B.Math.makeMatrix3().setRotationX(Math.PI)).
     *     uniform("someMatrix4", B.Math.makeMatrix4().setTranslation(1, 2, 3)).
     *     uniform("someTexture", dev.makeTexture(image)).
     *     uniform("someTexture", dev.stage("someStage").output().color()).
     *     uniform("someDepth", dev.stage("someStage").output().depth());
     *
     * stage.uniform("someTexture", null); // removing
     */
    /**
     * Gets uniform value.
     *
     * @function B.Render.Stage#uniform
     * @param {string} name
     * @returns {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth}
     */
    this.uniform = function (name, value) {

        if (arguments.length === 1) {
            return this._uniforms[name] || null;
        } else if (value === null) {
            delete this._uniforms[name];
        } else {
            this._uniforms[name] = value;
        }
        return this;
    };

    /**
     * Stage handler callback.
     *
     * @callback B.Render.Stage~Handler
     * @param {B.Render.Stage} stage
     */

    /**
     * Sets before stage handler.
     *
     * @function B.Render.Stage#before
     * @param {null | B.Render.Stage~Handler} handler
     * @returns {B.Render.Stage} this
     *
     * @example
     * stage.before(function (stage) {
     *     // ...
     * });
     *
     * stage.before(null); // removing
     */
    /**
     * Gets before stage handler.
     *
     * @function B.Render.Stage#before
     * @returns {null | B.Render.Stage~Handler}
     */
    this.before = function (handler) {

        if (arguments.length === 0) {
            return this._before;
        }
        this._before = handler;
        return this;
    };

    /**
     * Sets after stage handler.
     *
     * @function B.Render.Stage#after
     * @param {null | B.Render.Stage~Handler} handler
     * @returns {B.Render.Stage} this
     *
     * @example
     * stage.after(function (stage) {
     *     // ...
     * });
     *
     * stage.after(null); // removing
     */
    /**
     * Gets after stage handler.
     *
     * @function B.Render.Stage#after
     * @returns {null | B.Render.Stage~Handler}
     */
    this.after = function (handler) {

        if (arguments.length === 0) {
            return this._after;
        }
        this._after = handler;
        return this;
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeStage(this._name);

        B.Std.freeObject(this);
    };

    this._begin = function () {

        var gl = this._device._gl,
            target = this._output,
            viewport = this._viewport,
            depthRange = this._depthRange,
            scissor = this._scissor,
            cleanup = this._cleanup,
            write = this._write;

        if (this._before) {
            this._before(this);
        }
        if (target) {
            target._bind();
            if (viewport === false) {
                gl.viewport(0, 0, target.width(), target.height());
            } else {
                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            }
            if (depthRange === false) {
                gl.depthRange(0.0, 1.0);
            } else {
                gl.depthRange(depthRange.near, depthRange.far);
            }
            if (scissor !== false) {
                gl.enable(gl.SCISSOR_TEST);
                gl.scissor(scissor.x, scissor.y, scissor.width, scissor.height);
            }
            target._write(write.color, write.depth, write.stencil);
            if (cleanup !== false) {
                target._clear(cleanup.color, cleanup.depth, cleanup.stencil);
            }
        }
    };

    this._end = function () {

        var gl = this._device._gl;

        if (this._output && this._scissor !== false) {
            gl.disable(gl.SCISSOR_TEST);
        }
        if (this._after) {
            this._after(this);
        }
    };

    this._bindUniforms = function (pass) {

        var name, value, values = this._uniforms;

        for (name in values) {
            value = values[name];

            if (value === VIEW) {
                value = this._view;
            } else if (value === VIEW_INV) {
                value = this._viewInv;
            } else if (value === VIEW_POS) {
                value = this._viewPos;
            } else if (value === VIEW_DIR) {
                value = this._viewDir;
            } else if (value === PROJ) {
                value = this._proj;
            } else if (value === VIEW_PROJ) {
                value = this._viewProj;
            }
            pass._uniform(name, value);
        }
    };

    this._isVisible = function (instance) {

        var bounds = instance.bounds();

        return !this._culling || !instance.culling() ||
            bounds.empty() || this._frustum.contain(bounds);
    };
};

/**
 * Separates the rendering process within the frame.
 *
 * To create the object use [device.stage()]{@link B.Render.Device#stage}.
 *
 * @class
 * @this B.Render.Stage
 */
B.Render.Stage = function (device, name) {

    var M = B.Math,
        R = B.Render;

    this._device = device;

    this._name = name;
    this._output = null;
    this._culling = true;
    this._frustum = M.makeFrustum();
    this._view = M.makeMatrix4();
    this._proj = M.makeMatrix4();
    this._viewProj = M.makeMatrix4();
    this._viewInv = M.makeMatrix4();
    this._viewPos = M.makeVector3();
    this._viewDir = M.makeVector3();
    this._uniforms = {};
    this._viewport = false;
    this._depthRange = false;
    this._scissor = false;
    this._write = {
        color: R.Mask.RGBA,
        depth: true,
        stencil: 1
    };
    this._cleanup = {
        color: M.Color.WHITE.clone(),
        depth: 1,
        stencil: 0
    };
};

/**
 * Stage view matrix uniform placeholder.
 * It allows to set stage view matrix to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * stage.uniform("mxView", B.Render.Stage.VIEW);
 */
B.Render.Stage.VIEW = {};

/**
 * Stage projection matrix uniform placeholder.
 * It allows to set stage projection matrix to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * stage.uniform("mxProj", B.Render.Stage.PROJ);
 */
B.Render.Stage.PROJ = {};

/**
 * Stage view-projection matrix uniform placeholder.
 * It allows to set stage view-projection matrix to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * stage.uniform("mxViewProj", B.Render.Stage.VIEW_PROJ);
 */
B.Render.Stage.VIEW_PROJ = {};

/**
 * Stage view inverse matrix uniform placeholder.
 * It allows to set stage view inverse matrix to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * stage.uniform("mxViewInv", B.Render.Stage.VIEW_INV);
 */
B.Render.Stage.VIEW_INV = {};

/**
 * Stage view position uniform placeholder.
 * It allows to set world-space view position to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * stage.uniform("viewPos", B.Render.Stage.VIEW_POS);
 */
B.Render.Stage.VIEW_POS = {};

/**
 * Stage view direction uniform placeholder.
 * It allows to set world-space normalized view direction to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * stage.uniform("viewDir", B.Render.Stage.VIEW_DIR);
 */
B.Render.Stage.VIEW_DIR = {};

B.Render.Stage.prototype = new B.Render.StageProto();