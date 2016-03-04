/**
 * The project's namespace that contains a set of modules.
 *
 * @namespace B
 */
var B = {};

/**
 * Contains standard entities and utilities.
 *
 * @namespace B.Std
 */
B.Std = {};


B.Std.freeObject = function (obj) {

    var name;

    for (name in obj) {
        if (obj.hasOwnProperty(name)) {
            obj[name] = null;
        }
    }
};

B.Std.removeUnordered = function(array, index) {

    var l = array.length,
        elem = array[index];

    if (!l || index >= l) {
        return null;
    }
    if (l > 1) {
        array[index] = array[l - 1];
        array[index]._id = index;
    }
    array.length -= 1;
    return elem;
};

/**
 * Event object.
 *
 * To create the object use [listenable.makeEvent()]{@link B.Std.Listenable#makeEvent}.
 *
 * @class
 * @this B.Std.Event
 */
B.Std.Event = function (caster, type, data) {

    /**
     * An event type string (describes the nature of the event).
     *
     * @type {string}
     */
    this.type = type;

    /**
     * The listenable that initiated the event.
     *
     * @type {B.Std.Listenable}
     */
    this.caster = caster;

    /**
     * The current listenable within the event bubbling phase.
     *
     * @type {B.Std.Listenable}
     * @defaults null
     */
    this.receiver = null;

    /**
     * An optional object of data passed to an event when the event was triggered.
     *
     * @type {object}
     * @defaults null
     */
    this.data = data || null;

    /**
     * Set to true if you want to stop the event bubbling.
     *
     * @type {boolean}
     * @defaults false
     */
    this.stopped = false;

    /**
     * Set to true if you want to omit remaining handlers execution.
     *
     * @type {boolean}
     * @defaults false
     */
    this.omitted = false;
};

/**
 * Event handler callback.
 *
 * @callback B.Std.Listenable~Handler
 * @param {B.Std.Event} event
 */

/**
 * Event filter callback.
 *
 * @callback B.Std.Listenable~Filter
 * @param {B.Std.Event} event
 * @returns {boolean} true if event will be handled, false otherwise
 */

/**
 * @ignore
 * @this B.Std.Listenable
 */
B.Std.ListenableProto = function () {

    var Event = B.Std.Event;

    /**
     * Makes an event object.
     *
     * @param {string} type an event type string
     * @param {object} [data] an optional object of data
     * @returns {B.Std.Event}
     */
    this.makeEvent = function (event, data) {

        return new Event(this, event, data);
    };

    /**
     * Sets event bubbling enable.
     *
     * After an event triggers on the listenable, it then triggers on parents in nesting order.
     *
     * Disabled by default.
     *
     * @function B.Std.Listenable#bubbling
     * @param {boolean} enable
     * @returns {B.Std.Listenable} this
     */
    /**
     * Gets event bubbling enable.
     *
     * @function B.Std.Listenable#bubbling
     * @returns {boolean}
     */
    this.bubbling = function (enable) {

        if (arguments.length === 0) {
            return this._bubbling;
        }
        this._bubbling = enable;
        return this;
    };

    /**
     * Attaches an event handler function for one or more events.
     *
     * @param {string} events one or more space-separated event types
     * @param {B.Std.Listenable~Handler} handler a function to execute when the event is triggered
     * @param {B.Std.Listenable~Filter} [filter] a function to filter the event execution
     * @returns {B.Std.Listenable} this
     */
    this.on = function (events, handler, filter) {

        var that = this, handlers;

        events.split(" ").forEach(function (event) {

            handlers = that._handlers[event];

            if (!handlers) {
                handlers = [];
                that._handlers[event] = handlers;
            }
            handler._eventIndex = handlers.push({
                handler: handler,
                filter: filter
            });
        });
        return this;
    };

    /**
     * Detaches an event handler function for one or more events.
     *
     * @param {string} events one or more space-separated event types
     * @param {B.Std.Listenable~Handler} handler a function to execute when the event is triggered
     * @param {B.Std.Listenable~Filter} [filter] a function to filter the event execution
     * @returns {B.Std.Listenable} this
     */
    this.off = function (events, handler, filter) {

        var that = this, i, h, handlers;

        events.split(" ").forEach(function (event) {

            handlers = that._handlers[event];
            if (!handlers) {
                return this;
            }
            for (i = handlers.length - 1; i >= 0; i -= 1) {
                h = handlers[i];
                if (h.handler === handler && (!h.filter || h.filter === filter)) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        });
        return this;
    };

    /**
     * Executes all attached handlers for the given event type.
     *
     * @param {string | B.Std.Event} one or more space-separated event types
     *  or {@link B.Std.Event} object
     * @param {object} [data] additional data to pass along to the event handler
     * @returns {B.Std.Listenable} this
     *
     * @example
     * listenable.trigger(listenable.makeEvent("eventType", data));
     * listenable.trigger("eventType", data); // equivalent to above
     *
     * listenable.trigger("eventTypeA eventTypeB eventTypeC", data); // space-separated event types
     */
    this.trigger = function (event, data) {

        if (typeof event === "string") {
            event = new Event(this, event, data);
        }
        this._trigger(event);
        return this;
    };

    /**
     * Mutes event listening.
     *
     * If the listened is mute, event handler functions will not execute.
     *
     * Not muted by default.
     *
     * @function B.Std.Listenable#mute
     * @param {boolean} enable
     * @returns {B.Std.Listenable} this
     */
    /**
     * Checks if muted.
     *
     * @function B.Std.Listenable#mute
     * @returns {boolean}
     */
    this.mute = function (enable) {

        if (arguments.length === 0) {
            return this._muted;
        }
        this._muted = enable;
        return this;
    };

    this._trigger = function (event) {

        var i, h, f,
            handlers = this._handlers[event.type],
            parent = this._parent;

        event.receiver = this;
        event.stopped = !this._bubbling;
        event.omitted = false;

        if (handlers) {
            for (i = handlers.length - 1; i >= 0; i -= 1) {
                h = handlers[i];
                f = h.filter;
                if (!this._muted && (!f || f(event))) {
                    h.handler(event);
                }
                if (event.omitted === true) {
                    break;
                }
            }
        }
        if (parent && event.stopped !== true) {
            parent._trigger(event);
        }
    };

    this._assign = function (other) {

        var name;

        for (name in other._handlers) {
            this._handlers[name] = other._handlers[name];
        }
        this._bubbling = other._bubbling;
        this._muted = other._muted;
    };
};

/**
 * The interface that all event listener interfaces must inherit.
 *
 * @class
 * @this B.Std.Listenable
 * @param {B.Std.Listenable} [parent]
 */
B.Std.Listenable = function (parent) {

    this._parent = parent || null;
    this._handlers = {};
    this._bubbling = false;
    this._muted = false;
};

B.Std.Listenable.prototype = new B.Std.ListenableProto();


/**
 * Contains linear algebra tools and commonly used geometry objects.
 *
 * @namespace B.Math
 */
B.Math = {};

B.Math.Type = {

    POINT: 1,
    PLANE: 2,
    RAY: 3,
    SEGMENT: 4,
    TRIANGLE: 5,
    AABOX: 6,
    SPHERE: 7
};


/**
 * Negligibly small number.
 *
 * @constant
 * @type {number}
 * @default 0.00000001
 */
B.Math.EPSILON = 10e-8;

/**
 * Checks for strict equality of two numbers.
 *
 * @function
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
B.Math.equal = (function () {

    var EPSILON = B.Math.EPSILON,
        abs = Math.abs;

    return function (a, b) {
        return (abs(a - b) < EPSILON);
    };
}());


/**
 * A type of relation between two geometry objects.
 *
 * @enum {number}
 * @readonly
 */
B.Math.Relation = {

    /**
     * Two objects intersect each other.
     *
     * @constant
     */
    INTERSECT: 1,

    /**
     * The object is located inside another object.
     *
     * @constant
     */
    INSIDE: 2,

    /**
     * The object is located outside another object.
     *
     * @constant
     */
    OUTSIDE: 4
};

B.Math.testRelationByDistance = function (d, relation) {

    var M = B.Math, R = M.Relation;

    relation = relation || R.INTERSECT;

    if (Math.abs(d) < M.EPSILON) {
        return !!(relation & R.INTERSECT);
    }
    return !!(relation & R.OUTSIDE);
};


/**
 * Converts from radians to degrees.
 *
 * @param {number} radians
 * @returns {number} degrees
 */
B.Math.degrees = function (radians) {
    return radians * (180 / Math.PI);
};

/**
 * Converts from degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} radians
 */
B.Math.radians = function (degrees) {
    return degrees * (Math.PI / 180);
};


/**
 * Makes a RGBA color.
 *
 * @param {number} [r=0] red component (value between 0 and 1)
 * @param {number} [g=0] green component (value between 0 and 1)
 * @param {number} [b=0] blue component (value between 0 and 1)
 * @param {number} [a=1] alpha component (value between 0 and 1)
 * @returns {B.Math.Color}
 */
B.Math.makeColor = function (r, g, b, a) {

    return new B.Math.Color(r, g, b, a);
};

/**
 * Makes a 2D vector.
 *
 * @param {number} [x=0] x component
 * @param {number} [y=0] y component
 * @returns {B.Math.Vector2}
 */
B.Math.makeVector2 = function (x, y) {

    return new B.Math.Vector2(x, y);
};

/**
 * Makes a 3D vector.
 *
 * @param {number} [x=0] x component
 * @param {number} [y=0] y component
 * @param {number} [z=0] z component
 * @returns {B.Math.Vector3}
 */
B.Math.makeVector3 = function (x, y, z) {

    return new B.Math.Vector3(x, y, z);
};

/**
 * Makes a 4D vector.
 *
 * @param {number} [x=0] x component
 * @param {number} [y=0] y component
 * @param {number} [z=0] z component
 * @param {number} [w=0] w component
 * @returns {B.Math.Vector4}
 */
B.Math.makeVector4 = function (x, y, z, w) {

    return new B.Math.Vector4(x, y, z, w);
};

/**
 * Makes a column-major 3x3 matrix.
 *
 * @param {number} [m00=1]
 * @param {number} [m01=0]
 * @param {number} [m02=0]
 * @param {number} [m10=0]
 * @param {number} [m11=1]
 * @param {number} [m12=0]
 * @param {number} [m20=0]
 * @param {number} [m21=0]
 * @param {number} [m22=1]
 * @returns {B.Math.Matrix3}
 */
B.Math.makeMatrix3 = function (
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22) {

    return (arguments.length === 0) ?
        new B.Math.Matrix3() :
        new B.Math.Matrix3(
            m00, m01, m02,
            m10, m11, m12,
            m20, m21, m22);
};

/**
 * Makes a column-major 4x4 matrix.
 *
 * @param {number} [m00=1]
 * @param {number} [m01=0]
 * @param {number} [m02=0]
 * @param {number} [m03=0]
 * @param {number} [m10=0]
 * @param {number} [m11=1]
 * @param {number} [m12=0]
 * @param {number} [m13=0]
 * @param {number} [m20=0]
 * @param {number} [m21=0]
 * @param {number} [m22=1]
 * @param {number} [m23=0]
 * @param {number} [m30=0]
 * @param {number} [m31=0]
 * @param {number} [m32=0]
 * @param {number} [m33=1]
 * @returns {B.Math.Matrix4}
 */
B.Math.makeMatrix4 = function (
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {

    return (arguments.length === 0) ?
        new B.Math.Matrix4() :
        new B.Math.Matrix4(
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33);
};

/**
 * Makes a quaternion.
 *
 * @param {number} [w=1] w component (cos(angle/2))
 * @param {number} [x=0] x component (sin(angle/2)*axis.x)
 * @param {number} [y=0] y component (sin(angle/2)*axis.y)
 * @param {number} [z=0] z component (sin(angle/2)*axis.z)
 * @returns {B.Math.Quaternion}
 */
B.Math.makeQuaternion = function (w, x, y, z) {

    return new B.Math.Quaternion(w, x, y, z);
};

/**
 * Makes canonical Euler angles (yaw-pitch-roll order).
 *
 * @param {number} [yaw=0] global Y-axis rotation [-PI, PI].
 * @param {number} [pitch=0] local X-axis rotation [-PI/2, PI/2].
 * @param {number} [roll=0] local Z-axis rotation [-PI, PI].
 * @returns {B.Math.Angles}
 */
B.Math.makeAngles = function (yaw, pitch, roll) {

    return new B.Math.Angles(yaw, pitch, roll);
};

/**
 * Makes a plane.
 *
 * @param {B.Math.Vector3} [normal={@link B.Math.Vector3.Y}]
 * @param {number} [distance=0]
 * @returns {B.Math.Plane}
 */
B.Math.makePlane = function (normal, distance) {

    return new B.Math.Plane(normal, distance);
};

/**
 * Makes a ray.
 *
 * @param {B.Math.Vector3} [origin={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [direction={@link B.Math.Vector3.Z}]
 * @returns {B.Math.Ray}
 */
B.Math.makeRay = function (origin, direction) {

    return new B.Math.Ray(origin, direction);
};

/**
 * Makes a segment.
 *
 * @param {B.Math.Vector3} [start={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [end={@link B.Math.Vector3.ZERO}]
 * @returns {B.Math.Segment}
 */
B.Math.makeSegment = function (start, end) {

    return new B.Math.Segment(start, end);
};

/**
 * Makes a triangle.
 *
 * @param {B.Math.Vector3} [a={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [b={@link B.Math.Vector3.ZERO}]
 * @param {B.Math.Vector3} [c={@link B.Math.Vector3.ZERO}]
 * @returns {B.Math.Triangle}
 */
B.Math.makeTriangle = function (a, b, c) {

    return new B.Math.Triangle(a, b, c);
};

/**
 * Makes an axis-aligned box.
 *
 * @param {B.Math.Vector3} [min={@link B.Math.Vector3.INF}]
 * @param {B.Math.Vector3} [max={@link B.Math.Vector3.N_INF}]
 * @returns {B.Math.AABox}
 */
B.Math.makeAABox = function (min, max) {

    return new B.Math.AABox(min, max);
};

/**
 * Makes a sphere.
 *
 * @param {B.Math.Vector3} [center={@link B.Math.Vector3.ZERO}]
 * @param {number} [radius=0]
 * @returns {B.Math.Sphere}
 */
B.Math.makeSphere = function (center, radius) {

    return new B.Math.Sphere(center, radius);
};

/**
 * Makes a frustum.
 *
 * @param {B.Math.Plane} [left={@link B.Math.Plane.X}]
 * @param {B.Math.Plane} [right={@link B.Math.Plane.N_X}]
 * @param {B.Math.Plane} [top={@link B.Math.Plane.N_Y}]
 * @param {B.Math.Plane} [bottom={@link B.Math.Plane.Y}]
 * @param {B.Math.Plane} [near={@link B.Math.Plane.N_Z}]
 * @param {B.Math.Plane} [far={@link B.Math.Plane.Z}]
 * @returns {B.Math.Frustum}
 */
B.Math.makeFrustum = function (left, right, top, bottom, near, far) {

    return new B.Math.Frustum(left, right, top, bottom, near, far);
};


/**
 * @ignore
 * @this B.Math.Color
 */
B.Math.ColorProto = function () {

    var M = B.Math,

        equal = M.equal,
        min = Math.min,
        max = Math.max;

    /**
     * Copies a given color into this color.
     *
     * @param {B.Math.Color} color
     * @returns {B.Math.Color} this
     */
    this.copy = function (color) {

        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;

        return this;
    };

    /**
     * Clones this color to a new color.
     *
     * @returns {B.Math.Color} this
     */
    this.clone = function () {

        return new M.Color(this.r, this.g, this.b, this.a);
    };

    /**
     * Sets this color from separated components.
     *
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     * @returns {B.Math.Color} this
     */
    this.set = function (r, g, b, a) {

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

        return this.clamp();
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this.r;
        case 1:
            return this.g;
        case 2:
            return this.b;
        case 3:
            return this.a;
        default:
            throw new Error("Color index is out of range");
        }
    };

    /**
     * Sets RGB-components of this color from a hexadecimal value.
     *
     * @param {number} hex
     * @returns {B.Math.Color} this
     */
    this.setHex = function (hex) {

        var num = Math.floor(hex);

        this.r = (num >> 16 & 255 ) / 255;
        this.g = (num >> 8 & 255 ) / 255;
        this.b = (num & 255 ) / 255;

        return this;
    };

    /**
     * Returns the hexadecimal value of this color (RGB-components).
     *
     * @returns {number}
     */
    this.getHex = function () {

        return (
            (this.r * 255) << 16 ^
            (this.g * 255) << 8 ^
            (this.b * 255)
        );
    };

    /**
     * Sets this color from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.r = array[offset];
        this.g = array[offset + 1];
        this.b = array[offset + 2];
        this.a = array[offset + 3];

        this.clamp();

        return offset + 4;
    };

    /**
     * Sets this color components to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.r;
        array[offset + 1] = this.g;
        array[offset + 2] = this.b;
        array[offset + 3] = this.a;

        return offset + 4;
    };

    /**
     * Clamps components of this color to the range [0.0, 1.0].
     *
     * @returns {B.Math.Color} this
     */
    this.clamp = function () {

        this.r = max(min(this.r, 1.0), 0.0);
        this.g = max(min(this.g, 1.0), 0.0);
        this.b = max(min(this.b, 1.0), 0.0);
        this.a = max(min(this.a, 1.0), 0.0);

        return this;
    };

    /**
     * Adds a color or a scalar to this color.
     *
     * @param {number | B.Math.Color} v
     * @returns {B.Math.Color} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.r += v;
            this.g += v;
            this.b += v;
            this.a += v;
        }
        else {
            this.r += v.r;
            this.g += v.g;
            this.b += v.b;
            this.a += v.a;
        }
        return this.clamp();
    };

    /**
     * Adds two given colors and sets the result to this.
     *
     * @param {B.Math.Color} a
     * @param {B.Math.Color} b
     * @returns {B.Math.Color} this
     */
    this.addColors = function (a, b) {

        this.r = a.r + b.r;
        this.g = a.g + b.g;
        this.b = a.b + b.b;
        this.a = a.a + b.a;

        return this.clamp();
    };

    /**
     * Subtracts a color or a scalar from this color.
     *
     * @param {number | B.Math.Color} v
     * @returns {B.Math.Color} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.r -= v;
            this.g -= v;
            this.b -= v;
            this.a -= v;
        }
        else {
            this.r -= v.r;
            this.g -= v.g;
            this.b -= v.b;
            this.a -= v.a;
        }
        return this.clamp();
    };

    /**
     * Subtracts two given colors and sets the result to this.
     *
     * @param {B.Math.Color} a
     * @param {B.Math.Color} b
     * @returns {B.Math.Color} this
     */
    this.subColors = function (a, b) {

        this.r = a.r - b.r;
        this.g = a.g - b.g;
        this.b = a.b - b.b;
        this.a = a.a - b.a;

        return this.clamp();
    };

    /**
     * Multiplies this color by a given color or a scalar.
     *
     * @param {number | B.Math.Color} v
     * @returns {B.Math.Color} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.r *= v;
            this.g *= v;
            this.b *= v;
            this.a *= v;
        }
        else {
            this.r *= v.r;
            this.g *= v.g;
            this.b *= v.b;
            this.a *= v.a;
        }
        return this.clamp();
    };

    /**
     * Multiplies two given colors and sets the result to this.
     *
     * @param {B.Math.Color} a
     * @param {B.Math.Color} b
     * @returns {B.Math.Color} this
     */
    this.mulColors = function (a, b) {

        this.r = a.r * b.r;
        this.g = a.g * b.g;
        this.b = a.b * b.b;
        this.a = a.a * b.a;

        return this.clamp();
    };

    /**
     * Checks for strict equality of this color and another color.
     *
     * @param {B.Math.Color} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.r, this.r) && equal(v.g, this.g) &&
            equal(v.b, this.b) && equal(v.a, this.a);
    };
};

/**
 * Represents a RGBA color.
 *
 * To create the object use [B.Math.makeColor()]{@link B.Math.makeColor}.
 *
 * @class
 * @this B.Math.Color
 */
B.Math.Color = function (r, g, b, a) {

    /**
     * Red component.
     *
     * @type {number}
     */
    this.r = r || 0.0;

    /**
     * Green component.
     *
     * @type {number}
     */
    this.g = g || 0.0;

    /**
     * Blue component.
     *
     * @type {number}
     */
    this.b = b || 0.0;

    /**
     * Alpha component.
     *
     * @type {number}
     */
    this.a = (a === undefined) ? 1.0 : a;

    this.clamp();
};

B.Math.Color.prototype = new B.Math.ColorProto();

/**
 * White color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 1.0, g: 1.0, b: 1.0, a: 1.0}
 */
B.Math.Color.WHITE = B.Math.makeColor(1.0, 1.0, 1.0, 1.0);

/**
 * Gray color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.5, g: 0.5, b: 0.5, a: 1.0}
 */
B.Math.Color.GRAY = B.Math.makeColor(0.5, 0.5, 0.5, 1.0);

/**
 * Black color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.0, g: 0.0, b: 0.0, a: 1.0}
 */
B.Math.Color.BLACK = B.Math.makeColor(0.0, 0.0, 0.0, 1.0);

/**
 * Red color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 1.0, g: 0.0, b: 0.0, a: 1.0}
 */
B.Math.Color.RED = B.Math.makeColor(1.0, 0.0, 0.0, 1.0);

/**
 * Green color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.0, g: 1.0, b: 0.0, a: 1.0}
 */
B.Math.Color.GREEN = B.Math.makeColor(0.0, 1.0, 0.0, 1.0);

/**
 * Blue color.
 * @constant
 * @type {B.Math.Color}
 * @default {r: 0.0, g: 0.0, b: 1.0, a: 1.0}
 */
B.Math.Color.BLUE = B.Math.makeColor(0.0, 0.0, 1.0, 1.0);

/**
 * @ignore
 * @this B.Math.Vector2
 */
B.Math.Vector2Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    /**
     * Clones this vector to a new vector.
     *
     * @returns {B.Math.Vector2} this
     */
    this.clone = function () {

        return M.makeVector2(this.x, this.y);
    };

    /**
     * Copies a given vector into this vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.copy = function (v) {

        this.x = v.x;
        this.y = v.y;

        return this;
    };

    /**
     * Sets this vector from separated components.
     *
     * @param {number} x
     * @param {number} y
     * @returns {B.Math.Vector2} this
     */
    this.set = function (x, y) {

        this.x = x;
        this.y = y;

        return this;
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this.x;
        case 1:
            return this.y;
        default:
            throw new Error("Vector2 index is out of range");
        }
    };

    /**
     * Sets this vector from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.x = array[offset];
        this.y = array[offset + 1];

        return offset + 2;
    };

    /**
     * Sets this vector to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.x;
        array[offset + 1] = this.y;

        return offset + 2;
    };

    /**
     * Calculates the length of this vector.
     *
     * @returns {number} length
     */
    this.length = function () {

        var x = this.x, y = this.y;

        return Math.sqrt(x * x + y * y);
    };

    /**
     * Calculates the squared length of this vector.
     *
     * @returns {number} squared length
     */
    this.lengthSq = function () {

        var x = this.x, y = this.y;

        return x * x + y * y;
    };

    /**
     * Normalizes this vector.
     *
     * @returns {B.Math.Vector2} this
     */
    this.normalize = function () {

        var sl = this.lengthSq();

        if (sl > 0 && abs(1.0 - sl) > EPSILON) {
            this.mul(1.0 / sqrt(sl));
        }
        return this;
    };

    /**
     * Inverts this vector.
     *
     * @returns {B.Math.Vector2} this
     */
    this.negate = function () {

        this.x *= -1.0;
        this.y *= -1.0;

        return this;
    };

    /**
     * Clamps components of this vector.
     *
     * @param {number} [minVal=0.0]
     * @param {number} [maxVal=1.0]
     * @returns {B.Math.Vector2} this
     */
    this.clamp = function (minVal, maxVal) {

        minVal = minVal || 0.0;
        maxVal = maxVal || 1.0;

        this.x = max(min(this.x, maxVal), minVal);
        this.y = max(min(this.y, maxVal), minVal);

        return this;
    };

    /**
     * Adds a vector or a scalar to this vector.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.x += v;
            this.y += v;
        } else {
            this.x += v.x;
            this.y += v.y;
        }
        return this;
    };

    /**
     * Adds two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.addVectors = function (a, b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;

        return this;
    };

    /**
     * Subtracts a vector or a scalar from this vector.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.x -= v;
            this.y -= v;
        } else {
            this.x -= v.x;
            this.y -= v.y;
        }
        return this;
    };

    /**
     * Subtracts two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.subVectors = function (a, b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;

        return this;
    };

    /**
     * Multiplies this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.x *= v;
            this.y *= v;
        } else {
            this.x *= v.x;
            this.y *= v.y;
        }
        return this;
    };

    /**
     * Multiplies two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.mulVectors = function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;

        return this;
    };

    /**
     * Divides this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector2} v
     * @returns {B.Math.Vector2} this
     */
    this.div = function (v) {

        if (typeof v === "number") {
            this.x /= v;
            this.y /= v;
        } else {
            this.x /= v.x;
            this.y /= v.y;
        }
        return this;
    };

    /**
     * Divides two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector2} a
     * @param {B.Math.Vector2} b
     * @returns {B.Math.Vector2} this
     */
    this.divVectors = function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;

        return this;
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} dot product
     */
    this.dot = function (v) {

        return this.x * v.x + this.y * v.y;
    };

    /**
     * Calculates the angle in radians between this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} angle
     */
    this.angleTo = function (v) {

        var cosAngle = this.dot(v) / (this.length() * v.length());

        return Math.acos(min(max(cosAngle, -1.0), 1.0));
    };

    /**
     * Calculates the distance between this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} distance
     */
    this.distanceTo = function (v) {

        return Math.sqrt(this.distanceToSq(v));
    };

    /**
     * Calculates the squared distance between this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {number} squared distance
     */
    this.distanceToSq = function (v) {

        var x = this.x - v.x,
            y = this.y - v.y;

        return x * x + y * y;
    };

    /**
     * Checks for strict equality of this vector and another vector.
     *
     * @param {B.Math.Vector2} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.x, this.x) && equal(v.y, this.y);
    };
};

/**
 * Represents a 2D vector.
 *
 * To create the object use [B.Math.makeVector2()]{@link B.Math.makeVector2}.
 *
 * @class
 * @this B.Math.Vector2
 */
B.Math.Vector2 = function (x, y) {

    /**
     * X component.
     *
     * @type {number}
     */
    this.x = x || 0.0;

    /**
     * Y component.
     *
     * @type {number}
     */
    this.y = y || 0.0;
};

B.Math.Vector2.prototype = new B.Math.Vector2Proto();

/**
 * Zero vector.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 0.0, y: 0.0}
 */
B.Math.Vector2.ZERO = B.Math.makeVector2(0.0, 0.0);

/**
 * Positive infinity point.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: Infinity, y: Infinity}
 */
B.Math.Vector2.INF = B.Math.makeVector2(Infinity, Infinity);

/**
 * Negative infinity point.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: -Infinity, y: -Infinity}
 */
B.Math.Vector2.N_INF = B.Math.makeVector2(-Infinity, -Infinity);

/**
 * Positive direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 1.0, y: 0.0}
 */
B.Math.Vector2.X = B.Math.makeVector2(1.0, 0.0);

/**
 * Positive direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 0.0, y: 1.0}
 */
B.Math.Vector2.Y = B.Math.makeVector2(0.0, 1.0);

/**
 * Negative direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: -1.0, y: 0.0}
 */
B.Math.Vector2.N_X = B.Math.makeVector2(-1.0, 0.0);

/**
 * Negative direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector2}
 * @default {x: 0.0, y: -1.0}
 */
B.Math.Vector2.N_Y = B.Math.makeVector2(0.0, -1.0);

/**
 * @ignore
 * @this B.Math.Vector3
 */
B.Math.Vector3Proto = function () {

    var M = B.Math,
        T = M.Type,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    this._type = function () {

        return T.POINT;
    };

    /**
     * Clones this vector to a new vector.
     *
     * @returns {B.Math.Vector3} this
     */
    this.clone = function () {

        return M.makeVector3(this.x, this.y, this.z);
    };

    /**
     * Copies a given vector into this vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.copy = function (v) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;
    };

    /**
     * Sets this vector from separated components.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Vector3} this
     */
    this.set = function (x, y, z) {

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this.x;
        case 1:
            return this.y;
        case 2:
            return this.z;
        default:
            throw new Error("Vector3 index is out of range");
        }
    };

    /**
     * Sets this vector from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];

        return offset + 3;
    };

    /**
     * Sets this vector to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;

        return offset + 3;
    };

    /**
     * Calculates the length of this vector.
     *
     * @returns {number} length
     */
    this.length = function () {

        var x = this.x, y = this.y, z = this.z;

        return Math.sqrt(x * x + y * y + z * z);
    };

    /**
     * Calculates the squared length of this vector.
     *
     * @returns {number} squared length
     */
    this.lengthSq = function () {

        var x = this.x, y = this.y, z = this.z;

        return x * x + y * y + z * z;
    };

    /**
     * Normalizes this vector.
     *
     * @returns {B.Math.Vector3} this
     */
    this.normalize = function () {

        var sl = this.lengthSq();

        if (sl > 0 && abs(1.0 - sl) > EPSILON) {
            this.mul(1.0 / sqrt(sl));
        }
        return this;
    };

    /**
     * Inverts this vector.
     *
     * @returns {B.Math.Vector3} this
     */
    this.negate = function () {

        this.x *= -1.0;
        this.y *= -1.0;
        this.z *= -1.0;

        return this;
    };

    /**
     * Clamps components of this vector.
     *
     * @param {number} [minVal=0.0]
     * @param {number} [maxVal=1.0]
     * @returns {B.Math.Vector3} this
     */
    this.clamp = function (minVal, maxVal) {

        minVal = minVal || 0.0;
        maxVal = maxVal || 1.0;

        this.x = max(min(this.x, maxVal), minVal);
        this.y = max(min(this.y, maxVal), minVal);
        this.z = max(min(this.z, maxVal), minVal);

        return this;
    };

    /**
     * Adds a vector or a scalar to this vector.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.x += v;
            this.y += v;
            this.z += v;
        }
        else {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    };

    /**
     * Adds two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.addVectors = function (a, b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;
    };

    /**
     * Subtracts a vector or a scalar from this vector.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.x -= v;
            this.y -= v;
            this.z -= v;
        }
        else {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
        return this;
    };

    /**
     * Subtracts two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.subVectors = function (a, b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;
    };

    /**
     * Multiplies this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.x *= v;
            this.y *= v;
            this.z *= v;
        }
        else {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
        }
        return this;
    };

    /**
     * Multiplies two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.mulVectors = function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;
    };

    /**
     * Divides this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.div = function (v) {

        if (typeof v === "number") {
            this.x /= v;
            this.y /= v;
            this.z /= v;
        } else {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
        }
        return this;
    };

    /**
     * Divides two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.divVectors = function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;
        this.z = a.z / b.z;

        return this;
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} dot product
     */
    this.dot = function (v) {

        return this.x * v.x + this.y * v.y + this.z * v.z;
    };

    /**
     * Sets this vector to the cross product of itself and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {B.Math.Vector3} this
     */
    this.cross = function (v) {

        var ax = this.x, bx = v.x,
            ay = this.y, by = v.y,
            az = this.z, bz = v.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    };

    /**
     * Calculates the cross product of two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @returns {B.Math.Vector3} this
     */
    this.crossVectors = function (a, b) {

        var ax = a.x, bx = b.x,
            ay = a.y, by = b.y,
            az = a.z, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    };

    /**
     * Reflects this vector by a normal vector.
     *
     * @function
     * @param {B.Math.Vector3} normal
     * @returns {B.Math.Vector3} this
     */
    this.reflect = (function () {

        var n = null;

        return function (normal) {

            var x = this.x, y = this.y, z = this.z, dot;

            n = (n || M.makeVector3()).copy(normal).normalize();

            dot = x * n.x + y * n.y + z * n.z;

            this.x = x - 2.0 * n.x * dot;
            this.y = y - 2.0 * n.y * dot;
            this.z = z - 2.0 * n.z * dot;

            return this;
        };
    }());

    /**
     * Transforms this vector by a 3x3 matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Vector3} this
     */
    this.transform3 = function (matrix) {

        var m = matrix.m,
            x = this.x, y = this.y, z = this.z;

        this.x = m[0] * x + m[3] * y + m[6] * z;
        this.y = m[1] * x + m[4] * y + m[7] * z;
        this.z = m[2] * x + m[5] * y + m[8] * z;

        return this;
    };

    /**
     * Transforms this vector by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @param {number} [w=1.0] additional vector's component
     * @returns {B.Math.Vector3} this
     */
    this.transform4 = function (matrix, w) {

        var m = matrix.m,
            x = this.x, y = this.y, z = this.z,
            tx = m[12], ty = m[13], tz = m[14];

        if (w !== 1.0 && w !== undefined) {
            tx *= w;
            ty *= w;
            tz *= w;
        }
        this.x = m[0] * x + m[4] * y + m[8] * z + tx;
        this.y = m[1] * x + m[5] * y + m[9] * z + ty;
        this.z = m[2] * x + m[6] * y + m[10] * z + tz;

        return this;
    };

    /**
     * Transforms this vector by any matrix.
     *
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @param {number} [w=1.0] additional vector's component
     * @returns {B.Math.Vector3} this
     */
    this.transform = function (matrix, w) {

        if (matrix instanceof B.Math.Matrix3) {
            return this.transform3(matrix);
        } else {
            return this.transform4(matrix, w);
        }
    };

    /**
     * Rotates this vector by a quaternion or an Euler angles object.
     *
     * @function
     * @param {B.Math.Quaternion | B.Math.Angles} object
     * @returns {B.Math.Vector3} this
     */
    this.rotate = (function () {

        var
            byQuaternion = function (v, q) {

                var vx = v.x, vy = v.y, vz = v.z,
                    qw = q._w, qx = q._x, qy = q._y, qz = q._z,

                    w = -qx * vx - qy * vy - qz * vz,
                    x =  qw * vx + qy * vz - qz * vy,
                    y =  qw * vy + qz * vx - qx * vz,
                    z =  qw * vz + qx * vy - qy * vx;

                v.x = x * qw - w * qx - y * qz + z * qy;
                v.y = y * qw - w * qy - z * qx + x * qz;
                v.z = z * qw - w * qz - x * qy + y * qx;
            },

            byAngles = (function () {

                var q = null;

                return function (v, angles) {

                    q = q || M.makeQuaternion();
                    byQuaternion(v, q.fromAngles(angles));
                };
            }());

        return function (object) {

            if (object instanceof B.Math.Quaternion) {
                byQuaternion(this, object);
            } else {
                byAngles(this, object);
            }
            return this;
        };
    }());

    /**
     * Calculates the angle in radians between this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} angle
     */
    this.angleTo = function (v) {

        var cosAngle = this.dot(v) / (this.length() * v.length());

        return Math.acos(min(max(cosAngle, -1.0), 1.0));
    };

    /**
     * Calculates the distance between this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} distance
     */
    this.distanceTo = function (v) {

        return Math.sqrt(this.distanceToSq(v));
    };

    /**
     * Calculates squared distance between this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {number} squared distance
     */
    this.distanceToSq = function (v) {

        var x = this.x - v.x,
            y = this.y - v.y,
            z = this.z - v.z;

        return x * x + y * y + z * z;
    };

    /**
     * Checks for strict equality of this vector and another vector.
     *
     * @param {B.Math.Vector3} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.x, this.x) && equal(v.y, this.y) && equal(v.z, this.z);
    };
};

/**
 * Represents a 3D vector / point.
 *
 * To create the object use [B.Math.makeVector3()]{@link B.Math.makeVector3}.
 *
 * @class
 * @this B.Math.Vector3
 */
