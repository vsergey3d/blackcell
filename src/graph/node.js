/**
 * Node's ID resolver callback.
 *
 * If you are going to clone the whole node's hierarchy
 * sometimes it's necessary to change children IDs somehow.
 * So, you can define ID-resolver (this callback) and pass it to the clone function.
 *
 * @callback B.Graph.Node~IDResolver
 * @param {string} source ID
 * @returns {string} resolved ID
 */

/**
 * @ignore
 * @this B.Graph.Node
 */
B.Graph.NodeProto = function () {

    var G = B.Graph,

        nodes = {},

        nodeByID = function (id) {

            return nodes[id];
        };

    /**
     * Clones this node to a new node.
     *
     * @param {string} id clone's ID
     * @param {boolean} [deep] true if you want to clone the whole hierarchy
     * @param {B.Graph.Node~IDResolver} [childIdResolver] resolves children IDs (in case of deep clone)
     * @returns {B.Graph.Node}
     */
    this.clone = function (id, deep, childIdResolver) {

        var cloned = this._clone(id),
            i, children = this._children;

        if (deep) {
            for (i in children) {
                cloned.attach(children[i].clone(
                    childIdResolver ? childIdResolver(i) : i, true, childIdResolver));
            }
        }
        return cloned;
    };

    this._clone = function (id) {

        return (new G.Node(id))._assign(this);
    };

    this._assign = function (other) {

        var name, thisProps = this._props,
            otherProps = other._props;

        B.Std.Listenable._assign.call(this, other);
        this._parent = null;

        for (name in otherProps) {
            thisProps[name] = otherProps[name];
        }
        return this;
    };

    /**
     * Attach some node to this node.
     *
     * @param {B.Graph.Node} node some node
     * @returns {B.Graph.Node} this node
     */
    this.attach = function (node) {

        node.detach();

        node._parent = this;
        this._children[node._id] = node;

        node.trigger("attached");
        this.trigger("child-attached");

        return this;
    };

    /**
     * Detach a child node from this node.
     *
     * If a node is not a child of this node the function will do nothing.
     *
     * @param {B.Graph.Node} node child node (it will no effects)
     * @returns {B.Graph.Node} this node
     */
    /**
     * Detach this node from its parent.
     *
     * If this node is not atached the function will do nothing.
     *
     * @returns {B.Graph.Node} this node
     */
    this.detach = function (node) {

        if (node === undefined && this._parent) {
            this._parent.detach(this);
        }
        else if (node._id in this._children) {
            delete this._children[node._id];
            node._parent = null;

            node.trigger("detached");
            this.trigger("child-detached");
        }
        return this;
    };

    /**
     * Frees all internal data.
     */
    this.free = function () {

        B.Std.freeObject(this);
    };

    this._make = function () {

        var id = this._id, exists = id in nodes;

        /*if (node === null && exists) {
            delete map[id];
        } else if (exists) {
            throw new Error("B.Graph.Node failed: node's ID is already exist");
        } else {
            map[id] = node;
        }*/
    };
};

B.Graph.NodeProto.prototype = new B.Std.ListenableProto();

/**
 * Represents a graph node.
 *
 * To create the object use [B.Graph.makeNode()]{@link B.Graph#makeNode}.
 *
 * @class
 * @this B.Graph.Node
 */
B.Graph.Node = function (id, props) {

    B.Std.Listenable.call(this);

    this._id = id;
    this._props = props;
    this._children = {};

    this._make();
};

B.Graph.Node.prototype = new B.Graph.NodeProto();
