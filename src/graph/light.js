
/**
 * Reporting that the light's parameter has been changes.
 *
 * @event B.Graph.Light#light-changed
 * @type {B.Std.Event}
 */

/**
 * @ignore
 * @this B.Graph.Light
 */
B.Graph.LightProto = function () {

    var G = B.Graph;

    /**
     * Returns direction of the light.
     *
     * The direction is calculating from Locator's transformation.
     * It has no meaning for "point" lights.
     *
     * @function B.Graph.Light#direction
     * @returns {B.Math.Vector3} direction
     */
    this.direction = function () {

        return this.finalTransform().getAxisZ(this._direction);
    };

    /**
     * Sets an angle of the light.
     *
     * The angle has meaning only for "spot" lights.
     * The "point" lights always has angle 2*PI.
     *
     * @function B.Graph.Light#angle
     * @param {number} radians
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Light} this
     * @fires B.Graph.Light#light-changed
     */
    /**
     * Returns angle of the light.
     *
     * @function B.Graph.Light#angle
     * @returns {number} radians
     */
    this.angle = function (radians, deep) {

        if (arguments.length === 0) {
            return this._angle;
        }
        this._angle = radians;
        if (deep) {
            this._callDeep("angle", radians);
        }
        this.trigger("light-changed");
        return this;
    };

    /**
     * Sets a radius of the light.
     *
     * @function B.Graph.Light#radius
     * @param {number} radius
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Light} this
     * @fires B.Graph.Light#light-changed
     */
    /**
     * Returns radius of the light.
     *
     * @function B.Graph.Light#radius
     * @returns {number} radius
     */
    this.radius = function (radius, deep) {

        if (arguments.length === 0) {
            return this._radius;
        }
        this._radius = radius;
        if (deep) {
            this._callDeep("radius", radius);
        }
        this.trigger("light-changed");
        return this;
    };

    /**
     * Sets intensity of the light.
     *
     * @function B.Graph.Light#intensity
     * @param {number} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Light} this
     * @fires B.Graph.Light#light-changed
     */
    /**
     * Returns intensity of the light.
     *
     * @function B.Graph.Light#intensity
     * @returns {number} intensity
     */
    this.intensity = function (value, deep) {

        if (arguments.length === 0) {
            return this._intensity;
        }
        this._intensity = value;
        if (deep) {
            this._callDeep("intensity", value);
        }
        this.trigger("light-changed");
        return this;
    };

    /**
     * Sets deviation of the light.
     *
     * @function B.Graph.Light#deviation
     * @param {number} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Light} this
     * @fires B.Graph.Light#light-changed
     */
    /**
     * Returns deviation of the light.
     *
     * @function B.Graph.Light#deviation
     * @returns {number} deviation
     */
    this.deviation = function (value, deep) {

        if (arguments.length === 0) {
            return this._deviation;
        }
        this._deviation = value;
        if (deep) {
            this._callDeep("deviation", value);
        }
        this.trigger("light-changed");
        return this;
    };

    /**
     * Sets cutoff of the light.
     *
     * @function B.Graph.Light#cutoff
     * @param {number} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Light} this
     * @fires B.Graph.Light#light-changed
     */
    /**
     * Returns cutoff of the light.
     *
     * @function B.Graph.Light#cutoff
     * @returns {number} cutoff
     */
    this.cutoff = function (value, deep) {

        if (arguments.length === 0) {
            return this._cutoff;
        }
        this._cutoff = value;
        if (deep) {
            this._callDeep("cutoff", value);
        }
        this.trigger("light-changed");
        return this;
    };

    /**
     * Sets color of the light.
     *
     * @function B.Graph.Light#color
     * @param {B.Math.Color} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
     * @returns {B.Graph.Light} this
     * @fires B.Graph.Light#light-changed
     */
    /**
     * Returns color of the light.
     *
     * @function B.Graph.Light#color
     * @returns {B.Math.Color} color
     */
    this.color = function (value, deep) {

        if (arguments.length === 0) {
            return this._color;
        }
        this._color = value;
        if (deep) {
            this._callDeep("color", value);
        }
        this.trigger("light-changed");
        return this;
    };

    this._clone = function () {

        return new G.Light();
    };

    this._assign = function (other) {

        G.Locator.prototype._assign.call(this, other);

        this._angle = other._angle;
        this._radius = other._radius;
        this._intensity = other._intensity;
        this._deviation = other._deviation;
        this._cutoff = other._cutoff;
        this._color = other._color;

        this.trigger("light-changed");
    };
};

B.Graph.LightProto.prototype = new B.Graph.LocatorProto();

/**
 * Represents a light.
 *
 * To create the object use [B.Graph.makeLight()]{@link B.Graph.makeLight}.
 *
 * The Light object doesn't bring the lighting to the "scene". Any lighting technique could be
 *  implemented using this object. For example, you can traverse through all lights and set
 *  its parameters to your stages.
 * Another example is deferred technique where you are rendering each light to the special
 *  stage. In that case you can attach a Visual to your Light and specify mesh and material.
 *
 * There are no conceptual difference between "point" and "spot" light.
 * The "spot" light is just spherical cone, i.e. a part of a sphere specified by an
 *  [angle]{@link B.Graph.Light#angle} and a [direction]{@link B.Graph.Light#direction}.
 * The "point" light is the whole sphere, so it has the angle 2*PI and direction has no meaning.
 *
 * @class
 * @this B.Graph.Light
 * @augments B.Graph.Locator
 */
B.Graph.Light = function () {

    B.Graph.Locator.call(this);

    this._direction = B.Math.makeVector3();
    this._angle = Math.PI * 2.0;
    this._radius = 1.0;
    this._intensity = 1.0;
    this._deviation = 3.0;
    this._cutoff = 0.0;
    this._color = B.Math.Color.WHITE;
};

B.Graph.Light.prototype = new B.Graph.LightProto();