B.Math.Vector3 = function (x, y, z) {

    /**
     * X component.
     *
     * @type {number}
     */
    this.x = x || 0.0;

    /**
     * Y component.
     *
     * @type {number}
     */
    this.y = y || 0.0;

    /**
     * Z component.
     *
     * @type {number}
     */
    this.z = z || 0.0;
};

B.Math.Vector3.prototype = new B.Math.Vector3Proto();

/**
 * Zero vector.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 0.0, z: 0.0}
 */
B.Math.Vector3.ZERO = B.Math.makeVector3(0.0, 0.0, 0.0);

/**
 * Positive infinity point.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: Infinity, y: Infinity, z: Infinity}
 */
B.Math.Vector3.INF = B.Math.makeVector3(Infinity, Infinity, Infinity);

/**
 * Negative infinity point.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: -Infinity, y: -Infinity, z: -Infinity}
 */
B.Math.Vector3.N_INF = B.Math.makeVector3(-Infinity, -Infinity, -Infinity);

/**
 * Positive direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 1.0, y: 0.0, z: 0.0}
 */
B.Math.Vector3.X = B.Math.makeVector3(1.0, 0.0, 0.0);

/**
 * Positive direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 1.0, z: 0.0}
 */
B.Math.Vector3.Y = B.Math.makeVector3(0.0, 1.0, 0.0);

/**
 * Positive direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 0.0, z: 1.0}
 */
B.Math.Vector3.Z = B.Math.makeVector3(0.0, 0.0, 1.0);

/**
 * Negative direction along X-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: -1.0, y: 0.0, z: 0.0}
 */
B.Math.Vector3.N_X = B.Math.makeVector3(-1.0, 0.0, 0.0);

/**
 * Negative direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: -1.0, z: 0.0}
 */
B.Math.Vector3.N_Y = B.Math.makeVector3(0.0, -1.0, 0.0);

/**
 * Negative direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Vector3}
 * @default {x: 0.0, y: 0.0, z: -1.0}
 */
B.Math.Vector3.N_Z = B.Math.makeVector3(0.0, 0.0, -1.0);


/**
 * @ignore
 * @this B.Math.Vector4
 */
B.Math.Vector4Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    /**
     * Clones this vector to a new vector.
     *
     * @returns {B.Math.Vector4} this
     */
    this.clone = function () {

        return M.makeVector4(this.x, this.y, this.z, this.w);
    };

    /**
     * Copies a given vector into this vector.
     *
     * @param {B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.copy = function (v) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;

        return this;
    };

    /**
     * Sets this vector from separated components.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {B.Math.Vector4} this
     */
    this.set = function (x, y, z, w) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this.x;
        case 1:
            return this.y;
        case 2:
            return this.z;
        case 3:
            return this.w;
        default:
            throw new Error("Vector4 index is out of range");
        }
    };

    /**
     * Sets this vector from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];

        return offset + 4;
    };

    /**
     * Sets this vector to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;
        array[offset + 3] = this.w;

        return offset + 4;
    };

    /**
     * Calculates the length of this vector.
     *
     * @returns {number} length
     */
    this.length = function () {

        var x = this.x, y = this.y, z = this.z, w = this.w;

        return Math.sqrt(x * x + y * y + z * z + w * w);
    };

    /**
     * Calculates the squared length of this vector.
     *
     * @returns {number} squared length
     */
    this.lengthSq = function () {

        var x = this.x, y = this.y, z = this.z, w = this.w;

        return x * x + y * y + z * z + w * w;
    };

    /**
     * Normalizes this vector.
     *
     * @returns {B.Math.Vector4} this
     */
    this.normalize = function () {

        var sl = this.lengthSq();

        if (sl > 0 && abs(1.0 - sl) > EPSILON) {
            this.mul(1.0 / sqrt(sl));
        }
        return this;
    };

    /**
     * Inverts this vector.
     *
     * @returns {B.Math.Vector4} this
     */
    this.negate = function () {

        this.x *= -1.0;
        this.y *= -1.0;
        this.z *= -1.0;
        this.w *= -1.0;

        return this;
    };

    /**
     * Clamps components of this vector.
     *
     * @param {number} [minVal=0.0]
     * @param {number} [maxVal=1.0]
     * @returns {B.Math.Vector4} this
     */
    this.clamp = function (minVal, maxVal) {

        minVal = minVal || 0.0;
        maxVal = maxVal || 1.0;

        this.x = max(min(this.x, maxVal), minVal);
        this.y = max(min(this.y, maxVal), minVal);
        this.z = max(min(this.z, maxVal), minVal);
        this.w = max(min(this.w, maxVal), minVal);

        return this;
    };

    /**
     * Adds a vector or a scalar to this vector.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.add = function (v) {

        if (typeof v === "number") {
            this.x += v;
            this.y += v;
            this.z += v;
            this.w += v;
        }
        else {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            this.w += v.w;
        }
        return this;
    };

    /**
     * Adds two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.addVectors = function (a, b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        this.w = a.w + b.w;

        return this;
    };

    /**
     * Subtracts a vector or a scalar from this vector.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.sub = function (v) {

        if (typeof v === "number") {
            this.x -= v;
            this.y -= v;
            this.z -= v;
            this.w -= v;
        }
        else {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
            this.w -= v.w;
        }
        return this;
    };

    /**
     * Subtracts two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.subVectors = function (a, b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        this.w = a.w - b.w;

        return this;
    };

    /**
     * Multiplies this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.mul = function (v) {

        if (typeof v === "number") {
            this.x *= v;
            this.y *= v;
            this.z *= v;
            this.w *= v;
        }
        else {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
            this.w *= v.w;
        }
        return this;
    };

    /**
     * Multiplies two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.mulVectors = function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        this.w = a.w * b.w;

        return this;
    };

    /**
     * Divides this vector by a given vector or a scalar.
     *
     * @param {number | B.Math.Vector4} v
     * @returns {B.Math.Vector4} this
     */
    this.div = function (v) {

        if (typeof v === "number") {
            this.x /= v;
            this.y /= v;
            this.z /= v;
            this.w /= v;
        } else {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
            this.w /= v.w;
        }
        return this;
    };

    /**
     * Divides two given vectors and sets the result to this.
     *
     * @param {B.Math.Vector4} a
     * @param {B.Math.Vector4} b
     * @returns {B.Math.Vector4} this
     */
    this.divVectors = function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;
        this.z = a.z / b.z;
        this.w = a.w / b.w;

        return this;
    };

    /**
     * Transforms this vector by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Vector4} this
     */
    this.transform = function (matrix) {

        var m = matrix.m,
            x = this.x, y = this.y, z = this.z, w = this.w;

        this.x = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        this.y = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        this.z = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        this.w = m[3] * x + m[7] * y + m[11] * z + m[15] * w;

        return this;
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {B.Math.Vector4} v
     * @returns {number} dot product
     */
    this.dot = function (v) {

        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    };

    /**
     * Checks for strict equality of this vector and another vector.
     *
     * @param {B.Math.Vector4} v
     * @returns {boolean}
     */
    this.equal = function (v) {

        return equal(v.x, this.x) && equal(v.y, this.y) &&
            equal(v.z, this.z) && equal(v.w, this.w);
    };
};

/**
 * Represents a 4D vector.
 *
 * To create the object use [B.Math.makeVector4()]{@link B.Math.makeVector4}.
 *
 * @class
 * @this B.Math.Vector4
 */
B.Math.Vector4 = function (x, y, z, w) {

    /**
     * X component.
     *
     * @type {number}
     */
    this.x = x || 0.0;

    /**
     * Y component.
     *
     * @type {number}
     */
    this.y = y || 0.0;

    /**
     * Z component.
     *
     * @type {number}
     */
    this.z = z || 0.0;

    /**
     * W component.
     *
     * @type {number}
     */
    this.w = w || 0.0;
};

B.Math.Vector4.prototype = new B.Math.Vector4Proto();

/**
 * Zero vector.
 *
 * @constant
 * @type {B.Math.Vector4}
 * @default {x: 0.0, y: 0.0, z: 0.0, w: 0.0}
 */
B.Math.Vector4.ZERO = B.Math.makeVector4(0.0, 0.0, 0.0, 0.0);


/**
 * @ignore
 * @this B.Math.Matrix3
 */
B.Math.Matrix3Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        ROWS_COUNT = 3,
        COLS_COUNT = 3,
        ELEMENTS_COUNT = ROWS_COUNT * COLS_COUNT,

        equal = M.equal,
        abs = Math.abs,
        sin = Math.sin,
        cos = Math.cos;

    /**
     * Clones this matrix to a new matrix.
     *
     * @returns {B.Math.Matrix3} this
     */
    this.clone = function () {

        var clone = M.makeMatrix3();
        clone.fromArray(this.m);
        return clone;
    };

    /**
     * Copies a given matrix into this matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Matrix3} this
     */
    this.copy = function (matrix) {

        this.fromArray(matrix.m);
        return this;
    };

    /**
     * Sets all elements of this matrix.
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22
     * @returns {B.Math.Matrix3} this
     */
    this.set = function (
        m00, m01, m02,
        m10, m11, m12,
        m20, m21, m22) {

        var m = this.m;

        m[0] = m00;
        m[1] = m10;
        m[2] = m20;

        m[3] = m01;
        m[4] = m11;
        m[5] = m21;

        m[6] = m02;
        m[7] = m12;
        m[8] = m22;

        return this;
    };

    /**
     * Gets an element by its row and column indices.
     *
     * @param {number} row index [0, 2]
     * @param {number} column index [0, 2]
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (row, column) {

        if (column < 0 || column >= COLS_COUNT) {
            throw new Error("Matrix3 column index is out of range");
        }
        if (row < 0 || row >= ROWS_COUNT) {
            throw new Error("Matrix3 row index is out of range");
        }
        return this.m[column * ROWS_COUNT + row];
    };

    /**
     * Sets the X-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix3} this
     */
    this.setAxisX = function (axis) {

        var m = this.m;

        m[0] = axis.x;
        m[1] = axis.y;
        m[2] = axis.z;

        return this;
    };

    /**
     * Returns the X-axis vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisX = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[0], m[1], m[2]);
    };

    /**
     * Sets the Y-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix3} this
     */
    this.setAxisY = function (axis) {

        var m = this.m;

        m[3] = axis.x;
        m[4] = axis.y;
        m[5] = axis.z;

        return this;
    };

    /**
     * Returns the Y-axis vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisY = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[3], m[4], m[5]);
    };

    /**
     * Sets the Z-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix3} this
     */
    this.setAxisZ = function (axis) {

        var m = this.m;

        m[6] = axis.x;
        m[7] = axis.y;
        m[8] = axis.z;

        return this;
    };

    /**
     * Returns the Z-axis vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisZ = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[6], m[7], m[8]);
    };

    /**
     * Extracts scale factors.
     *
     * @function
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.extractScale = (function () {

        var v = M.makeVector3();

        return function (result) {

            result = result || M.makeVector3();

            return result.set(
                this.getAxisX(v).length(),
                this.getAxisY(v).length(),
                this.getAxisZ(v).length()
            );
        };
    }());

    /**
     * Sets this matrix elements from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        var i, m = this.m;

        offset = offset || 0;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            m[i] = array[i + offset];
        }

        return offset + ELEMENTS_COUNT;
    };

    /**
     * Sets this matrix elements to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        var i, m = this.m;

        offset = offset || 0;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            array[i + offset] = m[i];
        }

        return offset + ELEMENTS_COUNT;
    };

    /**
     * Sets this matrix from Euler angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Matrix3} this
     */
    this.fromAngles = function (angles) {

        var x = angles.pitch(), y = angles.yaw(), z = angles.roll(),
            cx = cos(x), cy = cos(y), cz = cos(z),
            sx = sin(x), sy = sin(y), sz = sin(z),
            cycz = cy * cz, cysz = cy * sz,
            sycz = sy * cz, sysz = sy * sz;

        // rotationZ(roll) * rotationX(pitch) * rotationY(yaw)

        return this.set(
            cycz + sysz * sx, sycz * sx - cysz, cx * sy,
            cx * sz, cx * cz, -sx,
            cysz * sx - sycz, sysz + cycz * sx, cx * cy
        );
    };

    /**
     * Sets this matrix from a quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Matrix3} this
     */
    this.fromQuaternion = function (q) {

        var x = q._x, y = q._y, z = q._z, w = q._w,
            x2 = x * 2.0, y2 = y * 2.0, z2 = z * 2.0,
            xx2 = x * x2, xy2 = x * y2, xz2 = x * z2,
            yy2 = y * y2, yz2 = y * z2, zz2 = z * z2,
            wx2 = w * x2, wy2 = w * y2, wz2 = w * z2;

        // rotationAxis(q.axis(), q.angle())

        return this.set(
            1 - yy2 - zz2, xy2 - wz2, xz2 + wy2,
            xy2 + wz2, 1 - xx2 - zz2, yz2 - wx2,
            xz2 - wy2, yz2 + wx2, 1 - xx2 - yy2
        );
    };

    /**
     * Sets this matrix to the identity.
     *
     * @returns {B.Math.Matrix3} this
     */
    this.identity = function () {

        return this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    };

    /**
     * Sets this matrix to X-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationX = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            1, 0, 0,
            0, c, -s,
            0, s, c
        );
    };

    /**
     * Sets this matrix to Y-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationY = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, 0, s,
            0, 1, 0,
            -s, 0, c
        );
    };

    /**
     * Sets this matrix to Z-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationZ = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        );
    };

    /**
     * Sets this matrix to arbitrary axis rotation transform.
     *
     * @function
     * @param {B.Math.Vector3} axis
     * @param {number} angle
     * @returns {B.Math.Matrix3} this
     */
    this.rotationAxis = (function () {

        var v = M.makeVector3();

        return function (axis, angle) {

            // explanation: http://ami.ektf.hu/uploads/papers/finalpdf/AMI_40_from175to186.pdf

            var x = v.copy(axis).normalize().x, y = v.y, z = v.z,
                c = cos(angle),
                s = sin(angle),
                t = 1.0 - c,
                tx = t * x,
                ty = t * y;

            return this.set(
                tx * x + c, tx * y - s * z, tx * z + s * y,
                tx * y + s * z, ty * y + c, ty * z - s * x,
                tx * z - s * y, ty * z + s * x, t * z * z + c
            );
        };
    }());

    /**
     * Sets this matrix to scale transform.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Matrix3} this
     */
    this.scale = function (x, y, z) {

        return this.set(
            x, 0, 0,
            0, y, 0,
            0, 0, z
        );
    };

    /**
     * Adds a matrix to this matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Matrix3} this
     */
    this.add = function (matrix) {

        var ma = this.m, mb = matrix.m;

        ma[0] += mb[0];
        ma[1] += mb[1];
        ma[2] += mb[2];

        ma[3] += mb[3];
        ma[4] += mb[4];
        ma[5] += mb[5];

        ma[6] += mb[6];
        ma[7] += mb[7];
        ma[8] += mb[8];

        return this;
    };

    /**
     * Multiplies this matrix by a given scalar.
     *
     * @param {number} scalar
     * @returns {B.Math.Matrix3} this
     */
    this.mulScalar = function (scalar) {

        var i, m = this.m;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            m[i] *= scalar;
        }

        return this;
    };

    /**
     * Multiplies two given matrices and sets the result to this.
     *
     * @param {B.Math.Matrix3} a
     * @param {B.Math.Matrix3} b
     * @returns {B.Math.Matrix3} this
     */
    this.mulMatrices = function (a, b) {

        var m = this.m, ma = a.m, mb = b.m,
            a00 = ma[0], a01 = ma[3], a02 = ma[6],
            a10 = ma[1], a11 = ma[4], a12 = ma[7],
            a20 = ma[2], a21 = ma[5], a22 = ma[8],
            b00 = mb[0], b01 = mb[3], b02 = mb[6],
            b10 = mb[1], b11 = mb[4], b12 = mb[7],
            b20 = mb[2], b21 = mb[5], b22 = mb[8];

        m[0] = a00 * b00 + a10 * b01 + a20 * b02;
        m[3] = a01 * b00 + a11 * b01 + a21 * b02;
        m[6] = a02 * b00 + a12 * b01 + a22 * b02;

        m[1] = a00 * b10 + a10 * b11 + a20 * b12;
        m[4] = a01 * b10 + a11 * b11 + a21 * b12;
        m[7] = a02 * b10 + a12 * b11 + a22 * b12;

        m[2] = a00 * b20 + a10 * b21 + a20 * b22;
        m[5] = a01 * b20 + a11 * b21 + a21 * b22;
        m[8] = a02 * b20 + a12 * b21 + a22 * b22;

        return this;
    };

    /**
     * Multiplies this matrix by a given matrix or a scalar.
     *
     * @param {number | B.Math.Matrix3} value
     * @returns {B.Math.Matrix3} this
     */
    this.mul = function (value) {

        if (typeof value === "number") {
            return this.mulScalar(value);
        } else {
            return this.mulMatrices(this, value);
        }
    };

    /**
     * Calculates the determinant of this matrix.
     *
     * @returns {number}
     */
    this.determinant = function () {

        var m = this.m,
            m00 = m[0], m01 = m[3], m02 = m[6],
            m10 = m[1], m11 = m[4], m12 = m[7],
            m20 = m[2], m21 = m[5], m22 = m[8];

        return (
            (m11 * m22 - m12 * m21) * m00 +
            (m02 * m21 - m01 * m22) * m10 +
            (m01 * m12 - m02 * m11) * m20
        );
    };

    /**
     * Transposes this matrix.
     *
     * @returns {B.Math.Matrix3} this
     */
    this.transpose = function () {

        var m = this.m;

        return this.set(
            m[0], m[1], m[2],
            m[3], m[4], m[5],
            m[6], m[7], m[8]
        );
    };

    /**
     * Inverts this matrix.
     *
     * @returns {B.Math.Matrix3} this
     * @throws {Error} if determinant is zero.
     */
    this.invert = function () {

        var d, m = this.m,
            m00 = m[0], m01 = m[3], m02 = m[6],
            m10 = m[1], m11 = m[4], m12 = m[7],
            m20 = m[2], m21 = m[5], m22 = m[8];

        m[0] = m11 * m22 - m12 * m21;
        m[3] = m02 * m21 - m01 * m22;
        m[6] = m01 * m12 - m02 * m11;
        m[1] = m12 * m20 - m10 * m22;
        m[4] = m00 * m22 - m02 * m20;
        m[7] = m02 * m10 - m00 * m12;
        m[2] = m10 * m21 - m11 * m20;
        m[5] = m01 * m20 - m00 * m21;
        m[8] = m00 * m11 - m01 * m10;

        d = m00 * m[0] + m10 * m[3] + m20 * m[6];

        if (abs(d) < EPSILON) {
            throw new Error("can't invert Matrix3 - determinant is zero");
        }
        return this.mulScalar(1.0 / d);
    };

    /**
     * Checks for strict equality of this matrix and another matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {boolean}
     */
    this.equal = function (matrix) {

        var i, ma = this.m, mb = matrix.m;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            if (!equal(ma[i], mb[i])) {
                return false;
            }
        }
        return true;
    };
};

/**
 * Represents a column-major 3x3 matrix.
 *
 * |  make / set:  |   |      representation:      |   |  array accessor: |
 * | ------------- |:-:|:-------------------------:|:-:| ----------------:|
 * | m00, m01, m02 |   | axisX.x, axisY.x, axisZ.x |   | m[0], m[3], m[6] |
 * | m10, m11, m12 | = | axisX.y, axisY.y, axisZ.y | = | m[1], m[4], m[7] |
 * | m20, m21, m22 |   | axisX.z, axisY.z, axisZ.z |   | m[2], m[5], m[8] |
 *
 * To create the object use [B.Math.makeMatrix3()]{@link B.Math.makeMatrix3}.
 *
 * *Note: the order of transformations coincides with the order in which the matrices are
 *  multiplied (from left to right).*
 *
 * @class
 * @this B.Math.Matrix3
 */
