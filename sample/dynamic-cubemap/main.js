
window.onload = function () {

    var M = B.Math, R = B.Render, S = B.Sample,
        boxes = [];

    new S.App(R.makeDevice(
            document.getElementById("canvas")),
        [
            "dynamic-cubemap/",
            "surface.vs", "surface.fs", "env.vs", "env.fs",
            "media/",
            "amb_nx.png", "amb_ny.png", "amb_nz.png", "amb_px.png", "amb_py.png", "amb_pz.png",
            "env_nx.jpg", "env_ny.jpg", "env_nz.jpg", "env_px.jpg", "env_py.jpg", "env_pz.jpg",
            "concrete_a.jpg", "concrete_n.png", "concrete_h.png"
        ],
        function (app) {

            var V3 = M.Vector3,
                CF = R.CubeFace,
                device = app.device(), boxMesh,
                cubemap = device.makeTexture(R.Format.RGB, 512, 512, 1, R.CubeFace.COUNT),
                depth = device.makeDepth(R.Format.DEPTH, 512, 512),
                clearColor = M.makeColor().setHex(0xcccccc),
                cubeFaceView = [[V3.X, V3.N_Y], [V3.N_X, V3.N_Y], [V3.Y, V3.Z],
                    [V3.N_Y, V3.N_Z], [V3.Z, V3.N_Y], [V3.N_Z, V3.N_Y]],
                cubeFaceProj = M.makeMatrix4().perspective(Math.PI / 2, 1, 0.1, 200),
                view, name, face, stages = [];

            device.
                uniform("ambientIntensity", 0.6).
                uniform("ambientCube", device.makeTexture([
                    app.image("amb_px.png"), app.image("amb_nx.png"), app.image("amb_py.png"),
                    app.image("amb_ny.png"), app.image("amb_pz.png"), app.image("amb_nz.png")
                ])).
                uniform("lightIntensity", 0.7).
                uniform("lightDir", M.makeVector3(0, 1, -1).normalize());

            // create reflection stages

            for (face = 0; face < CF.COUNT; ++face) {
                view = cubeFaceView[face];
                name = "face-" + face;

                device.stage("face-" + face).
                    output(device.makeTarget(cubemap.mip(0, face), depth)).
                    cleanup(clearColor, 1).
                    view(M.makeMatrix4().lookAt(V3.ZERO, view[0], view[1])).proj(cubeFaceProj).
                    uniform("mxVP", R.Stage.VIEW_PROJ);

                stages.push(name);
            }

            // create main stage

            device.stage("main").
                output(device.target()).
                cleanup(clearColor, 1).
                proj(M.makeMatrix4().perspective(Math.PI / 3,
                    device.canvas().width / device.canvas().height, 0.1, 1000)).
                uniform("mxVP", R.Stage.VIEW_PROJ).
                uniform("viewPos", R.Stage.VIEW_POS).
                uniform("environmentCube", cubemap);

            stages.push("main");

            // create environment

            boxMesh = R.genBox(device).computeBounds();

            device.material("env").
                pass(stages,
                    device.makePass(app.text("env.vs"), app.text("env.fs")).
                        state(R.State.POLYGON).cull(R.Face.FRONT).pass()).
                uniform("environmentCube", device.makeTexture([
                    app.image("env_px.jpg"), app.image("env_nx.jpg"), app.image("env_py.jpg"),
                    app.image("env_ny.jpg"), app.image("env_pz.jpg"), app.image("env_nz.jpg")
                ]).buildMips());

            device.instance("env", boxMesh).culling(false);

            // create reflective sphere

            device.material("glass").
                pass("main", device.makePass(app.text("surface.vs"), app.text("surface.fs"),
                    {"SPECULAR": "", "REFLECTION": ""}).
                    sampler("environmentCube").filter(R.Filter.TRILINEAR).pass()).
                uniform("specularPower", 32).
                uniform("specularIntensity", 0.9).
                uniform("reflectionIntensity", 1).
                uniform("fresnelOffset", 0.5).
                uniform("fresnelPower", 0.35);

            device.instance("glass", R.genSphere(device, 30).computeBounds()).
                uniform("mxT", R.Instance.TRANSFORM).
                uniform("mxNT", R.Instance.NORMAL_TRANSFORM).
                uniform("color", M.makeColor().setHex(0xad7e7e));

            // create boxes

            device.material("concrete").
                pass(stages,
                    device.makePass(app.text("surface.vs"), app.text("surface.fs"),
                        {"ALBEDO_MAP": "", "NORMAL_MAP": "", "PARALLAX": ""}).
                        sampler("albedoMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass().
                        sampler("normalMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass().
                        sampler("heightMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass()).
                uniform("albedoMap", device.makeTexture(app.image("concrete_a.jpg")).buildMips()).
                uniform("normalMap", device.makeTexture(app.image("concrete_n.png")).buildMips()).
                uniform("heightMap", device.makeTexture(app.image("concrete_h.png")).buildMips());

            S.generateRandomPoints(10, 5, 30, function (x, y, z) {

                boxes.push(device.instance("concrete", boxMesh).
                    scale(8).move(x + 100, y, z).
                    uniform("mxT", R.Instance.TRANSFORM).
                    uniform("mxNT", R.Instance.NORMAL_TRANSFORM));
            });

            S.generateRandomPoints(10, 5, 30, function (x, y, z) {

                boxes.push(device.instance("concrete", boxMesh).
                    scale(8).move(x - 100, y, z).
                    uniform("mxT", R.Instance.TRANSFORM).
                    uniform("mxNT", R.Instance.NORMAL_TRANSFORM));
            });

            S.generateRandomPoints(10, 5, 30, function (x, y, z) {

                boxes.push(device.instance("concrete", boxMesh).
                    scale(8).move(x, y, z - 100).
                    uniform("mxT", R.Instance.TRANSFORM).
                    uniform("mxNT", R.Instance.NORMAL_TRANSFORM));
            });

            // create camera

            (new S.Camera(device.stage("main"))).
                rotate(Math.PI, 0).
                minRadius(50).maxRadius(200).radius(70);

            S.runFrameInfoUpdate(app);
        },
        function () {

            boxes.forEach(function (box) {
                box.transform(M.makeMatrix4().rotationY(0.005));
            });
        }
    );
};