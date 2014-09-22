var expect = chai.expect;

var extendMath = function (chai, utils) {

    var EPSILON = B.Math.EPSILON,

        getArgsArray = function () {

            var arg0 = arguments[0],
                val;

            if (arguments.length > 1) {
                val = Array.prototype.slice.call(arguments);
            }
            else if (utils.type(arg0) === "array") {
                val = arg0.slice();
            }
            else if (arg0 instanceof B.Math.Vector2) {
                val = [arg0.x, arg0.y];
            }
            else if (arg0 instanceof B.Math.Vector3) {
                val = [arg0.x, arg0.y, arg0.z];
            }
            else if (arg0 instanceof B.Math.Vector4) {
                val = [arg0.x, arg0.y, arg0.z, arg0.w];
            }
            else if (arg0 instanceof B.Math.Color) {
                val = [arg0.r, arg0.g, arg0.b, arg0.a];
            }
            else if (arg0 instanceof B.Math.Matrix4 || arg0 instanceof B.Math.Matrix3) {
                val = arg0.m.slice();
            }
            else if (arg0 instanceof B.Math.Quaternion) {
                val = [arg0._w, arg0._x, arg0._y, arg0._z];
            }
            else if (arg0 instanceof B.Math.Angles) {
                val = [arg0.yaw(), arg0.pitch(), arg0.roll()];
            }
            else if (arg0 instanceof B.Math.Plane) {
                val = [arg0.normal.x, arg0.normal.y, arg0.normal.z, arg0.distance];
            }
            else if (arg0 instanceof B.Math.AABox) {
                val = [arg0.min.x, arg0.min.y, arg0.min.z, arg0.max.x, arg0.max.y, arg0.max.z];
            }

            return val;
        },

        makeAssertion = function (assertFunc, obj, msg, val) {

            if (obj instanceof B.Math.Vector2) {

                assertFunc(obj.x, msg + "x", val[0]);
                assertFunc(obj.y, msg + "y", val[1]);
            }
            else if (obj instanceof B.Math.Vector3) {

                assertFunc(obj.x, msg + "x", val[0]);
                assertFunc(obj.y, msg + "y", val[1]);
                assertFunc(obj.z, msg + "z", val[2]);
            }
            else if (obj instanceof B.Math.Vector4) {

                assertFunc(obj.x, msg + "x", val[0]);
                assertFunc(obj.y, msg + "y", val[1]);
                assertFunc(obj.z, msg + "z", val[2]);
                assertFunc(obj.w, msg + "w", val[3]);
            }
            else if (obj instanceof B.Math.Color) {

                assertFunc(obj.r, msg + "r", val[0]);
                assertFunc(obj.g, msg + "g", val[1]);
                assertFunc(obj.b, msg + "b", val[2]);
                assertFunc(obj.a, msg + "a", val[3]);
            }
            else if (obj instanceof B.Math.Matrix3) {

                var m3 = obj.m;

                assertFunc(m3[0], msg + "m00", val[0]);
                assertFunc(m3[1], msg + "m10", val[1]);
                assertFunc(m3[2], msg + "m20", val[2]);

                assertFunc(m3[3], msg + "m01", val[3]);
                assertFunc(m3[4], msg + "m11", val[4]);
                assertFunc(m3[5], msg + "m21", val[5]);

                assertFunc(m3[6], msg + "m02", val[6]);
                assertFunc(m3[7], msg + "m12", val[7]);
                assertFunc(m3[8], msg + "m22", val[8]);
            }
            else if (obj instanceof B.Math.Matrix4) {

                var m4 = obj.m;

                assertFunc(m4[0], msg + "m00", val[0]);
                assertFunc(m4[1], msg + "m01", val[1]);
                assertFunc(m4[2], msg + "m02", val[2]);
                assertFunc(m4[3], msg + "m03", val[3]);

                assertFunc(m4[4], msg + "m04", val[4]);
                assertFunc(m4[5], msg + "m05", val[5]);
                assertFunc(m4[6], msg + "m06", val[6]);
                assertFunc(m4[7], msg + "m07", val[7]);

                assertFunc(m4[8], msg + "m08", val[8]);
                assertFunc(m4[9], msg + "m09", val[9]);
                assertFunc(m4[10], msg + "m10", val[10]);
                assertFunc(m4[11], msg + "m11", val[11]);

                assertFunc(m4[12], msg + "m12", val[12]);
                assertFunc(m4[13], msg + "m13", val[13]);
                assertFunc(m4[14], msg + "m14", val[14]);
                assertFunc(m4[15], msg + "m15", val[15]);
            }
            else if (obj instanceof B.Math.Quaternion) {

                assertFunc(obj._w, msg + "w", val[0]);
                assertFunc(obj._x, msg + "x", val[1]);
                assertFunc(obj._y, msg + "y", val[2]);
                assertFunc(obj._z, msg + "z", val[3]);
            }
            else if (obj instanceof B.Math.Angles) {

                assertFunc(obj.yaw(), msg + "yaw", val[0]);
                assertFunc(obj.pitch(), msg + "pitch", val[1]);
                assertFunc(obj.roll(), msg + "roll", val[2]);
            }
            else if (obj instanceof B.Math.Plane) {

                assertFunc(obj.normal.x, msg + "normal.x", val[0]);
                assertFunc(obj.normal.y, msg + "normal.y", val[1]);
                assertFunc(obj.normal.z, msg + "normal.z", val[2]);
                assertFunc(obj.distance, msg + "distance", val[3]);
            }
            else if (obj instanceof B.Math.AABox) {

                assertFunc(obj.min.x, msg + "min.x", val[0]);
                assertFunc(obj.min.y, msg + "min.y", val[1]);
                assertFunc(obj.min.z, msg + "min.z", val[2]);

                assertFunc(obj.max.x, msg + "max.x", val[3]);
                assertFunc(obj.max.y, msg + "max.y", val[4]);
                assertFunc(obj.max.z, msg + "max.z", val[5]);
            }
            else {
                assertFunc(obj, msg, val);
            }
        };

    utils.addMethod(chai.Assertion.prototype, "equalByComponents", function () {

        var obj = utils.flag(this, "object"),
            msg = utils.flag(this, "message"),

            assertFunc = function (obj, msg, val) {
                new chai.Assertion(obj, msg).to.equal(val);
            },

            val = getArgsArray.apply(obj, arguments);

        makeAssertion(assertFunc, obj, msg ? (msg + ": ") : "", val);

    });

    utils.addMethod(chai.Assertion.prototype, "closeByComponents", function () {

        var obj = utils.flag(this, "object"),
            msg = utils.flag(this, "message"),

            assertFunc = function (obj, msg, val) {
                new chai.Assertion(obj, msg).be.closeTo(val, EPSILON);
            },

            val = getArgsArray.apply(this, arguments);

        makeAssertion(assertFunc, obj, msg ? (msg + ": ") : "", val);
    });

};

chai.use(extendMath);