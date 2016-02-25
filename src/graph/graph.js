
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