B.Math.Matrix3 = function (
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22) {

    /**
     * Matrix element array.
     *
     * @type {Array<number>}
     */
    this.m = (arguments.length !== 0) ? [
        m00, m10, m20,
        m01, m11, m21,
        m02, m12, m22
    ] : [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
};

B.Math.Matrix3.prototype = new B.Math.Matrix3Proto();

/**
 * Zero matrix.
 *
 * @constant
 * @type {B.Math.Matrix3}
 * @default [0,0,0, 0,0,0, 0,0,0]
 */
B.Math.Matrix3.ZERO = B.Math.makeMatrix3(
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
);

/**
 * Identity matrix.
 *
 * @constant
 * @type {B.Math.Matrix3}
 * @default [1,0,0, 0,1,0, 0,0,1]
 */
B.Math.Matrix3.IDENTITY = B.Math.makeMatrix3();


/**
 * @ignore
 * @this B.Math.Matrix4
 */
B.Math.Matrix4Proto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        ROWS_COUNT = 4,
        COLS_COUNT = 4,
        ELEMENTS_COUNT = ROWS_COUNT * COLS_COUNT,

        equal = M.equal,
        abs = Math.abs,
        sin = Math.sin,
        cos = Math.cos;

    /**
     * Clones this matrix to a new matrix.
     *
     * @returns {B.Math.Matrix4} this
     */
    this.clone = function () {

        var clone = M.makeMatrix4();
        clone.fromArray(this.m);
        return clone;
    };

    /**
     * Copies a given matrix into this matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Matrix4} this
     */
    this.copy = function (matrix) {

        this.fromArray(matrix.m);
        return this;
    };

    /**
     * Sets all elements of this matrix.
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m03
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m13
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22
     * @param {number} m23
     * @param {number} m30
     * @param {number} m31
     * @param {number} m32
     * @param {number} m33
     * @returns {B.Math.Matrix4} this
     */
    this.set = function (
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33) {

        var m = this.m;

        m[0] = m00;
        m[1] = m10;
        m[2] = m20;
        m[3] = m30;

        m[4] = m01;
        m[5] = m11;
        m[6] = m21;
        m[7] = m31;

        m[8] = m02;
        m[9] = m12;
        m[10] = m22;
        m[11] = m32;

        m[12] = m03;
        m[13] = m13;
        m[14] = m23;
        m[15] = m33;

        return this;
    };

    /**
     * Gets an element by its row and column indices.
     *
     * @param {number} row index [0, 3]
     * @param {number} column index [0, 3]
     * @returns {number}
     * @throws {Error} if the index is out of range.
     */
    this.get = function (row, column) {

        if (column < 0 || column >= COLS_COUNT) {
            throw new Error("Matrix4 column index is out of range");
        }
        if (row < 0 || row >= ROWS_COUNT) {
            throw new Error("Matrix4 row index is out of range");
        }
        return this.m[column * ROWS_COUNT + row];
    };

    /**
     * Sets 3x3 top left part of this matrix.
     *
     * @param {B.Math.Matrix3} matrix
     * @returns {B.Math.Matrix4} this
     */
    this.setMatrix3 = function (matrix) {

        var m = this.m, m3 = matrix.m;

        m[0] = m3[0];
        m[1] = m3[1];
        m[2] = m3[2];

        m[4] = m3[3];
        m[5] = m3[4];
        m[6] = m3[5];

        m[8] = m3[6];
        m[9] = m3[7];
        m[10] = m3[8];

        return this;
    };

    /**
     * Returns 3x3 top left part of this matrix.
     *
     * @param {B.Math.Matrix3} [result] omit if you want to return newly created matrix
     * @returns {B.Math.Matrix3}
     */
    this.getMatrix3 = function (result) {

        var m = this.m;

        result = result || M.makeMatrix3();

        return result.set(
            m[0], m[4], m[8],
            m[1], m[5], m[9],
            m[2], m[6], m[10]
        );
    };

    /**
     * Sets the X-axis vector.
     *
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix4} this
     */
    this.setAxisX = function (axis) {

        var m = this.m;

        m[0] = axis.x;
        m[1] = axis.y;
        m[2] = axis.z;

        return this;
    };

    /**
     * Returns the X-axis vector.
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisX = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[0], m[1], m[2]);
    };

    /**
     * Sets the Y-axis vector.
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix4} this
     */
    this.setAxisY = function (axis) {

        var m = this.m;

        m[4] = axis.x;
        m[5] = axis.y;
        m[6] = axis.z;

        return this;
    };

    /**
     * Returns the Y-axis vector.
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisY = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[4], m[5], m[6]);
    };

    /**
     * Sets the Z-axis vector.
     * @param {B.Math.Vector3} axis
     * @returns {B.Math.Matrix4} this
     */
    this.setAxisZ = function (axis) {

        var m = this.m;

        m[8] = axis.x;
        m[9] = axis.y;
        m[10] = axis.z;

        return this;
    };

    /**
     * Returns the Z-axis vector.
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getAxisZ = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[8], m[9], m[10]);
    };

    /**
     * Sets the position vector.
     * @param {B.Math.Vector3} position
     * @returns {B.Math.Matrix4} this
     */
    this.setPosition = function (position) {

        var m = this.m;

        m[12] = position.x;
        m[13] = position.y;
        m[14] = position.z;

        return this;
    };

    /**
     * Returns the position vector.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.getPosition = function (result) {

        var m = this.m,
            v = result || M.makeVector3();

        return v.set(m[12], m[13], m[14]);
    };

    /**
     * Extracts scale factors.
     *
     * @function
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.extractScale = (function () {

        var v = M.makeVector3();

        return function (result) {

            result = result || M.makeVector3();

            return result.set(
                this.getAxisX(v).length(),
                this.getAxisY(v).length(),
                this.getAxisZ(v).length()
            );
        };
    }());

    /**
     * Sets this matrix elements from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        var i, m = this.m;

        offset = offset || 0;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            m[i] = array[i + offset];
        }

        return offset + ELEMENTS_COUNT;
    };

    /**
     * Sets this matrix elements to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        var i, m = this.m;

        offset = offset || 0;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            array[i + offset] = m[i];
        }

        return offset + ELEMENTS_COUNT;
    };

    /**
     * Sets this matrix from Euler angles.
     *
     * @function
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Matrix4} this
     */
    this.fromAngles = (function () {

        var m3 = M.makeMatrix3();

        return function (angles) {

            return this.identity().setMatrix3(m3.fromAngles(angles));
        };
    }());

    /**
     * Sets this matrix from a quaternion.
     *
     * @function
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Matrix4} this
     */
    this.fromQuaternion = (function () {

        var m3 = M.makeMatrix3();

        return function (q) {

            return this.identity().setMatrix3(m3.fromQuaternion(q));
        };
    }());

    /**
     * Sets this matrix to the identity.
     *
     * @returns {B.Math.Matrix4} this
     */
    this.identity = function () {

        return this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to translation transform.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Matrix4} this
     */
    this.translation = function (x, y, z) {

        return this.set(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to X-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationX = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to Y-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationY = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to Z-axis rotation transform.
     *
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationZ = function (angle) {

        var c = cos(angle),
            s = sin(angle);

        return this.set(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to arbitrary axis rotation transform.
     *
     * @function
     * @param {B.Math.Vector3} axis
     * @param {number} angle
     * @returns {B.Math.Matrix4} this
     */
    this.rotationAxis = (function () {

        var m3 = M.makeMatrix3();

        return function (axis, angle) {

            return this.identity().setMatrix3(m3.rotationAxis(axis, angle));
        };
    }());

    /**
     * Sets this matrix to scale transform.
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Matrix4} this
     */
    this.scale = function (x, y, z) {

        return this.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to right-handed view transform.
     *
     * @function
     * @param {B.Math.Vector3} eye
     * @param {B.Math.Vector3} target
     * @param {B.Math.Vector3} up
     * @returns {B.Math.Matrix4} this
     */
    this.lookAt = (function () {

        var xAxis = M.makeVector3(),
            yAxis = M.makeVector3(),
            zAxis = M.makeVector3();

        return function (eye, target, up) {

            zAxis.subVectors(eye, target).normalize();
            xAxis.crossVectors(up, zAxis).normalize();
            if (xAxis.length() < M.EPSILON) {
                zAxis.x += M.EPSILON;
                xAxis.crossVectors(up, zAxis).normalize();
            }
            yAxis.crossVectors(zAxis, xAxis);

            return this.set(
                xAxis.x, xAxis.y, xAxis.z, -xAxis.dot(eye),
                yAxis.x, yAxis.y, yAxis.z, -yAxis.dot(eye),
                zAxis.x, zAxis.y, zAxis.z, -zAxis.dot(eye),
                0, 0, 0, 1
            );
        };
    }());

    /**
     * Sets this matrix to orthographic projection transform.
     *
     * @param {number} width
     * @param {number} height
     * @param {number} zNear
     * @param {number} zFar
     * @returns {B.Math.Matrix4} this
     */
    this.orthographic = function (width, height, zNear, zFar) {

        // explanation: http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho

        var xs = 2.0 / width,
            ys = 2.0 / height,
            d = -1.0 / (zFar - zNear),
            za = 2.0 * d,
            zb = (zFar + zNear) * d;

        return this.set(
            xs, 0, 0, 0,
            0, ys, 0, 0,
            0, 0, za, zb,
            0, 0, 0, 1
        );
    };

    /**
     * Sets this matrix to perspective projection transform.
     *
     * @param {number} fov field of view angle
     * @param {number} aspect output surface width to height ratio
     * @param {number} zNear
     * @param {number} zFar
     * @returns {B.Math.Matrix4} this
     */
    this.perspective = function (fov, aspect, zNear, zFar) {

        // explanation: http://www.songho.ca/opengl/gl_projectionmatrix.html#perspective

        var hTan = Math.tan(fov * 0.5),
            xs = 1.0 / (aspect * hTan),
            ys = 1.0 / hTan,
            d = -1.0 / (zFar - zNear),
            za = (zFar + zNear) * d,
            zb = 2.0 * zFar * zNear * d;

        return this.set(
            xs, 0, 0, 0,
            0, ys, 0, 0,
            0, 0, za, zb,
            0, 0, -1, 0
        );
    };

    /**
     * Adds a matrix to this matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Matrix4} this
     */
    this.add = function (matrix) {

        var ma = this.m, mb = matrix.m;

        ma[0] += mb[0];
        ma[1] += mb[1];
        ma[2] += mb[2];
        ma[3] += mb[3];

        ma[4] += mb[4];
        ma[5] += mb[5];
        ma[6] += mb[6];
        ma[7] += mb[7];

        ma[8] += mb[8];
        ma[9] += mb[9];
        ma[10] += mb[10];
        ma[11] += mb[11];

        ma[12] += mb[12];
        ma[13] += mb[13];
        ma[14] += mb[14];
        ma[15] += mb[15];

        return this;
    };

    /**
     * Multiplies this matrix by a given scalar.
     *
     * @param {number} scalar
     * @returns {B.Math.Matrix4} this
     */
    this.mulScalar = function (scalar) {

        var i, m = this.m;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            m[i] *= scalar;
        }

        return this;
    };

    /**
     * Multiplies two given matrices and sets the result to this.
     *
     * @param {B.Math.Matrix4} a
     * @param {B.Math.Matrix4} b
     * @returns {B.Math.Matrix4} this
     */
    this.mulMatrices = function (a, b) {

        var m = this.m, ma = a.m, mb = b.m,
            a00 = ma[0], a01 = ma[4], a02 = ma[8], a03 = ma[12],
            a10 = ma[1], a11 = ma[5], a12 = ma[9], a13 = ma[13],
            a20 = ma[2], a21 = ma[6], a22 = ma[10], a23 = ma[14],
            a30 = ma[3], a31 = ma[7], a32 = ma[11], a33 = ma[15],
            b00 = mb[0], b01 = mb[4], b02 = mb[8], b03 = mb[12],
            b10 = mb[1], b11 = mb[5], b12 = mb[9], b13 = mb[13],
            b20 = mb[2], b21 = mb[6], b22 = mb[10], b23 = mb[14],
            b30 = mb[3], b31 = mb[7], b32 = mb[11], b33 = mb[15];

        m[0] =  a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
        m[4] =  a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
        m[8] =  a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
        m[12] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

        m[1] =  a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
        m[5] =  a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
        m[9] =  a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
        m[13] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

        m[2] =  a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
        m[6] =  a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
        m[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
        m[14] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

        m[3] =  a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
        m[7] =  a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
        m[11] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
        m[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

        return this;
    };

    /**
     * Multiplies this matrix by a given matrix or a scalar.
     *
     * @param {number | B.Math.Matrix4} value
     * @returns {B.Math.Matrix4} this
     */
    this.mul = function (value) {

        if (typeof value === "number") {
            return this.mulScalar(value);
        } else {
            return this.mulMatrices(this, value);
        }
    };

    /**
     * Calculates the determinant of this matrix.
     *
     * @returns {number}
     */
    this.determinant = function () {

        var m = this.m,
            m00 = m[0], m01 = m[4], m02 = m[8], m03 = m[12],
            m10 = m[1], m11 = m[5], m12 = m[9], m13 = m[13],
            m20 = m[2], m21 = m[6], m22 = m[10], m23 = m[14],
            m30 = m[3], m31 = m[7], m32 = m[11], m33 = m[15],

            m03m10 = m03 * m10, m03m11 = m03 * m11, m03m12 = m03 * m12,
            m02m10 = m02 * m10, m02m11 = m02 * m11, m02m13 = m02 * m13,
            m01m10 = m01 * m10, m01m12 = m01 * m12, m01m13 = m01 * m13,
            m00m11 = m00 * m11, m00m12 = m00 * m12, m00m13 = m00 * m13;

        return (
            (m03m12 * m21 - m02m13 * m21 - m03m11 * m22 +
                m01m13 * m22 + m02m11 * m23 - m01m12 * m23) * m30 +
            (m02m13 * m20 - m03m12 * m20 + m03m10 * m22 -
                m00m13 * m22 - m02m10 * m23 + m00m12 * m23) * m31 +
            (m03m11 * m20 - m01m13 * m20 - m03m10 * m21 +
                m01m10 * m23 - m00m11 * m23 - m00m13 * m21) * m32 +
            (m02m11 * m20 + m01m12 * m20 + m02m10 * m21 -
                m00m12 * m21 - m01m10 * m22 + m00m11 * m22) * m33
        );
    };

    /**
     * Transposes this matrix.
     *
     * @returns {B.Math.Matrix4} this
     */
    this.transpose = function () {

        var m = this.m;

        return this.set(
            m[0], m[1], m[2], m[3],
            m[4], m[5], m[6], m[7],
            m[8], m[9], m[10], m[11],
            m[12], m[13], m[14], m[15]
        );
    };

    /**
     * Inverts this matrix.
     *
     * @returns {B.Math.Matrix4} this
     * @throws {Error} if determinant is zero.
     */
    this.invert = function () {

        var d, m = this.m,
            m00 = m[0], m01 = m[4], m02 = m[8], m03 = m[12],
            m10 = m[1], m11 = m[5], m12 = m[9], m13 = m[13],
            m20 = m[2], m21 = m[6], m22 = m[10], m23 = m[14],
            m30 = m[3], m31 = m[7], m32 = m[11], m33 = m[15];

        m[0] = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 -
            m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;
        m[4] = m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 +
            m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33;
        m[8] = m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 -
            m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33;
        m[12] = m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 +
            m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23;
        m[1] = m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 +
            m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33;
        m[5] = m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 -
            m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33;
        m[9] = m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 +
            m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33;
        m[13] = m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 -
            m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23;
        m[2] = m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 -
            m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33;
        m[6] = m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 +
            m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33;
        m[10] = m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 -
            m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33;
        m[14] = m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 +
            m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23;
        m[3] = m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 +
            m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32;
        m[7] = m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 -
            m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32;
        m[11] = m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 +
            m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32;
        m[15] = m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 -
            m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22;

        d = m00 * m[0] + m10 * m[4] + m20 * m[8] + m30 * m[12];

        if (abs(d) < EPSILON) {

            throw new Error("can't invert Matrix4 - determinant is zero");
        }
        return this.mulScalar(1.0 / d);
    };

    /**
     * Checks for strict equality of this matrix and another matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {boolean}
     */
    this.equal = function (matrix) {

        var i, ma = this.m, mb = matrix.m;

        for (i = 0; i < ELEMENTS_COUNT; i += 1) {
            if (!equal(ma[i], mb[i])) {
                return false;
            }
        }
        return true;
    };
};

/**
 * Represents a column-major 4x4 matrix.
 *
 * |     make / set:    |   |             representation:           |   |      array accessor:     |
 * |  ------------------|:-:|:-------------------------------------:|:-:| ------------------------:|
 * | m00, m01, m02, m03 |   | axisX.x, axisY.x, axisZ.x, position.x |   | m[0], m[4], m[08], m[12] |
 * | m10, m11, m12, m13 | = | axisX.y, axisY.y, axisZ.y, position.y | = | m[1], m[5], m[09], m[13] |
 * | m20, m21, m22, m23 |   | axisX.z, axisY.z, axisZ.z, position.z |   | m[2], m[6], m[10], m[14] |
 * | m30, m31, m32, m33 |   |    0,       0,       0,        1      |   | m[3], m[7], m[11], m[15] |
 *
 * To create the object use [B.Math.makeMatrix4()]{@link B.Math.makeMatrix4}.
 *
 * *Note: the order of transformations coincides with the order in which the matrices are
 *  multiplied (from left to right).*
  *
 * @class
 * @this B.Math.Matrix4
 */
B.Math.Matrix4 = function (
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {

    /**
     * Matrix element array.
     *
     * @type {Array<number>}
     */
    this.m = (arguments.length !== 0) ? [
        m00, m10, m20, m30,
        m01, m11, m21, m31,
        m02, m12, m22, m32,
        m03, m13, m23, m33
    ] : [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

B.Math.Matrix4.prototype = new B.Math.Matrix4Proto();

/**
 * Zero matrix.
 *
 * @constant
 * @type {B.Math.Matrix4}
 * @default [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
 */
B.Math.Matrix4.ZERO = B.Math.makeMatrix4(
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
);

/**
 * Identity matrix.
 *
 * @constant
 * @type {B.Math.Matrix4}
 * @default [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
 */
B.Math.Matrix4.IDENTITY = B.Math.makeMatrix4();


/**
 * @ignore
 * @this B.Math.Quaternion
 */
B.Math.QuaternionProto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        equal = M.equal,
        cos = Math.cos,
        sin = Math.sin,
        atan2 = Math.atan2,
        sqrt = Math.sqrt,
        abs = Math.abs;

    /**
     * Clones this quaternion to a new quaternion object.
     *
     * @returns {B.Math.Quaternion} this
     */
    this.clone = function () {

        return M.makeQuaternion(this._w, this._x, this._y, this._z);
    };

    /**
     * Copies a given quaternion object into this quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Quaternion} this
     */
    this.copy = function (q) {

        this._w = q._w;
        this._x = q._x;
        this._y = q._y;
        this._z = q._z;

        return this;
    };

    /**
     * Sets all elements and performs normalization.
     *
     * @param {number} w
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {B.Math.Quaternion} this
     */
    this.set = function (w, x, y, z) {

        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;

        return this._normalize();
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this._w;
        case 1:
            return this._x;
        case 2:
            return this._y;
        case 3:
            return this._z;
        default:
            throw new Error("Quaternion index is out of range");
        }
    };

    /**
     * Sets this quaternion from a part of array and performs normalization.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this._w = array[offset];
        this._x = array[offset + 1];
        this._y = array[offset + 2];
        this._z = array[offset + 3];
        this._normalize();

        return offset + 4;
    };

    /**
     * Sets this quaternion to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this._w;
        array[offset + 1] = this._x;
        array[offset + 2] = this._y;
        array[offset + 3] = this._z;

        return offset + 4;
    };

    /**
     * Sets this quaternion from an axis vector and an angle.
     *
     * @function
     * @param {B.Math.Vector3} axis
     * @param {number} angle
     * @returns {B.Math.Quaternion} this
     */
    this.fromAxisAngle = (function () {

        var v = M.makeVector3();

        return function (axis, angle) {

            var ha = angle * 0.5,
                hs = sin(ha);

            v.copy(axis).normalize();

            return this.set(cos(ha), v.x * hs, v.y * hs, v.z * hs);
        };
    }());

    /**
     * Sets this quaternion from any rotation matrix.
     *
     * @function
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Math.Quaternion} this
     */
    this.fromRotationMatrix = (function () {

        var mx3 = M.makeMatrix3();

        return function (matrix) {

            var m = (matrix instanceof M.Matrix4) ?
                    matrix.getMatrix3(mx3).m : matrix.m,

                m00 = m[0], m01 = m[3], m02 = m[6],
                m10 = m[1], m11 = m[4], m12 = m[7],
                m20 = m[2], m21 = m[5], m22 = m[8],

                tw = m00 + m11 + m22,
                tx = m00 - m11 - m22,
                ty = m11 - m00 - m22,
                tz = m22 - m00 - m11,

                max = tw, i = 0, s;

            if (tx > max) {
                max = tx;
                i = 1;
            } else if (ty > max) {
                max = ty;
                i = 2;
            } else if (tz > max) {
                max = tz;
                i = 3;
            }
            max = sqrt(1.0 + max) * 0.5;
            s = 0.25 / max;

            switch (i) {
            case 0:
                return this.set(max, (m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s);
            case 1:
                return this.set((m21 - m12) * s, max, (m01 + m10) * s, (m02 + m20) * s);
            case 2:
                return this.set((m02 - m20) * s, (m01 + m10) * s, max, (m12 + m21) * s);
            case 3:
                return this.set((m10 - m01) * s, (m02 + m20) * s, (m12 + m21) * s, max);
            }
        };
    }());

    /**
     * Sets this quaternion from Euler angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Quaternion} this
     */
    this.fromAngles = function (angles) {

        var hx = angles.pitch() * 0.5,
            hy = angles.yaw() * 0.5,
            hz = angles.roll() * 0.5,

            cx = cos(hx), cy = cos(hy), cz = cos(hz),
            sx = sin(hx), sy = sin(hy), sz = sin(hz);

        return this.set(
            cy * cx * cz - sy * sx * sz,
            cy * sx * cz + sy * cx * sz,
            sy * cx * cz - cy * sx * sz,
            cy * cx * sz - sy * sx * cz
        ); 
    };

    /**
     * Returns the axis vector (or zero-vector for identity quaternion).
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector.
     * @returns {B.Math.Vector3}
     */
    this.axis = function (result) {

        var w = this._w,
            s = sqrt(1.0 - w * w),
            v = result || M.makeVector3();

        if (s < EPSILON) {
            return v.set(0.0, 0.0, 0.0);
        }
        return v.set(this._x, this._y, this._z).mul(1.0 / s).normalize();
    };

    /**
     * Returns the angle.
     *
     * @returns {number}
     */
    this.angle = function () {

        var w = this._w, x = this._x, y = this._y, z = this._z;

        return 2.0 * atan2(sqrt(x * x + y * y + z * z), abs(w));
    };

    /**
     * Multiplies two given quaternions and sets the result to this.
     *
     * @param {B.Math.Quaternion} a
     * @param {B.Math.Quaternion} b
     * @returns {B.Math.Quaternion} this
     */
    this.mulQuaternions = function (a, b) {

        var aw = a._w, ax = a._x, ay = a._y, az = a._z,
            bw = b._w, bx = b._x, by = b._y, bz = b._z;

        this._w = bw * aw - bx * ax - by * ay - bz * az;
        this._x = bx * aw + bw * ax + by * az - bz * ay;
        this._y = by * aw + bw * ay + bz * ax - bx * az;
        this._z = bz * aw + bw * az + bx * ay - by * ax;

        return this;
    };

    /**
     * Multiplies this quaternion by a given quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Quaternion} this
     */
    this.mul = function (q) {

        return this.mulQuaternions(this, q);
    };

    /**
     * Calculates the dot product of this quaternion and another quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {number} this
     */
    this.dot = function (q) {

        var aw = this._w, ax = this._x, ay = this._y, az = this._z,
            bw = q._w, bx = q._x, by = q._y, bz = q._z;

        return aw * bw + ax * bx + ay * by + az * bz;
    };

    /**
     * Inverts this quaternion.
     *
     * @returns {B.Math.Quaternion} this
     */
    this.invert = function () {

        this._x *= -1.0;
        this._y *= -1.0;
        this._z *= -1.0;

        return this;
    };

    /**
     * Spherically interpolates between this quaternion and another quaternion by t.
     *
     * @param {B.Math.Quaternion} q
     * @param {number} t [0.0, 1.0]
     * @param {B.Math.Quaternion} [result] omit if you want to return newly created quaternion.
     * @returns {B.Math.Quaternion} this
     */
    this.slerp = function (q, t, result) {

        var aw = this._w, ax = this._x, ay = this._y, az = this._z,
            bw = q._w, bx = q._x, by = q._y, bz = q._z, t0, t1, ha,
            sinHA, cosHA = aw * bw + ax * bx + ay * by + az * bz;

        result = result || M.makeQuaternion();

        if (cosHA < EPSILON) {
            bw = -bw;
            bx = -bx;
            by = -by;
            bz = -bz;
            cosHA = -cosHA;
        }
        if (cosHA > (1.0 - EPSILON)) {
            return result.set(aw, ax, ay, az);
        }

        sinHA = sqrt(1.0 - cosHA * cosHA);
        ha = atan2(sinHA, cosHA);

        t0 = sin((1.0 - t) * ha) / sinHA;
        t1 = sin(t * ha) / sinHA;

        return result.set(
            aw * t0 + bw * t1,
            ax * t0 + bx * t1,
            ay * t0 + by * t1,
            az * t0 + bz * t1
        );
    };

    /**
     * Checks for strict equality of this quaternion and another quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {boolean}
     */
    this.equal = function (q) {

        return equal(q._w, this._w) &&
            equal(q._x, this._x) &&
            equal(q._y, this._y) &&
            equal(q._z, this._z);
    };

    this._normalize = function () {

        var w = this._w, x = this._x, y = this._y, z = this._z,
            sl = w * w + x * x + y * y + z * z;

        if (sl < EPSILON) {
            this._w = 1.0;
            this._x = 0.0;
            this._y = 0.0;
            this._z = 0.0;

        } else {
            sl = 1.0 / sqrt(sl);
            this._w *= sl;
            this._x *= sl;
            this._y *= sl;
            this._z *= sl;
        }
        return this;
    };
};

/**
 * Represents a unit quaternion.
 *
 * To create the object use [B.Math.makeQuaternion()]{@link B.Math.makeQuaternion}.
 *
 * *Note: the order of transformations coincides with the order in which the quaternions are
 *  multiplied (from left to right).*
 *
 * @class
 * @this B.Math.Quaternion
 */
B.Math.Quaternion = function (w, x, y, z) {

    this._w = (w !== undefined) ? w : 1.0;
    this._x = x || 0.0;
    this._y = y || 0.0;
    this._z = z || 0.0;

    this._normalize();
};

B.Math.Quaternion.prototype = new B.Math.QuaternionProto();

/**
 * Identity quaternion.
 *
 * @constant
 * @type {B.Math.Quaternion}
 * @default {w: 1.0, x: 0.0, y: 0.0, z: 0.0}
 */
B.Math.Quaternion.IDENTITY = B.Math.makeQuaternion();


/**
 * @ignore
 * @this B.Math.Angles
 */
B.Math.AnglesProto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,
        ONE_MINUS_EPSILON = 1.0 - EPSILON,

        equal = M.equal,
        min = Math.min,
        max = Math.max,
        abs = Math.abs,
        asin = Math.asin,
        atan2 = Math.atan2,

        clamp = function (v) {
            return min(max(v, -1.0), 1.0);
        };

    /**
     * Clones this angles to a new angles object.
     *
     * @returns {B.Math.Angles} this
     */
    this.clone = function () {

        return M.makeAngles(this._yaw, this._pitch, this._roll);
    };

    /**
     * Copies a given angles object into this angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {B.Math.Angles} this
     */
    this.copy = function (angles) {

        this._yaw = angles._yaw;
        this._pitch = angles._pitch;
        this._roll = angles._roll;

        return this;
    };

    /**
     * Sets all elements and performs canonization.
     *
     * @param {number} yaw
     * @param {number} pitch
     * @param {number} roll
     * @returns {B.Math.Angles} this
     */
    this.set = function (yaw, pitch, roll) {

        this._yaw = yaw;
        this._pitch = pitch;
        this._roll = roll;

        return this._canonize();
    };

    /**
     * Gets an element by its index.
     *
     * @param {number} index
     * @returns {number}
     * @throws {Error} if the index is out of range
     */
    this.get = function (index) {

        switch (index) {
        case 0:
            return this._yaw;
        case 1:
            return this._pitch;
        case 2:
            return this._roll;
        default:
            throw new Error("Angles the index is out of range");
        }
    };

    /**
     * Sets yaw angle (rotation around global Y-axis) and performs canonization.
     * Range: [-PI, PI].
     *
     * @function B.Math.Angles#yaw
     * @param {number} angle
     * @returns {B.Math.Angles} this
     */
    /**
     * Gets yaw angle (rotation around global Y-axis).
     * Range: [-PI, PI].
     *
     * @function B.Math.Angles#yaw
     * @returns {number}
     */
    this.yaw = function (angle) {

        if (arguments.length === 0) {
            return this._yaw;
        }
        this._yaw = angle;
        return this._canonize();
    };

    /**
     * Sets pitch angle (rotation around local X-axis) and performs canonization.
     * Range: [-PI/2, PI/2].
     *
     * @function B.Math.Angles#pitch
     * @param {number} angle
     * @returns {B.Math.Angles} this
     */
    /**
     * Gets pitch angle (rotation around local X-axis).
     *
     * @function B.Math.Angles#pitch
     * @returns {number}
     */
    this.pitch = function (angle) {

        if (arguments.length === 0) {
            return this._pitch;
        }
        this._pitch = angle;
        return this._canonize();
    };

    /**
     * Sets roll angle (rotation around local Z-axis) and performs canonization.
     * Range: [-PI, PI].
     *
     * @function B.Math.Angles#roll
     * @param {number} angle
     * @returns {B.Math.Angles} this
     */
    /**
     * Gets roll angle (rotation around local Z-axis).
     *
     * @function B.Math.Angles#roll
     * @returns {number}
     */
    this.roll = function (angle) {

        if (arguments.length === 0) {
            return this._roll;
        }
        this._roll = angle;
        return this._canonize();
    };

    /**
     * Sets this angles from a part of array and performs canonization.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        this._yaw = array[offset];
        this._pitch = array[offset + 1];
        this._roll = array[offset + 2];
        this._canonize();

        return offset + 3;
    };

    /**
     * Sets this angles to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        array[offset] = this._yaw;
        array[offset + 1] = this._pitch;
        array[offset + 2] = this._roll;

        return offset + 3;
    };

    /**
     * Sets this angles from any rotation matrix.
     *
     * @function
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Math.Angles} this
     */
    this.fromRotationMatrix = (function () {

        var mx3 = M.makeMatrix3();

        return function (matrix) {

            // deriving angles from the Angles->Matrix3 conversion matrix

            var m = (matrix instanceof M.Matrix4) ?
                    matrix.getMatrix3(mx3).m : matrix.m,
                m7 = clamp(m[7]);

            this._pitch = asin(-m7);

            if (abs(m7) < ONE_MINUS_EPSILON) {
                this._yaw = atan2(m[6], m[8]);
                this._roll = atan2(m[1], m[4]);
            } else {
                this._yaw = atan2((m7 < 0.0) ? m[3] : -m[3], m[0]);
                this._roll = 0.0;
            }
            return this;
        };
    }());

    /**
     * Sets this angles from a quaternion.
     *
     * @param {B.Math.Quaternion} q
     * @returns {B.Math.Angles} this
     */
    this.fromQuaternion = function (q) {

        // deriving angles from the Angles->Matrix3 and Quaternion->Matrix3 conversion matrices

        var x = q._x, y = q._y, z = q._z, w = q._w,
            x2 = x * 2.0, y2 = y * 2.0, z2 = z * 2.0,
            m7 = clamp(y * z2 - w * x2);

        this._pitch = asin(-m7);

        if (abs(m7) < ONE_MINUS_EPSILON) {
            this._yaw = atan2(x * z2 + w * y2, 1.0 - x * x2 - y * y2);
            this._roll = atan2(x * y2 + w * z2, 1.0 - x * x2 - z * z2);
        } else {
            this._yaw = atan2((m7 < 0.0) ? (x * y2 - w * z2) : (w * z2 - x * y2),
                1.0 - y * y2 - z * z2);
            this._roll = 0.0;
        }
        return this;
    };

    /**
     * Checks for strict equality of this angles and another angles.
     *
     * @param {B.Math.Angles} angles
     * @returns {boolean}
     */
    this.equal = function (angles) {

        return equal(angles._yaw, this._yaw) &&
            equal(angles._pitch, this._pitch) &&
            equal(angles._roll, this._roll);
    };

    this._canonize = (function () {

        var PI = Math.PI,
            HALF_PI = PI * 0.5,
            TWO_PI = PI * 2.0,
            ONE_OVER_TWO_PI = 1.0 / TWO_PI,

            floor = Math.floor,

            wrap = function (a) {

                if (a < -PI || a > PI) {
                    a += PI;
                    a -= floor(a * ONE_OVER_TWO_PI) * TWO_PI;
                    a -= PI;
                }
                return a;
            };

        return function () {

            var yaw = this._yaw, pitch = this._pitch, roll = this._roll;

            pitch = wrap(pitch);

            if (pitch < -HALF_PI) {
                pitch = -PI - pitch;
                yaw += PI;
                roll += PI;
            } else if (pitch > HALF_PI) {
                pitch = PI - pitch;
                yaw += PI;
                roll += PI;
            }
            if (abs(HALF_PI - abs(pitch)) < EPSILON) {
                yaw = (pitch < 0.0) ? yaw + roll : yaw - roll;
                roll = 0.0;
            } else {
                roll = wrap(roll);
            }
            yaw = wrap(yaw);

            this._yaw = yaw;
            this._pitch = pitch;
            this._roll = roll;

            return this;
        };
    }());
};

/**
 * Represents canonical Euler angles.
 *
 * To create the object use [B.Math.makeAngles()]{@link B.Math.makeAngles}.
 *
 * @class
 * @this B.Math.Angles
 */
B.Math.Angles = function (yaw, pitch, roll) {

    this._yaw = yaw || 0.0;
    this._pitch = pitch || 0.0;
    this._roll = roll || 0.0;

    this._canonize();
};

B.Math.Angles.prototype = new B.Math.AnglesProto();


/**
 * @ignore
 * @this B.Math.Plane
 */
B.Math.PlaneProto = function () {

    var M = B.Math,
        T = M.Type,
        EPSILON = M.EPSILON,

        equal = M.equal,
        abs = Math.abs,
        sqrt = Math.sqrt,
        min = Math.min,
        max = Math.max;

    this._type = function () {

        return T.PLANE;
    };

    /**
     * Clones this plane to a new plane.
     *
     * @returns {B.Math.Plane} this
     */
    this.clone = function () {

        return M.makePlane(this.normal.clone(), this.distance);
    };

    /**
     * Copies a given plane into this plane.
     *
     * @param {B.Math.Plane} plane
     * @returns {B.Math.Plane} this
     */
    this.copy = function (plane) {

        this.normal.copy(plane.normal);
        this.distance = plane.distance;

        return this;
    };

    /**
     * Sets this plane from a normal and a distance.
     *
     * @param {B.Math.Vector3} normal
     * @param {number} distance
     * @returns {B.Math.Plane} this
     */
    this.set = function (normal, distance) {

        this.normal.copy(normal);
        this.distance = distance;

        return this;
    };

    /**
     * Sets this plane from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.normal.fromArray(array, offset);
        this.distance = array[offset];

        return offset + 1;
    };

    /**
     * Sets this plane to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.normal.toArray(array, offset);
        array[offset] = this.distance;

        return offset + 1;
    };

    /**
     * Sets this plane from a normal and a point.
     *
     * @param {B.Math.Vector3} normal
     * @param {B.Math.Vector3} point
     * @returns {B.Math.Plane} this
     */
    this.fromNormalPoint = function (normal, point) {

        this.normal.copy(normal).normalize();
        this.distance = point.dot(this.normal);

        return this;
    };

    /**
     * Sets this plane from three coplanar points.
     *
     * @function
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @param {B.Math.Vector3} c
     * @returns {B.Math.Plane} this
     */
    this.fromCoplanarPoints = (function () {

        var v = M.makeVector3();

        return function (a, b, c) {

            this.normal.subVectors(c, b).cross(v.subVectors(a, b)).normalize();
            this.distance = a.dot(this.normal);

            return this;
        };
    }());

    /**
     * Translates this plane by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Plane} this
     */
    this.translate = function (offset) {

        this.distance += offset.dot(this.normal);
        return this;
    };

    /**
     * Transforms this plane by a 4x4 matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Plane} this
     */
    this.transform = (function () {

        var v = M.makeVector4(),
            mx = M.makeMatrix4();

        return function (matrix) {

            var n = this.normal;

            v.set(n.x, n.y, n.z, -this.distance);
            v.transform(mx.copy(matrix).invert().transpose());

            this.normal.set(v.x, v.y, v.z);
            this.distance = -v.w;

            return this;
        };
    }());

    /**
     * Normalizes this plane.
     *
     * @returns {B.Math.Plane} this
     */
    this.normalize = function () {

        var sl = this.normal.lengthSq();

        if (abs(1.0 - sl) > EPSILON) {
            sl = 1.0 / sqrt(sl);
            this.normal.mul(sl);
            this.distance *= sl;
        }
        return this;
    };

    /**
     * Negates this plane.
     *
     * @returns {B.Math.Plane} this
     */
    this.negate = function () {

        this.normal.negate();
        this.distance *= -1.0;

        return this;
    };

    /**
     * Projects a point to this plane.
     *
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} projected point
     */
    this.projectPoint = function (point, result) {

        var v = result || M.makeVector3();

        v.copy(this.normal).mul(this.normal.dot(point) - this.distance);
        return v.sub(point).negate();
    };

    /**
     * Calculates the shortest distance between this plane and an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Plane | B.Math.Ray | B.Math.Segment |
     *     B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @returns {number} distance
     * @throws {Error} if the object argument has unsupported type
     */
    this.distanceTo = (function () {

        var
            distanceToPoint = function (plane, point) {
                return plane.normal.dot(point) - plane.distance;
            },

            calls = [];

        calls[T.POINT] = distanceToPoint;

        calls[T.PLANE] = function (planeA, planeB) {

            var da = planeA.distance, db = planeB.distance,
                dot = planeA.normal.dot(planeB.normal);

            if(abs(1.0 - abs(dot)) > EPSILON) {
                return 0.0;
            }
            return (dot > 0.0) ? (db - da) : -(db + da);
        };

        calls[T.RAY] = function (plane, ray) {

            var d = distanceToPoint(plane, ray.origin), dotND;

            if (d !== 0.0) {
                dotND = plane.normal.dot(ray.direction);
                if (d * dotND < 0.0) {
                    return 0.0;
                }
            }
            return d;
        };

        calls[T.SEGMENT] = function (plane, segment) {

            var ds = distanceToPoint(plane, segment.start),
                de = distanceToPoint(plane, segment.end);

            if (ds * de <= 0.0) {
                return 0.0;
            }
            return (ds > 0.0) ? min(ds, de) : max(ds, de);
        };

        calls[T.TRIANGLE] = function (plane, triangle) {

            var da = plane.distanceTo(triangle.a),
                db = plane.distanceTo(triangle.b),
                dc = plane.distanceTo(triangle.c);

            if (da * db <= 0.0 || da * dc <= 0.0) {
                return 0.0;
            }
            return (da > 0.0) ? min(min(da, db), dc) : max(max(da, db), dc);
        };

        calls[T.AABOX] = (function () {

            var p0 = M.makeVector3(),
                p1 = M.makeVector3();

            return function (plane, aabox) {

                var d0, d1, n = plane.normal,
                    bmin = aabox.min, bmax = aabox.max;

                p0.x = (n.x > 0.0) ? bmin.x : bmax.x;
                p1.x = (n.x > 0.0) ? bmax.x : bmin.x;
                p0.y = (n.y > 0.0) ? bmin.y : bmax.y;
                p1.y = (n.y > 0.0) ? bmax.y : bmin.y;
                p0.z = (n.z > 0.0) ? bmin.z : bmax.z;
                p1.z = (n.z > 0.0) ? bmax.z : bmin.z;

                d0 = distanceToPoint(plane, p0);
                d1 = distanceToPoint(plane, p1);

                if (d0 * d1 <= 0.0) {
                    return 0.0;
                }
                return (d0 > 0.0) ? min(d0, d1) : max(d0, d1);
            };
        }());

        calls[T.SPHERE] = function (plane, sphere) {

            var d = distanceToPoint(plane, sphere.center),
                r = sphere.radius;

            if (abs(d) <= r) {
                return 0.0;
            }
            return (d > 0.0) ? (d - r) : (d + r);
        };

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            return func(this, object);
        };
    }());

    /**
     * Tests relation between this plane and an object.
     *
     * @param {B.Math.Vector3 | B.Math.Plane | B.Math.Ray | B.Math.Segment |
     *     B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @param {B.Math.Relation} relation
     * @returns {boolean}
     * @throws {Error} if the object argument has unsupported type.
     */
    this.test = function (object, relation) {

        return M.testRelationByDistance(this.distanceTo(object), relation);
    };

    /**
     * Checks for strict equality of this plane and another plane.
     *
     * @param {B.Math.Plane} plane
     * @returns {boolean}
     */
    this.equal = function (plane) {

        return plane.normal.equal(this.normal) && equal(plane.distance, this.distance);
    };
};

/**
 * Represents a plane.
 *
 * To create the object use [B.Math.makePlane()]{@link B.Math.makePlane}.
 *
 * @class
 * @this B.Math.Plane
 */
B.Math.Plane = function (normal, distance) {

    /**
     * Normal of the plane.
     *
     * @type {B.Math.Vector3}
     */
    this.normal = normal || B.Math.Vector3.Y.clone();

    /**
     * Distance to the plane along the normal.
     *
     * @type {number}
     */
    this.distance = distance || 0.0;
};

B.Math.Plane.prototype = new B.Math.PlaneProto();

/**
 * Positive direction along X-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.X}, distance: 0}
 */
B.Math.Plane.X = B.Math.makePlane(B.Math.Vector3.X);

/**
 * Positive direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.Y}, distance: 0}
 */
B.Math.Plane.Y = B.Math.makePlane(B.Math.Vector3.Y);

/**
 * Positive direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.Z}, distance: 0}
 */
B.Math.Plane.Z = B.Math.makePlane(B.Math.Vector3.Z);

/**
 * Negative direction along X-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.N_X}, distance: 0}
 */
B.Math.Plane.N_X = B.Math.makePlane(B.Math.Vector3.N_X);

/**
 * Negative direction along Y-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.N_Y}, distance: 0}
 */
B.Math.Plane.N_Y = B.Math.makePlane(B.Math.Vector3.N_Y);

/**
 * Negative direction along Z-axis.
 *
 * @constant
 * @type {B.Math.Plane}
 * @default {normal: {@link B.Math.Vector3.N_Z}, distance: 0}
 */
B.Math.Plane.N_Z = B.Math.makePlane(B.Math.Vector3.N_Z);


/**
 * @ignore
 * @this B.Math.Ray
 */
B.Math.RayProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.RAY;
    };

    /**
     * Clones this ray to a new ray.
     *
     * @returns {B.Math.Ray} this
     */
    this.clone = function () {

        return M.makeRay(this.origin, this.direction);
    };

    /**
     * Copies a given ray into this ray.
     *
     * @param {B.Math.Ray} ray
     * @returns {B.Math.Ray} this
     */
    this.copy = function (ray) {

        this.origin.copy(ray.origin);
        this.direction.copy(ray.direction);

        return this;
    };

    /**
     * Sets this ray from an origin and a direction.
     *
     * @param {B.Math.Vector3} origin
     * @param {B.Math.Vector3} direction
     * @returns {B.Math.Ray} this
     */
    this.set = function (origin, direction) {

        this.origin.copy(origin);
        this.direction.copy(direction);

        return this;
    };

    /**
     * Sets this ray from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.origin.fromArray(array, offset);
        offset = this.direction.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this ray to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.origin.toArray(array, offset);
        offset = this.direction.toArray(array, offset);

        return offset;
    };

    /**
     * Sets this ray from an origin and a target.
     *
     * @param {B.Math.Vector3} origin
     * @param {B.Math.Vector3} target
     * @returns {B.Math.Ray} this
     */
    this.fromOriginTarget = function (origin, target) {

        this.origin.copy(origin);
        this.direction.copy(target).sub(origin).normalize();

        return this;
    };

    /**
     * Translates this ray by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Ray} this
     */
    this.translate = function (offset) {

        this.origin.add(offset);
        return this;
    };

    /**
     * Transforms this ray by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Ray} this
     */
    this.transform = function (matrix) {

        this.direction.add(this.origin).transform(matrix);
        this.origin.transform(matrix);
        this.direction.sub(this.origin);

        return this;
    };

    /**
     * Gets a point at this ray.
     *
     * @param {number} t [0, +Infinity]
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} point
     */
    this.at = function (t, result) {

        var v = result || M.makeVector3();

        return v.copy(this.direction).mul(t).add(this.origin);
    };

    /**
     * Projects a point to this ray.
     *
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} projected point
     */
    this.projectPoint = function (point, result) {

        var v = result || M.makeVector3(),
            orig = this.origin, dir = this.direction,
            dot = v.subVectors(point, orig).dot(dir);

        if (dot <= 0.0) {
            return v.copy(orig);
        }
        return v.copy(dir).mul(dot).add(orig);
    };

    /**
     * Finds the point of intersection between this ray and an object.
     *
     * @function
     * @param {B.Math.Plane | B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @param {B.Math.Vector3} [point] point of intersection
     * @returns {number | null} distance from origin or null if no intersections
     * @throws {Error} if the object argument has unsupported type
     */
    this.trace = (function () {

        var EPSILON = M.EPSILON,

            calls = [];

        calls[T.PLANE] = function (ray, plane) {

            var n = plane.normal, d = plane.distance, o = ray.origin,

                dotND = n.dot(ray.direction), t;

            if (Math.abs(dotND) < EPSILON) {
                if (Math.abs(n.dot(o) - d) < EPSILON) {
                    return 0.0;
                }
            } else {
                t = (d - n.dot(o)) / dotND;
                if (t >= 0.0) {
                    return t;
                }
            }
            return null;
        };

        calls[T.TRIANGLE] = (function () {

            var plane = M.makePlane(),
                p = M.makeVector3(),
                d = M.makeVector3(),
                e = M.makeVector3();

            return function (ray, triangle) {

                var a = triangle.a, b = triangle.b, c = triangle.c,
                    n = triangle.plane(plane).normal,

                    t = ray.trace(plane);

                if (t === null) {
                    return null;
                }
                ray.at(t, p);

                e.subVectors(b, a).cross(d.subVectors(p, a));
                if (n.dot(e) < 0.0) {
                    return null;
                }
                e.subVectors(c, b).cross(d.subVectors(p, b));
                if (n.dot(e) < 0.0) {
                    return null;
                }
                e.subVectors(a, c).cross(d.subVectors(p, c));
                if (n.dot(e) < 0.0) {
                    return null;
                }
                return t;
            };
        }());

        calls[T.AABOX] = function (ray, aabox) {

            var min = aabox.min, max = aabox.max, orig = ray.origin,
                dir = ray.direction, tMin, tMax, tMinY, tMaxY, tMinZ, tMaxZ,
                iDirX = 1.0 / dir.x, iDirY = 1.0 / dir.y, iDirZ = 1.0 / dir.z;

            if (iDirX >= 0.0) {
                tMin = (min.x - orig.x) * iDirX;
                tMax = (max.x - orig.x) * iDirX;
            } else {
                tMin = (max.x - orig.x) * iDirX;
                tMax = (min.x - orig.x) * iDirX;
            }
            if (iDirY >= 0.0) {
                tMinY = (min.y - orig.y) * iDirY;
                tMaxY = (max.y - orig.y) * iDirY;
            } else {
                tMinY = (max.y - orig.y) * iDirY;
                tMaxY = (min.y - orig.y) * iDirY;
            }
            if ((tMin > tMaxY) || (tMinY > tMax)) {
                return null;
            }
            if ((tMinY > tMin) || (tMin !== tMin)) {
                tMin = tMinY;
            }
            if ((tMaxY < tMax) || (tMax !== tMax)) {
                tMax = tMaxY;
            }
            if (iDirZ >= 0.0) {
                tMinZ = (min.z - orig.z) * iDirZ;
                tMaxZ = (max.z - orig.z) * iDirZ;
            } else {
                tMinZ = (max.z - orig.z) * iDirZ;
                tMaxZ = (min.z - orig.z) * iDirZ;
            }
            if ((tMin > tMaxZ) || (tMinZ > tMax)) {
                return null;
            }
            if (tMinZ > tMin || tMin !== tMin ) {
                tMin = tMinZ;
            }
            if (tMaxZ < tMax || tMax !== tMax ) {
                tMax = tMaxZ;
            }
            if (tMax < 0.0) {
                return null;
            }
            return (tMin >= 0.0) ? tMin : tMax;
        };

        calls[T.SPHERE] = (function () {

            var co = B.Math.makeVector3();

            return function (ray, sphere) {

                var r = sphere.radius, dir = ray.direction,
                    b, c, d, t0, t1;

                co.subVectors(ray.origin, sphere.center);

                b = 2.0 * co.dot(dir);
                c = co.dot(co) - r * r;

                d = b * b - 4.0 * c;
                if (d < 0.0) {
                    return null;
                }
                t0 = (Math.sqrt(d) - b) / 2.0;
                t1 = -(b + Math.sqrt(d)) / 2.0;

                if (t0 < 0.0 && t1 < 0.0) {
                    return null;
                }
                if (t0 * t1 < 0.0) {
                    return Math.max(t0, t1);
                }
                return Math.min(t0, t1);
            };
        }());

        return function (object, point) {

            var type = object && object._type,
                func = type && calls[type()], t;

            if (!func) {
                throw new Error("unsupported object type");
            }
            t = func(this, object);

            if (point && t !== null) {
                this.at(t, point);
            }
            return t;
        };
    }());

    /**
     * Calculates the shortest distance between this ray and an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Ray} object
     * @returns {number} distance
     * @throws {Error} if the object argument has unsupported type
     */
    this.distanceTo = (function () {

        var calls = [];

        calls[T.POINT] = (function () {

            var v = B.Math.makeVector3();

            return function (ray, point) {

                return ray.projectPoint(point, v).distanceTo(point);
            };
        }());

        calls[T.RAY] = (function () {

            var M = B.Math,
                EPSILON2 = M.EPSILON * M.EPSILON,

                v0 = M.makeVector3(),
                v1 = M.makeVector3();

            return function (rayA, rayB) {

                var origA = rayA.origin, dirA = rayA.direction,
                    origB = rayB.origin, dirB = rayB.direction,
                    tA, tB, cl2 = v0.crossVectors(dirA, dirB).lengthSq();

                if (cl2 < EPSILON2) {
                    tA = v0.subVectors(origB, origA).dot(dirA) / dirA.length();
                    if (tA < 0.0) {
                        tB = v0.subVectors(origA, origB).dot(dirB) / dirB.length();
                        if (tB < 0.0) {
                            return origA.distanceTo(origB);
                        } else {
                            return origA.distanceTo(v0.copy(dirB).mul(tB).add(origB));
                        }
                    } else {
                        return origB.distanceTo(v0.copy(dirA).mul(tA).add(origA));
                    }
                } else {
                    tA = v1.subVectors(origB, origA).cross(dirB).dot(v0) / cl2;
                    tB = v1.subVectors(origB, origA).cross(dirA).dot(v0) / cl2;
                    if (tA < 0.0) {
                        return origA.distanceTo(rayB.projectPoint(origA, v0));
                    }
                    if (tB < 0.0) {
                        return origB.distanceTo(rayA.projectPoint(origB, v0));
                    }
                    v0.copy(dirA).mul(tA).add(origA);
                    v1.copy(dirB).mul(tB).add(origB);
                    return v0.distanceTo(v1);
                }
            };
        }());

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            return func(this, object);
        };
    }());

    /**
     * Checks for strict equality of this ray and another ray.
     *
     * @param {B.Math.Ray} ray
     * @returns {boolean}
     */
    this.equal = function (ray) {

        return ray.origin.equal(this.origin) && ray.direction.equal(this.direction);
    };
};

/**
 * Represents a ray.
 *
 * To create the object use [B.Math.makeRay()]{@link B.Math.makeRay}.
 *
 * @class
 * @this B.Math.Ray
 */
B.Math.Ray = function (origin, direction) {

    var V3 = B.Math.Vector3;

    /**
     * Origin of the ray.
     *
     * @type {B.Math.Vector3}
     */
    this.origin = origin || V3.ZERO.clone();

    /**
     * Direction of the ray.
     *
     * @type {B.Math.Vector3}
     */
    this.direction = (direction && direction.normalize()) || V3.Z.clone();
};

B.Math.Ray.prototype = new B.Math.RayProto();


/**
 * @ignore
 * @this B.Math.Segment
 */
B.Math.SegmentProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.SEGMENT;
    };

    /**
     * Clones this segment to a new segment.
     *
     * @returns {B.Math.Segment} this
     */
    this.clone = function () {

        return M.makeSegment(this.start, this.end);
    };

    /**
     * Copies a given segment into this segment.
     *
     * @param {B.Math.Segment} segment
     * @returns {B.Math.Segment} this
     */
    this.copy = function (segment) {

        this.start.copy(segment.start);
        this.end.copy(segment.end);

        return this;
    };

    /**
     * Sets this segment from a start and a end points.
     *
     * @param {B.Math.Vector3} start
     * @param {B.Math.Vector3} end
     * @returns {B.Math.Segment} this
     */
    this.set = function (start, end) {

        this.start.copy(start);
        this.end.copy(end);

        return this;
    };

    /**
     * Sets this segment from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.start.fromArray(array, offset);
        offset = this.end.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this segment to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.start.toArray(array, offset);
        offset = this.end.toArray(array, offset);

        return offset;
    };

    /**
     * Translates this segment by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Segment} this
     */
    this.translate = function (offset) {

        this.start.add(offset);
        this.end.add(offset);

        return this;
    };

    /**
     * Transforms this segment by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Segment} this
     */
    this.transform = function (matrix) {

        this.start.transform(matrix);
        this.end.transform(matrix);

        return this;
    };

    /**
     * Gets the center point of this segment.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.center = function (result) {

        var v = result || M.makeVector3();

        return v.addVectors(this.start, this.end).mul(0.5);
    };

    /**
     * Gets the vector from start to end.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.delta = function (result) {

        var v = result || M.makeVector3();

        return v.subVectors(this.end, this.start);
    };

    /**
     * Gets the length of this segment.
     *
     * @returns {number}
     */
    this.length = function () {

        return this.start.distanceTo(this.end);
    };

    /**
     * Gets a point at this segment.
     *
     * @param {number} t [0, 1]
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} point
     */
    this.at = function (t, result) {

        var v = result || M.makeVector3();

        return this.delta(v).mul(t).add(this.start);
    };

    /**
     * Projects a point to this segment.
     *
     * @function
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3} projected point
     */
    this.projectPoint = (function () {

        var v0 = M.makeVector3();

        return function (point, result) {

            var v1 = result || M.makeVector3(),
                start = this.start, end = this.end,
                l2 = v0.subVectors(end, start).dot(v0),
                dot = v1.subVectors(point, start).dot(v0);

            if (dot <= 0.0) {
                return v1.copy(start);
            }
            if (dot >= l2) {
                return v1.copy(end);
            }
            return v1.copy(v0).mul(dot / l2).add(start);
        };
    }());

    /**
     * Finds the point of intersection between this segment and an object.
     *
     * @function
     * @param {B.Math.Plane | B.Math.Triangle | B.Math.AABox | B.Math.Sphere} object
     * @param {B.Math.Vector3} [point] point of intersection.
     * @returns {number | null} distance from start or null if no intersections.
     * @throws {Error} if the object argument has unsupported type
     */
    this.trace = (function () {

        var ray = M.makeRay();

        return function (object, point) {

            var t = ray.fromOriginTarget(this.start, this.end).trace(object);

            if (t !== null && t <= this.length()) {
                if (point) {
                    ray.at(t, point);
                }
                return t;
            }
            return null;
        };
    }());

    /**
     * Calculates the shortest distance between this segment and an object.
     *
     * @function
     * @param {B.Math.Vector3} object
     * @returns {number} distance
     * @throws {Error} if the object argument has unsupported type
     */
    this.distanceTo = (function () {

        var calls = [];

        calls[T.POINT] = (function () {

            var v = M.makeVector3();

            return function (segment, point) {

                return segment.projectPoint(point, v).distanceTo(point);
            };
        }());

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            return func(this, object);
        };
    }());

    /**
     * Checks for strict equality of this segment and another segment.
     *
     * @param {B.Math.Segment} segment
     * @returns {boolean}
     */
    this.equal = function (segment) {

        return segment.start.equal(this.start) && segment.end.equal(this.end);
    };
};

