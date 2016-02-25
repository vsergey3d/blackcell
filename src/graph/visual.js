
/**
 * Reporting that the visual has been shown.
 *
 * @event B.Graph.Visual#shown
 * @type {B.Std.Event}
 */

/**
 * Reporting that the visual has been hidden.
 *
 * @event B.Graph.Visual#hidden
 * @type {B.Std.Event}
 */

/**
 * @ignore
 * @this B.Graph.Visual
 */
B.Graph.VisualProto = function () {

    var G = B.Graph;

    /**
     * Sets visibility enable.
     *
     * @function B.Graph.Visual#visible
     * @param {boolean} enable
     * @param {boolean} [deep=false] true if you want to set value to the whole hierarchy
     * @returns {B.Graph.Visual} this
     */
    /**
     * Gets visibility enable.
     *
     * @function B.Graph.Visual#visible
     * @returns {boolean}
     */
    this.visible = function (enable, deep) {

        var changed = false;

        if (arguments.length === 0) {
            return this._visible;
        }
        if (this._visible !== enable) {
            this._visible = enable;
            this._updateInstance();
            changed = true;
        }
        if (deep) {
            this._callDeep("visible", enable);
        }
        if (changed) {
            this.trigger(enable ? "shown" : "hidden");
        }
        return this;
    };

    /**
     * Sets a new material.
     *
     * @function B.Graph.Visual#material
     * @param {B.Render.Material} material
     * @param {boolean} [deep=false] true if you want to set value to the whole hierarchy
     * @returns {B.Graph.Visual} this
     */
    /**
     * Returns material.
     *
     * @function B.Graph.Visual#material
     * @returns {B.Render.Material}
     */
    this.material = function (material, deep) {

        if (arguments.length === 0) {
            return this._material;
        }
        if (this._material !== material) {
            this._material = material;
            this._updateInstance();
        }
        if (deep) {
            this._callDeep("material", material);
        }
    };

    /**
     * Sets a new mesh.
     *
     * @function B.Graph.Visual#mesh
     * @param {B.Render.Mesh} mesh
     * @param {boolean} [deep=false] true if you want to set value to the whole hierarchy
     * @returns {B.Graph.Visual} this
     */
    /**
     * Returns mesh.
     *
     * @function B.Graph.Visual#mesh
     * @returns {B.Render.Mesh}
     */
    this.mesh = function (mesh, deep) {

        if (arguments.length === 0) {
            return this._mesh;
        }
        if (this._mesh !== mesh) {
            this._mesh = mesh;
            this._updateInstance();
        }
        if (deep) {
            this._callDeep("mesh", mesh);
        }
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
     * Sets a uniform value.
     *
     * @function B.Graph.Visual#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @param {boolean} [deep=false] true if you want to set value to the whole hierarchy
     * @returns {B.Graph.Visual} this
     *
     * @example
     * visual.
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
     * visual.uniform("someTexture", null); // removing
     */
    /**
     * Gets a uniform value.
     *
     * @function B.Graph.Visual#uniform
     * @param {string} name
     * @returns {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth}
     */
    this.uniform = function (name, value, deep) {

        if (arguments.length === 1) {
            return this._uniforms[name] || null;
        } else if (value === null) {
            delete this._uniforms[name];
        } else {
            this._uniforms[name] = value;
            if (this._instance) {
                this._instance.uniform(name, value);
            }
        }
        if (deep) {
            this._callDeep("uniform", name, value);
        }
        return this;
    };

    /**
     * Sets frustum culling enable.
     *
     * @function B.Graph.Visual#culling
     * @param {boolean} enable
     * @param {boolean} [deep=false] true if you want to set value to the whole hierarchy
     * @returns {B.Graph.Visual} this
     */
    /**
     * Gets frustum culling enable.
     *
     * @function B.Graph.Visual#culling
     * @returns {boolean}
     */
    this.culling = function (enable, deep) {

        if (arguments.length === 0) {
            return this._culling;
        }
        this._culling = enable;
        if (this._instance) {
            this._instance.culling(this._culling);
        }
        if (deep) {
            this._callDeep("culling", enable);
        }
        return this;
    };

    /**
     * Returns bounds.
     *
     * @param {boolean} [deep] true if you want to return bounds for the whole hierarchy
     * @returns {B.Math.AABox|null} null if the object is not visible
     */
    this.bounds = function (deep) {

        if (deep) {
            if (this._instance) {
                this._bounds.copy(this._instance.bounds());
            } else {
                this._bounds.reset();
            }
            this.traverse(function (node) {
                if (node.bounds) {
                    this._bounds.merge(node.bounds());
                }
            });
            return this._bounds;
        }
        return this._instance ? this._instance.bounds() : null;
    };

    this._clone = function () {

        return new G.Visual(this._device);
    };

    this._assign = function (other) {

        var name;

        this._visible = other._visible;
        this._mesh = other._mesh;
        this._material = other._material;
        this._bounds = other._bounds;
        this._culling = other._culling;
        for (name in other._uniforms) {
            this._uniforms[name] = other._uniforms[name];
        }
        this._updateInstance();
    };

    this._updateInstance = function () {

        var name, uniforms = this._uniforms;

        if (this._instance) {
            this._instance.free();
            this._instance = null;
        }
        if (this._visible && this._mesh && this._material) {
            this._instance = this._device.instance(this._material,
                this._mesh, this.transform(), this._culling);
            this._instance.culling(this._culling);
            for (name in uniforms) {
                this._instance.uniform(name, uniforms[name]);
            }
        }
    };
};

B.Graph.VisualProto.prototype = new B.Graph.LocatorProto();

/**
 * Represents a visual (transformed mesh + material).
 *
 * To create the object use [B.Graph.makeVisual()]{@link B.Graph.makeVisual}.
 *
 * @class
 * @this B.Graph.Visual
 * @augments B.Graph.Locator
 */
B.Graph.Visual = function (device) {

    B.Graph.Locator.call(this);

    this._device = device;
    this._visible = true;
    this._mesh = null;
    this._material = null;
    this._uniforms = {};
    this._culling = true;
    this._instance = null;
};

B.Graph.Visual.prototype = new B.Graph.VisualProto();
