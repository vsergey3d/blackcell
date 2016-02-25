
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
 * @param {boolean} [deep=false] true if you want to set value through the whole hierarchy
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
