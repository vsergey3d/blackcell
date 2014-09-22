
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
