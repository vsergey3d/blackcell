
var M = B.Math, R = B.Render, S = B.Sample;

window.onload = function () {

    new S.App(R.makeDevice(
            document.getElementById("canvas")),
        [
            "simple-materials/",
            "surface.vs", "surface.fs", "light.vs", "light.fs", "env.vs", "env.fs",
            "media/",
            "env_nx.jpg", "env_ny.jpg", "env_nz.jpg", "env_px.jpg", "env_py.jpg", "env_pz.jpg",
            "amb_nx.png", "amb_ny.png", "amb_nz.png", "amb_px.png", "amb_py.png", "amb_pz.png",
            "stub_a.png", "stub_n.png", "stub_s.png",
            "planks_a.jpg", "planks_n.png", "planks_s.png",
            "metal_a.png", "metal_n.png", "metal_s.png",
            "brick_a.png", "brick_n.png", "brick_h.png",
            "concrete_a.jpg", "concrete_n.png", "concrete_h.png"
        ],
        function (app) {

            var device = app.device(), mainStage, boxMesh, sphereMesh, keys,
                lights = [
                    {
                        position: M.makeVector3(60, 90, 60),
                        color: M.makeColor(1, 0.7, 0.7),
                        intensity: 1.0,
                        radius: 200,
                        deviation: 3.0,
                        cutoff: 0.0
                    },
                    {
                        position: M.makeVector3(60, 90, -60),
                        color: M.makeColor(0.7, 0.7, 1),
                        intensity: 1.0,
                        radius: 200,
                        deviation: 3.0,
                        cutoff: 0.0
                    },
                    {
                        position: M.makeVector3(-60, 90, 60),
                        color: M.makeColor(0.7, 1, 0.7),
                        intensity: 1.0,
                        radius: 200,
                        deviation: 3.0,
                        cutoff: 0.0
                    },
                    {
                        position: M.makeVector3(-60, 90, -60),
                        color: M.makeColor(1, 1, 1),
                        intensity: 1.0,
                        radius: 200,
                        deviation: 3.0,
                        cutoff: 0.0
                    }
                ],
                materials = {
                    "wood": {
                        macros: ["SPECULAR"],
                        params: {
                            transparency: 1.0,
                            color: M.makeColor(1, 1, 1),
                            albedoMap: device.makeTexture(app.image("planks_a.jpg")).buildMips(),
                            normalMap: device.makeTexture(app.image("planks_n.png")).buildMips(),
                            specularMap: device.makeTexture(app.image("planks_s.png")).buildMips(),
                            specularColor: M.makeColor(1, 1, 1),
                            specularPower: 7,
                            specularIntensity: 0.8
                        }
                    },
                    "brick": {
                        macros: ["PARALLAX"],
                        params: {
                            transparency: 1.0,
                            color: M.makeColor(1, 1, 1),
                            albedoMap: device.makeTexture(app.image("brick_a.png")).buildMips(),
                            normalMap: device.makeTexture(app.image("brick_n.png")).buildMips(),
                            heightMap: device.makeTexture(app.image("brick_h.png")).buildMips(),
                            parallaxScale: 0.015
                        }
                    },
                    "copper": {
                        macros: ["SPECULAR", "REFLECTION"],
                        params: {
                            transparency: 1.0,
                            color: M.makeColor(0.67, 0.67, 0.67),
                            albedoMap: device.makeTexture(app.image("stub_a.png")).buildMips(),
                            normalMap: device.makeTexture(app.image("stub_n.png")).buildMips(),
                            specularMap: device.makeTexture(app.image("stub_s.png")).buildMips(),
                            specularPower: 15,
                            specularIntensity: 1.35,
                            reflectionIntensity: 1,
                            fresnelOffset: 0.5,
                            fresnelPower: 0.35
                        }
                    },
                    "metal": {
                        macros: ["SPECULAR", "REFLECTION"],
                        params: {
                            transparency: 1.0,
                            color: M.makeColor(1, 1, 1),
                            albedoMap: device.makeTexture(app.image("metal_a.png")).buildMips(),
                            normalMap: device.makeTexture(app.image("metal_n.png")).buildMips(),
                            specularMap: device.makeTexture(app.image("metal_s.png")).buildMips(),
                            specularPower: 11,
                            specularIntensity: 1.66,
                            reflectionIntensity: 0.1,
                            fresnelOffset: 0.5,
                            fresnelPower: 0.48
                        }
                    },
                    "concrete": {
                        macros: ["PARALLAX"],
                        params: {
                            transparency: 1.0,
                            color: M.makeColor(1, 1, 1),
                            albedoMap: device.makeTexture(app.image("concrete_a.jpg")).buildMips(),
                            normalMap: device.makeTexture(app.image("concrete_n.png")).buildMips(),
                            heightMap: device.makeTexture(app.image("concrete_h.png")).buildMips(),
                            parallaxScale: 0.002
                        }
                    },
                    "glass": {
                        macros: ["SPECULAR", "REFLECTION"],
                        params: {
                            transparency: 0.6,
                            color: M.makeColor(0.5, 0.5, 1),
                            albedoMap: device.makeTexture(app.image("stub_a.png")).buildMips(),
                            normalMap: device.makeTexture(app.image("stub_n.png")).buildMips(),
                            specularMap: device.makeTexture(app.image("stub_s.png")).buildMips(),
                            specularPower: 1,
                            specularIntensity: 2,
                            reflectionIntensity: 1,
                            fresnelOffset: 0.3,
                            fresnelPower: 0.47
                        }
                    }
                },

                addMaterial = function (name, desc) {

                    var pass, material, params = desc.params,
                        macros = {"LIGHT_COUNT": lights.length.toString()};

                    desc.macros.forEach(function (macro) {
                        macros[macro] = "";
                    });
                    pass = device.makePass(app.text("surface.vs"), app.text("surface.fs"), macros);

                    material = device.material(name).pass(mainStage, pass);

                    if (macros["REFLECTION"]) {
                        pass.sampler("environmentCube").filter(R.Filter.TRILINEAR);
                    }
                    if (params.transparency < 1.0) {
                        pass.state(R.State.POLYGON).cull(false).pass().
                            state(R.State.BLEND).src(R.Blend.SRC_ALPHA).
                                dest(R.Blend.INV_SRC_ALPHA).eq(R.BlendEq.ADD);
                    }
                    Object.keys(params).forEach(function (paramName) {

                        if (paramName.search("Map") !== -1) {
                            pass.sampler(paramName).filter(R.Filter.TRILINEAR).anisotropy(4);
                        }
                        material.uniform(paramName, params[paramName]);
                    });
                };

            // create main stage

            mainStage = device.stage("main").
                cleanup(M.makeColor().setHex(0xeeeeee), 1, 0).
                proj(M.makeMatrix4().perspective(Math.PI / 3,
                    device.canvas().width / device.canvas().height, 0.1, 1000)).
                output(device.target()).
                uniform("mxVP", R.Stage.VIEW_PROJ).
                uniform("viewPos", R.Stage.VIEW_POS).
                uniform("ambientCube", device.makeTexture([
                    app.image("amb_px.png"), app.image("amb_nx.png"), app.image("amb_py.png"),
                    app.image("amb_ny.png"), app.image("amb_pz.png"), app.image("amb_nz.png")
                ])).
                uniform("ambientIntensity", 0.6).
                uniform("environmentCube", device.makeTexture([
                    app.image("env_px.jpg"), app.image("env_nx.jpg"), app.image("env_py.jpg"),
                    app.image("env_ny.jpg"), app.image("env_pz.jpg"), app.image("env_nz.jpg")
                ]).buildMips()).
                uniform("lightPos", []).
                uniform("lightColor", []).
                uniform("lightParam", []);

            // create environment

            boxMesh = R.genBox(device).computeBounds();

            device.material("env").
                pass(mainStage, device.makePass(app.text("env.vs"), app.text("env.fs")).
                    state(R.State.POLYGON).cull(R.Face.FRONT).pass());

            device.instance("env", boxMesh).culling(false);

            // create lights

            sphereMesh = R.genSphere(device, 3, 16).computeBounds();

            device.material("light").
                pass(mainStage, device.makePass(app.text("light.vs"), app.text("light.fs"),
                    {"LIGHT_COUNT": lights.length.toString()}));

            lights.forEach(function (light, i) {

                device.instance("light", sphereMesh).
                    uniform("index", i).
                    uniform("color", light.color);

                mainStage.uniform("lightPos")[i] = light.position;
                mainStage.uniform("lightColor")[i] = light.color;
                mainStage.uniform("lightParam")[i] = M.makeVector4(
                    light.radius, light.intensity, light.deviation, light.cutoff);
            });

            // create boxes

            keys = Object.keys(materials);
            keys.forEach(function (name, i) {

                addMaterial(name, materials[name]);

                device.instance(name, boxMesh).
                    scale(25).move(50, 50, 0).
                    rotate(M.Vector3.Y, Math.PI * 2 / keys.length * i).
                    uniform("mxT", R.Instance.TRANSFORM).
                    uniform("mxNT", R.Instance.NORMAL_TRANSFORM);
            });

            // create plane

            device.instance("wood", R.genQuad(device, 400, 400, 2, 2).computeBounds()).
                rotate(M.Vector3.X, -Math.PI / 2).
                uniform("mxT", R.Instance.TRANSFORM).
                uniform("mxNT", R.Instance.NORMAL_TRANSFORM);

            // create camera

            (new S.Camera(mainStage)).
                target(M.makeVector3(0, 25, 0)).
                minVAngle(0).rotate(Math.PI / 4, Math.PI / 4).
                minRadius(77).maxRadius(300).radius(200);

                S.runFrameInfoUpdate(app);
        },
        function (app) {

            var lights = app.device().stage("main").uniform("lightPos");

            // rotate lights

            lights.forEach(function (light) {
                light.transform(M.makeMatrix4().rotationY(0.01));
            });
        }
    );
};