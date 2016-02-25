
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
