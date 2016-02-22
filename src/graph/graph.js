
/**
 * Contains scene graph nodes and utilities.
 *
 * @namespace B.Graph
 */
B.Graph = {};

/**
 * Makes a scene graph node.
 *
 * @returns {B.Graph.Node}
 */
B.Graph.makeNode = function () {

    return new B.Graph.Node();
};