/**
 * Represents a segment.
 *
 * To create the object use [B.Math.makeSegment()]{@link B.Math.makeSegment}.
 *
 * @class
 * @this B.Math.Segment
 */
B.Math.Segment = function (start, end) {

    var V3 = B.Math.Vector3;

    /**
     * Start of the segment.
     *
     * @type {B.Math.Vector3}
     */
    this.start = start || V3.ZERO.clone();

    /**
     * End of the segment.
     *
     * @type {B.Math.Vector3}
     */
    this.end = end || V3.ZERO.clone();
};

B.Math.Segment.prototype = new B.Math.SegmentProto();


/**
 * @ignore
 * @this B.Math.Triangle
 */
B.Math.TriangleProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.TRIANGLE;
    };

    /**
     * Clones this triangle to a new triangle.
     *
     * @returns {B.Math.Triangle} this
     */
    this.clone = function () {

        return M.makeTriangle(this.a, this.b, this.c);
    };

    /**
     * Copies a given triangle into this triangle.
     *
     * @param {B.Math.Triangle} triangle
     * @returns {B.Math.Triangle} this
     */
    this.copy = function (triangle) {

        this.a.copy(triangle.a);
        this.b.copy(triangle.b);
        this.c.copy(triangle.c);

        return this;
    };

    /**
     * Sets this triangle from three points.
     *
     * @param {B.Math.Vector3} a
     * @param {B.Math.Vector3} b
     * @param {B.Math.Vector3} c
     * @returns {B.Math.Triangle} this
     */
    this.set = function (a, b, c) {

        this.a.copy(a);
        this.b.copy(b);
        this.c.copy(c);

        return this;
    };

    /**
     * Sets this triangle from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.a.fromArray(array, offset);
        offset = this.b.fromArray(array, offset);
        offset = this.c.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this triangle to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.a.toArray(array, offset);
        offset = this.b.toArray(array, offset);
        offset = this.c.toArray(array, offset);

        return offset;
    };

    /**
     * Translates this triangle by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Triangle} this
     */
    this.translate = function (offset) {

        this.a.add(offset);
        this.b.add(offset);
        this.c.add(offset);

        return this;
    };

    /**
     * Transforms this triangle by a 4x4 matrix.
     *
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Triangle} this
     */
    this.transform = function (matrix) {

        this.a.transform(matrix);
        this.b.transform(matrix);
        this.c.transform(matrix);

        return this;
    };

    /**
     * Gets the normal of this triangle.
     *
     * @function
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.normal = (function () {

        var ab = M.makeVector3();

        return function (result) {

            var a = this.a, b = this.b, c = this.c,
                v = result || M.makeVector3();

            return v.subVectors(c, b).cross(ab.subVectors(a, b)).normalize();
        };
    }());

    /**
     * Gets the plane of this triangle.
     *
     * @param {B.Math.Plane} [result] omit if you want to return newly created plane
     * @returns {B.Math.Plane}
     */
    this.plane = function (result) {

        var v = result || M.makePlane();

        return v.fromCoplanarPoints(this.a, this.b, this.c);
    };

    /**
     * Gets the area of this triangle.
     *
     * @function
     * @returns {number}
     */
    this.area = (function () {

        var v0 = M.makeVector3();
        var v1 = M.makeVector3();

        return function () {

            v0.subVectors(this.c, this.b);
            v1.subVectors(this.a, this.b);

            return v0.cross(v1).length() * 0.5;
        };
    }());

    /**
     * Gets the perimeter of this triangle.
     *
     * @returns {number}
     */
    this.perimeter = function () {

        var a = this.a, b = this.b, c = this.c;

        return a.distanceTo(b) + b.distanceTo(c) + c.distanceTo(a);
    };

    /**
     * Gets the centroid of this triangle.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.centroid = function (result) {

        var v = result || M.makeVector3();

        return v.addVectors(this.a, this.b).add(this.c).div(3.0);
    };

    /**
     * Computes barycentric coordinates of point for this triangle.
     *
     * @function
     * @param {B.Math.Vector3} point
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     * @throws {Error} if triangle is collinear or singular
     */
    this.barycentric = (function () {

        // explanation: http://www.blackpawn.com/texts/pointinpoly/default.html

        var v0 = M.makeVector3();
        var v1 = M.makeVector3();
        var v2 = M.makeVector3();

        return function (point, result) {

            var out = result || M.makeVector3(),
                a = this.a, b = this.b, c = this.c,
                d00, d01, d02, d11, d12, denom, invDenom, u, v;

            v0.subVectors(c, a);
            v1.subVectors(b, a);
            v2.subVectors(point, a);

            d00 = v0.dot(v0);
            d01 = v0.dot(v1);
            d02 = v0.dot(v2);
            d11 = v1.dot(v1);
            d12 = v1.dot(v2);

            denom = d00 * d11 - d01 * d01;

            if (denom === 0.0) {
                throw new Error("can't compute barycentric coordinates - " +
                    "triangle is collinear or singular");
            }
            invDenom = 1.0 / denom;

            u = (d11 * d02 - d01 * d12) * invDenom;
            v = (d00 * d12 - d01 * d02) * invDenom;

            return out.set(1.0 - u - v, v, u);
        };
    }());

    /**
     * Checks for strict equality of this triangle and another triangle.
     *
     * @param {B.Math.Triangle} triangle
     * @returns {boolean}
     */
    this.equal = function (triangle) {

        return triangle.a.equal(this.a) &&
            triangle.b.equal(this.b) &&
            triangle.c.equal(this.c);
    };
};

/**
 * Represents a triangle.
 *
 * To create the object use [B.Math.makeTriangle()]{@link B.Math.makeTriangle}.
 *
 * @class
 * @this B.Math.Triangle
 */
B.Math.Triangle = function (a, b, c) {

    var V3 = B.Math.Vector3;

    /**
     * The first point.
     *
     * @type {B.Math.Vector3}
     */
    this.a = a || V3.ZERO.clone();

    /**
     * The second point.
     *
     * @type {B.Math.Vector3}
     */
    this.b = b || V3.ZERO.clone();

    /**
     * The third point.
     *
     * @type {B.Math.Vector3}
     */
    this.c = c || V3.ZERO.clone();
};

B.Math.Triangle.prototype = new B.Math.TriangleProto();


/**
 * @ignore
 * @this B.Math.AABox
 */
B.Math.AABoxProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.AABOX;
    };

    /**
     * Clones this box to a new box.
     *
     * @returns {B.Math.AABox} this
     */
    this.clone = function () {

        return M.makeAABox(this.min, this.max);
    };

    /**
     * Copies a given box into this box.
     *
     * @param {B.Math.AABox} aabox
     * @returns {B.Math.AABox} this
     */
    this.copy = function (aabox) {

        this.min.copy(aabox.min);
        this.max.copy(aabox.max);

        return this;
    };

    /**
     * Sets this box from minimum and maximum points.
     *
     * @param {B.Math.Vector3} min
     * @param {B.Math.Vector3} max
     * @returns {B.Math.AABox} this
     */
    this.set = function (min, max) {

        this.min.copy(min);
        this.max.copy(max);

        return this;
    };

    /**
     * Sets this box from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.min.fromArray(array, offset);
        offset = this.max.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this box to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.min.toArray(array, offset);
        offset = this.max.toArray(array, offset);

        return offset;
    };

    /**
     * Sets this box from a center and a size.
     *
     * @function
     * @param {B.Math.Vector3} center
     * @param {B.Math.Vector3} size
     * @returns {B.Math.AABox} this
     */
    this.fromCenterSize = (function () {

        var halfSize = M.makeVector3();

        return function (center, size) {

            halfSize.copy(size).mul(0.5);

            this.min.copy(center).sub(halfSize);
            this.max.copy(center).add(halfSize);

            return this;
        };
    }());

    /**
     * Sets this box from an array of points.
     *
     * @param {Array<B.Math.Vector3>} points
     * @returns {B.Math.AABox} this
     */
    this.fromPoints = function (points) {

        var i, l;

        this.reset();

        for (i = 0, l = points.length; i < l; i += 1) {
            this.merge(points[i]);
        }
        return this;
    };

    /**
     * Sets this box from a sphere.
     *
     * @param {B.Math.Sphere} sphere
     * @returns {B.Math.AABox} this
     */
    this.fromSphere = function (sphere) {

        var c = sphere.center, r = sphere.radius;

        this.min.copy(c).sub(r);
        this.max.copy(c).add(r);

        return this;
    };

    /**
     * Resets this box to the initial state.
     *
     * @returns {B.Math.AABox} this
     */
    this.reset = function () {

        var V3 = M.Vector3;

        this.min.copy(V3.INF);
        this.max.copy(V3.N_INF);

        return this;
    };

    /**
     * Check this box for zero volume.
     *
     * @returns {boolean}
     */
    this.empty = function () {

        var min = this.min, max = this.max;

        return (max.x <= min.x) || (max.y <= min.y) || (max.z <= min.z);
    };

    /**
     * Returns the center of this box.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.center = function (result) {

        var v = result || M.makeVector3();

        return v.copy(this.min).add(this.max).mul(0.5);
    };

    /**
     * Returns the size of this box.
     *
     * @param {B.Math.Vector3} [result] omit if you want to return newly created vector
     * @returns {B.Math.Vector3}
     */
    this.size = function (result) {

        var v = result || M.makeVector3();

        return v.copy(this.max).sub(this.min);
    };

    /**
     * Returns corner points of this box.
     *
     * @function
     * @param {Array<B.Math.Vector3>} [result] omit if you want to return newly created array
     * @returns {Array<B.Math.Vector3>}
     */
    this.cornerPoints = (function () {

        var
            assign = function (array, index, x, y, z) {

                if (!array[index]) {
                    array[index] = M.makeVector3();
                }
                array[index].set(x, y, z);
                return index + 1;
            };

        return function (result) {

            var min = this.min, max = this.max,
                minX = min.x, minY = min.y, minZ = min.z,
                maxX = max.x, maxY = max.y, maxZ = max.z,
                i = 0;

            result = result || [];

            i = assign(result, i, minX, minY, minZ);
            i = assign(result, i, minX, minY, maxZ);
            i = assign(result, i, minX, maxY, minZ);
            i = assign(result, i, minX, maxY, maxZ);
            i = assign(result, i, maxX, minY, minZ);
            i = assign(result, i, maxX, minY, maxZ);
            i = assign(result, i, maxX, maxY, minZ);
            i = assign(result, i, maxX, maxY, maxZ);

            result.length = i;

            return result;
        };
    }());

    /**
     * Translates this box by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.AABox} this
     */
    this.translate = function (offset) {

        this.min.add(offset);
        this.max.add(offset);

        return this;
    };

    /**
     * Transforms this box by a 4x4 matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.AABox} this
     */
    this.transform = (function () {

        var points = [];

        return function (matrix) {

            var i, l;

            this.cornerPoints(points);

            for (i = 0, l = points.length; i < l; i += 1) {
                points[i].transform(matrix);
            }
            return this.fromPoints(points);
        };
    }());

    /**
     * Merges this box with an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Segment | B.Math.Triangle | B.Math.AABox
     *  | B.Math.Sphere} object
     * @returns {B.Math.AABox} this
     * @throws {Error} if the object argument has unsupported type.
     */
    this.merge = (function () {

        var calls = [],

            mergePoint = function (aabox, point) {

                var min = aabox.min, max = aabox.max,
                    px = point.x, py = point.y, pz = point.z;

                if (min.x > px) {
                    min.x = px;
                }
                if (min.y > py) {
                    min.y = py;
                }
                if (min.z > pz) {
                    min.z = pz;
                }
                if (max.x < px) {
                    max.x = px;
                }
                if (max.y < py) {
                    max.y = py;
                }
                if (max.z < pz) {
                    max.z = pz;
                }
            };

        calls[T.POINT] = function (point) {

            mergePoint(this, point);
        };

        calls[T.SEGMENT] = function (segment) {

            mergePoint(this, segment.start);
            mergePoint(this, segment.end);
        };

        calls[T.TRIANGLE] = function (triangle) {

            mergePoint(this, triangle.a);
            mergePoint(this, triangle.b);
            mergePoint(this, triangle.c);
        };

        calls[T.AABOX] = function (aabox) {

            mergePoint(this, aabox.min);
            mergePoint(this, aabox.max);
        };

        calls[T.SPHERE] = (function () {

            var p = M.makeVector3();

            return function (sphere) {

                var c = sphere.center, r = sphere.radius;

                mergePoint(this, p.copy(c).add(r));
                mergePoint(this, p.copy(c).sub(r));
            };
        }());

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            func.call(this, object);
            return this;
        };
    }());

    /**
     * Checks for strict equality of this box and another box.
     *
     * @param {B.Math.AABox} aabox
     * @returns {boolean}
     */
    this.equal = function (aabox) {

        return aabox.min.equal(this.min) && aabox.max.equal(this.max);
    };
};

/**
 * Represents an axis-aligned box.
 *
 * To create the object use [B.Math.makeAABox()]{@link B.Math.makeAABox}.
 *
 * @class
 * @this B.Math.AABox
 */
B.Math.AABox = function (min, max) {

    var V3 = B.Math.Vector3;

    /**
     * Minimum point.
     *
     * @type {B.Math.Vector3}
     */
    this.min = min ? min.clone() : V3.INF.clone();

    /**
     * Maximum point.
     *
     * @type {B.Math.Vector3}
     */
    this.max = max ? max.clone() : V3.N_INF.clone();
};

B.Math.AABox.prototype = new B.Math.AABoxProto();


/**
 * @ignore
 * @this B.Math.Sphere
 */
B.Math.SphereProto = function () {

    var M = B.Math,
        T = M.Type;

    this._type = function () {

        return T.SPHERE;
    };

    /**
     * Clones this sphere to a new sphere.
     *
     * @returns {B.Math.Sphere} this
     */
    this.clone = function () {

        return M.makeSphere(this.center, this.radius);
    };

    /**
     * Copies a given sphere into this sphere.
     *
     * @param {B.Math.Sphere} sphere
     * @returns {B.Math.Sphere} this
     */
    this.copy = function (sphere) {

        this.center.copy(sphere.center);
        this.radius = sphere.radius;

        return this;
    };

    /**
     * Sets this sphere from a center and a radius.
     *
     * @param {B.Math.Vector3} center
     * @param {number} radius
     * @returns {B.Math.Sphere} this
     */
    this.set = function (center, radius) {

        this.center.copy(center);
        this.radius = radius;

        return this;
    };

    /**
     * Sets this shere from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.center.fromArray(array, offset);
        this.radius = array[offset];

        return offset + 1;
    };

    /**
     * Sets this sphere to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.center.toArray(array, offset);
        array[offset] = this.radius;

        return offset + 1;
    };

    /**
     * Sets this sphere from an array of points.
     *
     * @function
     * @param {Array<B.Math.Vector3>} points
     * @returns {B.Math.Sphere} this
     */
    this.fromPoints = (function () {

        var min = Math.min, max = Math.max,
            vMin = M.makeVector3(),
            vMax = M.makeVector3();

        return function (points) {

            var p, i, l = points.length;

            if (l > 0) {

                vMin.copy(M.Vector3.INF);
                vMax.copy(M.Vector3.N_INF);

                for (i = 0; i < l; i += 1) {

                    p = points[i];

                    vMax.x = max(vMax.x, p.x);
                    vMax.y = max(vMax.y, p.y);
                    vMax.z = max(vMax.z, p.z);

                    vMin.x = min(vMin.x, p.x);
                    vMin.y = min(vMin.y, p.y);
                    vMin.z = min(vMin.z, p.z);
                }

                this.center.copy(vMax).sub(vMin).mul(0.5);
                this.radius = this.center.length();
                this.center.add(vMin);
            }
            return this;
        };
    }());

    /**
     * Sets this sphere from an axis-aligned box.
     *
     * @param {B.Math.AABox} aabox
     * @returns {B.Math.Sphere} this
     */
    this.fromAABox = function (aabox) {

        this.radius = aabox.size(this.center).length() * 0.5;
        aabox.center(this.center);

        return this;
    };

    /**
     * Resets this sphere to the initial state.
     *
     * @returns {B.Math.Sphere} this
     */
    this.reset = function () {

        this.center.copy(M.Vector3.ZERO);
        this.radius = 0.0;

        return this;
    };

    /**
     * Check this sphere for zero volume.
     *
     * @returns {boolean}
     */
    this.empty = function () {

        return (this.radius <= 0.0);
    };

    /**
     * Translates this sphere by a given offset.
     *
     * @param {B.Math.Vector3} offset
     * @returns {B.Math.Sphere} this
     */
    this.translate = function (offset) {

        this.center.add(offset);

        return this;
    };

    /**
     * Transforms this sphere by a 4x4 matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Sphere} this
     */
    this.transform = (function () {

        var v = M.makeVector3();

        return function (matrix) {

            this.center.transform(matrix);

            this.radius *= Math.max(Math.max(
                matrix.getAxisX(v).length(),
                matrix.getAxisY(v).length()),
                matrix.getAxisZ(v).length());

            return this;
        };
    }());

    /**
     * Merges this sphere with an object.
     *
     * @function
     * @param {B.Math.Vector3 | B.Math.Segment | B.Math.Triangle | B.Math.AABox
     *  | B.Math.Sphere} object
     * @returns {B.Math.Sphere} this
     * @throws {Error} if the object argument has unsupported type
     */
    this.merge = (function () {

        var calls = [],

            v0 = M.makeVector3(),
            v1 = M.makeVector3();

        calls[T.POINT] = function (point) {

            var d = v0.copy(point).sub(this.center).length();

            if (d > this.radius) {
                this.center.add(v0.mul(0.5));
                this.radius += (d * 0.5);
            }
        };

        calls[T.SEGMENT] = function (segment) {

            var c = this.center, r = this.radius;

            this.fromPoints([
                v0.copy(c).add(r),
                v1.copy(c).sub(r),
                segment.start,
                segment.end
            ]);
        };

        calls[T.TRIANGLE] = function (triangle) {

            var c = this.center, r = this.radius;

            this.fromPoints([
                v0.copy(c).add(r),
                v1.copy(c).sub(r),
                triangle.a,
                triangle.b,
                triangle.c
            ]);
        };

        calls[T.AABOX] = (function () {

            var points = [];

            return function (aabox) {

                var c = this.center, r = this.radius;

                aabox.cornerPoints(points);

                points.push(v0.copy(c).add(r));
                points.push(v1.copy(c).sub(r));

                this.fromPoints(points);
            };
        }());

        calls[T.SPHERE] = (function () {

            var v = M.makeVector3(),
                p0 = M.makeVector3(),
                p1 = M.makeVector3();

            return function (sphere) {

                var c0 = this.center, c1 = sphere.center,
                    r0 = this.radius, r1 = sphere.radius,
                    d = v.copy(c1).sub(c0).length();

                if (d + r0 <= r1) {
                    this.copy(sphere);

                } else if (d + r1 > r0) {
                    v.mul(1.0 / d);

                    p0.copy(v).mul(r1).add(c1);
                    p1.copy(v).negate().mul(r0).add(c0);

                    c0.copy(p1).sub(p0).mul(0.5);
                    this.radius = c0.length();
                    c0.add(p0);
                }
            };
        }());

        return function (object) {

            var type = object && object._type,
                func = type && calls[type()];

            if (!func) {
                throw new Error("unsupported object type");
            }
            func.call(this, object);
            return this;
        };
    }());

    /**
     * Checks for strict equality of this sphere and another sphere.
     *
     * @param {B.Math.Sphere} sphere
     * @returns {boolean}
     */
    this.equal = function (sphere) {

        return sphere.center.equal(this.center) && (sphere.radius === this.radius);
    };
};

/**
 * Represents a sphere.
 *
 * To create the object use [B.Math.makeSphere()]{@link B.Math.makeSphere}.
 *
 * @class
 * @this B.Math.Sphere
 */
B.Math.Sphere = function (center, radius) {

    /**
     * Center point of the sphere.
     *
     * @type {B.Math.Vector3}
     */
    this.center = center || B.Math.Vector3.ZERO.clone();

    /**
     * Radius of the sphere.
     *
     * @type {number}
     */
    this.radius = radius || 0.0;
};

B.Math.Sphere.prototype = new B.Math.SphereProto();


/**
 * @ignore
 * @this B.Math.Frustum
 */
