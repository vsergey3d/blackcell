
/**
 * @ignore
 * @this B.Graph.Camera
 */
B.Graph.CameraProto = function () {

    var M = B.Math,
        G = B.Graph;

    /**
     * Enables/disables camera.
     *
     * @function B.Graph.Camera#enable
     * @param {boolean} enable
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Camera} this
     */
    /**
     * Returns if this camera enabled or not.
     *
     * @function B.Graph.Camera#enable
     * @returns {boolean}
     */
    this.enable = function (enable, deep) {

        var i;

        if (arguments.length === 0) {
            return this._enabled;
        }
        this._enabled = enable;
        if (this._enabled) {
            for (i = 0; i < this._stages.length; i += 1) {
                this._stages[i].view(this._view).proj(this._proj);
            }
        }
        if (deep) {
            this._callDeep("enable", enable);
        }
        return this;
    };

    /**
     * Sets stage or array of stages.
     *
     * @function B.Graph.Camera#stages
     * @param {Array.<B.Render.Stage>|B.Render.Stage|null} value
     *  pass null if you want to remove all stages from the camera
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Camera} this
     */
    /**
     * Returns array of stage names.
     *
     * @function B.Graph.Camera#stages
     * @returns {Array.<B.Render.Stage>}
     */
    this.stages = function (value, deep) {

        var i;

        if (arguments.length === 0) {
            return this._stages;
        }
        this._stages = [];
        if (value !== null) {
            this._stages = Array.isArray(value) ? value : [value];
        }
        if (this._enabled) {
            for (i = 0; i < this._stages.length; i += 1) {
                this._stages[i].view(this._view).proj(this._proj);
            }
        }
        if (deep) {
            this._callDeep("stages", value);
        }
        return this;
    };

    /**
     * Sets z-value of the near plane.
     *
     * @function B.Graph.Camera#near
     * @param {number} zValue
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Camera} this
     */
    /**
     * Returns z-value of the near plane.
     *
     * @function B.Graph.Camera#near
     * @returns {number} z-value
     */
    this.near = function (zValue, deep) {

        if (arguments.length === 0) {
            return this._near;
        }
        this._near = zValue;
        this._rebuildProj();
        if (deep) {
            this._callDeep("near", zValue);
        }
        return this;
    };

    /**
     * Sets z-value of the far plane.
     *
     * @function B.Graph.Camera#far
     * @param {number} zValue
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Camera} this
     */
    /**
     * Returns z-value of the far plane.
     *
     * @function B.Graph.Camera#far
     * @returns {number} z-value
     */
    this.far = function (zValue, deep) {

        if (arguments.length === 0) {
            return this._far;
        }
        this._far = zValue;
        this._rebuildProj();
        if (deep) {
            this._callDeep("far", zValue);
        }
        return this;
    };

    /**
     * Sets camera aspect.
     *
     * @function B.Graph.Camera#aspect
     * @param {number} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Camera} this
     */
    /**
     * Returns camera aspect.
     *
     * @function B.Graph.Camera#aspect
     * @returns {number} value
     */
    this.aspect = function (value, deep) {

        if (arguments.length === 0) {
            return this._aspect;
        }
        this._aspect = value;
        this._rebuildProj();
        if (deep) {
            this._callDeep("aspect", value);
        }
        return this;
    };

    /**
     * Sets field of view (angle in radians).
     *
     * @function B.Graph.Camera#fov
     * @param {number} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Camera} this
     */
    /**
     * Returns field of view (angle in radians).
     *
     * @function B.Graph.Camera#fov
     * @returns {number} value
     */
    this.fov = function (value, deep) {

        if (arguments.length === 0) {
            return this._fov;
        }
        this._fov = value;
        this._rebuildProj();
        if (deep) {
            this._callDeep("fov", value);
        }
        return this;
    };

    this._clone = function () {

        return new G.Camera();
    };

    this._assign = function (other) {

        G.Locator.prototype._assign.call(this, other);

        this._enabled = other._enabled;
        this._stages = other._stages;
        this._near = other._near;
        this._far = other._far;
        this._aspect = other._aspect;
        this._fov = other._fov;
        this._view = other._view;
        this._proj = other._proj;
    };

    this._rebuildView = (function () {

        var xAxis = M.makeVector3(),
            yAxis = M.makeVector3(),
            zAxis = M.makeVector3(),
            pos = M.makeVector3();

        return function () {

            var i, final = this.finalTransform();

            final.getAxisX(xAxis);
            final.getAxisY(yAxis);
            final.getAxisZ(zAxis);
            final.getPosition(pos);

            this._view.set(
                xAxis.x, xAxis.y, xAxis.z, -xAxis.dot(pos),
                yAxis.x, yAxis.y, yAxis.z, -yAxis.dot(pos),
                zAxis.x, zAxis.y, zAxis.z, -zAxis.dot(pos),
                0, 0, 0, 1
            );
            if (this._enabled) {
                for (i = 0; i < this._stages.length; i += 1) {
                    this._stages[i].view(this._view);
                }
            }
        };
    }());

    this._rebuildProj = function () {

        var i;

        this._proj.perspective(this._fov, this._aspect, this._near, this._far);

        if (this._enabled) {
            for (i = 0; i < this._stages.length; i += 1) {
                this._stages[i].proj(this._proj);
            }
        }
    };

    this._transformed = function () {

        this._rebuildView();
    };
};

B.Graph.CameraProto.prototype = new B.Graph.LocatorProto();

/**
 * Represents a camera.
 *
 * To create the object use [B.Graph.makeCamera()]{@link B.Graph.makeCamera}.
 *
 * @class
 * @this B.Graph.Camera
 * @augments B.Graph.Locator
 */
B.Graph.Camera = function () {

    B.Graph.Locator.call(this);

    this._enabled = true;
    this._stages = [];
    this._near = 0.001;
    this._far = 100.0;
    this._aspect = 16 / 9;
    this._fov = Math.PI / 2.0;
    this._view = B.Math.makeMatrix4();
    this._proj = B.Math.makeMatrix4();
};

B.Graph.Camera.prototype = new B.Graph.CameraProto();
