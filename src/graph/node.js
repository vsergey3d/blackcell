
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
 * @ignore
 * @this B.Graph.Node
 */
B.Graph.NodeProto = function () {

    /**
     * Clones this node to a new node.
     *
     * @param {boolean} [deep=false] true if you want to clone the whole hierarchy
     * @returns {B.Graph.Node}
     */
    this.clone = function (deep) {

        var cloned = this._clone(),
            i, l, children = this._children;

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
     * @param {boolean} [trigger=true] true if you want to trigger the "prop-changed" event
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
    this.prop = function (name, value, deep, trigger) {

        var i, l, children = this._children;

        if (arguments.length === 1) {
            return this._props[name];
        }
        this._props[name] = value;

        if(trigger === undefined || trigger === true) {
            this.trigger("prop-changed", {
                name: name,
                value: value
            });
        }
        if (deep) {
            for (i = 0, l = children.length; i < l; i += 1) {
                children[i].prop(name, value, deep, trigger);
            }
        }
        return this;
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

            this.trigger("detached");
            parent.trigger("child-detached");
        }
        return this;
    };

    /**
     * Detaches the node and frees all internal data.
     *
     * If this node is not attached the function will not trigger
     *  "detached" and "child-detached" events.
     *
     * @fires B.Graph.Node#detached
     * @fires B.Graph.Node#child-detached
     */
    this.free = function () {

        this.detach();
        B.Std.freeObject(this);
    };

    this._clone = function () {

        var node = new B.Graph.Node(), name;

        for (name in this._props) {
            node._props[name] = this._props[name];
        }
        return node;
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