B.Math.FrustumProto = function () {

    var M = B.Math,
        EPSILON = M.EPSILON,

        abs = Math.abs;

    /**
     * Clones this frustum to a new frustum.
     *
     * @returns {B.Math.Frustum} this
     */
    this.clone = function () {

        return M.makeFrustum(this.left, this.right, this.top,
            this.bottom, this.near, this.far);
    };

    /**
     * Copies a given frustum into this frustum.
     *
     * @param {B.Math.Frustum} frustum
     * @returns {B.Math.Frustum} this
     */
    this.copy = function (frustum) {

        this.left.copy(frustum.left);
        this.right.copy(frustum.right);
        this.top.copy(frustum.top);
        this.bottom.copy(frustum.bottom);
        this.near.copy(frustum.near);
        this.far.copy(frustum.far);

        return this;
    };

    /**
     * Sets this frustum from planes.
     *
     * @param {B.Math.Plane} left
     * @param {B.Math.Plane} right
     * @param {B.Math.Plane} top
     * @param {B.Math.Plane} bottom
     * @param {B.Math.Plane} near
     * @param {B.Math.Plane} far
     * @returns {B.Math.Frustum} this
     */
    this.set = function (left, right, top, bottom, near, far) {

        this.left.copy(left);
        this.right.copy(right);
        this.top.copy(top);
        this.bottom.copy(bottom);
        this.near.copy(near);
        this.far.copy(far);

        return this;
    };

    /**
     * Sets this frustum from a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.fromArray = function (array, offset) {

        offset = offset || 0;

        offset = this.left.fromArray(array, offset);
        offset = this.right.fromArray(array, offset);
        offset = this.top.fromArray(array, offset);
        offset = this.bottom.fromArray(array, offset);
        offset = this.near.fromArray(array, offset);
        offset = this.far.fromArray(array, offset);

        return offset;
    };

    /**
     * Sets this frustum to a part of array.
     *
     * @param {Array<number>} array
     * @param {number} [offset=0]
     * @returns {number} new offset
     */
    this.toArray = function (array, offset) {

        offset = offset || 0;

        offset = this.left.toArray(array, offset);
        offset = this.right.toArray(array, offset);
        offset = this.top.toArray(array, offset);
        offset = this.bottom.toArray(array, offset);
        offset = this.near.toArray(array, offset);
        offset = this.far.toArray(array, offset);

        return offset;
    };

    /**
     * Sets this frustum from a view-projection matrix.
     *
     * @function
     * @param {B.Math.Matrix4} matrix
     * @returns {B.Math.Frustum} this
     */
    this.fromMatrix = (function () {

        var v = M.makeVector3();

        return function (matrix) {

            // explanation: http://www.cs.otago.ac.nz/postgrads/alexis/planeExtraction.pdf

            var m = matrix.m,
                m00 = m[0], m10 = m[1], m20 = m[2], m30 = m[3],
                m01 = m[4], m11 = m[5], m21 = m[6], m31 = m[7],
                m02 = m[8], m12 = m[9], m22 = m[10], m32 = m[11],
                m03 = m[12], m13 = m[13], m23 = m[14], m33 = m[15];

            // distance = -(d)
            this.left.set(v.set(m30 + m00, m31 + m01, m32 + m02), -(m33 + m03)).normalize();
            this.right.set(v.set(m30 - m00, m31 - m01, m32 - m02), -(m33 - m03)).normalize();
            this.top.set(v.set(m30 - m10, m31 - m11, m32 - m12), -(m33 - m13)).normalize();
            this.bottom.set(v.set(m30 + m10, m31 + m11, m32 + m12), -(m33 + m13)).normalize();
            this.near.set(v.set(m30 + m20, m31 + m21, m32 + m22), -(m33 + m23)).normalize();
            this.far.set(v.set(m30 - m20, m31 - m21, m32 - m22), -(m33 - m23)).normalize();

            return this;
        };
    }());

    /**
     * Returns corner points of this frustum.
     *
     * @function
     * @param {Array<B.Math.Vector3>} [result] omit if you want to return newly created array
     * @returns {Array<B.Math.Vector3>}
     * @throws {Error} if frustum has invalid set of planes
     */
    this.cornerPoints = (function () {

        var v = M.makeVector3(),

            intersect = function (p0, p1, p2, array, index) {

                var n0 = p0.normal, d0 = p0.distance,
                    n1 = p1.normal, d1 = p1.distance,
                    n2 = p2.normal, d2 = p2.distance, denom;

                if (!array[index]) {
                    array[index] = M.makeVector3();
                }
                denom = array[index].crossVectors(n1, n2).dot(n0);
                if (abs(denom) < EPSILON) {
                    throw new Error("Frustum has invalid set of planes");
                }
                array[index].mul(d0).
                    add(v.crossVectors(n0, n1).mul(d2)).
                    add(v.crossVectors(n2, n0).mul(d1)).
                    div(denom);
            };

        return function (result) {

            var near = this.near, far = this.far,
                top = this.top, bottom = this.bottom,
                left = this.left, right = this.right;

            result = result || [];

            intersect(near, top, left, result, 0);
            intersect(near, top, right, result, 1);
            intersect(near, bottom, left, result, 2);
            intersect(near, bottom, right, result, 3);
            intersect(far, top, left, result, 4);
            intersect(far, top, right, result, 5);
            intersect(far, bottom, left, result, 6);
            intersect(far, bottom, right, result, 7);

            return result;
        };
    }());

    /**
     * Check if this frustum contains an object.
     *
     * @param {B.Math.Vector3 | B.Math.Segment | B.Math.Triangle | B.Math.AABox
     *  | B.Math.Sphere} object
     * @returns {boolean}
     * @throws {Error} if the object argument has unsupported type
     */
    this.contain = function (object) {

        return this.left.distanceTo(object) >= 0.0 &&
            this.right.distanceTo(object) >= 0.0 &&
            this.top.distanceTo(object) >= 0.0 &&
            this.bottom.distanceTo(object) >= 0 &&
            this.near.distanceTo(object) >= 0 &&
            this.far.distanceTo(object) >= 0;
    };

    /**
     * Checks for strict equality of this frustum and another frustum.
     *
     * @param {B.Math.Frustum} frustum
     * @returns {boolean}
     */
    this.equal = function (frustum) {

        return this.left.equal(frustum.left) &&
            this.right.equal(frustum.right) &&
            this.top.equal(frustum.top) &&
            this.bottom.equal(frustum.bottom) &&
            this.near.equal(frustum.near) &&
            this.far.equal(frustum.far);
    };
};


/**
 * Represents a frustum.
 *
 * To create the object use [B.Math.makeFrustum()]{@link B.Math.makeFrustum}.
 *
 * @class
 * @this B.Math.Frustum
 */
B.Math.Frustum = function (left, right, top, bottom, near, far) {

    var P = B.Math.Plane;

    /**
     * Left plane.
     *
     * @type {B.Math.Plane}
     */
    this.left = left || P.X.clone();

    /**
     * Right plane.
     *
     * @type {B.Math.Plane}
     */
    this.right = right || P.N_X.clone();

    /**
     * Top plane.
     *
     * @type {B.Math.Plane}
     */
    this.top = top || P.N_Y.clone();

    /**
     * Bottom plane.
     *
     * @type {B.Math.Plane}
     */
    this.bottom = bottom || P.Y.clone();

    /**
     * Near plane.
     *
     * @type {B.Math.Plane}
     */
    this.near = near || P.Z.clone();

    /**
     * Far plane.
     *
     * @type {B.Math.Plane}
     */
    this.far = far || P.N_Z.clone();
};

B.Math.Frustum.prototype = new B.Math.FrustumProto();


/**
 * Contains a set of primitives that provide staging graphics core architecture.
 *
 * @namespace B.Render
 */
B.Render = {};


/**
 * Color mask.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Mask = {

    /**
     * Red component.
     *
     * @constant
     */
    R: 1,

    /**
     * Green component.
     *
     * @constant
     */
    G: 2,

    /**
     * Blue component.
     *
     * @constant
     */
    B: 4,

    /**
     * Alpha component.
     *
     * @constant
     */
    A: 8,

    /**
     * Red, Green, Blue components.
     *
     * @constant
     */
    RGB: 7,

    /**
     * Red, Green, Blue, Alpha components.
     *
     * @constant
     */
    RGBA: 15
};

B.Render.applyColorMask = function (gl, mask) {

    var M = B.Render.Mask,
        r = mask & M.R,
        g = mask & M.G,
        b = mask & M.B,
        a = mask & M.A;

    gl.colorMask(r, g, b, a);
};


/**
 * Describe a webgl-context settings.
 *
 * See: http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2
 *
 * @typedef B.Render~WebglSettings
 * @type {Object}
 * @property {boolean} [antialias=true]
 * @property {boolean} [premultipliedAlpha=true]
 * @property {boolean} [preserveDrawingBuffer=true]
 * @property {boolean} [preferLowPowerToHighPerformance=true]
 * @property {boolean} [failIfMajorPerformanceCaveat=true]
 */

/**
 * Makes a rendering device.
 *
 * @param {HTMLCanvasElement} canvas rendering output
 * @param {B.Render.Format} [colorFormat={@link B.Render.Format.RGB}]
 *  color target format (supported formats are {@link B.Render.Format.RGB}
 *  and {@link B.Render.Format.RGBA})
 * @param {B.Render.Format | false} [depthFormat={@link B.Render.Format.DEPTH}]
 *  depth-stencil target format (supported formats are
 *  {@link B.Render.Format.DEPTH} and
 *  {@link B.Render.Format.DEPTH_STENCIL}) or **false** to disable depth
 * @param {B.Render~WebglSettings} [settings] webgl-context settings
 * @returns {B.Render.Device}
 * @throws {B.Render.Error} if WebGL is not supported or target parameters are incorrect
 *
 * @example
 * var device = B.Render.makeDevice(canvas);
 *
 * var device = B.Render.makeDevice(canvas, B.Render.Format.RGB, false);
 *
 * var device = B.Render.makeDevice(canvas, B.Render.Format.RGB, B.Render.Format.DEPTH_STENCIL,
 *     {
 *         antialias: false,
 *         premultipliedAlpha: false
 *     }
 * );
 */
B.Render.makeDevice = function (canvas, colorFormat, depthFormat, settings) {

    return new B.Render.Device(canvas, colorFormat, depthFormat, settings);
};


/**
 * Returns true if numeric value is power of two, false otherwise.
 *
 * @param {number} value
 * @returns {boolean}
 */
B.Render.isPowerOfTwo = function (value) {

    var log2 = Math.log(value) / Math.LN2;

    return (log2 - Math.floor(log2) === 0);
};

/**
 * Converts numeric value to closest power of two.
 *
 * @param {number} value
 * @returns {number}
 */
B.Render.toPowerOfTwo = function (value) {

    var log2 = Math.log(value) / Math.LN2;

    return Math.pow(2, Math.ceil(log2));
};


/**
 * Generates a quad mesh.
 *
 * The mesh will have positions, normals, tangents and uv-coordinates.
 *
 * @function
 * @param {B.Render.Device} device
 * @param {number} [xSize=1.0]
 * @param {number} [ySize=1.0]
 * @param {number} [uScale=1.0]
 * @param {number} [vScale=1.0]
 * @returns {B.Render.Mesh}
 */
B.Render.genQuad = (function () {

    var R = B.Render;

    return function (device, xSize, ySize, uScale, vScale) {

        var phx = (xSize || 1.0) * 0.5, nhx = -phx,
            phy = (ySize || 1.0) * 0.5, nhy = -phy,
            us = uScale || 1.0,
            vs = vScale || 1.0,
            v = [
                nhx, nhy, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0,
                phx, nhy, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, us, 0.0,
                phx, phy, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, us, vs,
                nhx, phy, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, vs
            ],
            i = [
                0, 1, 2,
                2, 3, 0
            ];

        return device.makeMesh().
            attribute("position", R.Attribute.POSITION).
            attribute("normal", R.Attribute.NORMAL).
            attribute("tangent", R.Attribute.TANGENT).
            attribute("uv", R.Attribute.UV).
            vertices(v).
            indices(i);
    };
}());

/**
 * Generates a box mesh.
 *
 * The mesh will have positions, normals, tangents and uv-coordinates.
 *
 * @function
 * @param {B.Render.Device} device
 * @param {number} [xSize=1.0]
 * @param {number} [ySize=1.0]
 * @param {number} [zSize=1.0]
 * @param {number} [uScale=1.0]
 * @param {number} [vScale=1.0]
 * @returns {B.Render.Mesh}
 */
B.Render.genBox = (function () {

    var R = B.Render;

    return function (device, xSize, ySize, zSize, uScale, vScale) {

        var phx = (xSize || 1.0) * 0.5, nhx = -phx,
            phy = (ySize || 1.0) * 0.5, nhy = -phy,
            phz = (zSize || 1.0) * 0.5, nhz = -phz,
            us = uScale || 1.0,
            vs = vScale || 1.0,
            v = [
                nhx, nhy, phz, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0,
                nhx, nhy, nhz, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, us, 0.0,
                nhx, phy, nhz, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, us, vs,
                nhx, phy, phz, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, vs,
                nhx, nhy, nhz, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, us, 0.0,
                nhx, nhy, phz, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, us, vs,
                phx, nhy, phz, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, 0.0, vs,
                phx, nhy, nhz, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0,
                nhx, nhy, nhz, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0,
                phx, nhy, nhz, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, us, 0.0,
                phx, phy, nhz, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, us, vs,
                nhx, phy, nhz, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, 0.0, vs,
                phx, nhy, nhz, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
                phx, nhy, phz, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, us, 0.0,
                phx, phy, phz, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, us, vs,
                phx, phy, nhz, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, vs,
                nhx, phy, nhz, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
                phx, phy, nhz, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, us, 0.0,
                phx, phy, phz, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, us, vs,
                nhx, phy, phz, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, vs,
                phx, nhy, phz, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, 0.0, 0.0,
                nhx, nhy, phz, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, us, 0.0,
                nhx, phy, phz, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, us, vs,
                phx, phy, phz, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, 0.0, vs
            ],
            i = [
                0, 2, 1, 2, 0, 3,
                4, 6, 5, 6, 4, 7,
                8, 10, 9, 10, 8, 11,
                12, 14, 13, 14, 12, 15,
                16, 18, 17, 18, 16, 19,
                20, 22, 21, 22, 20, 23
            ];

        return device.makeMesh().
            attribute("position", R.Attribute.POSITION).
            attribute("normal", R.Attribute.NORMAL).
            attribute("tangent", R.Attribute.TANGENT).
            attribute("uv", R.Attribute.UV).
            vertices(v).
            indices(i);
    };
}());

/**
 * Generates a sphere mesh.
 *
 * The mesh will have positions, normals, tangents and uv-coordinates.
 *
 * @function
 * @param {B.Render.Device} device
 * @param {number} [radius=1.0]
 * @param {number} [segments=32]
 * @param {number} [uScale=1.0]
 * @param {number} [vScale=1.0]
 * @returns {B.Render.Mesh}
 */
B.Render.genSphere = (function () {

    var R = B.Render,

        PI = Math.PI,
        HALF_PI = PI * 0.5,
        TWO_PI = PI * 2.0,

        cos = Math.cos,
        sin = Math.sin;

    return function (device, radius, segments, uScale, vScale) {
    
        var v = [], i = [],
            a, ia, la, b, ib, lb, t,
            sinA, cosA, sinB, cosB,
            r = radius || 1.0,
            s = segments || 32,
            us = uScale || 1.0,
            vs = vScale || 1.0;

        for (ia = 0, la = s * 2; ia <= la; ia += 1) {
            for (ib = 0, lb = s; ib <= lb; ib += 1) {

                a = ia * TWO_PI / la;
                b = ib * TWO_PI / lb;
                t = HALF_PI + b;

                sinA = sin(a);
                cosA = cos(a);
                sinB = sin(b);
                cosB = cos(b);

                v.push(
                    r * sinA * sinB, r * sinA * cosB, r * cosA,
                    sinA * sinB, sinA * cosB, cosA,
                    sin(t), cos(t), 0.0,
                    us * b / s, vs * (1.0 - a / s)
                );
            }
        }
        t = s + 1;

        for (ia = 0, la = s; ia <= la; ia += 1) {
            for (ib = 0, lb = s; ib <= lb; ib += 1) {

                a = ia + 1;
                b = ib + 1;

                i.push(ia * t + ib, ia * t + b, a * t + b);
                i.push(ia * t + ib, a * t + b, a * t + ib);
            }
        }

        return device.makeMesh().
            attribute("position", R.Attribute.POSITION).
            attribute("normal", R.Attribute.NORMAL).
            attribute("tangent", R.Attribute.TANGENT).
            attribute("uv", R.Attribute.UV).
            vertices(v).
            indices(i);
    };
}());


/**
 * Represents an error of the [Render]{@link B.Render} module.
 *
 * @class
 * @this B.Render.Error
 * @augments Error
 * @param {string} message
 */
B.Render.Error = function (message, name) {

    this.stack = (new Error()).stack;

    /**
     * Error type name.
     *
     * @type {string}
     */
    this.name = name || "B.Render.Error";

    /**
     * Error message.
     *
     * @type {string}
     */
    this.message = message;
};

B.Render.Error.prototype = Error.prototype;


/**
 * @ignore
 * @this B.Render.GLError
 */
B.Render.GLErrorProto = function () {
};

B.Render.GLErrorProto.prototype = B.Render.Error.prototype;

/**
 * Represents an error of WebGL context.
 *
 * @class
 * @this B.Render.GLError
 * @augments B.Render.Error
 * @param {string} message
 * @param {number} code WebGL error code
 */
B.Render.GLError = function (message, code) {

    B.Render.Error.call(this, "Internal WebGL error: " + message, "B.Render.GLError");

    /**
     * WebGL error code.
     *
     * @type {string}
     */
    this.code = code;
};

B.Render.GLError.prototype = new B.Render.GLErrorProto();


B.Render.checkGLError = function (gl, message) {

    var code = gl.getError();

    if (code !== gl.NO_ERROR && code !== gl.CONTEXT_LOST_WEBGL) {
        throw new B.Render.GLError(message, code);
    }
};

B.Render.checkGLFramebufferStatus = function (gl, message) {

    var code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (code !== gl.FRAMEBUFFER_COMPLETE) {
        throw new B.Render.GLError(message, code);
    }
};

/**
 * Vertex attribute type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Attribute = {

    /**
     * Unsigned integer.
     *
     * @constant
     */
    UINT: 1,

    /**
     * Floating-point scalar.
     *
     * @constant
     */
    FLOAT: 2,

    /**
     * Floating-point 2D-vector.
     *
     * @constant
     */
    VECTOR2: 3,

    /**
     * Floating-point 3D-vector.
     *
     * @constant
     */
    VECTOR3: 4,

    /**
     * Floating-point 4D-vector.
     *
     * @constant
     */
    VECTOR4: 5,

    /**
     * Position ([VECTOR3]{@link B.Render.Attribute.VECTOR3} alias).
     *
     * @constant
     */
    POSITION: 6,

    /**
     * Normal ([VECTOR3]{@link B.Render.Attribute.VECTOR3} alias).
     *
     * @constant
     */
    NORMAL: 7,

    /**
     * Tangent ([VECTOR3]{@link B.Render.Attribute.VECTOR3} alias).
     *
     * @constant
     */
    TANGENT: 8,

    /**
     * UV-coordinates ([VECTOR2]{@link B.Render.Attribute.VECTOR2} alias).
     *
     * @constant
     */
    UV: 9,

    /**
     * Color ([UINT]{@link B.Render.Attribute.UINT} alias).
     *
     * @constant
     */
    COLOR: 10
};


/**
 * Returns byte size of attribute type.
 *
 * @param {B.Render.Attribute} type
 * @returns {number}
 */
B.Render.attributeByteSize = function (type) {

    var A = B.Render.Attribute;

    switch (type) {
    case A.UINT:
        return 4;
    case A.FLOAT:
        return 4;
    case A.VECTOR2:
        return 8;
    case A.VECTOR3:
        return 12;
    case A.VECTOR4:
        return 16;
    case A.POSITION:
        return 12;
    case A.NORMAL:
        return 12;
    case A.TANGENT:
        return 12;
    case A.UV:
        return 8;
    case A.COLOR:
        return 4;
    }
    return 0;
};

/**
 * Checks vertex attributes consistency.
 *
 * @param {Object.<string, B.Render.Attribute>} attributes
 * @returns {boolean}
 */
B.Render.checkAttributes = function (attributes) {

    var A = B.Render.Attribute,
        name, type, count = 0, pCount = 0, nCount = 0;

    if (!attributes) {
        return false;
    }
    for (name in attributes) {
        type = attributes[name];
        switch (type) {
        case A.UINT:
        case A.FLOAT:
        case A.VECTOR2:
        case A.VECTOR3:
        case A.VECTOR4:
        case A.TANGENT:
        case A.UV:
        case A.COLOR:
            count += 1;
            break;
        case A.POSITION:
            count += 1;
            pCount += 1;
            break;
        case A.NORMAL:
            count += 1;
            nCount += 1;
            break;
        default:
            return false;
        }
    }
    return (count > 0 && pCount < 2 && nCount < 2);
};

B.Render.resolveAttributeAlias = function (type) {

    var A = B.Render.Attribute;

    switch (type) {
    case A.POSITION:
    case A.NORMAL:
    case A.TANGENT:
        return A.VECTOR3;
    case A.UV:
        return A.VECTOR2;
    case A.COLOR:
        return A.UINT;
    }
    return type;
};

B.Render.fromGLAttributeActiveInfo = function (gl, info) {

    var A = B.Render.Attribute;

    switch (info.type) {
    case gl.UNSIGNED_INT:
        return A.UINT;
    case gl.FLOAT:
        return A.FLOAT;
    case gl.FLOAT_VEC2:
        return A.VECTOR2;
    case gl.FLOAT_VEC3:
        return A.VECTOR3;
    case gl.FLOAT_VEC4:
        return A.VECTOR4;
    }
};

/**
 * Index type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Index = {

    /**
     * 16-bit index.
     *
     * @constant
     */
    USHORT: 1,

    /**
     * 32-bit index (to check hardware support use
     *  [device.caps().indexUInt]{@link B.Render.Device~Caps} flag).
     *
     @constant
     */
    UINT: 2
};


/**
 * Returns byte size of index type.
 *
 * @param {B.Render.Index} type
 * @returns {number}
 */
B.Render.indexByteSize = function (type) {

    var I = B.Render.Index;

    switch (type) {
    case I.USHORT:
        return 2;
    case I.UINT:
        return 4;
    }
    return 0;
};


B.Render.toGLIndex = function (gl, index) {

    var I = B.Render.Index;

    switch (index) {
    case I.USHORT:
        return gl.UNSIGNED_SHORT;
    case I.UINT:
        return gl.UNSIGNED_INT;
    }
};

/**
 * Primitive type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Primitive = {

    /**
     * Isolated point.
     *
     * @constant
     */
    POINT: 1,

    /**
     * Isolated straight line.
     *
     * @constant
     */
    LINE: 2,

    /**
     * Isolated triangle.
     *
     * @constant
     */
    TRIANGLE: 3
};


/**
 * Returns index count per primitive.
 *
 * @param {B.Render.Primitive} primitive
 * @returns {number}
 */
B.Render.indicesPerPrimitive = function (primitive) {

    var P = B.Render.Primitive;

    switch (primitive) {
    case P.POINT:
        return 1;
    case P.LINE:
        return 2;
    case P.TRIANGLE:
        return 3;
    }
    return 0;
};


B.Render.toGLPrimitive = function (gl, primitives) {

    var P = B.Render.Primitive;

    switch (primitives) {
    case P.POINT:
        return gl.POINTS;
    case P.LINE:
        return gl.LINES;
    case P.TRIANGLE:
        return gl.TRIANGLES;
    }
};

/**
 * Specifies the usage pattern of the data store.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Usage = {

    /**
     * The data store contents will be modified once.
     *
     * @constant
     */
    STATIC: 1,

    /**
     * The data store contents will be modified repeatedly.
     *
     * @constant
     */
    DYNAMIC: 2
};


/**
 * @ignore
 * @this B.Render.Mesh
 */
B.Render.MeshProto = function () {

    var M = B.Math,
        R = B.Render,
        U = R.Usage,
        I = R.Index,

        toGLUsage = function (gl, usage) {

            var U = B.Render.Usage;

            switch (usage) {
            case U.STATIC:
                return gl.STATIC_DRAW;
            case U.DYNAMIC:
                return gl.DYNAMIC_DRAW;
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
     * Returns array of vertex attributes names.
     *
     * @returns {Array.<string>}
     */
    this.attributes = function () {

        return this._attributesNames;
    };

    /**
     * Sets vertex attribute.
     *
     * @function B.Render.Mesh#attribute
     * @param {string} name if the name is not found a new attribute will be pushed
     * @param {B.Render.Attribute | null} type use the null value to remove existing attribute
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if attributes configuration is incorrect
     *
     * @example
     * mesh.
     *     attribute("position", B.Render.Attribute.POSITION).
     *     attribute("normal", B.Render.Attribute.NORMAL).
     *     attribute("uv", B.Render.Attribute.VECTOR2);
     *
     * mesh.attribute("uv", B.Render.Attribute.UV); // changing
     *
     * mesh.attribute("uv", null); // removing
     */
    /**
     * Gets vertex attribute.
     *
     * @function B.Render.Mesh#attribute
     * @param {string} name if the name is not found the null value will be returned
     * @returns {B.Render.Attribute | null}
     */
    /**
     * Renames vertex attribute.
     *
     * @function B.Render.Mesh#attribute
     * @param {string} name
     * @param {string} newName
     * @returns {B.Render.Mesh} this
     *
     * @example
     * mesh.attribute("uv", "uv0");
     */
    this.attribute = function (name, arg) {

        var i, found, attrs = this._attributes,
            names = this._attributesNames;

        if (arguments.length === 1) {
            return this._attributes[name] || null;
        }
        i = names.indexOf(name);
        found = (i !== -1);

        if (typeof arg === "string") {
            if (found) {
                names.splice(i, 1, arg);
                attrs[arg] = attrs[name];
                delete attrs[name];
            }
        } else if (arg === null) {
            if (found) {
                names.splice(i, 1);
                delete attrs[name];
            }
        } else {
            if (!found) {
                names.push(name);
            }
            attrs[name] = arg;
        }
        this._adjustAttributes();

        return this;
    };

    /**
     * Returns vertex count.
     *
     * @returns {number}
     */
    this.vertexCount = function () {

        return this._vertexCount;
    };

    /**
     * Sets vertex data.
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * @function B.Render.Mesh#vertices
     * @param {Array.<number> | Float32Array} source
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the data source is incorrect
     */
    /**
     * Allocates specified vertex count (the data will be initialized to 0).
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * @function B.Render.Mesh#vertices
     * @param {number} vertexCount
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the vertex count is incorrect
     */
    /**
     * Gets the vertex data source.
     *
     * @function B.Render.Mesh#vertices
     * @returns {Float32Array | null}
     */
    this.vertices = function (source, usage) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._vertexSource;
        }
        if (typeof source === "number") {
            if(source < 1) {
                throw new R.Error("can't set Mesh vertex data - vertex count is 0");
            }
            this._vertexSource = null;
            this._vertexCount = source;
        } else if (Array.isArray(source)) {
            this._vertexSource = new Float32Array(source);
        } else if (source instanceof Float32Array) {
            this._vertexSource = source;
        } else {
            throw new R.Error("can't set Mesh vertex data - invalid source type");
        }
        this._vertexUsage = usage || U.STATIC;

        this._adjustAttributes();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertexSource ||
            (this._glStride * this._vertexCount), toGLUsage(gl, this._vertexUsage));
        R.checkGLError(gl, "can't set Mesh vertices");

        if (this._vertexUsage === U.DYNAMIC) {
            this._vertexSource = null;
        }
        return this;
    };

    /**
     * Updates vertices from a new or existent data source.
     *
     * *Note: if you repeatedly updates vertices it's highly recommended to use
     *  {@link B.Render.Usage.DYNAMIC} to avoid performance penalty.*
     *
     * @param {Array.<number> | Float32Array} [source] omit if you want to use existent data source
     * @param {number} [offset=0] elements offset where data replacement will begin
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if vertices are not initialized or the source has invalid type
     *  or the source data is out of range
     */
    this.updateVertices = function (source, offset) {

        var gl = this._gl,
            byteOffset = offset ? offset * Float32Array.BYTES_PER_ELEMENT : 0,
            byteSize = this._glStride * this._vertexCount;

        if (!byteSize) {
            throw new R.Error("can't update Mesh vertex data - vertices must be set before update");
        }
        if (source) {
            if (Array.isArray(source)) {
                source = new Float32Array(source);
            } else if (!(source instanceof Float32Array)) {
                throw new R.Error("can't update Mesh vertex data - invalid source type");
            }
            if (byteOffset + source.byteLength > byteSize) {
                throw new R.Error("can't update Mesh vertex data - source data is out of range");
            }
            if (this._vertexSource && this._vertexUsage !== U.DYNAMIC) {
                this._vertexSource.set(source, offset);
            }
        } else {
            source = this._vertexSource;
        }
        if (source) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, byteOffset, source);
            R.checkGLError(gl, "can't update Mesh vertices");
        }
        return this;
    };

    /**
     * Flush linked vertex data source.
     *
     * *Note: the vertex data won't be restored after device lost.*
     *
     * @returns {B.Render.Mesh} this
     */
    this.flushVertices = function () {

        this._vertexSource = null;

        return this;
    };

    /**
     * Returns index type.
     *
     * @returns {B.Render.Index}
     */
    this.index = function () {

        return this._index;
    };

    /**
     * Returns index count.
     *
     * @returns {number}
     */
    this.indexCount = function () {

        return this._indexCount;
    };

    /**
     * Sets index data.
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * Some hardware supports 32-bit indices. To check it use
     *  [device.caps().indexUInt]{@link B.Render.Device~Caps} flag.
     *
     * @function B.Render.Mesh#indices
     * @param {Array.<number> | Uint16Array | Uint32Array} source
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the data source is incorrect
     */
    /**
     * Allocate specified index count (the data will be initialized to 0).
     *
     * If {@link B.Render.Usage.DYNAMIC} usage is specified the data source
     *  won't be preserved.
     *
     * Some hardware supports 32-bit indices. To check it use
     *  [device.caps().indexUInt]{@link B.Render.Device~Caps} flag.
     *
     * @function B.Render.Mesh#indices
     * @param {number} indexCount
     * @param {B.Render.Usage} [usage={@link B.Render.Usage.STATIC}] pattern of the data store
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if the index count is incorrect
     */
    /**
     * Gets the index data source.
     *
     * @function B.Render.Mesh#indices
     * @returns {Uint16Array | Uint32Array | null}
     */
    this.indices = function (source, usage) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._indexSource;
        }
        this._index = I.USHORT;

        if (typeof source === "number") {
            if(source < 1) {
                throw new R.Error("can't set Mesh index data - index count is 0");
            }
            this._indexSource = null;
        } else if (Array.isArray(source)) {
            this._indexSource = new Uint16Array(source);
        } else if (source instanceof Uint16Array) {
            this._indexSource = source;
        } else if (source instanceof Uint32Array) {
            this._indexSource = source;
            this._index = I.UINT;
        } else {
            throw new R.Error("can't set Mesh index data - invalid source type");
        }
        if (this._index === I.UINT && !this._device.caps().indexUInt) {
            throw new R.Error("can't set Mesh index data - 32-bit indices are not supported");
        }
        this._glIndex = R.toGLIndex(gl, this._index);
        this._indexCount = source.length || source;
        this._indexUsage = usage || U.STATIC;

        this._adjustPrimitives();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexSource ||
            (R.indexByteSize(this._index) * this._indexCount), toGLUsage(gl, this._indexUsage));
        R.checkGLError(gl, "can't set Mesh indices");

        if (this._indexUsage === U.DYNAMIC) {
            this._indexSource = null;
        }
        return this;
    };

    /**
     * Updates indices from a new or existent data source.
     *
     * *Note: if you repeatedly updates indices it's highly recommended to use
     *  {@link B.Render.Usage.DYNAMIC} to avoid performance penalty.*
     *
     * @param {Array.<number> | Uint16Array | Uint32Array} [source] omit if you want to use
     *  existent data source
     * @param {number} [offset=0] elements offset where data replacement will begin
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if indices are not initialized or the source has invalid type
     *  or the source data is out of range
     */
    this.updateIndices = function (source, offset) {

        var gl = this._gl,
            index = this._index,
            byteStride = R.indexByteSize(index),
            byteSize = byteStride * this._indexCount,
            byteOffset = offset ? offset * byteStride : 0;

        if (!byteSize) {
            throw new R.Error("can't update Mesh index data - indices must be set before update");
        }
        if (source) {
            if (Array.isArray(source)) {
                source = (index === I.USHORT) ? new Uint16Array(source) : new Uint32Array(source);
            } else if ((index === I.USHORT && !(source instanceof Uint16Array)) ||
                (index === I.UINT && !(source instanceof Uint32Array))) {
                throw new R.Error("can't update Mesh index data - invalid source type");
            }
            if (byteOffset + source.byteLength > byteSize) {
                throw new R.Error("can't update Mesh index data - source data is out of range");
            }
            if (this._indexSource && this._indexUsage !== U.DYNAMIC) {
                this._indexSource.set(source, offset);
            }
        } else {
            source = this._indexSource;
        }
        if (source) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, byteOffset, this._indexSource);
            R.checkGLError(gl, "can't update Mesh indices");
        }
        return this;
    };

    /**
     * Flush linked index data source.
     *
     * *Note: the index data won't be restored after device lost.*
     *
     * @returns {B.Render.Mesh} this
     */
    this.flushIndices = function () {

        this._indexSource = null;

        return this;
    };

    /**
     * Sets primitive type.
     *
     * @function B.Render.Mesh#primitive
     * @param {B.Render.Primitive} type
     * @returns {B.Render.Mesh} this
     */
    /**
     * Gets primitive type.
     *
     * @function B.Render.Mesh#primitive
     * @returns {B.Render.Primitive}
     */
    this.primitive = function (type) {

        if (arguments.length === 0) {
            return this._primitive;
        }
        this._primitive = type;
        this._adjustPrimitives();
        return this;
    };

    /**
     * Returns primitive count.
     *
     * @returns {number}
     */
    this.primitiveCount = function () {

        return this._primitiveCount;
    };

    /**
     * Sets bounds.
     *
     * @function B.Render.Mesh#bounds
     * @param {B.Math.AABox} box
     * @returns {B.Render.Mesh} this
     */
    /**
     * Gets bounds.
     *
     * @function B.Render.Mesh#bounds
     * @returns {B.Math.AABox}
     */
    this.bounds = function (box) {

        if (arguments.length === 0) {
            return this._bounds;
        }
        this._bounds.copy(box);
        return this;
    };

    /**
     * Computes bounds from vertex positions.
     *
     * @function
     * @returns {B.Render.Mesh} this
     * @throws {B.Render.Error} if a vertex data source is not linked
     *  or the {@link B.Render.Attribute.POSITION} attribute is not found
     */
    this.computeBounds = (function () {

        var point = M.makeVector3();

        return function () {

            var name, attrs = this._attributes, posAttr = 0,
                bounds = this._bounds, data = this._vertexSource,
                i, l, index = 0, stride, offset;

            if (!data) {
                throw new R.Error("can't compute Mesh bounds - vertex data source is not linked");
            }
            for (name in attrs) {
                if (attrs[name] === R.Attribute.POSITION) {
                    posAttr = name;
                    break;
                }
            }
            if (!posAttr) {
                throw new R.Error("can't compute Mesh bounds - POSITION attribute is not found");
            }
            bounds.reset();

            stride = this._glStride / Float32Array.BYTES_PER_ELEMENT;
            offset = this._glOffsets[posAttr] / Float32Array.BYTES_PER_ELEMENT;

            for (i = 0, l = this._vertexCount; i < l; i += 1) {
                index = i * stride + offset;
                point.set(data[index], data[index + 1], data[index + 2]);
                bounds.merge(point);
            }
            return this;
        };
    }());

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        var gl = this._gl;

        this._device._removeMesh(this);

        gl.deleteBuffer(this._glVertexBuffer);
        gl.deleteBuffer(this._glIndexBuffer);

        B.Std.freeObject(this);
    };

    this._make = function () {

        var gl = this._gl;

        this._glVertexBuffer = gl.createBuffer();
        this._glIndexBuffer = gl.createBuffer();

        R.checkGLError(gl, "can't make Mesh buffers");
    };

    this._bind = (function () {

        var A = R.Attribute,
            attribPtr = [],
            attribStub = [];

        attribPtr[A.UINT] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 4, gl.UNSIGNED_BYTE, true, stride, offset);
        };
        attribPtr[A.FLOAT] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, stride, offset);
        };
        attribPtr[A.VECTOR2] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, stride, offset);
        };
        attribPtr[A.VECTOR3] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, stride, offset);
        };
        attribPtr[A.VECTOR4] = function (gl, loc, stride, offset) {
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, stride, offset);
        };

        attribStub[A.FLOAT] = function (gl, loc) {
            gl.vertexAttrib1f(loc, 0);
        };
        attribStub[A.VECTOR2] = function (gl, loc) {
            gl.vertexAttrib2f(loc, 0, 0);
        };
        attribStub[A.VECTOR3] = function (gl, loc) {
            gl.vertexAttrib3f(loc, 0, 0, 0);
        };
        attribStub[A.VECTOR4] = function (gl, loc) {
            gl.vertexAttrib4f(loc, 0, 0, 0, 0);
        };

        return function (passAttribs) {

            var gl = this._gl,
                attribs = this._attributes, offsets = this._glOffsets,
                stride = this._glStride, boundCount = 0,
                name, passAttrib, passType, meshType, location;

            gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);

            for (name in passAttribs) {
                passAttrib = passAttribs[name];

                meshType = R.resolveAttributeAlias(attribs[name]);
                passType = passAttrib.type;
                location = passAttrib.location;

                if (meshType === passType || (meshType === A.UINT && passType === A.VECTOR4)) {
                    attribPtr[meshType](gl, location, stride, offsets[name]);
                    boundCount += 1;
                } else {
                    attribStub[passType](gl, location);
                }
            }
            if (!boundCount) {
                throw new R.Error("can't bind Mesh - neither attributes matched");
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
        };
    }());

    this._draw = function () {

        this._gl.drawElements(this._glPrimitive, this._indexCount, this._glIndex, 0);
    };

    this._restore = function () {

        var vCount = this._vertexCount,
            iCount = this._indexCount;

        this._make();

        if (vCount) {
            this.vertices(this._vertexSource || vCount, this._vertexUsage);
        }
        if (iCount) {
            this.indices(this._indexSource || iCount, this._indexUsage);
        }
    };

    this._adjustAttributes = function () {

        var attribs = this._attributes, names = this._attributesNames,
            i, l, name, offset = 0;

        if (!R.checkAttributes(attribs)) {
            throw new R.Error("can't adjust Mesh - invalid vertex attributes");
        }
        this._glOffsets = {};

        for (i = 0, l = names.length; i < l; i += 1) {
            name = names[i];
            this._glOffsets[name] = offset;
            offset += R.attributeByteSize(attribs[name]);
        }
        this._glStride = offset;

        if (this._vertexSource) {
            this._vertexCount = this._vertexSource.byteLength / this._glStride;
        }
    };

    this._adjustPrimitives = function () {

        this._primitiveCount = this._indexCount / R.indicesPerPrimitive(this._primitive);
        this._glPrimitive = R.toGLPrimitive(this._gl, this._primitive);
    };
};

