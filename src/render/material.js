
/**
 * @ignore
 * @this B.Render.Material
 */
B.Render.MaterialProto = function () {

    var R = B.Render;

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
     * Sets a pass to a stage.
     *
     * @function B.Render.Material#pass
     * @param {string | B.Render.Stage} stage object or string name
     * @param {B.Render.Pass | null} pass
     * @returns {B.Render.Material} this
     */
    /**
     * Sets a pass to a set of stage.
     *
     * @function B.Render.Material#pass
     * @param {Array<string | B.Render.Stage>} array of stage objects or string names
     * @param {B.Render.Pass | null} pass
     * @returns {B.Render.Material} this
     */
    /**
     * Gets a pass from a stage.
     *
     * @function B.Render.Material#pass
     * @param {string | B.Render.Stage} stage object or string name
     * @returns {B.Render.Pass | null}
     */
    this.pass = (function () {

        var
            stageName = function (stage) {
                return (stage instanceof R.Stage) ? stage.name() : stage;
            };

        return function (stage, pass) {

            var i, l;

            if (arguments.length === 1) {
                return this._passes[stageName(stage)] || null;
            }
            if (Array.isArray(stage)) {
                for (i = 0, l = stage.length; i < l; i += 1) {
                    this._passes[stageName(stage[i])] = pass;
                }
            } else {
                this._passes[stageName(stage)] = pass;
            }
            return this;
        };
    }());

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
     * @function B.Render.Material#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @returns {B.Render.Material} this
     *
     * @example
     * material.
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
     * material.uniform("someScalar", null); // removing
     */
    /**
     * Gets uniform value.
     *
     * @function B.Render.Material#uniform
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
     * Frees all internal data and detach the resource from linked rendering device.
     *
     * *Note: it also removes all instances which have this material.*
     */
    this.free = function () {

        this._device._removeMaterial(this._name);

        B.Std.freeObject(this);
    };

    this._bindUniforms = function (pass) {

        var name, values = this._uniforms;

        for (name in values) {
            pass._uniform(name, values[name]);
        }
    };
};

/**
 * Describes a rendering method of a mesh.
 * The material defines a set of passes for the stage grid.
 *
 * To create the object use [device.material()]{@link B.Render.Device#material}.
 *
 * @class
 * @this B.Render.Material
 */
B.Render.Material = function (device, name) {

    this._device = device;

    this._name = name;
    this._passes = {};
    this._uniforms = {};
};

B.Render.Material.prototype = new B.Render.MaterialProto();