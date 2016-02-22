
/**
 * Contains scene graph nodes and utilities.
 *
 * @namespace B.Graph
 */
B.Graph = {};

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