/**
 * Represents a mesh, contains vertices and indexed primitives.
 *
 * To create the object use [device.makeMesh()]{@link B.Render.Device#makeMesh}.
 *
 * @class
 * @this B.Render.Mesh
 */
B.Render.Mesh = function (device) {

    this._device = device;

    this._attributes = {};
    this._attributesNames = [];
    this._vertexUsage = 0;
    this._vertexCount = 0;
    this._vertexSource = null;
    this._index = 0;
    this._indexUsage = 0;
    this._indexCount = 0;
    this._indexSource = null;
    this._primitive = B.Render.Primitive.TRIANGLE;
    this._primitiveCount = 0;
    this._bounds = B.Math.makeAABox();

    this._gl = device._gl;
    this._glOffsets = {};
    this._glStride = 0;
    this._glPrimitive = 0;
    this._glIndex = 0;
    this._glVertexBuffer = null;
    this._glIndexBuffer = null;

    this._id = -1;

    this._make();
};

B.Render.Mesh.prototype = new B.Render.MeshProto();

/**
 * Surface format.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Format = {

    /**
     * 8-bit format (alpha only).
     * @constant
     */
    A: 1,

    /**
     * 24-bit format using 8 bits for the each channel (red, green, blue).
     * @constant
     */
    RGB: 2,

    /**
     * 32-bit format using 8 bits for the each channel (red, green, blue, alpha).
     * @constant
     */
    RGBA: 3,

    /**
     * DXT1 (S3TC) compression format.
     * To check hardware support use [device.caps().textureDXT]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGB_DXT1: 4,

    /**
     * DXT5 (S3TC) compression format.
     * To check hardware support use [device.caps().textureDXT]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGBA_DXT5: 5,

    /**
     * 16-bit floating-point format (alpha only).
     * To check hardware support use
     *  [device.caps().textureFloat16]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    A_F16: 6,

    /**
     * 48-bit floating-point format using 16 bits for the each channel (red, green, blue).
     * To check hardware support use
     *  [device.caps().textureFloat16]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGB_F16: 7,

    /**
     * 64-bit floating-point format using 16 bits for the each channel (red, green, blue, alpha).
     * To check hardware support use
     *  [device.caps().textureFloat16]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGBA_F16: 8,

    /**
     * 32-bit floating-point format (alpha only).
     * To check hardware support use
     *  [device.caps().textureFloat32]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    A_F32: 9,

    /**
     * 96-bit floating-point format using 32 bits for the each channel (red, green, blue).
     * To check hardware support use
     *  [device.caps().textureFloat32]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGB_F32: 10,

    /**
     * 128-bit floating-point format using 32 bits for the each channel (red, green, blue, alpha).
     * To check hardware support use
     *  [device.caps().textureFloat32]{@link B.Render.Device~Caps} flag.
     * @constant
     */
    RGBA_F32: 11,

    /**
     * 16-bit depth format.
     * @constant
     */
    DEPTH: 12,

    /**
     * 32-bit depth-stencil format using 24 bits for the depth and 8 bits for the stencil.
     * @constant
     */
    DEPTH_STENCIL: 13
};


/**
 * Returns bit size of surface format.
 * @param {B.Render.Format} format
 * @returns {number}
 */
B.Render.formatBitSize = function (format) {

    var R = B.Render, F = R.Format;

    switch (format) {
    case F.A:
        return 8;
    case F.RGB:
        return 24;
    case F.RGBA:
        return 32;
    case F.RGB_DXT1:
        return 4;
    case F.RGBA_DXT5:
        return 8;
    case F.A_F16:
        return 16;
    case F.RGB_F16:
        return 48;
    case F.RGBA_F16:
        return 64;
    case F.A_F32:
        return 32;
    case F.RGB_F32:
        return 96;
    case F.RGBA_F32:
        return 128;
    case F.DEPTH:
        return 16;
    case F.DEPTH_STENCIL:
        return 32;
    }
    return 0;
};

/**
 * Returns byte size of compressed format block.
 * @param {B.Render.Format} format
 * @returns {number}
 */
B.Render.formatBlockByteSize = function (format) {

    var F = B.Render.Format;

    switch (format) {
    case F.RGB_DXT1:
        return 8;
    case F.RGBA_DXT5:
        return 16;
    }
    return 0;
};

/**
 * Returns texel size (one dimension) of compressed format block.
 * @param {B.Render.Format} format
 * @returns {number}
 */
B.Render.formatBlockTexelSize = function (format) {

    var F = B.Render.Format;

    switch (format) {
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        return 4;
    }
    return 0;
};

/**
 * Calculates pitch (in bytes) for arbitrary format and width.
 * @param {B.Render.Format} format
 * @param {number} width
 * @returns {number}
 */
B.Render.imagePitch = function (format, width) {

    var R = B.Render, F = R.Format,
        blockWidth;

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
    case F.DEPTH:
    case F.DEPTH_STENCIL:
        return width * R.formatBitSize(format) / 8;
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        blockWidth = R.formatBlockTexelSize(format);
        return Math.max(blockWidth, width) / blockWidth * R.formatBlockByteSize(format);
    }
    return 0;
};

/**
 * Calculates rows count for arbitrary format and height.
 * @param {B.Render.Format} format
 * @param {number} height
 * @returns {number}
 */
B.Render.imageRows = function (format, height) {

    var R = B.Render, F = R.Format,
        blockHeight;

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
    case F.DEPTH:
    case F.DEPTH_STENCIL:
        return height;
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        blockHeight = R.formatBlockTexelSize(format);
        return Math.max(blockHeight, height) / blockHeight;
    }
    return 0;
};

/**
 * Calculates byte size for arbitrary image.
 * @param {B.Render.Format} format
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
B.Render.imageByteSize = function (format, width, height) {

    return B.Render.imagePitch(format, width) * B.Render.imageRows(format, height);
};

/**
 * Checks color format consistency.
 * @param {B.Render.Device} device
 * @param {B.Render.Format} format
 * @param {boolean} [renderable=false]
 * @returns {boolean}
 */
B.Render.checkColorFormat = function (device, format, renderable) {

    var F = B.Render.Format,
        caps = device.caps();

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
        return true;
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        return !renderable && caps.textureDXT;
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
        return renderable ? caps.colorTargetFloat16 : caps.textureFloat16;
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
        return renderable ? caps.colorTargetFloat32 : caps.textureFloat32;
    }
    return false;
};

/**
 * Checks depth-stencil format consistency.
 * @param {B.Render.Device} device
 * @param {B.Render.Format} format
 * @returns {boolean}
 */
B.Render.checkDepthFormat = function (device, format) {

    var F = B.Render.Format;

    switch (format) {
    case F.DEPTH:
    case F.DEPTH_STENCIL:
        return true;
    }
    return false;
};

B.Render.checkColorFormatDataSource = function (format, source) {

    var F = B.Render.Format;

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
    case F.RGB_DXT1:
    case F.RGBA_DXT5:
        return (source instanceof Uint8Array);
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
        return (source instanceof Float32Array);
    }
    return false;
};

B.Render.toGLColorFormat = function (device, format) {

    var R = B.Render, F = R.Format,
        gl = device._gl,
        extDXT = device._ext("compressed_texture_s3tc");

    switch (format) {
    case F.A:
    case F.A_F16:
    case F.A_F32:
        return gl.ALPHA;
    case F.RGB:
    case F.RGB_F16:
    case F.RGB_F32:
        return gl.RGB;
    case F.RGBA:
    case F.RGBA_F16:
    case F.RGBA_F32:
        return gl.RGBA;
    case F.RGB_DXT1:
        return extDXT && extDXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
    case F.RGBA_DXT5:
        return extDXT && extDXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    }
};

B.Render.toGLDepthFormat = function (device, format, readable) {

    var R = B.Render, F = R.Format,
        gl = device._gl;

    switch (format) {
    case F.DEPTH:
        return readable ? gl.DEPTH_COMPONENT : gl.DEPTH_COMPONENT16;
    case F.DEPTH_STENCIL:
        return gl.DEPTH_STENCIL;
    }
};

B.Render.toGLType = function (device, format) {

    var F = B.Render.Format,
        gl = device._gl,
        extDT = device._ext("depth_texture"),
        extTHF = device._ext("texture_half_float");

    switch (format) {
    case F.A:
    case F.RGB:
    case F.RGBA:
        return gl.UNSIGNED_BYTE;
    case F.A_F16:
    case F.RGB_F16:
    case F.RGBA_F16:
        return extTHF && extTHF.HALF_FLOAT_OES;
    case F.A_F32:
    case F.RGB_F32:
    case F.RGBA_F32:
        return gl.FLOAT;
    case F.DEPTH:
        return gl.UNSIGNED_SHORT;
    case F.DEPTH_STENCIL:
        return extDT && extDT.UNSIGNED_INT_24_8_WEBGL;
    }
};

/**
 * @ignore
 * @this B.Render.Depth
 */
B.Render.DepthProto = function () {

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
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns surface format.
     *
     * @returns {B.Render.Format}
     */
    this.format = function () {

        return this._format;
    };

    /**
     * Returns readable flag.
     *
     * @returns {boolean}
     */
    this.readable = function () {

        return this._readable;
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeDepth(this);

        if (this._readable) {
            this._gl.deleteTexture(this._glHandle);
        } else {
            this._gl.deleteRenderbuffer(this._glHandle);
        }
        B.Std.freeObject(this);
    };

    this._make = (function () {

        var F = R.Format,

            toGLAttachmnet = function (gl, format) {

                switch (format) {
                case F.DEPTH:
                    return gl.DEPTH_ATTACHMENT;
                case F.DEPTH_STENCIL:
                    return gl.DEPTH_STENCIL_ATTACHMENT;
                }
            };

        return function () {

            var dev = this._device, gl = dev._gl,
                format = this._format, width = this._width, height = this._height;

            if (this._readable && !this._device.caps().readableDepth) {
                throw new R.Error("readable Depth buffers are not supported " +
                    "(check device.caps().readableDepth)");
            }
            if (!R.checkDepthFormat(dev, format)) {
                throw new R.Error("can't make Depth - unsupported format");
            }
            if (!width || !height) {
                throw new R.Error("can't make Depth - invalid size argument");
            }
            if (!R.isPowerOfTwo(width) || !R.isPowerOfTwo(height)) {
                throw new R.Error("can't make Depth - size is not power of 2");
            }
            if (Math.max(width, height) > dev.caps().depthMaxSize) {
                throw new R.Error("can't make Depth - " +
                    "unsupported size (greater then device.caps().depthMaxSize)");
            }
            this._glAttachment = toGLAttachmnet(gl, this._format);

            this._adjust();
        };
    }());

    this._adjust = function () {

        var gl = this._gl,
            width = this._width, height = this._height,
            format = R.toGLDepthFormat(this._device, this._format, this._readable),
            type = R.toGLType(this._device, this._format), target;

        if (this._readable) {
            target = gl.TEXTURE_2D;
            this._glHandle = gl.createTexture();
            gl.bindTexture(target, this._glHandle);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texImage2D(target, 0, format, width, height, 0, format, type, null);

        } else {
            target = gl.RENDERBUFFER;
            this._glHandle = gl.createRenderbuffer();
            gl.bindRenderbuffer(target, this._glHandle);
            gl.renderbufferStorage(target, format, width, height);
        }
        R.checkGLError(gl, "can't adjust Depth");
    };

    this._attach = function () {

        var gl = this._gl;

        if (this._readable) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, this._glAttachment,
                gl.TEXTURE_2D, this._glHandle, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, this._glAttachment,
                gl.RENDERBUFFER, this._glHandle);
        }
    };

    this._detach = function () {

        var gl = this._gl;

        if (this._readable) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, this._glAttachment,
                gl.TEXTURE_2D, null, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, this._glAttachment,
                gl.RENDERBUFFER, null);
        }
    };

    this._restore = function () {

        this._adjust();
    };
};

/**
 * Represents a depth-stencil buffer.
 *
 * To create the object use [device.makeDepth()]{@link B.Render.Device#makeDepth}.
 *
 * @class
 * @this B.Render.Depth
 */
B.Render.Depth = function (device, format, width, height, readable) {

    this._device = device;

    this._width = width;
    this._height = height;
    this._size = B.Math.makeVector2(width, height);
    this._format = format;
    this._readable = readable || false;

    this._gl = device._gl;
    this._glAttachment = 0;
    this._glHandle = null;

    this._id = -1;

    this._make();
};

B.Render.Depth.prototype = new B.Render.DepthProto();

/**
 * @ignore
 * @this B.Render.Mip
 */
B.Render.MipProto = function () {

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns linked texture.
     *
     * @returns {B.Render.Texture}
     */
    this.texture = function () {

        return this._texture;
    };

    /**
     * Returns index of this mip level.
     *
     * @returns {number}
     */
    this.index = function () {

        return this._index;
    };

    /**
     * Returns mip levels count of linked texture.
     *
     * @returns {number}
     */
    this.count = function () {

        return this._count;
    };

    /**
     * Returns cubemap face of this mip level (always 0 for 2D-textures).
     *
     * @returns {B.Render.CubeFace}
     */
    this.face = function () {

        return this._face;
    };

    /**
     * Returns cubemap face count of linked texture.
     *
     * @returns {number}
     */
    this.faceCount = function () {

        return this._faceCount;
    };

    /**
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns surface format.
     *
     * @returns {B.Render.Format}
     */
    this.format = function () {

        return this._format;
    };

    /**
     * Sets texel data source.
     *
     * @function B.Render.Mip#source
     * @param {null | Uint8Array | Float32Array | ImageData | HTMLImageElement |
     *  HTMLCanvasElement | HTMLVideoElement} source
     * @returns {B.Render.Mip} this
     * @throws {B.Render.Error} if source is inappropriate or has invalid size
     * */
    /**
     * Gets texel data source.
     *
     * @function B.Render.Mip#source
     * @returns {null | Uint8Array | Float32Array | ImageData | HTMLImageElement |
     *  HTMLCanvasElement | HTMLVideoElement}
     */
    this.source = function (source) {

        if (arguments.length === 0) {
            return this._source;
        }
        this._texture._upload(this._face, this._index, source);
        this._source = source || null;
        return this;
    };

    /**
     * Flush linked data source.
     *
     * *Note: the data won't be restored after device lost.*
     *
     * @returns {B.Render.Mip} this
     */
    this.flush = function () {

        this._source = null;
    };

    /**
     * Returns data pitch (in bytes).
     *
     * @returns {number}
     */
    this.pitch = function () {

        return this._pitch;
    };

    /**
     * Returns data rows count.
     *
     * @returns {number}
     */
    this.rows = function () {

        return this._rows;
    };

    /**
     * Returns data size (in bytes).
     *
     * @returns {number}
     */
    this.byteSize = function () {

        return this._byteSize;
    };

    this._attach = function (targetIndex) {

        this._texture._attach(targetIndex, this._face, this._index);
    };

    this._detach = function (targetIndex) {

        this._texture._detach(targetIndex);
    };

    this._restore = function () {

        this._texture._upload(this._face, this._index, this._source);
    };
};

/**
 * Represents a texture mip level.
 *
 * To get the object use [texture.mip()]{@link B.Render.Texture#mip}.
 *
 * @class
 * @this B.Render.Mip
 */
B.Render.Mip = function (device, texture, index, face) {

    var R = B.Render;

    this._device = device;

    this._texture = texture;
    this._index = index;
    this._count = texture.mipCount();
    this._face = face;
    this._faceCount = texture.faceCount();
    this._width = R.Mip.calcSize(texture.width(), index);
    this._height = R.Mip.calcSize(texture.height(), index);
    this._size = B.Math.makeVector2(this._width, this._height);
    this._format = texture.format();
    this._pitch = R.imagePitch(this._format, this._width);
    this._rows = R.imageRows(this._format, this._height);
    this._byteSize = this._pitch * this._rows;

    this._source = null;
};

B.Render.Mip.prototype = new B.Render.MipProto();

/**
 * Calculates maximum mip levels count of given texture size.
 *
 * @param {number} textureSize
 * @returns {number}
 */
B.Render.Mip.calcMaxCount = function (textureSize) {

    return Math.max(0, Math.log(textureSize)) / Math.LN2 + 1;
};

/**
 * Calculates size of specified mip level from given texture size.
 *
 * @param {number} textureSize
 * @param {number} mipIndex
 * @returns {number}
 */
B.Render.Mip.calcSize = function (textureSize, mipIndex) {

    return Math.pow(2, Math.max(0, Math.log(textureSize) / Math.LN2 - mipIndex));
};

/**
 * Cubemap face.
 *
 * @enum {number}
 * @readonly
 */
B.Render.CubeFace = {

    /**
     * Positive X-face.
     *
     * @constant
     */
    POSITIVE_X: 0,

    /**
     * Negative X-face.
     *
     * @constant
     */
    NEGATIVE_X: 1,

    /**
     * Positive Y-face.
     *
     * @constant
     */
    POSITIVE_Y: 2,

    /**
     * Negative Y-face.
     *
     * @constant
     */
    NEGATIVE_Y: 3,

    /**
     * Positive Z-face.
     *
     * @constant
     */
    POSITIVE_Z: 4,

    /**
     * Negative Z-face.
     *
     * @constant
     */
    NEGATIVE_Z: 5,

    /**
     * Face count.
     *
     * @constant
     */
    COUNT: 6
};


/**
 * @ignore
 * @this B.Render.Texture
 */
B.Render.TextureProto = function () {

    var R = B.Render,
        CF = R.CubeFace,

        toGLTarget = function (gl, faceCount, faceIndex) {

            if (faceCount === 1) {
                return gl.TEXTURE_2D;
            }
            if (faceIndex === undefined) {
                return gl.TEXTURE_CUBE_MAP;
            }
            switch (faceIndex) {
            case CF.POSITIVE_X:
                return gl.TEXTURE_CUBE_MAP_POSITIVE_X;
            case CF.NEGATIVE_X:
                return gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
            case CF.POSITIVE_Y:
                return gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
            case CF.NEGATIVE_Y:
                return gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
            case CF.POSITIVE_Z:
                return gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
            case CF.NEGATIVE_Z:
                return gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
            }
        },

        forEachMip = function (that, action) {

            var iF, lF, iM, lM, res, face, mips = that._mips;

            for (iF = 0, lF = that._faceCount; iF < lF; iF += 1) {
                face = mips[iF];
                for (iM = 0, lM = that._mipCount; iM < lM; iM += 1) {
                    res = action(face[iM], iF, iM);
                    if (res) {
                        face[iM] = res;
                    }
                }
            }
        },

        buildMipChain = function (that, mipCount) {

            var dev = that._device;

            that._mipCount = mipCount || R.Mip.calcMaxCount(Math.max(that._width, that._height));

            forEachMip(that, function (mip, iFace, iMip) {
                if (!mip) {
                    return new R.Mip(dev, that, iMip, iFace);
                }
            });
        },

        extractSourceSize = function (source, size) {

            size.set(
                source.videoWidth || source.naturalWidth || source.width,
                source.videoHeight || source.naturalHeight || source.height
            );
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
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns surface format.
     *
     * @returns {B.Render.Format}
     */
    this.format = function () {

        return this._format;
    };

    /**
     * Returns mip levels count.
     *
     * @returns {number}
     */
    this.mipCount = function () {

        return this._mipCount;
    };

    /**
     * Returns cubemap faces count.
     *
     * @returns {number}
     */
    this.faceCount = function () {

        return this._faceCount;
    };

    /**
     * Returns mip level.
     *
     * @param {number} [mipIndex=0]
     * @param {B.Render.CubeFace} [faceIndex=0] omit for 2D-textures
     * @returns {B.Render.Mip | null}
     */
    this.mip = function (mipIndex, faceIndex) {

        var face = this._mips[faceIndex || 0];

        return (face && face[mipIndex || 0]) || null;
    };

    /**
     * Builds mip levels chain.
     *
     * @returns {B.Render.Texture} this
     */
    this.buildMips = function () {

        var gl = this._gl;

        buildMipChain(this);

        gl.bindTexture(this._glTarget, this._glTexture);
        gl.generateMipmap(this._glTarget);

        R.checkGLError(gl, "can't build Texture mips");
        this._built = true;

        return this;
    };

    /**
     * Flush all mip data sources.
     *
     * *Note: the data won't be restored after device lost.*
     *
     * @returns {B.Render.Texture} this
     */
    this.flush = function () {

        forEachMip(this, function (mip) {
            mip.flush();
        });
        return this;
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeTexture(this);

        this._gl.deleteTexture(this._glTexture);

        forEachMip(this, function (mip) {
            B.Std.freeObject(mip);
        });
        B.Std.freeObject(this);
    };

    this._make = (function () {

        var F = R.Format,

            fromParams = function (that, format, width, height, mipCount, faceCount) {

                that._size.set(width, height);
                that._width = width;
                that._height = height;
                that._format = format;
                that._faceCount = faceCount || 1;
                that._mipCount = mipCount || 0;
            },

            fromSource = function (that, source, faceCount) {

                if (!source) {
                    throw new R.Error("can't make Texture - invalid source object");
                }
                extractSourceSize(source, that._size);
                that._width = that._size.x;
                that._height = that._size.y;
                that._format = R.Format.RGBA;
                that._faceCount = faceCount;
                that._mipCount = 1;
            },

            check = function (that) {

                var caps = that._device.caps(),
                    width = that._width,
                    height = that._height,
                    maxSize = Math.max(width, height),
                    minSize = Math.min(width, height),
                    format = that._format,
                    faceCount = that._faceCount,
                    mipCount = that._mipCount;

                if (!R.checkColorFormat(that._device, format)) {
                    throw new R.Error("can't make Texture - unsupported format");
                }
                if (!width || !height) {
                    throw new R.Error("can't make Texture - invalid size");
                }
                if ((format === F.RGB_DXT1 || format === F.RGBA_DXT5) && minSize < 4) {
                    throw new R.Error("can't make Texture - size is less than one block");
                }
                if (!R.isPowerOfTwo(width) || !R.isPowerOfTwo(height)) {
                    throw new R.Error("can't make Texture - size is not power of 2");
                }
                if (faceCount !== 1 && faceCount !== CF.COUNT) {
                    throw new R.Error("can't make Texture - invalid face count");
                }
                if (mipCount > R.Mip.calcMaxCount(maxSize)) {
                    throw new R.Error("can't make Texture - invalid mip count");
                }
                if (faceCount === 1 && maxSize > caps.textureMaxSize) {
                    throw new R.Error("can't make Texture - " +
                        "unsupported size (greater then device.caps().texturesMaxSize)");
                }
                if (faceCount === CF.COUNT && maxSize > caps.cubemapMaxSize) {
                    throw new R.Error("can't make Texture - " +
                        "unsupported size (greater then device.caps().cubemapMaxSize)");
                }
            };

        return function (format, width, height, mipCount, faceCount) {

            var source = format, i, l,
                gl = this._gl;

            if (typeof format === "number") {
                source = null;
                fromParams(this, format, width, height, mipCount, faceCount);
            } else {
                source = Array.isArray(source) ? source : [source];
                fromSource(this, source[0], source.length);
            }
            check(this);

            for (i = 0, l = this._faceCount; i < l; i += 1) {
                this._mips[i] = [];
            }
            this._glTarget = toGLTarget(gl, this._faceCount);
            this._glFormat = R.toGLColorFormat(this._device, this._format);
            this._glType = R.toGLType(this._device, this._format);

            this._adjust();

            buildMipChain(this, this._mipCount);

            forEachMip(this, function (mip, iFace) {
                mip.source(source && source[iFace]);
            });
        };
    }());

    this._adjust = function () {

        var gl = this._gl, glTarget = this._glTarget;

        this._glTexture = gl.createTexture();

        gl.bindTexture(glTarget, this._glTexture);
        gl.texParameteri(glTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(glTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_T, gl.REPEAT);

        R.checkGLError(gl, "can't adjust Texture");
    };

    this._upload = (function () {

        var
            compressedFormat = function (format) {

                var F = R.Format;

                switch (format) {
                case F.RGB_DXT1:
                case F.RGBA_DXT5:
                    return true;
                }
                return false;
            },

            uploadNull = function (that, target, mip) {

                var gl = that._gl,
                    mipIndex = mip.index(),
                    format = that._glFormat,
                    type = that._glType;

                switch (that._format) {
                case R.Format.RGB_DXT1:
                    format = gl.RGB;
                    type = gl.UNSIGNED_BYTE;
                    break;
                case R.Format.RGBA_DXT5:
                    format = gl.RGBA;
                    type = gl.UNSIGNED_BYTE;
                    break;
                }
                gl.texImage2D(target, mipIndex, format, mip.width(),
                    mip.height(), 0, format, type, null);
            },

            uploadArray = function (that, target, mip, source) {

                var gl = that._gl,
                    mipIndex = mip.index();

                if (!R.checkColorFormatDataSource(that._format, source)) {
                    throw new R.Error("can't upload Mip data - invalid source type");
                }
                if (source.byteLength !== mip.byteSize()) {
                    throw new R.Error("can't upload Mip data - invalid source byte size");
                }
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

                if (compressedFormat(that._format)) {
                    gl.compressedTexImage2D(target, mipIndex, that._glFormat,
                        mip.width(), mip.height(), 0, source);
                } else {
                    gl.texImage2D(target, mipIndex, that._glFormat, mip.width(),
                        mip.height(), 0, that._glFormat, that._glType, source);
                }
            },

            uploadObject = (function () {

                var size = B.Math.makeVector2();

                return function (that, target, mip, source) {

                    var gl = that._gl,
                        mipIndex = mip.index();

                    extractSourceSize(source, size);
                    if (size.x !== mip.width() || size.y !== mip.height()) {
                        throw new R.Error("can't upload Texture mip data - " +
                            "inappropriate source size");
                    }
                    if (compressedFormat(that._format)) {
                        throw new R.Error("can't upload Texture mip data - " +
                            "only compressed data allowed");
                    } else {
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, (that._faceCount !== CF.COUNT));
                        gl.texImage2D(target, mipIndex, that._glFormat, that._glFormat,
                            that._glType, source);
                    }
                };
            }());

        return function (faceIndex, mipIndex, source) {

            var gl = this._gl,
                mip = this.mip(mipIndex, faceIndex),
                target = toGLTarget(gl, this._faceCount, faceIndex);

            gl.bindTexture(this._glTarget, this._glTexture);
            if (!source) {
                uploadNull(this, target, mip);
            } else if (source instanceof Uint8Array || source instanceof Float32Array) {
                uploadArray(this, target, mip, source);
            } else {
                uploadObject(this, target, mip, source);
            }
            R.checkGLError(gl, "can't upload Texture mip data");
        };
    }());

    this._attach = function (targetIndex, faceIndex, mipIndex) {

        var gl = this._gl;

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + targetIndex,
            toGLTarget(gl, this._faceCount, faceIndex), this._glTexture, mipIndex);
    };

    this._detach = function (targetIndex) {

        var gl = this._gl;

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + targetIndex,
            gl.TEXTURE_2D, null, 0);
    };

    this._restore = function () {

        var built = this._built;

        this._adjust();

        forEachMip(this, function (mip, iFace, iMip) {
            if (!built || iMip === 0) {
                mip._restore();
            }
        });
        if (built) {
            this.buildMips();
        }
    };
};

/**
 * Represents a 2D-texture or cubemap.
 *
 * To create the object use [device.makeTexture()]{@link B.Render.Device#makeTexture}.
 *
 * @class
 * @this B.Render.Texture
 */
