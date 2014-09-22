
/**
 * Reporting that the device has been lost.
 *
 * @event B.Render.Device#lose
 * @type {B.Std.Event}
 */

/**
 * Reporting that the device has been restored.
 *
 * @event B.Render.Device#restore
 * @type {B.Std.Event}
 */

/**
 * Reporting that the linked canvas element size has been changed.
 *
 * @event B.Render.Device#resize
 * @type {B.Std.Event}
 * @property {number} data.width a new width
 * @property {number} data.height a new height
 */


/**
 * @ignore
 * @this B.Render.Device
 */
B.Render.DeviceProto = function () {

    var R = B.Render,
        TIME = R.Device.TIME,
        DELTA_TIME = R.Device.DELTA_TIME,

        searchByName = function (array, name) {

            var i, l;

            for (i = 0, l = array.length; i < l; i += 1) {
                if (array[i].name() === name) {
                    return i;
                }
            }
            return -1;
        };

    /**
     * Makes a mesh.
     *
     * @returns {B.Render.Mesh}
     */
    this.makeMesh = function () {

        var obj = new R.Mesh(this);
        obj._id = this._meshes.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a 2D-texture/cubemap from parameters.
     *
     * To check maximum 2D-texture/cubemap size use
     *  [device.caps().textureMaxSize/cubemapMaxSize]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTexture
     * @param {B.Render.Format} format
     * @param {number} [width] must be power of 2
     * @param {number} [height] must be power of 2
     * @param {number} [mipCount=0] omit if you want to build full mip levels chain
     * @param {number} [faceCount=1] omit for 2D-textures or set to
     *  [CubeFace.COUNT]{@link B.Render.CubeFace.COUNT} for cubemaps
     * @returns {B.Render.Texture}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var
     *     // creating 2D-texture from parameters
     *     textureA = device.makeTexture(Format.RGBA, 128, 128, 1),
     *
     *     // creating cubemap from parameters
     *     textureB = device.makeTexture(Format.RGBA, 128, 128, 1, CubeFace.COUNT);
     */
    /**
     * Makes a 2D-texture from a source object.
     *
     * To check maximum 2D-texture size use
     *  [device.caps().textureMaxSize]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTexture
     * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} object
     * @returns {B.Render.Texture}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var textureA = device.makeTexture(image);
     */
    /**
     * Makes a cubemap from array of six source objects.
     *
     * To check maximum cubemap texture size use
     *  [device.caps().cubemapMaxSize]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTexture
     * @param {Array.<ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement>} array
     *  array of objects
     * @returns {B.Render.Texture}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var textureA = device.makeTexture([imgPX, imgNX, imgPY, imgNY, imgPZ, imgNZ]);
     */
    this.makeTexture = function (format, width, height, mipCount, faceCount) {

        var obj = new R.Texture(this, format, width, height, mipCount, faceCount);
        obj._id = this._textures.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a depth.
     *
     * To check maximum depth-stencil buffer width/height use
     *  [device.caps().depthMaxSize]{@link B.Render.Device~Caps}.
     *
     * @param {B.Render.Format} format
     * @param {number} width must be power of 2
     * @param {number} height must be power of 2
     * @param {boolean} [readable=false] true if you want read from the depth buffer through
     * a 2D-texture uniform (to check hardware support use
     *  [device.caps().readableDepth]{@link B.Render.Device~Caps} flag)
     * @returns {B.Render.Depth}
     * @throws {B.Render.Error} if parameters configuration is invalid
     */
    this.makeDepth = function (format, width, height, readable) {

        var obj = new R.Depth(this, format, width, height, readable);
        obj._id = this._depths.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a target from objects.
     *
     * @function B.Render.Device#makeTarget
     * @param {B.Render.Mip | B.Render.Texture} color
     * @param {B.Render.Depth} [depth]
     * @returns {B.Render.Target}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget(texture.mip(0), depth),
     *     targetB = device.makeTarget(texture, depth); // equivalent to above
     *     targetC = device.makeTarget(texture); // no depth
     */
    /**
     * Makes a target from parameters.
     *
     * @function B.Render.Device#makeTarget
     * @param {B.Render.Format} color
     * @param {B.Render.Format | false} [depth]
     * @returns {B.Render.Target}
     * @param {number} [width]
     * @param {number} [height]
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget(Format.RGBA, Format.DEPTH, 512, 512),
     *     targetB = device.makeTarget(Format.RGBA, false, 512, 512); // no depth
     */
    /**
     * Makes a target from objects (multiple color output).
     *
     * To check maximum color outputs count use
     *  [device.caps().colorTargetCount]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTarget
     * @param {Array.<B.Render.Mip | B.Render.Texture>} color
     * @param {B.Render.Depth} [depth]
     * @returns {B.Render.Target}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget([mip0, mip1], depth),
     *     targetB = device.makeTarget([texture1, texture2], depth); // equivalent to above
     *     targetC = device.makeTarget([texture1, texture2]); // no depth
     */
    /**
     * Makes a target from parameters (multiple color output).
     *
     * To check maximum color outputs count use
     *  [device.caps().colorTargetCount]{@link B.Render.Device~Caps}.
     *
     * @function B.Render.Device#makeTarget
     * @param {Array.<B.Render.Format>} color
     * @param {B.Render.Format | false} [depth]
     * @param {number} [width]
     * @param {number} [height]
     * @returns {B.Render.Target}
     * @throws {B.Render.Error} if parameters configuration is invalid
     *
     * @example
     * var targetA = device.makeTarget([Format.RGBA, Format.RGB], Format.DEPTH, 512, 512),
     *     targetB = device.makeTarget([Format.RGBA, Format.RGB], false, 512, 512); // no depth
     */
    this.makeTarget = function (color, depth, width, height) {

        var obj = new R.Target(this, color, depth, width, height);
        obj._id = this._targets.push(obj) - 1;
        return obj;
    };

    /**
     * Makes a pass.
     *
     * @param {string} vs vertex shader source
     * @param {string} fs fragment shader source
     * @param {Object.<string, string>} [macros] shader macro defines
     * @returns {B.Render.Pass}
     * @throws {B.Render.Error} if internal or linking error is occurred or shader source is invalid
     * @throws {B.Render.Pass.CompileError} if shader compilation error is occurred
     */
    this.makePass = function (vs, fs, macros) {

        var obj = new R.Pass(this, vs, fs, macros);
        obj._id = this._passes.push(obj) - 1;
        return obj;
    };

    /**
     * Adds a new stage to the grid.
     *
     * @function B.Render.Device#stage
     * @param {string} name
     * @param {string} [before]
     * @returns {B.Render.Stage}
     *
     * @example
     * // adds new stage to the end of grid
     * device.stage("new-name");
     *
     * // adds new stage before existing stage
     * device.stage("new-name", "existing-name");
     */
    /**
     * Returns existing stage from the grid.
     *
     * @function B.Render.Device#stage
     * @param {string} name
     * @returns {B.Render.Stage}
     */
    this.stage = function (name, before) {

        var stages = this._grid.stages, stage,
            index = searchByName(stages, name),
            at = null;

        if (index !== -1) {
            return stages[index];
        }
        if (arguments.length > 1) {
            at = searchByName(stages, before);
        }
        stage = new R.Stage(this, name);
        stages.splice((at !== null) ? at : stages.length, 0, stage);

        return stage;
    };

    /**
     * Returns ordered array of all stage names.
     *
     * @function
     * @returns {Array.<string>}
     */
    this.stages = (function () {

        var result = [];

        return function () {

            var i, l, stages = this._grid.stages;

            result.length = 0;
            for (i = 0, l = stages.length; i < l; i += 1) {
                result[i] = stages[i].name();
            }
            return result;
        };
    }());

    /**
     * Adds a new material to the grid.
     *
     * @function B.Render.Device#material
     * @param {string} name
     * @param {string} [before]
     * @returns {B.Render.Material}
     *
     * @example
     * // adds new material to the end of grid
     * device.material("new-name");
     *
     * // adds new material before existing material
     * device.material("new-name", "existing-name");
     */
    /**
     * Returns existing material from the grid.
     *
     * @function B.Render.Device#material
     * @param {string} name
     * @returns {B.Render.Material}
     */
    this.material = function (name, before) {

        var materials = this._grid.materials, material,
            index = searchByName(materials, name),
            at = null;

        if (index !== -1) {
            return materials[index];
        }
        if (arguments.length > 1) {
            at = searchByName(materials, before);
        }
        at = (at !== null) ? at : materials.length;

        material = new R.Material(this, name);
        materials.splice(at, 0, material);
        this._bins[name] = [];

        return material;
    };

    /**
     * Returns ordered array of all material names.
     *
     * @function
     * @returns {Array.<string>}
     */
    this.materials = (function () {

        var result = [];

        return function () {

            var i, l, materials = this._grid.materials;

            result.length = 0;
            for (i = 0, l = materials.length; i < l; i += 1) {
                result[i] = materials[i].name();
            }
            return result;
        };
    }());

    /**
     * Adds a new instance to the rendering.
     *
     * @param {string | B.Render.Material} material string name or object
     * @param {B.Render.Mesh} mesh
     * @param {B.Math.Matrix4} [transform={@link B.Math.Matrix4.IDENTITY}]
     * @param {boolean} [culling=true] enable/disable frustum culling
     * @returns {B.Render.Instance}
     * @throws {B.Render.Error} if the material is not found in the grid
     */
    this.instance = function (material, mesh, transform, culling) {

        var materials = this._grid.materials,
            materialName = (material instanceof R.Material) ? material.name() : material,
            index = searchByName(materials, materialName),
            instance;

        if (index === -1) {
            throw new R.Error("can't add Instance to Device - the material is not found");
        }
        instance = new R.Instance(this, materials[index], mesh, transform, culling);
        instance._id = this._bins[materialName].push(instance) - 1;

        return instance;
    };

    /**
     * Returns array of uniforms names.
     *
     * @returns {Array.<string>}
     */
    this.uniforms = function () {

        return Object.keys(this._uniforms);
    };

    /**
     * Sets uniform value.
     *
     * @function B.Render.Device#uniform
     * @param {string} name
     * @param {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     *  B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth} value
     * @returns {B.Render.Device} this
     *
     * @example
     * device.
     *     uniform("someNumber", 1.5).
     *     uniform("someVector2", B.Math.makeVector2(1, 2)).
     *     uniform("someVector3", B.Math.makeVector3(1, 2, 3)).
     *     uniform("someVector4", B.Math.makeVector4(1, 2, 3, 4)).
     *     uniform("someColor", B.Math.makeColor(1, 0, 0, 0.5)).
     *     uniform("someMatrix3", B.Math.makeMatrix3().setRotationX(Math.PI)).
     *     uniform("someMatrix4", B.Math.makeMatrix4().setTranslation(1, 2, 3)).
     *     uniform("someTexture", dev.makeTexture(image)).
     *     uniform("someTexture", dev.stage("someStage").output().color()).
     *     uniform("someDepth", dev.stage("someStage").output().depth());
     *
     * device.uniform("someTexture", null); // removing
     */
    /**
     * Gets uniform value.
     *
     * @function B.Render.Device#uniform
     * @param {string} name
     * @returns {null | number | B.Math.Vector2 | B.Math.Vector3 | B.Math.Vector4 | B.Math.Color |
     * B.Math.Matrix3 | B.Math.Matrix4 | B.Render.Texture | B.Render.Depth}
     */
    this.uniform = function (name, value) {

        if (arguments.length === 1) {
            return this._uniforms[name] || null;
        } else if (value === null) {
            delete this._uniforms[name];
        } else {
            this._uniforms[name] = value;
        }
        return this;
    };

    /**
     * Describes a frame information.
     *
     * @typedef B.Render.Device~FrameInfo
     * @type {Object}
     * @property {number} fps frames per second
     * @property {number} vertexDrawn drawn vertex count
     * @property {number} vertexTotal total vertex count
     * @property {number} primitiveDrawn drawn primitive count
     * @property {number} primitiveTotal total primitive count
     * @property {number} instanceDrawn drawn instance count
     * @property {number} instanceTotal total instance count
     */

    /**
     * Performs a frame.
     *
     * @function
     * @returns {B.Render.Device~FrameInfo}
     * @fires B.Render.Device#resize
     */
    this.frame = (function () {

        var
            byMeshID = function (a, b) {

                return b.mesh()._id - a.mesh()._id;
            },

            checkResize = function (that) {

                var canvas = that._canvas,
                    clientWidth = canvas.clientWidth,
                    clientHeight = canvas.clientHeight;

                if (canvas.width !== clientWidth ||
                    canvas.height !== clientHeight) {

                    canvas.width = clientWidth;
                    canvas.height = clientHeight;

                    that._target._resize(clientWidth, clientHeight);

                    that.trigger("resize", {
                        width: clientWidth,
                        height: clientHeight
                    });
                }
            },

            resetInfo = function (that) {

                var info = that._frameInfo;

                info.vertexDrawn = 0;
                info.vertexTotal = 0;
                info.primitiveDrawn = 0;
                info.primitiveTotal = 0;
                info.instanceDrawn = 0;
                info.instanceTotal = 0;
            },

            draw = function (that) {

                var iS, lS, stage, stages = that._grid.stages,
                    iM, lM, material, materials = that._grid.materials,
                    bin, bins = that._bins,
                    pass, lastPass = null;

                for (iS = 0, lS = stages.length; iS < lS; iS += 1) {

                    stage = stages[iS];
                    stage._begin();

                    for (iM = 0, lM = materials.length; iM < lM; iM += 1) {

                        material = materials[iM];
                        bin = bins[material.name()];
                        pass = material.pass(stage.name());

                        if (pass && bin.length > 0) {
                            if (lastPass !== pass) {
                                if (lastPass) {
                                    lastPass._end();
                                }
                                pass._begin(lastPass);
                                lastPass = pass;
                            }
                            drawBin(that, bin, material, stage, pass);
                        }
                    }
                    stage._end();
                }
                if (lastPass) {
                    lastPass._end();
                }
            },

            drawBin = (function () {

                var visibles = [];

                return function (that, bin, material, stage, pass) {

                    var i, l, drawn = 0, mesh, instance,
                        info = that._frameInfo;

                    visibles.length = 0;

                    for (i = 0, l = bin.length; i < l; i += 1) {

                        instance = bin[i];
                        mesh = instance.mesh();

                        info.vertexTotal += mesh.vertexCount();
                        info.primitiveTotal += mesh.primitiveCount();
                        info.instanceTotal += 1;

                        if (stage._isVisible(instance)) {

                            visibles[drawn] = instance;
                            drawn += 1;
                            info.vertexDrawn += mesh.vertexCount();
                            info.primitiveDrawn += mesh.primitiveCount();
                            info.instanceDrawn += 1;
                        }
                    }

                    visibles.sort(byMeshID);
                    drawInstances(that, visibles, material, stage, pass);
                };
            }()),

            drawInstances = function (device, instances, material, stage, pass) {

                var i, l, mesh, instance, id, lastID = -1;

                for (i = 0, l = instances.length; i < l; i += 1) {

                    instance = instances[i];
                    mesh = instance.mesh();
                    id = mesh._id;

                    pass._resetUniforms();
                    device._bindUniforms(pass);
                    stage._bindUniforms(pass);
                    material._bindUniforms(pass);
                    instance._bindUniforms(pass);
                    pass._applyUniforms();

                    if (lastID !== id) {
                        lastID = id;
                        pass._bindMesh(mesh);
                    }
                    mesh._draw();
                }
            },

            measureFPS = (function () {

                var UPDATE_INTERVAL = 0.5;

                return function (that) {

                    var time = Date.now(),
                        dt = (time - that._time) / 1000;

                    that._time = time;
                    that._deltaTime = dt;
                    that._intervalTime += dt;
                    that._wrappedTime = (that._wrappedTime + dt) % 1;
                    that._frameCount += 1;

                    if (that._intervalTime >= UPDATE_INTERVAL) {
                        that._frameInfo.fps = that._frameCount / that._intervalTime;
                        that._intervalTime = 0;
                        that._frameCount = 0;
                    }
                };
            }());

        return function () {

            resetInfo(this);

            if (!this._lost) {
                checkResize(this);
                draw(this);
                R.checkGLError(this._gl, "can't make frame");
            }
            measureFPS(this);

            return this._frameInfo;
        };
    }());

    /**
     * Returns device target.
     *
     * @returns {B.Render.Device.Target}
     */
    this.target = function () {

        return this._target;
    };

    /**
     * Returns linked canvas.
     *
     * @returns {HTMLCanvasElement}
     */
    this.canvas = function () {

        return this._canvas;
    };

    /**
     * Represents capabilities of the hardware.
     *
     * @typedef B.Render.Device~Caps
     * @type {Object}
     * @property {boolean} indexUInt 32-bit unsigned integer mesh indices
     * @property {number} textureMaxSize highest possible texture width/height
     * @property {number} cubemapMaxSize highest possible cubemap width/height
     * @property {number} depthMaxSize highest possible depth-stencil buffer width/height
     * @property {boolean} textureDXT compressed texture formats
     * @property {boolean} textureFloat16 16-bit floating point texture formats
     * @property {boolean} textureFloat32 32-bit floating point texture formats
     * @property {boolean} textureFloat16Filter 16-bit floating point texture filtering
     * @property {boolean} textureFloat32Filter 32-bit floating point texture filtering
     * @property {boolean} colorTargetFloat16 rendering to 16-bit floating point texture
     * @property {boolean} colorTargetFloat32 rendering to 32-bit floating point texture
     * @property {number} colorTargetCount highest possible multiple color targets count
     * @property {boolean} samplerAnisotropy anisotropic filtering
     * @property {number} samplerMaxAnisotropy highest possible level of anisotropic filtering
     * @property {boolean} readableDepth reading from the depth buffer through a 2D-texture uniform
     * @property {boolean} writableDepth writing to the depth buffer from the fragment shader
     * @property {boolean} derivatives shader derivatives
     * @property {number} attributeCount highest possible count of vertex shader attributes
     * @property {number} varyingCount highest possible count of shader varyings
     * @property {number} vertexUniformCount highest possible count of vertex shader uniforms
     * @property {number} vertexTextureCount highest possible count of vertex shader textures
     * @property {number} fragmentUniformCount highest possible count of fragment shader uniforms
     * @property {number} fragmentTextureCount highest possible count of fragment shader textures
     */

    /**
     * Returns hardware capabilities.
     *
     * @returns {B.Render.Device~Caps}
     */
    this.caps = function () {

        return this._caps;
    };

    /**
     * Frees all internal data and objects.
     *
     * @function
     */
    this.free = (function () {

        var
            free = function (element) {
                element.free();
            };

        return function () {

            this._meshes.forEach(free);
            this._textures.forEach(free);
            this._depths.forEach(free);
            this._targets.forEach(free);
            this._passes.forEach(free);
            this._grid.stages.forEach(free);
            this._grid.materials.forEach(free);

            this._canvas.removeEventListener("webglcontextlost", this._onLose, false);
            this._canvas.removeEventListener("webglcontextrestored", this._onRestore, false);

            B.Std.freeObject(this);
        };
    }());

    this._bindUniforms = function (pass) {

        var name, value, values = this._uniforms;

        for (name in values) {
            value = values[name];

            if (value === TIME) {
                value = this._wrappedTime;
            } else if (value === DELTA_TIME) {
                value = this._deltaTime;
            }
            pass._uniform(name, value);
        }
    };

    this._removeMesh = function (mesh) {
        B.Std.removeUnordered(this._meshes, mesh._id);
    };

    this._removeTexture = function (texture) {
        B.Std.removeUnordered(this._textures, texture._id);
    };

    this._removeDepth = function (depth) {
        B.Std.removeUnordered(this._depths, depth._id);
    };

    this._removeTarget = function (target) {
        B.Std.removeUnordered(this._targets, target._id);
    };

    this._removePass = function (pass) {
        B.Std.removeUnordered(this._passes, pass._id);
    };

    this._removeStage = function (name) {

        var stages = this._grid.stages,
            index = searchByName(stages, name);

        stages.splice(index, 1);
    };

    this._removeMaterial = (function () {

        var
            free = function (element) {
                element.free();
            };

        return function (name) {

            var materials = this._grid.materials,
                bins = this._bins,
                index = searchByName(materials, name);

            bins[name].forEach(free);
            delete bins[name];
            materials.splice(index, 1);
        };
    }());

    this._removeInstance = function (instance) {

        var bins = this._bins,
            bin = bins[instance.material().name()];

        B.Std.removeUnordered(bin, instance._id);
    };

    this._lose = function () {

        this._lost = true;
        this.trigger("lose");
    };

    this._restore = (function () {

        var
            restore = function (element) {
                element._restore();
            };

        return function () {

            this._initExts();
            this._initCaps();

            this._meshes.forEach(restore);
            this._textures.forEach(restore);
            this._depths.forEach(restore);
            this._targets.forEach(restore);
            this._passes.forEach(restore);

            this._lost = false;
            this.trigger("restore");
        };
    }());

    this._initExts = function () {

        var gl = this._gl,
            exts = this._exts;

        exts["compressed_texture_s3tc"] =
            gl.getExtension("WEBGL_compressed_texture_s3tc") ||
            gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
            gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");

        exts["depth_texture"] =
            gl.getExtension("WEBGL_depth_texture") ||
            gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
            gl.getExtension("MOZ_WEBGL_depth_texture");

        exts["texture_filter_anisotropic"] =
            gl.getExtension("EXT_texture_filter_anisotropic") ||
            gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
            gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

        exts["texture_half_float"] = gl.getExtension("OES_texture_half_float");
        exts["texture_float"] = gl.getExtension("OES_texture_float");
        exts["texture_half_float_linear"] =  gl.getExtension("OES_texture_half_float_linear");
        exts["texture_float_linear"] =  gl.getExtension("OES_texture_float_linear");
        exts["color_buffer_half_float"] = gl.getExtension("EXT_color_buffer_half_float");
        exts["color_buffer_float"] = gl.getExtension("WEBGL_color_buffer_float");
        exts["draw_buffers"] = gl.getExtension("WEBGL_draw_buffers");
        exts["element_index_uint"] = gl.getExtension("OES_element_index_uint");
        exts["standard_derivatives"] = gl.getExtension("OES_standard_derivatives");
        exts["frag_depth"] = gl.getExtension("EXT_frag_depth");
    };

    this._initCaps = function () {

        var gl = this._gl,
            caps = this._caps,
            exts = this._exts,
            extDrawBuf = exts["draw_buffers"],
            extAniso = exts["texture_filter_anisotropic"];

        caps.indexUInt = !!exts["element_index_uint"];
        caps.textureMaxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        caps.cubemapMaxSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        caps.depthMaxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        caps.textureDXT = !!exts["compressed_texture_s3tc"];
        caps.textureFloat16 = !!exts["texture_half_float"];
        caps.textureFloat32 = !!exts["texture_float"];
        caps.textureFloat16Filter = !!exts["texture_half_float_linear"];
        caps.textureFloat32Filter = !!exts["texture_float_linear"];
        caps.colorTargetFloat16 = !!exts["color_buffer_half_float"];
        caps.colorTargetFloat32 = !!exts["color_buffer_float"];
        caps.colorTargetCount = extDrawBuf ?
            gl.getParameter(extDrawBuf.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
        caps.samplerAnisotropy = !!extAniso;
        caps.samplerMaxAnisotropy = extAniso ?
            gl.getParameter(extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
        caps.readableDepth = !!exts["depth_texture"];
        caps.writableDepth = !!exts["frag_depth"];
        caps.derivatives = !!exts["standard_derivatives"];
        caps.attributeCount = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        caps.varyingCount = gl.getParameter(gl.MAX_VARYING_VECTORS);
        caps.vertexUniformCount = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        caps.vertexTextureCount = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        caps.fragmentUniformCount = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        caps.fragmentTextureCount = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    };

    this._make = (function () {

        var F = R.Format,

            checkFormats = function (colorFormat, depthFormat) {

                if (colorFormat !== F.RGB && colorFormat !== F.RGBA) {
                    throw new R.Error("can't make Device.Target - unsupported color format");
                }
                if (depthFormat && (depthFormat !== F.DEPTH && depthFormat !== F.DEPTH_STENCIL)) {
                    throw new R.Error("can't make Device.Target - unsupported depth format");
                }
            },

            resizeCanvas = function (canvas) {

                var clientWidth = canvas.clientWidth,
                    clientHeight = canvas.clientHeight;

                if (canvas.width !== clientWidth ||
                    canvas.height !== clientHeight) {

                    canvas.width = clientWidth;
                    canvas.height = clientHeight;
                }
            },

            initGL = function (that, colorFormat, depthFormat, settings) {

                var canvas = that._canvas;

                settings.alpha = (colorFormat === F.RGBA);
                settings.depth = !!depthFormat;
                settings.stencil = (depthFormat === F.DEPTH_STENCIL);

                try {
                    that._gl = canvas.getContext("webgl", settings) ||
                        canvas.getContext("experimental-webgl", settings);
                } catch(e) {}

                if (!that._gl) {
                    throw new R.Error("can't make Device - WebGL is not supported");
                }

                canvas.addEventListener("webglcontextlost", that._onLose, false);
                canvas.addEventListener("webglcontextrestored", that._onRestore, false);
            };

        return function (colorFormat, depthFormat, settings) {

            var canvas = this._canvas;

            checkFormats(colorFormat, depthFormat);

            resizeCanvas(canvas);

            initGL(this, colorFormat, depthFormat, settings);
            this._initExts();
            this._initCaps();

            R.checkGLError(this._gl, "can't make Device");

            this._target = new R.Device.Target(this, colorFormat, depthFormat,
                canvas.width, canvas.height);

            this._frameInfo = {
                fps: 0,
                vertexDrawn: 0,
                vertexTotal: 0,
                primitiveDrawn: 0,
                primitiveTotal: 0,
                instanceDrawn: 0,
                instanceTotal: 0
            };
        };
    }());

    this._ext = function (name) {

        return this._exts[name];
    };
};

B.Render.DeviceProto.prototype = new B.Std.ListenableProto();


/**
 * Represent a rendering pipeline as stage-material grid.
 * Makes and stores all entities within a rendering context.
 *
 * To create the object use [B.Render.makeDevice()]{@link B.Render.makeDevice}.
 *
 * @class
 * @this B.Render.Device
 * @augments B.Std.Listenable
 */
B.Render.Device = function (canvas, colorFormat, depthFormat, settings) {

    var that = this;

    B.Std.Listenable.call(this);

    this._canvas = canvas;
    this._gl = null;
    this._exts = {};
    this._caps = {};
    this._target = null;
    this._time = 0;
    this._deltaTime = 0;
    this._intervalTime = 0;
    this._wrappedTime = 0;
    this._frameCount = 0;
    this._frameInfo = null;
    this._lost = false;

    this._meshes = [];
    this._textures = [];
    this._depths = [];
    this._targets = [];
    this._passes = [];
    this._bins = {};
    this._grid = {
        stages: [],
        materials: []
    };
    this._uniforms = {};

    this._onLose = function (event) {
        event.preventDefault();
        that._lose();
    };
    this._onRestore = function () {
        that._restore();
    };

    this._make(
        colorFormat || B.Render.Format.RGB,
        (depthFormat !== false) && (depthFormat || B.Render.Format.DEPTH),
        settings || {});
};

/**
 * Device time uniform placeholder.
 * It allows to set the time value (wrapped by 1 ms) to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * device.uniform("time", B.Render.Device.TIME);
 */
B.Render.Device.TIME = {};

/**
 * Device delta time uniform placeholder.
 * It allows to set the delta time value to a uniform value automatically.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * device.uniform("deltaTime", B.Render.Device.DELTA_TIME);
 */
B.Render.Device.DELTA_TIME = {};

B.Render.Device.prototype = new B.Render.DeviceProto();


/**
 * @ignore
 * @this B.Render.Device.Target
 */
B.Render.Device.TargetProto = function () {

    var R = B.Render;

    /**
     * Returns linked rendering device.
     *
     * @returns {B.Render.Device}
     */
    this.device = function () {

        return this._device;
    };

    /**
     * Returns width.
     *
     * @returns {number}
     */
    this.width = function () {

        return this._width;
    };

    /**
     * Returns height.
     *
     * @returns {number}
     */
    this.height = function () {

        return this._height;
    };

    /**
     * Returns width and height.
     *
     * @returns {B.Math.Vector2}
     */
    this.size = function () {

        return this._size;
    };

    /**
     * Returns multisample coverage mask size.
     *
     * @returns {number}
     */
    this.multisamples = function () {

        return this._multisamples;
    };

    /**
     * Returns color format.
     *
     * @returns {B.Render.Format}
     */
    this.colorFormat = function () {

        return this._colorFormat;
    };

    /**
     * Returns depth format.
     *
     * @returns {B.Render.Format | false} false if the target isn't using depth buffer
     */
    this.depthFormat = function () {

        return this._depthFormat;
    };

    /**
     * Clones this target to a new target object (it also clones all linked resources).
     *
     * *Note: it converts target size to closest power of two.*
     *
     * @param {number} [scale=1.0] width & height factor
     * @returns {B.Render.Target}
     */
    this.clone = function (scale) {

        scale = (scale > 0.0) ? scale : 1.0;
        return this._device.makeTarget(this._colorFormat, this._depthFormat,
            R.toPowerOfTwo(this._width * scale), R.toPowerOfTwo(this._height * scale));
    };

    this._make = function () {

        var gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._multisamples = gl.getParameter(gl.SAMPLES);
    };

    this._bind = function () {

        var gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    this._clear = function (color, depth, stencil) {

        var gl = this._gl,
            fmt = this._depthFormat,
            bits = gl.COLOR_BUFFER_BIT;

        gl.clearColor(color.r, color.g, color.b, color.a);

        if (fmt === R.Format.DEPTH || fmt === R.Format.DEPTH_STENCIL) {
            gl.clearDepth(depth);
            bits |= gl.DEPTH_BUFFER_BIT;
        }
        if (fmt === R.Format.DEPTH_STENCIL) {
            gl.clearStencil(stencil);
            bits |= gl.STENCIL_BUFFER_BIT;
        }
        gl.clear(bits);
    };

    this._write = function (color, depth, stencil) {

        var gl = this._gl,
            fmt = this._depthFormat;

        R.applyColorMask(gl, color);

        if (fmt === R.Format.DEPTH || fmt === R.Format.DEPTH_STENCIL) {
            gl.depthMask(depth);
        }
        if (fmt === R.Format.DEPTH_STENCIL) {
            gl.stencilMask(stencil);
        }
    };

    this._resize = function (width, height) {

        this._width = width;
        this._height = height;
        this._size.set(width, height);
    };
};

/**
 * Provides interface over the linked canvas element.
 *
 * To get the object use [device.target()]{@link B.Render.Device#target}.
 *
 * @class
 * @this B.Render.Device.Target
 */
B.Render.Device.Target = function (device, colorFormat, depthFormat, width, height) {

    this._device = device;

    this._width = width;
    this._height = height;
    this._size = B.Math.makeVector2(width, height);
    this._multisamples = 0;
    this._colorFormat = colorFormat;
    this._depthFormat = depthFormat;

    this._gl = device._gl;

    this._make();
};

B.Render.Device.Target.prototype = new B.Render.Device.TargetProto();