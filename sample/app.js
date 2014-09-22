
B.Sample.AppProto = function () {

    this.frameInfo = function () {

        return this._frameInfo;
    };

    this.canvas = function () {

        return this._device.canvas();
    };

    this.device = function () {

        return this._device;
    };

    this.image = function (name) {

        return this._images[name];
    };

    this.text = function (name) {

        return this._texts[name];
    };

    this._loadText = function (path, src) {

        var that = this,
            xhr = new XMLHttpRequest();

        xhr.open("GET", path + src, true);

        xhr.onreadystatechange = function () {

            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status !== 200) {
                xhr.onerror();
                return;
            }
            that._loaded(that._texts, src, xhr.responseText);
        };

        xhr.onerror = function () {
            throw new Error("can't load text file [" + path + src + "]");
        };

        xhr.send(null);
    };

    this._loadImage = function (path, src) {

        var that = this,
            img = new Image();

        img.onload = function () {
            that._loaded(that._images, src, img);
        };

        img.onerror = function () {
            throw new Error("can't load image file [" + path + src + "]");
        };

        img.crossOrigin = "use-credentials";
        img.src = path + src;
    };

    this._loaded = function (storage, key, value) {

        if (key in storage) {
            throw new Error("resource [" + key + "] already loaded");
        }
        storage[key] = value;

        this._loads -= 1;
    };

    this._init = (function () {

        var IMAGE = /^\w+.(?:jpg|png)$/,

            showLoading = function (canvas) {

                var div = document.createElement("div");
                div.id = "loading";
                div.innerHTML = "<p style='color: #aaaaaa; font-size: 20px; " +
                    "padding: 30px'>Loading...</p>";
                div.style.cssText = "position: absolute; top:" + canvas.offsetTop + "px";
                canvas.parentNode.appendChild(div);
            },

            hideLoading = function () {

                var div = document.getElementById("loading");
                div.parentNode.removeChild(div);
            };

        return function (loads) {

            var i, l, str, path = "", frame;

            for (i = 0, l = loads.length; i < l; i += 1) {
                str = loads[i];

                if (str.lastIndexOf("/") === str.length - 1) {
                    path = str;
                } else {
                    if (IMAGE.test(str)) {
                        this._loadImage(path, str);
                    } else {
                        this._loadText(path, str);
                    }
                    this._loads += 1;
                }
            }

            frame = (function (that) {

                var lastTime, dt;

                return function (time) {

                    dt = lastTime ? time - lastTime : 0;
                    lastTime = time;

                    if (!that._initialized) {
                        if (that._loads === 0) {
                            if (that._onInit) {
                                that._onInit.call(that, that);
                            }
                            that._initialized = true;
                            hideLoading();
                        }
                    } else {
                        if (that._onFrame) {
                            that._onFrame.call(that, that, time, dt);
                        }
                        that._frameInfo = that._device.frame();
                    }
                    requestAnimationFrame(frame);
                };
            }(this));

            showLoading(this._device.canvas());
            requestAnimationFrame(frame);
        };
    }());
};

B.Sample.App = function (device, loads, onInit, onFrame) {

    this._device = device;
    this._texts = {};
    this._images = {};
    this._loads = 0;
    this._initialized = false;
    this._onInit = onInit;
    this._onFrame = onFrame;
    this._frameInfo = 0;

    this._init(loads);
};

B.Sample.App.prototype = new B.Sample.AppProto();