B.Render.Texture = function (device, format, width, height, mipCount, faceCount) {

    this._device = device;

    this._width = 0;
    this._height = 0;
    this._size = B.Math.makeVector2();
    this._format = 0;
    this._faceCount = 0;
    this._mipCount = 0;
    this._mips = [];

    this._gl = device._gl;
    this._glTexture = null;
    this._glTarget = 0;
    this._glFormat = 0;
    this._glType = 0;

    this._built = false;
    this._id = -1;

    this._make(format, width, height, mipCount, faceCount);
};

B.Render.Texture.prototype = new B.Render.TextureProto();

/**
 * @ignore
 * @this B.Render.Target
 */
B.Render.TargetProto = function () {

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
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns multisample coverage mask size.
     *
     * @returns {number}
     */
    this.multisamples = function () {

        return this._multisamples;
    };

    /**
     * Sets color target or multiple color targets.
     *
     * To check maximum color targets count use
     *  [device.caps().colorTargetCount]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Target#color
     * @param {B.Render.Mip | B.Render.Texture | Array<B.Render.Mip | B.Render.Texture>} object
     * @returns {B.Render.Target} this
     * @throws {B.Render.Error} if object's size or format are inappropriate or the object is not
     *  specified.
     *
     * @example
     * target.color(mip);
     * target.color(texture); // equivalent to target.color(texture.mip(0))
     *
     * // multiple color targets
     * target.color([mip0, mip1, texture]);
     */
    /**
     * Gets color target or multiple color targets.
     *
     * @function B.Render.Target#color
     * @param {number} [index]
     * @returns {null | B.Render.Mip | Array<B.Render.Mip>}
     *
     * @example
     * var mip = target.color();
     *
     * // multiple color targets
     * var array = target.color();
     * var mip1 = target.color()[1];
     * var mip1 = target.color(1); // equivalent to above
     */
    this.color = function (object) {

        var objs = Array.isArray(object) ? object : [object], i, l,
            color = this._color;

        if (arguments.length === 0) {
            return (color.length === 1) ? color[0] : color;
        }
        if (arguments.length === 1 && typeof object === "number") {
            return color[object] || null;
        }

        this._bind();
        for (i = 0, l = this._color.length; i < l; i += 1) {
            this._color[i]._detach(i);
        }
        this._color = [];
        for (i = 0, l = objs.length; i < l; i += 1) {
            this._color[i] = (objs[i] instanceof R.Texture) ? objs[i].mip(0) : objs[i];
        }
        this._check();
        for (i = 0, l = this._color.length; i < l; i += 1) {
            this._color[i]._attach(i);
        }
        this._validate();

        this._size.copy(this._color[0].size());
        this._width = this._size.x;
        this._height = this._size.y;
        this._multisamples = this._gl.getParameter(this._gl.SAMPLES);

        return this;
    };

    /**
     * Sets depth-stencil target.
     *
     * @function B.Render.Target#depth
     * @param {null | B.Render.Depth} object
     * @returns {B.Render.Target} this
     * @throws {B.Render.Error} if object's size or format are inappropriate
     */
    /**
     * Gets depth-stencil target.
     *
     * @function B.Render.Target#depth
     * @returns {null | B.Render.Depth}
     */
    this.depth = function (object) {

        if (arguments.length === 0) {
            return this._depth;
        }
        this._bind();
        if (this._depth) {
            this._depth._detach();
        }
        this._depth = object || null;
        this._check();
        if (this._depth) {
            this._depth._attach();
        }
        this._validate();

        return this;
    };

    /**
     * Clones this target to a new target object (it also clones all linked resources).
     *
     * @param {number} [scale=1.0] size scale factor
     * @returns {B.Render.Target} this
     */
    this.clone = function (scale) {

        var i, l, colorFmt = [],
            depthFmt = this._depth ? this._depth.format() : null;

        scale = (scale > 0.0) ? scale : 1.0;

        for (i = 0, l = this._color.length; i < l; i += 1) {
            colorFmt[i] = this._color[i].format();
        }
        return this._device.makeTarget(colorFmt, depthFmt,
            this._width * scale, this._height * scale);
    };

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeTarget(this);

        this._gl.deleteFramebuffer(this._glFramebuffer);

        B.Std.freeObject(this);
    };

    this._make = function (color, depth, width, height) {

        var dev = this._device, i, l,
            colors = Array.isArray(color) ? color.slice() : [color];

        if (width !== undefined && height !== undefined) {
            depth = depth && dev.makeDepth(depth, width, height);
            for (i = 0, l = colors.length; i < l; i += 1) {
                colors[i] = dev.makeTexture(colors[i], width, height, 1).mip(0);
            }
        }
        this._glFramebuffer = dev._gl.createFramebuffer();

        this.color(colors);
        this.depth(depth);
    };

    this._bind = function () {

        var gl = this._device._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._glFramebuffer);
    };

    this._check = function () {

        var dev = this._device, depth = this._depth, colors = this._color,
            i, l = colors.length, color,

            width = depth && depth.width(),
            height = depth && depth.height();

        if (l > dev.caps().colorTargetCount) {
            throw new R.Error("can't assemble Target - unsupported color target count " +
                "(greater than device.caps().colorTargetCount)");
        }
        for (i = 0; i < l; i += 1) {
            color = colors[i];
            if (!color) {
                throw new R.Error("can't assemble Target - unspecified color target [" + i + "]");
            }
            width = width || color.width();
            height = height || color.height();

            if (color.width() !== width || color.height() !== height) {
                throw new R.Error("can't assemble Target - objects must have same size");
            }
            if (!R.checkColorFormat(dev, color.format(), true)) {
                throw new R.Error("can't assemble Target - color format is not renderable");
            }
        }
    };

    this._validate = function () {

        var gl = this._gl;

        R.checkGLFramebufferStatus(gl, "can't assemble Target");
        R.checkGLError(gl, "can't assemble Target");
    };

    this._clear = function (color, depth, stencil) {

        var gl = this._gl,
            bits = gl.COLOR_BUFFER_BIT,
            depthFmt = this._depth && this._depth.format();

        gl.clearColor(color.r, color.g, color.b, color.a);

        if (depthFmt) {
            gl.clearDepth(depth);
            bits |= gl.DEPTH_BUFFER_BIT;
            if (depthFmt === R.Format.DEPTH_STENCIL) {
                gl.clearStencil(stencil);
                bits |= gl.STENCIL_BUFFER_BIT;
            }
        }
        gl.clear(bits);
    };

    this._write = function (color, depth, stencil) {

        var gl = this._gl,
            depthFmt = this._depth && this._depth.format();

        R.applyColorMask(gl, color);

        if (depthFmt) {
            gl.depthMask(depth);
            if (depthFmt === R.Format.DEPTH_STENCIL) {
                gl.stencilMask(stencil);
            }
        }
    };

    this._restore = function () {

        this._make(this._color, this._depth);
    };
};

/**
 * Represents rendering output target.
 *
 * To create the object use [device.makeTarget()]{@link B.Render.Device#makeTarget}.
 *
 * @class
 * @this B.Render.Target
 */
B.Render.Target = function (device, color, depth, width, height) {

    this._device = device;

    this._width = 0;
    this._height = 0;
    this._size = B.Math.makeVector2();
    this._multisamples = 0;
    this._color = [];
    this._depth = null;

    this._gl = device._gl;
    this._glFramebuffer = null;

    this._id = -1;

    this._make(color, depth, width, height);
};

B.Render.Target.prototype = new B.Render.TargetProto();

/**
 * Uniform type.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Uniform = {

    /**
     * Floating-point scalar.
     *
     * @constant
     */
    FLOAT: 1,

    /**
     * Floating-point 2D-vector.
     *
     * @constant
     */
    VECTOR2: 2,

    /**
     * Floating-point 3D-vector.
     *
     * @constant
     */
    VECTOR3: 3,

    /**
     * Floating-point 4D-vector.
     *
     * @constant
     */
    VECTOR4: 4,

    /**
     * Floating-point 3x3-matrix.
     *
     * @constant
     */
    MATRIX3: 5,

    /**
     * Floating-point 4x4-matrix.
     *
     * @constant
     */
    MATRIX4: 6,

    /**
     * 2D-sampler.
     *
     * @constant
     */
    SAMPLER_2D: 7,

    /**
     * Cube-sampler.
     *
     * @constant
     */
    SAMPLER_CUBE: 8
};


/**
 * Returns byte size of uniform type.
 *
 * @param {B.Render.Uniform} type
 * @returns {number}
 */
B.Render.uniformByteSize = function (type) {

    var U = B.Render.Uniform;

    switch (type) {
    case U.FLOAT:
        return 4;
    case U.VECTOR2:
        return 8;
    case U.VECTOR3:
        return 12;
    case U.VECTOR4:
        return 16;
    case U.MATRIX3:
        return 36;
    case U.MATRIX4:
        return 64;
    }
    return 0;
};

B.Render.fromGLUniformActiveInfo = function (gl, info) {

    var U = B.Render.Uniform;

    switch (info.type) {
    case gl.FLOAT:
        return U.FLOAT;
    case gl.FLOAT_VEC2:
        return U.VECTOR2;
    case gl.FLOAT_VEC3:
        return U.VECTOR3;
    case gl.FLOAT_VEC4:
        return U.VECTOR4;
    case gl.FLOAT_MAT3:
        return U.MATRIX3;
    case gl.FLOAT_MAT4:
        return U.MATRIX4;
    case gl.SAMPLER_2D:
        return U.SAMPLER_2D;
    case gl.SAMPLER_CUBE:
        return U.SAMPLER_CUBE;
    }
};

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

/**
 * Texture addressing mode.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Address = {

    /**
     * Tile the texture at every integer junction.
     *
     * @constant
     */
    WRAP: 1,

    /**
     * Similar to WRAP, except that the texture is flipped at every integer junction.
     *
     * @constant
     */
    MIRROR: 2,

    /**
     * Texture coordinates outside the range [0.0, 1.0] are set to the texture color
     *  at 0.0 or 1.0 respectively.
     *
     * @constant
     */
    CLAMP: 3
};


/**
 * Texture filtering mode.
 *
 * To check floating-point texture filtering hardware support use
 *  [device.caps().textureFloat16Filter]{@link B.Render.Device~Caps} and
 *  [device.caps().textureFloat32Filter]{@link B.Render.Device~Caps} flags.
 *
 * @enum {number}
 * @readonly
 */
B.Render.Filter = {

    /**
     * Filtering disabled.
     *
     * @constant
     */
    NONE: 1,

    /**
     * Bilinear filtering.
     *
     * @constant
     */
    BILINEAR: 2,

    /**
     * Trilinear filtering.
     *
     * @constant
     */
    TRILINEAR: 3
};


/**
 * @ignore
 * @this B.Render.Sampler
 */
B.Render.SamplerProto = function () {

    var R = B.Render,
        F = R.Filter,
        A = R.Address,

        toGLWrap = function (gl, address) {

            switch (address) {
            case A.WRAP:
                return gl.REPEAT;
            case A.MIRROR:
                return gl.MIRRORED_REPEAT;
            case A.CLAMP:
                return gl.CLAMP_TO_EDGE;
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
     * @returns {B.Render.Sampler} this
     *
     * @example
     * // equivalent to
     * sampler.address(B.Render.Address.WRAP);
     * sampler.filter(B.Render.Filter.BILINEAR);
     */
    this.default = function () {

        this.address(A.WRAP);
        this.filter(F.BILINEAR);

        return this;
    };

    /**
     * Describes texture addressing modes.
     *
     * @typedef B.Render.Sampler~AddressModes
     * @type {Object}
     * @property {B.Render.Address} u texture addressing mode for the U-coordinate
     * @property {B.Render.Address} v texture addressing mode for the V-coordinate
     */

    /**
     * Sets texture addressing mode.
     *
     * @function B.Render.Sampler#address
     * @param {B.Render.Sampler~AddressModes} modes
     * @returns {B.Render.Sampler} this
     */
    /**
     * Sets texture addressing mode separately.
     *
     * @function B.Render.Sampler#address
     * @param {B.Render.Address} u mode for the U-coordinate (for both UV if v-argument is omitted)
     * @param {B.Render.Address} [v] mode for the V-coordinate
     * @returns {B.Render.Sampler} this
     *
     * @example
     * sampler.address(modeU, modeV);
     * sampler.address(modeUV);
     */
    /**
     * Gets texture addressing mode.
     *
     * @function B.Render.Sampler#address
     * @returns {B.Render.Sampler~AddressModes}
     */
    this.address = function (u, v) {

        var gl = this._gl,
            address = this._address;

        if (arguments.length === 0) {
            return address;
        }
        address.u = u;
        address.v = (arguments.length === 1) ? u : v;

        this._glWrapS = toGLWrap(gl, address.u);
        this._glWrapT = toGLWrap(gl, address.v);

        return this;
    };

    /**
     * Sets texture filtering mode.
     *
     * @function B.Render.Sampler#filter
     * @param {B.Render.Filter} mode
     * @returns {B.Render.Sampler} this
     */
    /**
     * Gets texture filtering mode.
     *
     * @function B.Render.Sampler#filter
     * @returns {B.Render.Filter}
     */
    this.filter = function (mode) {

        var gl = this._gl;

        if (arguments.length === 0) {
            return this._filter;
        }
        this._filter = mode;

        switch (this._filter) {
        case F.NONE:
            this._glMagFilter = gl.NEAREST;
            this._glMinFilter[0] = gl.NEAREST;
            this._glMinFilter[1] = gl.NEAREST;
            break;
        case F.BILINEAR:
            this._glMagFilter = gl.LINEAR;
            this._glMinFilter[0] = gl.LINEAR;
            this._glMinFilter[1] = gl.LINEAR_MIPMAP_NEAREST;
            break;
        case F.TRILINEAR:
            this._glMagFilter = gl.LINEAR;
            this._glMinFilter[0] = gl.LINEAR;
            this._glMinFilter[1] = gl.LINEAR_MIPMAP_LINEAR;
            break;
        }
        return this;
    };

    /**
     * Sets texture anisotropy level.
     *
     * To check hardware supports of texture anisotropy use
     *  [device.caps().samplerAnisotropy]{@link B.Render.Device~Caps}.
     *
     * To check maximum anisotropy level use
     *  [device.caps().samplerMaxAnisotropy]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Sampler#anisotropy
     * @param {number} level
     * @returns {B.Render.Sampler} this
     */
    /**
     * Gets texture anisotropy level.
     *
     * @function B.Render.Sampler#anisotropy
     * @returns {number}
     */
    this.anisotropy = function (level) {

        var caps = this._device.caps();

        if (arguments.length === 0) {
            return this._anisotropy;
        }
        this._anisotropy = Math.max(1, Math.min(level,
            caps.samplerAnisotropy ? caps.samplerMaxAnisotropy : 1));

        return this;
    };

    this._apply = function (target, location, unit, value) {

        var gl = this._gl, ext = this._device._ext("texture_filter_anisotropic"),
            handle = null, hasMips = 0;

        if (value instanceof R.Texture) {
            handle = value._glTexture;
            hasMips = (value.mipCount() > 1) ? 1 : 0;

        } else if (value instanceof R.Mip) {
            value = value.texture();
            handle = value._glTexture;
            hasMips = (value.mipCount() > 1) ? 1 : 0;

        } else if (value instanceof R.Depth) {
            if (!this._device.caps().readableDepth) {
                throw new R.Error("reading from the depth buffer is not supported " +
                    "(check device.caps().readableDepth)");
            }
            if (!value.readable()) {
                throw new R.Error("depth buffer wasn't created readable");
            }
            handle = value._glHandle;
        }
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(target, handle);

        if (handle) {
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, this._glMagFilter);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, this._glMinFilter[hasMips]);
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, this._glWrapS);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, this._glWrapT);
            if (ext) {
                gl.texParameteri(target, ext.TEXTURE_MAX_ANISOTROPY_EXT, this._anisotropy);
            }
        }
        gl.uniform1i(location, unit);
    };
};

/**
 * Represent a texture sampler.
 *
 * To get the object use [pass.sampler()]{@link B.Render.Pass#sampler}.
 *
 * @class
 * @this B.Render.Sampler
 */
B.Render.Sampler = function (pass) {

    this._pass = pass;
    this._device = pass.device();
    this._filter = 0;
    this._anisotropy = 1;
    this._address = {
        u: 0,
        v: 0
    };
    this._gl = pass.device()._gl;
    this._glWrapS = 0;
    this._glWrapT = 0;
    this._glMagFilter = 0;
    this._glMinFilter = [0, 0];

    this.default();
};

B.Render.Sampler.prototype = new B.Render.SamplerProto();

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

/**
 * @ignore
 * @this B.Render.Instance
 */
