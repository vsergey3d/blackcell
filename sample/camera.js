
B.Sample.CameraProto = function () {

    var M = B.Math,
        min = Math.min, max = Math.max;

    this.target = function (v) {

        if (arguments.length === 0) {
            return this._target;
        }
        this._target.copy(v);
        this.radius(this._radius).rotate(0, 0);
        return this;
    };

    this.radius = (function () {

        var dir = M.makeVector3(),
            mx4 = M.makeMatrix4();

        return function (r) {

            if (arguments.length === 0) {
                return this._radius;
            }
            this._radius = min(max(this._minRadius, r), this._maxRadius);
            dir.subVectors(this._target, this._pos).normalize().mul(this._radius);
            this._pos.copy(this._target).sub(dir);

            this._stage.view(mx4.lookAt(this._pos, this._target, M.Vector3.Y));
            this._callChangeHandler();
            return this;
        };
    }());

    this.minRadius = function (value) {

        if (arguments.length === 0) {
            return this._minRadius;
        }
        this._minRadius = value;
        this.radius(this._radius).rotate(0, 0);
        return this;
    };

    this.maxRadius = function (value) {

        if (arguments.length === 0) {
            return this._maxRadius;
        }
        this._maxRadius = value;
        this.radius(this._radius).rotate(0, 0);
        return this;
    };

    this.minVAngle = function (value) {

        if (arguments.length === 0) {
            return this._minVAngle;
        }
        this._minVAngle = value;
        this.radius(this._radius).rotate(0, 0);
        return this;
    };

    this.maxVAngle = function (value) {

        if (arguments.length === 0) {
            return this._maxVAngle;
        }
        this._maxVAngle = value;
        this.radius(this._radius).rotate(0, 0);
        return this;
    };

    this.sensitivity = function (value) {

        if (arguments.length === 0) {
            return this._sensitivity;
        }
        this._sensitivity = value;
        return this;
    };

    this.zoomSpeed = function (value) {

        if (arguments.length === 0) {
            return this._zoomSpeed;
        }
        this._zoomSpeed = value;
        return this;
    };

    this.rotate = (function () {

        var V3 = M.Vector3,
            mx4 = M.makeMatrix4();

        return function (dha, dva) {

            this._vAngle = min(max(this._vAngle + dva, this._minVAngle), this._maxVAngle);
            this._hAngle = this._hAngle + dha;

            this._pos.set(0, 0, this._radius).
                transform(mx4.rotationAxis(V3.N_X, this._vAngle)).
                transform(mx4.rotationAxis(V3.N_Y, this._hAngle)).
                add(this._target);

            this._stage.view(mx4.lookAt(this._pos, this._target, M.Vector3.Y));
            this._callChangeHandler();
            return this;
        };
    }());

    this._callChangeHandler = function () {

        var handler = this._onChange;

        if (handler) {
            handler(this._pos, this._target, this._radius);
        }
    };

    this._reset = function () {

        this._isPressed = false;
        this._curMouseX = 0;
        this._curMouseY = 0;
    };

    this._onButton = function (button, x, y, pressed) {

        if (button === this._dragButton && pressed) {
            this._curMouseX = x;
            this._curMouseY = y;
            this._isPressed = true;

        } else if (button === this._dragButton && !pressed && this._isPressed) {
            this._reset();
        }
    };

    this._onMove = function (x, y) {

        var dha, dva;

        if (this._isPressed) {
            dha = x - this._curMouseX;
            dva = y - this._curMouseY;
            this._curMouseX = x;
            this._curMouseY = y;

            this.rotate(dha * this._sensitivity, dva * this._sensitivity);
        }
    };

    this._init = function () {

        var that = this,
            canvas = this._device.canvas(),

            get = function (event) {

                event.preventDefault();

                if (!event) {
                    event = window.event;
                }
                return (window.event) ? event.srcElement : event.target;
            },

            onMouseButton = function (event, pressed) {

                var rect, target = get(event);

                if (target) {
                    rect = target.getBoundingClientRect();
                    that._onButton(event.which,
                        event.pageX - rect.left, event.pageY - rect.top, pressed);
                }
            },

            onMouseMove = function (event) {

                var rect, target = get(event);

                if (target) {
                    rect = target.getBoundingClientRect();
                    that._onMove(event.pageX - rect.left, event.pageY - rect.top);
                }
            },

            onMouseOut = function () {
                that._reset();
            },

            onMouseZoom = function (event, delta) {

                var target = get(event);

                if (target) {
                    if (event.wheelDelta) {
                        delta = event.wheelDelta / 40;
                    } else if (event.detail) {
                        delta = -event.detail;
                    }
                    that.radius(that.radius() - delta * that._zoomSpeed);
                }
            };

        canvas.onmouseup = function (event) {
            onMouseButton(event, false);
        };
        canvas.onmousedown = function (event) {
            onMouseButton(event, true);
        };
        canvas.onmousemove = function (event) {
            onMouseMove(event);
        };
        canvas.onmouseout = function (event) {
            onMouseOut(event);
        };
        canvas.onmousewheel = function (event, delta) {
            onMouseZoom(event, delta);
        };
        if (canvas.addEventListener) {
            canvas.addEventListener("DOMMouseScroll", onMouseZoom);
        }
        this.rotate(0, 0);
    };
};

B.Sample.Camera = function (stage, onChange) {

    var M = B.Math;

    this._stage = stage;
    this._device = stage.device();

    this._pos = new M.makeVector3();
    this._target = new M.makeVector3();

    this._radius = 1;
    this._minRadius = 0.1;
    this._maxRadius = 600.0;
    this._vAngle = 0;
    this._hAngle = 0;
    this._minVAngle = -Math.PI / 2 + M.EPSILON;
    this._maxVAngle = Math.PI / 2 - M.EPSILON;
    this._sensitivity = 0.005;
    this._zoomSpeed = 1.7;

    this._dragButton = 1;
    this._isPressed = false;
    this._curMouseX = 0;
    this._curMouseY = 0;
    this._onChange = onChange;

    this._init();
};

B.Sample.Camera.prototype = new B.Sample.CameraProto();