B.Render.InstanceProto = function () {

    var M = B.Math,
        R = B.Render,

        TRANSFORM = R.Instance.TRANSFORM,
        NORMAL_TRANSFORM = R.Instance.NORMAL_TRANSFORM;

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns mesh.
     *
     * @returns {B.Render.Mesh}
     */
    this.mesh = function () {

        return this._mesh;
    };

    /**
     * Returns material.
     *
     * @returns {B.Render.Material}
     */
    this.material = function () {

        return this._material;
    };

    /**
     * Returns bounds.
     *
     * @returns {B.Math.AABox}
     */
    this.bounds = function () {

        return this._bounds;
    };

    /**
     * Sets frustum culling enable.
     *
     * @function B.Render.Instance#culling
     * @param {boolean} enable
     * @returns {B.Render.Instance} this
     */
    /**
     * Gets frustum culling enable.
     *
     * @function B.Render.Instance#culling
     * @returns {boolean}
     */
    this.culling = function (enable) {

        if (arguments.length === 0) {
            return this._culling;
        }
        this._culling = enable;

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
     * Sets a uniform value.
     *
     * @function B.Render.Instance#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @returns {B.Render.Instance} this
     *
     * @example
     * instance.
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
     * instance.uniform("someTexture", null); // removing
     */
    /**
     * Gets a uniform value.
     *
     * @function B.Render.Instance#uniform
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
     * Sets the instance transformation.
     *
     * @param {B.Math.Matrix3 | B.Math.Matrix4} [matrix={@link B.Math.Matrix4.IDENTITY}]
     * @returns {B.Render.Instance} this
     */
    this.setTransform = function (matrix) {

        return this._setTransform(matrix || M.Matrix4.IDENTITY);
    };

    /**
     * Add a given transformation to the instance transformation.
     *
     * @function B.Render.Instance#transform
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Render.Instance} this
     */
    /**
     * Gets the instance transformation.
     *
     * @function B.Render.Instance#transform
     * @returns {B.Math.Matrix4}
     */
    this.transform = (function () {

        var mx4 = M.makeMatrix4();

        return function (matrix) {

            if (arguments.length === 0) {
                return this._transform;
            } else {
                this._transform.mul(matrix instanceof M.Matrix3 ?
                    mx4.identity().setMatrix3(matrix) : matrix);
                return this._setTransform();
            }
        };
    }());

    /**
     * Moves the instance by a given offset vector.
     *
     * @function B.Render.Instance#move
     * @param {B.Math.Vector3} offset
     * @returns {B.Render.Instance} this
     */
    /**
     * Moves the instance by given offsets.
     *
     * @function B.Render.Instance#move
     * @param {number} ox offset along X-axis
     * @param {number} oy offset along Y-axis
     * @param {number} oz offset along Z-axis
     * @returns {B.Render.Instance} this
     */
    this.move = (function () {

        var mx = M.makeMatrix4();

        return function (ox, oy, oz) {

            if (arguments.length === 1) {
                mx.translation(ox.x, ox.y, ox.z);
            } else {
                mx.translation(ox, oy, oz);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Rotates the instance around an arbitrary axis.
     *
     * @function B.Render.Instance#rotate
     * @param {B.Math.Vector3} axis
     * @param {number} angle in radians
     * @returns {B.Render.Instance} this
     */
    /**
     * Rotates instance by a quaternion or canonized euler angles.
     *
     * @function B.Render.Instance#rotate
     * @param {B.Math.Quaternion | B.Math.Angles} object
     * @returns {B.Render.Instance} this
     */
    this.rotate = (function () {

        var mx = M.makeMatrix4();

        return function (axis, angle) {

            if (arguments.length === 1) {
                if (axis instanceof M.Angles) {
                    mx.fromAngles(axis);
                }
                if (axis instanceof M.Quaternion) {
                    mx.fromQuaternion(axis);
                }
            } else {
                mx.rotationAxis(axis, angle);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Scales the instance by a given coefficient vector.
     *
     * @function B.Render.Instance#scale
     * @param {B.Math.Vector3} coeffs
     * @returns {B.Render.Instance} this
     */
    /**
     * Scales instance by given coefficients.
     *
     * @function B.Render.Instance#scale
     * @param {number} cx scale along X-axis
     * @param {number} cy scale along Y-axis
     * @param {number} cz scale along Z-axis
     * @returns {B.Render.Instance} this
     */
    /**
     * Scales (uniformly) instance by a given coefficient.
     *
     * @function B.Render.Instance#scale
     * @param {number} c scale along all axis uniformly
     * @returns {B.Render.Instance} this
     */
    this.scale = (function () {

        var mx = M.makeMatrix4();

        return function (cx, cy, cz) {

            if (arguments.length === 1) {
                if (typeof cx === "number") {
                    mx.scale(cx, cx, cx);
                } else {
                    mx.scale(cx.x, cx.y, cx.z);
                }
            } else {
                mx.scale(cx, cy, cz);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Frees all internal data and detach the resource from linked rendering device.
     */
    this.free = function () {

        this._device._removeInstance(this);

        B.Std.freeObject(this);
    };

    this._bindUniforms = function (pass) {

        var name, value, values = this._uniforms;

        for (name in values) {
            value = values[name];

            if (value === TRANSFORM) {
                value = this._transform;
            } else if (value === NORMAL_TRANSFORM) {
                value = this._normalTransform;
            }
            pass._uniform(name, value);
        }
    };

    this._setTransform = function (transform) {

        if (transform) {
            if (transform instanceof M.Matrix3) {
                this._transform.identity().setMatrix3(transform);
            } else {
                this._transform.copy(transform);
            }
        }
        this._transform.getMatrix3(this._normalTransform).invert().transpose();
        this._bounds.copy(this._mesh.bounds()).transform(this._transform);
        return this;
    };
};

/**
 * Represents a renderable instance.
 * The instance is the elementary unit of rendering (transformed [mesh]{@link B.Render.Mesh} +
 *  [material]{@link B.Render.Material}).
 *
 * To create the object use [device.instance()]{@link B.Render.Device#instance}.
 *
 * @class
 * @this B.Render.Instance
 */
B.Render.Instance = function (device, material, mesh, transform, culling) {

    var M = B.Math;

    this._device = device;

    this._material = material;
    this._mesh = mesh;
    this._transform = transform || M.makeMatrix4();
    this._normalTransform = this._transform.getMatrix3().invert().transpose();
    this._bounds = mesh.bounds().clone().transform(this._transform);
    this._culling = (culling !== undefined) ? culling : true;
    this._uniforms = {};

    this._id = -1;
};

/**
 * Instance transformation uniform placeholder.
 * It allows to set instance transformation matrix to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * instance.uniform("mxTransform", B.Render.Instance.TRANSFORM);
 */
B.Render.Instance.TRANSFORM = {};

/**
 * Instance inverse transpose transformation uniform placeholder.
 * It allows to set instance inverse transpose transformation matrix to
 * a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * instance.uniform("mxNormalTransform", B.Render.Instance.NORMAL_TRANSFORM);
 */
B.Render.Instance.NORMAL_TRANSFORM = {};

B.Render.Instance.prototype = new B.Render.InstanceProto();

/**
 * Reporting that the device has been lost.
 *
 * @event B.Render.Device#lose
 * @type {B.Std.Event}
 */

/**
 * Reporting that the device has been restored.
 *
 * @event B.Render.Device#restore
 * @type {B.Std.Event}
 */

/**
 * Reporting that the linked canvas element size has been changed.
 *
 * @event B.Render.Device#resize
 * @type {B.Std.Event}
 * @property {number} data.width a new width
 * @property {number} data.height a new height
 */


/**
 * @ignore
 * @this B.Render.Device
 */
B.Render.DeviceProto = function () {

    var R = B.Render,
        TIME = R.Device.TIME,
        DELTA_TIME = R.Device.DELTA_TIME,

        searchByName = function (array, name) {

            var i, l;

            for (i = 0, l = array.length; i < l; i += 1) {
                if (array[i].name() === name) {
                    return i;
                }
            }
            return -1;
        };

    /**
     * Makes a mesh.
     *
     * @returns {B.Render.Mesh}
     */
    this.makeMesh = function () {

        var obj = new R.Mesh(this);
        obj._id = this._meshes.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a 2D-texture/cubemap from parameters.
     *
     * To check maximum 2D-texture/cubemap size use
     *  [device.caps().textureMaxSize/cubemapMaxSize]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTexture
     * @param {B.Render.Format} format
     * @param {number} [width] must be power of 2
     * @param {number} [height] must be power of 2
     * @param {number} [mipCount=0] omit if you want to build full mip levels chain
     * @param {number} [faceCount=1] omit for 2D-textures or set to
     *  [CubeFace.COUNT]{@link B.Render.CubeFace.COUNT} for cubemaps
     * @returns {B.Render.Texture}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var
     *     // creating 2D-texture from parameters
     *     textureA = device.makeTexture(Format.RGBA, 128, 128, 1),
     *
     *     // creating cubemap from parameters
     *     textureB = device.makeTexture(Format.RGBA, 128, 128, 1, CubeFace.COUNT);
     */
    /**
     * Makes a 2D-texture from a source object.
     *
     * To check maximum 2D-texture size use
     *  [device.caps().textureMaxSize]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTexture
     * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} object
     * @returns {B.Render.Texture}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var textureA = device.makeTexture(image);
     */
    /**
     * Makes a cubemap from array of six source objects.
     *
     * To check maximum cubemap texture size use
     *  [device.caps().cubemapMaxSize]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTexture
     * @param {Array.<ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement>} array
     *  array of objects
     * @returns {B.Render.Texture}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var textureA = device.makeTexture([imgPX, imgNX, imgPY, imgNY, imgPZ, imgNZ]);
     */
    this.makeTexture = function (format, width, height, mipCount, faceCount) {

        var obj = new R.Texture(this, format, width, height, mipCount, faceCount);
        obj._id = this._textures.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a depth.
     *
     * To check maximum depth-stencil buffer width/height use
     *  [device.caps().depthMaxSize]{@link B.Render.Device~Caps}.
     *
     * @param {B.Render.Format} format
     * @param {number} width must be power of 2
     * @param {number} height must be power of 2
     * @param {boolean} [readable=false] true if you want read from the depth buffer through
     * a 2D-texture uniform (to check hardware support use
     *  [device.caps().readableDepth]{@link B.Render.Device~Caps} flag)
     * @returns {B.Render.Depth}
     * @throws {B.Render.Error} if parameters configuration is invalid
     */
    this.makeDepth = function (format, width, height, readable) {

        var obj = new R.Depth(this, format, width, height, readable);
        obj._id = this._depths.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a target from objects.
     *
     * @function B.Render.Device#makeTarget
     * @param {B.Render.Mip | B.Render.Texture} color
     * @param {B.Render.Depth} [depth]
     * @returns {B.Render.Target}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget(texture.mip(0), depth),
     *     targetB = device.makeTarget(texture, depth); // equivalent to above
     *     targetC = device.makeTarget(texture); // no depth
     */
    /**
     * Makes a target from parameters.
     *
     * @function B.Render.Device#makeTarget
     * @param {B.Render.Format} color
     * @param {B.Render.Format | false} [depth]
     * @returns {B.Render.Target}
     * @param {number} [width]
     * @param {number} [height]
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget(Format.RGBA, Format.DEPTH, 512, 512),
     *     targetB = device.makeTarget(Format.RGBA, false, 512, 512); // no depth
     */
    /**
     * Makes a target from objects (multiple color output).
     *
     * To check maximum color outputs count use
     *  [device.caps().colorTargetCount]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTarget
     * @param {Array.<B.Render.Mip | B.Render.Texture>} color
     * @param {B.Render.Depth} [depth]
     * @returns {B.Render.Target}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget([mip0, mip1], depth),
     *     targetB = device.makeTarget([texture1, texture2], depth); // equivalent to above
     *     targetC = device.makeTarget([texture1, texture2]); // no depth
     */
    /**
     * Makes a target from parameters (multiple color output).
     *
     * To check maximum color outputs count use
     *  [device.caps().colorTargetCount]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTarget
     * @param {Array.<B.Render.Format>} color
     * @param {B.Render.Format | false} [depth]
     * @param {number} [width]
     * @param {number} [height]
     * @returns {B.Render.Target}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget([Format.RGBA, Format.RGB], Format.DEPTH, 512, 512),
     *     targetB = device.makeTarget([Format.RGBA, Format.RGB], false, 512, 512); // no depth
     */
    this.makeTarget = function (color, depth, width, height) {

        var obj = new R.Target(this, color, depth, width, height);
        obj._id = this._targets.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a pass.
     *
     * @param {string} vs vertex shader source
     * @param {string} fs fragment shader source
     * @param {Object.<string, string>} [macros] shader macro defines
     * @returns {B.Render.Pass}
     * @throws {B.Render.Error} if internal or linking error is occurred or shader source is invalid
     * @throws {B.Render.Pass.CompileError} if shader compilation error is occurred
     */
    this.makePass = function (vs, fs, macros) {

        var obj = new R.Pass(this, vs, fs, macros);
        obj._id = this._passes.push(obj) - 1;
        return obj;
    };

    /**
     * Adds a new stage to the grid.
     *
     * @function B.Render.Device#stage
     * @param {string} name
     * @param {string} [before]
     * @returns {B.Render.Stage}
     *
     * @example
     * // adds new stage to the end of grid
     * device.stage("new-name");
     *
     * // adds new stage before existing stage
     * device.stage("new-name", "existing-name");
     */
    /**
     * Returns existing stage from the grid.
     *
     * @function B.Render.Device#stage
     * @param {string} name
     * @returns {B.Render.Stage}
     */
    this.stage = function (name, before) {

        var stages = this._grid.stages, stage,
            index = searchByName(stages, name),
            at = null;

        if (index !== -1) {
            return stages[index];
        }
        if (arguments.length > 1) {
            at = searchByName(stages, before);
        }
        stage = new R.Stage(this, name);
        stages.splice((at !== null) ? at : stages.length, 0, stage);

        return stage;
    };

    /**
     * Returns ordered array of all stage names.
     *
     * @function
     * @returns {Array.<string>}
     */
    this.stages = (function () {

        var result = [];

        return function () {

            var i, l, stages = this._grid.stages;

            result.length = 0;
            for (i = 0, l = stages.length; i < l; i += 1) {
                result[i] = stages[i].name();
            }
            return result;
        };
    }());

    /**
     * Adds a new material to the grid.
     *
     * @function B.Render.Device#material
     * @param {string} name
     * @param {string} [before]
     * @returns {B.Render.Material}
     *
     * @example
     * // adds new material to the end of grid
     * device.material("new-name");
     *
     * // adds new material before existing material
     * device.material("new-name", "existing-name");
     */
    /**
     * Returns existing material from the grid.
     *
     * @function B.Render.Device#material
     * @param {string} name
     * @returns {B.Render.Material}
     */
    this.material = function (name, before) {

        var materials = this._grid.materials, material,
            index = searchByName(materials, name),
            at = null;

        if (index !== -1) {
            return materials[index];
        }
        if (arguments.length > 1) {
            at = searchByName(materials, before);
        }
        at = (at !== null) ? at : materials.length;

        material = new R.Material(this, name);
        materials.splice(at, 0, material);
        this._bins[name] = [];

        return material;
    };

    /**
     * Returns ordered array of all material names.
     *
     * @function
     * @returns {Array.<string>}
     */
    this.materials = (function () {

        var result = [];

        return function () {

            var i, l, materials = this._grid.materials;

            result.length = 0;
            for (i = 0, l = materials.length; i < l; i += 1) {
                result[i] = materials[i].name();
            }
            return result;
        };
    }());

    /**
     * Adds a new instance to the rendering.
     *
     * @param {string | B.Render.Material} material string name or object
     * @param {B.Render.Mesh} mesh
     * @param {B.Math.Matrix4} [transform={@link B.Math.Matrix4.IDENTITY}]
     * @param {boolean} [culling=true] enable/disable frustum culling
     * @returns {B.Render.Instance}
     * @throws {B.Render.Error} if the material is not found in the grid
     */
    this.instance = function (material, mesh, transform, culling) {

        var materials = this._grid.materials,
            materialName = (material instanceof R.Material) ? material.name() : material,
            index = searchByName(materials, materialName),
            instance;

        if (index === -1) {
            throw new R.Error("can't add Instance to Device - the material is not found");
        }
        instance = new R.Instance(this, materials[index], mesh, transform, culling);
        instance._id = this._bins[materialName].push(instance) - 1;

        return instance;
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
     * @function B.Render.Device#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @returns {B.Render.Device} this
     *
     * @example
     * device.
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
     * device.uniform("someTexture", null); // removing
     */
    /**
     * Gets uniform value.
     *
     * @function B.Render.Device#uniform
     * @param {string} name
     * @returns {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     * B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth}
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
     * Describes a frame information.
     *
     * @typedef B.Render.Device~FrameInfo
     * @type {Object}
     * @property {number} fps frames per second
     * @property {number} vertexDrawn drawn vertex count
     * @property {number} vertexTotal total vertex count
     * @property {number} primitiveDrawn drawn primitive count
     * @property {number} primitiveTotal total primitive count
     * @property {number} instanceDrawn drawn instance count
     * @property {number} instanceTotal total instance count
     */

    /**
     * Performs a frame.
     *
     * @function
     * @returns {B.Render.Device~FrameInfo}
     * @fires B.Render.Device#resize
     */
    this.frame = (function () {

        var
            byMeshID = function (a, b) {

                return b.mesh()._id - a.mesh()._id;
            },

            checkResize = function (that) {

                var canvas = that._canvas,
                    clientWidth = canvas.clientWidth,
                    clientHeight = canvas.clientHeight;

                if (canvas.width !== clientWidth ||
                    canvas.height !== clientHeight) {

                    canvas.width = clientWidth;
                    canvas.height = clientHeight;

                    that._target._resize(clientWidth, clientHeight);

                    that.trigger("resize", {
                        width: clientWidth,
                        height: clientHeight
                    });
                }
            },

            resetInfo = function (that) {

                var info = that._frameInfo;

                info.vertexDrawn = 0;
                info.vertexTotal = 0;
                info.primitiveDrawn = 0;
                info.primitiveTotal = 0;
                info.instanceDrawn = 0;
                info.instanceTotal = 0;
            },

            draw = function (that) {

                var iS, lS, stage, stages = that._grid.stages,
                    iM, lM, material, materials = that._grid.materials,
                    bin, bins = that._bins,
                    pass, lastPass = null;

                for (iS = 0, lS = stages.length; iS < lS; iS += 1) {

                    stage = stages[iS];
                    stage._begin();

                    for (iM = 0, lM = materials.length; iM < lM; iM += 1) {

                        material = materials[iM];
                        bin = bins[material.name()];
                        pass = material.pass(stage.name());

                        if (pass && bin.length > 0) {
                            if (lastPass !== pass) {
                                if (lastPass) {
                                    lastPass._end();
                                }
                                pass._begin(lastPass);
                                lastPass = pass;
                            }
                            drawBin(that, bin, material, stage, pass);
                        }
                    }
                    stage._end();
                }
                if (lastPass) {
                    lastPass._end();
                }
            },

            drawBin = (function () {

                var visibles = [];

                return function (that, bin, material, stage, pass) {

                    var i, l, drawn = 0, mesh, instance,
                        info = that._frameInfo;

                    visibles.length = 0;

                    for (i = 0, l = bin.length; i < l; i += 1) {

                        instance = bin[i];
                        mesh = instance.mesh();

                        info.vertexTotal += mesh.vertexCount();
                        info.primitiveTotal += mesh.primitiveCount();
                        info.instanceTotal += 1;

                        if (stage._isVisible(instance)) {

                            visibles[drawn] = instance;
                            drawn += 1;
                            info.vertexDrawn += mesh.vertexCount();
                            info.primitiveDrawn += mesh.primitiveCount();
                            info.instanceDrawn += 1;
                        }
                    }

                    visibles.sort(byMeshID);
                    drawInstances(that, visibles, material, stage, pass);
                };
            }()),

            drawInstances = function (device, instances, material, stage, pass) {

                var i, l, mesh, instance, id, lastID = -1;

                for (i = 0, l = instances.length; i < l; i += 1) {

                    instance = instances[i];
                    mesh = instance.mesh();
                    id = mesh._id;

                    pass._resetUniforms();
                    device._bindUniforms(pass);
                    stage._bindUniforms(pass);
                    material._bindUniforms(pass);
                    instance._bindUniforms(pass);
                    pass._applyUniforms();

                    if (lastID !== id) {
                        lastID = id;
                        pass._bindMesh(mesh);
                    }
                    mesh._draw();
                }
            },

            measureFPS = (function () {

                var UPDATE_INTERVAL = 0.5;

                return function (that) {

                    var time = Date.now(),
                        dt = (time - that._time) / 1000;

                    that._time = time;
                    that._deltaTime = dt;
                    that._intervalTime += dt;
                    that._wrappedTime = (that._wrappedTime + dt) % 1;
                    that._frameCount += 1;

                    if (that._intervalTime >= UPDATE_INTERVAL) {
                        that._frameInfo.fps = that._frameCount / that._intervalTime;
                        that._intervalTime = 0;
                        that._frameCount = 0;
                    }
                };
            }());

        return function () {

            resetInfo(this);

            if (!this._lost) {
                checkResize(this);
                draw(this);
                R.checkGLError(this._gl, "can't make frame");
            }
            measureFPS(this);

            return this._frameInfo;
        };
    }());

    /**
     * Returns device target.
     *
     * @returns {B.Render.Device.Target}
     */
    this.target = function () {

        return this._target;
    };

    /**
     * Returns linked canvas.
     *
     * @returns {HTMLCanvasElement}
     */
    this.canvas = function () {

        return this._canvas;
    };

    /**
     * Represents capabilities of the hardware.
     *
     * @typedef B.Render.Device~Caps
     * @type {Object}
     * @property {boolean} indexUInt 32-bit unsigned integer mesh indices
     * @property {number} textureMaxSize highest possible texture width/height
     * @property {number} cubemapMaxSize highest possible cubemap width/height
     * @property {number} depthMaxSize highest possible depth-stencil buffer width/height
     * @property {boolean} textureDXT compressed texture formats
     * @property {boolean} textureFloat16 16-bit floating point texture formats
     * @property {boolean} textureFloat32 32-bit floating point texture formats
     * @property {boolean} textureFloat16Filter 16-bit floating point texture filtering
     * @property {boolean} textureFloat32Filter 32-bit floating point texture filtering
     * @property {boolean} colorTargetFloat16 rendering to 16-bit floating point texture
     * @property {boolean} colorTargetFloat32 rendering to 32-bit floating point texture
     * @property {number} colorTargetCount highest possible multiple color targets count
     * @property {boolean} samplerAnisotropy anisotropic filtering
     * @property {number} samplerMaxAnisotropy highest possible level of anisotropic filtering
     * @property {boolean} readableDepth reading from the depth buffer through a 2D-texture uniform
     * @property {boolean} writableDepth writing to the depth buffer from the fragment shader
     * @property {boolean} derivatives shader derivatives
     * @property {number} attributeCount highest possible count of vertex shader attributes
     * @property {number} varyingCount highest possible count of shader varyings
     * @property {number} vertexUniformCount highest possible count of vertex shader uniforms
     * @property {number} vertexTextureCount highest possible count of vertex shader textures
     * @property {number} fragmentUniformCount highest possible count of fragment shader uniforms
     * @property {number} fragmentTextureCount highest possible count of fragment shader textures
     */

    /**
     * Returns hardware capabilities.
     *
     * @returns {B.Render.Device~Caps}
     */
    this.caps = function () {

        return this._caps;
    };

    /**
     * Frees all internal data and objects.
     *
     * @function
     */
    this.free = (function () {

        var
            free = function (element) {
                element.free();
            };

        return function () {

            this._meshes.forEach(free);
            this._textures.forEach(free);
            this._depths.forEach(free);
            this._targets.forEach(free);
            this._passes.forEach(free);
            this._grid.stages.forEach(free);
            this._grid.materials.forEach(free);

            this._canvas.removeEventListener("webglcontextlost", this._onLose, false);
            this._canvas.removeEventListener("webglcontextrestored", this._onRestore, false);

            B.Std.freeObject(this);
        };
    }());

    this._bindUniforms = function (pass) {

        var name, value, values = this._uniforms;

        for (name in values) {
            value = values[name];

            if (value === TIME) {
                value = this._wrappedTime;
            } else if (value === DELTA_TIME) {
                value = this._deltaTime;
            }
            pass._uniform(name, value);
        }
    };

    this._removeMesh = function (mesh) {
        B.Std.removeUnordered(this._meshes, mesh._id);
    };

    this._removeTexture = function (texture) {
        B.Std.removeUnordered(this._textures, texture._id);
    };

    this._removeDepth = function (depth) {
        B.Std.removeUnordered(this._depths, depth._id);
    };

    this._removeTarget = function (target) {
        B.Std.removeUnordered(this._targets, target._id);
    };

    this._removePass = function (pass) {
        B.Std.removeUnordered(this._passes, pass._id);
    };

    this._removeStage = function (name) {

        var stages = this._grid.stages,
            index = searchByName(stages, name);

        stages.splice(index, 1);
    };

    this._removeMaterial = (function () {

        var
            free = function (element) {
                element.free();
            };

        return function (name) {

            var materials = this._grid.materials,
                bins = this._bins,
                index = searchByName(materials, name);

            bins[name].forEach(free);
            delete bins[name];
            materials.splice(index, 1);
        };
    }());

    this._removeInstance = function (instance) {

        var bins = this._bins,
            bin = bins[instance.material().name()];

        B.Std.removeUnordered(bin, instance._id);
    };

    this._lose = function () {

        this._lost = true;
        this.trigger("lose");
    };

    this._restore = (function () {

        var
            restore = function (element) {
                element._restore();
            };

        return function () {

            this._initExts();
            this._initCaps();

            this._meshes.forEach(restore);
            this._textures.forEach(restore);
            this._depths.forEach(restore);
            this._targets.forEach(restore);
            this._passes.forEach(restore);

            this._lost = false;
            this.trigger("restore");
        };
    }());

    this._initExts = function () {

        var gl = this._gl,
            exts = this._exts;

        exts["compressed_texture_s3tc"] =
            gl.getExtension("WEBGL_compressed_texture_s3tc") ||
            gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
            gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");

        exts["depth_texture"] =
            gl.getExtension("WEBGL_depth_texture") ||
            gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
            gl.getExtension("MOZ_WEBGL_depth_texture");

        exts["texture_filter_anisotropic"] =
            gl.getExtension("EXT_texture_filter_anisotropic") ||
            gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
            gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

        exts["texture_half_float"] = gl.getExtension("OES_texture_half_float");
        exts["texture_float"] = gl.getExtension("OES_texture_float");
        exts["texture_half_float_linear"] =  gl.getExtension("OES_texture_half_float_linear");
        exts["texture_float_linear"] =  gl.getExtension("OES_texture_float_linear");
        exts["color_buffer_half_float"] = gl.getExtension("EXT_color_buffer_half_float");
        exts["color_buffer_float"] = gl.getExtension("WEBGL_color_buffer_float");
        exts["draw_buffers"] = gl.getExtension("WEBGL_draw_buffers");
        exts["element_index_uint"] = gl.getExtension("OES_element_index_uint");
        exts["standard_derivatives"] = gl.getExtension("OES_standard_derivatives");
        exts["frag_depth"] = gl.getExtension("EXT_frag_depth");
    };

    this._initCaps = function () {

        var gl = this._gl,
            caps = this._caps,
            exts = this._exts,
            extDrawBuf = exts["draw_buffers"],
            extAniso = exts["texture_filter_anisotropic"];

        caps.indexUInt = !!exts["element_index_uint"];
        caps.textureMaxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        caps.cubemapMaxSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        caps.depthMaxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        caps.textureDXT = !!exts["compressed_texture_s3tc"];
        caps.textureFloat16 = !!exts["texture_half_float"];
        caps.textureFloat32 = !!exts["texture_float"];
        caps.textureFloat16Filter = !!exts["texture_half_float_linear"];
        caps.textureFloat32Filter = !!exts["texture_float_linear"];
        caps.colorTargetFloat16 = !!exts["color_buffer_half_float"];
        caps.colorTargetFloat32 = !!exts["color_buffer_float"];
        caps.colorTargetCount = extDrawBuf ?
            gl.getParameter(extDrawBuf.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
        caps.samplerAnisotropy = !!extAniso;
        caps.samplerMaxAnisotropy = extAniso ?
            gl.getParameter(extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
        caps.readableDepth = !!exts["depth_texture"];
        caps.writableDepth = !!exts["frag_depth"];
        caps.derivatives = !!exts["standard_derivatives"];
        caps.attributeCount = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        caps.varyingCount = gl.getParameter(gl.MAX_VARYING_VECTORS);
        caps.vertexUniformCount = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        caps.vertexTextureCount = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        caps.fragmentUniformCount = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        caps.fragmentTextureCount = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    };

    this._make = (function () {

        var F = R.Format,

            checkFormats = function (colorFormat, depthFormat) {

                if (colorFormat !== F.RGB && colorFormat !== F.RGBA) {
                    throw new R.Error("can't make Device.Target - unsupported color format");
                }
                if (depthFormat && (depthFormat !== F.DEPTH && depthFormat !== F.DEPTH_STENCIL)) {
                    throw new R.Error("can't make Device.Target - unsupported depth format");
                }
            },

            resizeCanvas = function (canvas) {

                var clientWidth = canvas.clientWidth,
                    clientHeight = canvas.clientHeight;

                if (canvas.width !== clientWidth ||
                    canvas.height !== clientHeight) {

                    canvas.width = clientWidth;
                    canvas.height = clientHeight;
                }
            },

            initGL = function (that, colorFormat, depthFormat, settings) {

                var canvas = that._canvas;

                settings.alpha = (colorFormat === F.RGBA);
                settings.depth = !!depthFormat;
                settings.stencil = (depthFormat === F.DEPTH_STENCIL);

                try {
                    that._gl = canvas.getContext("webgl", settings) ||
                        canvas.getContext("experimental-webgl", settings);
                } catch(e) {}

                if (!that._gl) {
                    throw new R.Error("can't make Device - WebGL is not supported");
                }

                canvas.addEventListener("webglcontextlost", that._onLose, false);
                canvas.addEventListener("webglcontextrestored", that._onRestore, false);
            };

        return function (colorFormat, depthFormat, settings) {

            var canvas = this._canvas;

            checkFormats(colorFormat, depthFormat);

            resizeCanvas(canvas);

            initGL(this, colorFormat, depthFormat, settings);
            this._initExts();
            this._initCaps();

            R.checkGLError(this._gl, "can't make Device");

            this._target = new R.Device.Target(this, colorFormat, depthFormat,
                canvas.width, canvas.height);

            this._frameInfo = {
                fps: 0,
                vertexDrawn: 0,
                vertexTotal: 0,
                primitiveDrawn: 0,
                primitiveTotal: 0,
                instanceDrawn: 0,
                instanceTotal: 0
            };
        };
    }());

    this._ext = function (name) {

        return this._exts[name];
    };
};

B.Render.DeviceProto.prototype = new B.Std.ListenableProto();


/**
 * Represent a rendering pipeline as stage-material grid.
 * Makes and stores all entities within a rendering context.
 *
 * To create the object use [B.Render.makeDevice()]{@link B.Render.makeDevice}.
 *
 * @class
 * @this B.Render.Device
 * @augments B.Std.Listenable
 */
B.Render.Device = function (canvas, colorFormat, depthFormat, settings) {

    var that = this;

    B.Std.Listenable.call(this);

    this._canvas = canvas;
    this._gl = null;
    this._exts = {};
    this._caps = {};
    this._target = null;
    this._time = 0;
    this._deltaTime = 0;
    this._intervalTime = 0;
    this._wrappedTime = 0;
    this._frameCount = 0;
    this._frameInfo = null;
    this._lost = false;

    this._meshes = [];
    this._textures = [];
    this._depths = [];
    this._targets = [];
    this._passes = [];
    this._bins = {};
    this._grid = {
        stages: [],
        materials: []
    };
    this._uniforms = {};

    this._onLose = function (event) {
        event.preventDefault();
        that._lose();
    };
    this._onRestore = function () {
        that._restore();
    };

    this._make(
        colorFormat || B.Render.Format.RGB,
        (depthFormat !== false) && (depthFormat || B.Render.Format.DEPTH),
        settings || {});
};

/**
 * Device time uniform placeholder.
 * It allows to set the time value (wrapped by 1 ms) to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * device.uniform("time", B.Render.Device.TIME);
 */
B.Render.Device.TIME = {};

/**
 * Device delta time uniform placeholder.
 * It allows to set the delta time value to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * device.uniform("deltaTime", B.Render.Device.DELTA_TIME);
 */
B.Render.Device.DELTA_TIME = {};

B.Render.Device.prototype = new B.Render.DeviceProto();


/**
 * @ignore
 * @this B.Render.Device.Target
 */
B.Render.Device.TargetProto = function () {

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
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns multisample coverage mask size.
     *
     * @returns {number}
     */
    this.multisamples = function () {

        return this._multisamples;
    };

    /**
     * Returns color format.
     *
     * @returns {B.Render.Format}
     */
    this.colorFormat = function () {

        return this._colorFormat;
    };

    /**
     * Returns depth format.
     *
     * @returns {B.Render.Format | false} false if the target isn't using depth buffer
     */
    this.depthFormat = function () {

        return this._depthFormat;
    };

    /**
     * Clones this target to a new target object (it also clones all linked resources).
     *
     * *Note: it converts target size to closest power of two.*
     *
     * @param {number} [scale=1.0] width & height factor
     * @returns {B.Render.Target}
     */
    this.clone = function (scale) {

        scale = (scale > 0.0) ? scale : 1.0;
        return this._device.makeTarget(this._colorFormat, this._depthFormat,
            R.toPowerOfTwo(this._width * scale), R.toPowerOfTwo(this._height * scale));
    };

    this._make = function () {

        var gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._multisamples = gl.getParameter(gl.SAMPLES);
    };

    this._bind = function () {

        var gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    this._clear = function (color, depth, stencil) {

        var gl = this._gl,
            fmt = this._depthFormat,
            bits = gl.COLOR_BUFFER_BIT;

        gl.clearColor(color.r, color.g, color.b, color.a);

        if (fmt === R.Format.DEPTH || fmt === R.Format.DEPTH_STENCIL) {
            gl.clearDepth(depth);
            bits |= gl.DEPTH_BUFFER_BIT;
        }
        if (fmt === R.Format.DEPTH_STENCIL) {
            gl.clearStencil(stencil);
            bits |= gl.STENCIL_BUFFER_BIT;
        }
        gl.clear(bits);
    };

    this._write = function (color, depth, stencil) {

        var gl = this._gl,
            fmt = this._depthFormat;

        R.applyColorMask(gl, color);

        if (fmt === R.Format.DEPTH || fmt === R.Format.DEPTH_STENCIL) {
            gl.depthMask(depth);
        }
        if (fmt === R.Format.DEPTH_STENCIL) {
            gl.stencilMask(stencil);
        }
    };

    this._resize = function (width, height) {

        this._width = width;
        this._height = height;
        this._size.set(width, height);
    };
};

/**
 * Provides interface over the linked canvas element.
 *
 * To get the object use [device.target()]{@link B.Render.Device#target}.
 *
 * @class
 * @this B.Render.Device.Target
 */
B.Render.Device.Target = function (device, colorFormat, depthFormat, width, height) {

    this._device = device;

    this._width = width;
    this._height = height;
    this._size = B.Math.makeVector2(width, height);
    this._multisamples = 0;
    this._colorFormat = colorFormat;
    this._depthFormat = depthFormat;

    this._gl = device._gl;

    this._make();
};

B.Render.Device.Target.prototype = new B.Render.Device.TargetProto();

/**
 * Contains scene graph nodes and utilities.
 *
 * @namespace B.Graph
 */
B.Graph = {};


/**
 * Graph traverse order.
 *
 * @enum {number}
 * @readonly
 */
B.Graph.Order = {

    /**
     * Pre-order (depth-first) traversal.
     *
     * @constant
     */
    PRE: 1,

    /**
     * Post-order (depth-first) traversal.
     *
     * @constant
     */
    POST: 2//,

    /**
     * Level-order (breadth-first) traversal.
     *
     * @constant
     */
    //LEVEL: 3
};


/**
 * Makes a node.
 *
 * @returns {B.Graph.Node}
 */
B.Graph.makeNode = function () {

    return new B.Graph.Node();
};

/**
 * Makes a locator (transformed location in 3D-space).
 *
 * @returns {B.Graph.Locator}
 */
B.Graph.makeLocator = function () {

    return new B.Graph.Locator();
};

/**
 * Makes a visual (transformed mesh + material).
 *
 * @param {B.Render.Device} device a rendering device
 * @returns {B.Graph.Visual}
 */
B.Graph.makeVisual = function (device) {

    return new B.Graph.Visual(device);
};


/**
 * Reporting that node's property has been changed.
 *
 * @event B.Graph.Node#prop-changed
 * @type {B.Std.Event}
 * @property {name} data.name property name
 * @property {value} data.value a new value
 */

/**
 * Reporting that the node has been attached to a new parent.
 *
 * @event B.Graph.Node#attached
 * @type {B.Std.Event}
 */

/**
 * Reporting that a child has been attached to the node.
 *
 * @event B.Graph.Node#child-attached
 * @type {B.Std.Event}
 */

/**
 * Reporting that the node has been detached from its parent.
 *
 * @event B.Graph.Node#detached
 * @type {B.Std.Event}
 */

/**
 * Reporting that a child has been detached from the node.
 *
 * @event B.Graph.Node#child-detached
 * @type {B.Std.Event}
 */

/**
 * Graph traverse callback.
 *
 * @callback B.Graph.Node~TraverseHandler
 * @param {B.Graph.Node} node
 */

/**
 * @ignore
 * @this B.Graph.Node
 */
B.Graph.NodeProto = function () {

    var G = B.Graph;

    /**
     * Clones this node to a new node.
     *
     * @param {boolean} [deep=false] true if you want to clone the whole hierarchy
     * @returns {B.Graph.Node}
     */
    this.clone = function (deep) {

        var cloned = this._clone(),
            i, l, children = this._children;

        cloned._assign(this);

        if (deep) {
            for (i = 0, l = children.length; i < l; i += 1) {
                cloned.attach(children[i].clone(deep));
            }
        }
        return cloned;
    };

    /**
     * Sets property value.
     *
     * @function B.Graph.Node#prop
     * @param {string} name
     * @param {any} value
     * @param {boolean} [deep=false] true if you want to set value to the whole hierarchy
     * @returns {B.Graph.Node} this node
     * @fires B.Graph.Node#prop-changed
     */
    /**
     * Gets property value.
     *
     * @function B.Graph.Node#prop
     * @param {string} name
     * @returns {any}
     */
    this.prop = function (name, value, deep) {

        var i, l, children = this._children;

        if (arguments.length === 1) {
            return this._props[name];
        }
        this._props[name] = value;
        this.trigger("prop-changed", {
            name: name,
            value: value
        });
        if (deep) {
            for (i = 0, l = children.length; i < l; i += 1) {
                children[i].prop(name, value, deep);
            }
        }
        return this;
    };

    /**
     * Returns array of properties names.
     *
     * @returns {Array.<string>}
     */
    this.props = function () {

        return Object.keys(this._props);
    };

    /**
     * Returns parent of this node.
     *
     * @returns {B.Graph.Node}
     */
    this.parent = function () {

        return this._parent;
    };

    /**
     * Returns children of this node.
     *
     * @returns {Array<B.Graph.Node>}
     */
    this.children = function () {

        return this._children;
    };

    /**
     * Finds children of this node by specified property name and value.
     *
     * @param {string} propName
     * @param {any} propValue
     * @param {boolean} [deep=false] true if you want to find through the whole hierarchy
     * @param {Array<B.Graph.Node>} [out] if you need you can pass an existing array to append
     * @returns {Array<B.Graph.Node>}
     */
    this.find = function (propName, propValue, deep, out) {

        var i, l, children = this._children, node;

        out = out || [];

        for (i = 0, l = children.length; i < l; i += 1) {
            node = children[i];
            if (node._props[propName] === propValue) {
                out.push(node);
            }
            if (deep) {
                node.find(propName, propValue, deep, out);
            }
        }
        return out;
    };

    /**
     * Traverses through the node's hierarchy.
     *
     * @param {B.Graph.Node~TraverseHandler} handler a function to execute
     *  when the node is traversed
     * @param {B.Graph.Order} [order=B.Graph.Order.PRE]
     * @returns {B.Graph.Node} this
     */
    this.traverse = function (handler, order) {

        var cur = this, prev = null, nextIndex,
            isPre = (order === undefined) || (order === G.Order.PRE),
            isPost = (order === G.Order.POST);

        while (cur && cur !== this._parent) {
            if (!prev || prev === cur._parent) { // moving down
                if (isPre) {
                    handler(cur);
                }
                prev = cur;
                if (cur._children.length > 0) {
                    cur = cur._children[0]; // down (if not leaf)
                } else {
                    if (isPost) {
                        handler(cur);
                    }
                    cur = cur._parent; // up (if leaf)
                }
            } else { // moving up
                nextIndex = prev._index + 1;
                prev = cur;
                if (nextIndex < cur._children.length) {
                    cur = cur._children[nextIndex]; // down (if not last child)
                } else {
                    if (isPost) {
                        handler(cur);
                    }
                    cur = cur._parent; // up (if last child)
                }
            }
        }
        return this;
    };

    /**
     * Attaches some node to this node.
     *
     * @param {B.Graph.Node} node
     * @returns {B.Graph.Node} this node
     * @fires B.Graph.Node#attached
     * @fires B.Graph.Node#child-attached
     */
    this.attach = function (node) {

        node.detach();

        node._parent = this;
        node._index = this._children.push(node) - 1;

        if (this._attached) {
            this._attached(this._parent);
        }
        node.trigger("attached");
        this.trigger("child-attached");

        return this;
    };

    /**
     * Detaches this node from its parent.
     *
     * If this node is not attached the function will do nothing.
     *
     * @returns {B.Graph.Node} this node
     * @fires B.Graph.Node#detached
     * @fires B.Graph.Node#child-detached
     */
    this.detach = function () {

        var parent = this._parent, last;

        if (parent) {
            last = parent._children.pop();
            if (last._index !== this._index) {
                last._index = this._index;
                parent._children[this._index] = last;
            }
            this._parent = null;
            this._index = -1;

            if (this._detached) {
                this._detached(this._parent);
            }
            this.trigger("detached");
            parent.trigger("child-detached");
        }
        return this;
    };

    this._clone = function () {

        return new G.Node();
    };

    this._assign = function (other) {

        var name;

        B.Std.Listenable.prototype._assign.call(this, other);

        for (name in other._props) {
            this._props[name] = other._props[name];
        }
    };

    this._callDeep = function (funcName) {

        var args = Array.prototype.splice.call(arguments, 1);

        this.traverse(function (node) {
            if (node[funcName]) {
                node[funcName].apply(node, args);
            }
        });
    };
};

B.Graph.NodeProto.prototype = new B.Std.ListenableProto();

/**
 * Represents a scene graph node.
 *
 * To create the object use [B.Graph.makeNode()]{@link B.Graph.makeNode}.
 *
 * @class
 * @this B.Graph.Node
 * @augments B.Std.Listenable
 */
B.Graph.Node = function () {

    B.Std.Listenable.call(this);

    this._props = {};
    this._children = [];
    this._index = -1;
};

B.Graph.Node.prototype = new B.Graph.NodeProto();


/**
 * Reporting that the locator has been transformed.
 *
 * @event B.Graph.Locator#transformed
 * @type {B.Std.Event}
 */

/**
 * @ignore
 * @this B.Graph.Locator
 */
B.Graph.LocatorProto = function () {

    var M = B.Math,
        G = B.Graph;

    /**
     * Moves the locator by a given offset vector.
     *
     * @function B.Graph.Locator#move
     * @param {B.Math.Vector3} offset
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Moves the locator by given offsets.
     *
     * @function B.Graph.Locator#move
     * @param {number} ox offset along X-axis
     * @param {number} oy offset along Y-axis
     * @param {number} oz offset along Z-axis
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    this.move = (function () {

        var mx = M.makeMatrix4();

        return function (ox, oy, oz) {

            if (arguments.length === 1) {
                mx.translation(ox.x, ox.y, ox.z);
            } else {
                mx.translation(ox, oy, oz);
            }
            return this.transform(mx)._rebuildFinal();
        };
    }());

    /**
     * Rotates the locator around an arbitrary axis.
     *
     * @function B.Graph.Locator#rotate
     * @param {B.Math.Vector3} axis
     * @param {number} angle in radians
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Rotates the locator by a quaternion or canonized euler angles.
     *
     * @function B.Graph.Locator#rotate
     * @param {B.Math.Quaternion | B.Math.Angles} object
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    this.rotate = (function () {

        var mx = M.makeMatrix4();

        return function (axis, angle) {

            if (arguments.length === 1) {
                if (axis instanceof M.Angles) {
                    mx.fromAngles(axis);
                }
                if (axis instanceof M.Quaternion) {
                    mx.fromQuaternion(axis);
                }
            } else {
                mx.rotationAxis(axis, angle);
            }
            return this.transform(mx)._rebuildFinal();
        };
    }());

    /**
     * Scales the locator by a given coefficient vector.
     *
     * @function B.Graph.Locator#scale
     * @param {B.Math.Vector3} coeffs
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Scales the locator by given coefficients.
     *
     * @function B.Graph.Locator#scale
     * @param {number} cx scale along X-axis
     * @param {number} cy scale along Y-axis
     * @param {number} cz scale along Z-axis
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Scales the locator uniformly by a given coefficient.
     *
     * @function B.Graph.Locator#scale
     * @param {number} c scale along all axis uniformly
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    this.scale = (function () {

        var mx = M.makeMatrix4();

        return function (cx, cy, cz) {

            if (arguments.length === 1) {
                if (typeof cx === "number") {
                    mx.scale(cx, cx, cx);
                } else {
                    mx.scale(cx.x, cx.y, cx.z);
                }
            } else {
                mx.scale(cx, cy, cz);
            }
            return this.transform(mx);
        };
    }());

    /**
     * Add a given transformation to the locator transformation.
     *
     * @function B.Graph.Locator#transform
     * @param {B.Math.Matrix3 | B.Math.Matrix4} matrix
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    /**
     * Gets the locator transformation.
     *
     * @function B.Graph.Locator#transform
     * @returns {B.Math.Matrix4}
     * @fires B.Graph.Locator#transformed
     */
    this.transform = (function () {

        var mx4 = M.makeMatrix4();

        return function (matrix) {

            if (arguments.length === 0) {
                return this._transform;
            } else {
                this._transform.mul(matrix instanceof M.Matrix3 ?
                    mx4.identity().setMatrix3(matrix) : matrix);
                this._rebuildFinal();
                this.trigger("transformed");
                return this;
            }
        };
    }());

    /**
     * Sets the locator transformation (overwrites the current).
     *
     * @param {B.Math.Matrix3 | B.Math.Matrix4} [matrix={@link B.Math.Matrix4.IDENTITY}]
     * @returns {B.Graph.Locator} this
     * @fires B.Graph.Locator#transformed
     */
    this.setTransform = function (matrix) {

        if (matrix === undefined) {
            this._transform.identity();
        } else if (matrix instanceof M.Matrix3) {
            this._transform.identity().setMatrix3(matrix);
        } else {
            this._transform.copy(matrix);
        }
        this._rebuildFinal();
        this.trigger("transformed");
        return this;
    };

    /**
     * Gets locator's final (world) transformation.
     *
     * @returns {B.Math.Matrix4}
     */
    this.finalTransform = function () {

        return this._finalTransform;
    };

    this._clone = function () {

        return new G.Locator();
    };

    this._assign = function (other) {

        G.Node.prototype._assign.call(this, other);

        this.transform(other._transform);
    };

    this._rebuildFinal = function () {

        var parent = this.parent(), children = this.children(), i, l;

        if (parent && parent.finalTransform) {
            this._finalTransform.copy(parent.finalTransform()).mul(this._transform);
        } else {
            this._finalTransform.copy(this._transform);
        }
        for (i = 0, l = children.length; i < l; i += 1) {
            if (children[i]._rebuildFinal) {
                children[i]._rebuildFinal();
            }
        }
    };
    this._attached = function () {

        this._rebuildFinal();
    };

    this._detached = function () {

        this._rebuildFinal();
    };
};

B.Graph.LocatorProto.prototype = new B.Graph.NodeProto();

/**
 * Represents a locator (transformed location in 3D-space).
 *
 * To create the object use [B.Graph.makeLocator()]{@link B.Graph.makeLocator}.
 *
 * @class
 * @this B.Graph.Locator
 * @augments B.Graph.Node
 */
B.Graph.Locator = function () {

    B.Graph.Node.call(this);

    this._transform = B.Math.makeMatrix4();
    this._finalTransform = B.Math.makeMatrix4();
};

B.Graph.Locator.prototype = new B.Graph.LocatorProto();


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
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
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
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
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
        return this;
    };

    /**
     * Sets a new mesh.
     *
     * @function B.Graph.Visual#mesh
     * @param {B.Render.Mesh} mesh
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
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
     * Sets a uniform value.
     *
     * @function B.Graph.Visual#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
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
     * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
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
     * @returns {B.Math.AABox|null} null if the node is not visible
     */
    this.bounds = function (deep) {

        var thisBounds = this._bounds, nodeBounds;

        if (deep) {
            if (this._instance) {
                thisBounds.copy(this._instance.bounds());
            } else {
                thisBounds.reset();
            }
            this.traverse(function (node) {
                nodeBounds = node.bounds && node.bounds();
                if (nodeBounds) {
                    thisBounds.merge(nodeBounds);
                }
            });
            return thisBounds;
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
        this._bounds = other._bounds;
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
    this._visible = false;
    this._mesh = null;
    this._material = null;
    this._uniforms = {};
    this._culling = true;
    this._bounds = B.Math.makeAABox();
    this._instance = null;
};

B.Graph.Visual.prototype = new B.Graph.VisualProto();
