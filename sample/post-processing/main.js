
window.onload = function () {

    var M = B.Math, R = B.Render, S = B.Sample;

    new S.App(R.makeDevice(
            document.getElementById("canvas")),
        [
            "post-processing/",
            "surface.vs", "surface.fs", "env.vs", "env.fs",
            "quad.vs", "bright.fs", "blur.fs", "combine.fs",
            "media/",
            "amb_nx.png", "amb_ny.png", "amb_nz.png", "amb_px.png", "amb_py.png", "amb_pz.png",
            "env_nx.jpg", "env_ny.jpg", "env_nz.jpg", "env_px.jpg", "env_py.jpg", "env_pz.jpg",
            "planks_a.jpg", "planks_n.png", "planks_s.png"
        ],
        function (app) {

            var device = app.device(), boxMesh,
                gaussianWeights = [0.13702, 0.12961, 0.10971, 0.08310, 0.05633, 0.03416, 0.01854],
                rescaleKernel = [-1.5, -0.5, 0.5, 1.5];

            // create main stage

            device.stage("main").
                output(device.target().clone()).
                cleanup(M.makeColor().setHex(0xcccccc), 1).
                proj(M.makeMatrix4().perspective(Math.PI / 3,
                    device.canvas().width / device.canvas().height, 0.1, 1000)).
                uniform("mxVP", R.Stage.VIEW_PROJ).
                uniform("viewPos", R.Stage.VIEW_POS).
                uniform("ambientIntensity", 0.6).
                uniform("ambientCube", device.makeTexture([
                    app.image("amb_px.png"), app.image("amb_nx.png"), app.image("amb_py.png"),
                    app.image("amb_ny.png"), app.image("amb_pz.png"), app.image("amb_nz.png")
                ])).
                uniform("environmentCube", device.makeTexture([
                    app.image("env_px.jpg"), app.image("env_nx.jpg"), app.image("env_py.jpg"),
                    app.image("env_ny.jpg"), app.image("env_pz.jpg"), app.image("env_nz.jpg")
                ]).buildMips()).
                uniform("lightIntensity", 0.7).
                uniform("lightDir", M.makeVector3(0, 1, -1).normalize());

            // create postprocessing pipeline

            device.stage("bright").
                output(device.stage("main").output().clone(1.0 / rescaleKernel.length)).
                uniform("scale", 1.2).
                uniform("threshold", 0.95).
                uniform("kernel", rescaleKernel).
                uniform("sourceMap", device.stage("main").output().color()).
                uniform("sourceMapSize", device.stage("main").output().size());

            device.stage("h-blur").
                output(device.stage("bright").output().clone()).
                uniform("gaussianWeights", gaussianWeights).
                uniform("sourceMap", device.stage("bright").output().color()).
                uniform("sourceMapSize", device.stage("bright").output().size());

            device.stage("v-blur").
                output(device.stage("bright").output()).
                uniform("gaussianWeights", gaussianWeights).
                uniform("sourceMap", device.stage("h-blur").output().color()).
                uniform("sourceMapSize", device.stage("h-blur").output().size());

            device.stage("combine").
                output(device.target()).
                uniform("sourceMapA", device.stage("main").output().color()).
                uniform("sourceMapB", device.stage("v-blur").output().color());

            device.instance(
                device.material("post-blur").
                    pass("bright", device.makePass(app.text("quad.vs"), app.text("bright.fs"),
                        {"KERNEL_SIZE": rescaleKernel.length})).
                    pass("h-blur", device.makePass(app.text("quad.vs"), app.text("blur.fs"),
                        {"WEIGHT_COUNT": gaussianWeights.length, "HORIZONTAL": ""})).
                    pass("v-blur", device.makePass(app.text("quad.vs"), app.text("blur.fs"),
                        {"WEIGHT_COUNT": gaussianWeights.length, "VERTICAL": ""})).
                    pass("combine", device.makePass(app.text("quad.vs"), app.text("combine.fs"))),
                R.genQuad(device, 2, 2));

            // create environment

            boxMesh = R.genBox(device).computeBounds();

            device.material("env").
                pass("main", device.makePass(app.text("env.vs"), app.text("env.fs")).
                    state(R.State.POLYGON).cull(R.Face.FRONT).pass());

            device.instance("env", boxMesh).culling(false);

            // create boxes

            device.material("wood").
                pass("main", device.makePass(app.text("surface.vs"), app.text("surface.fs")).
                    sampler("albedoMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass().
                    sampler("normalMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass().
                    sampler("specularMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass()).
                uniform("albedoMap", device.makeTexture(app.image("planks_a.jpg")).buildMips()).
                uniform("normalMap", device.makeTexture(app.image("planks_n.png")).buildMips()).
                uniform("specularMap", device.makeTexture(app.image("planks_s.png")).buildMips()).
                uniform("specularColor", M.makeColor(1, 1, 1)).
                uniform("specularPower", 7).
                uniform("specularIntensity", 0.8);

            S.generateRandomPoints(10, 20, 250, function (x, y, z) {

                device.instance("wood", boxMesh).
                    scale(8).move(x, y, z).
                    uniform("mxT", R.Instance.TRANSFORM).
                    uniform("mxNT", R.Instance.NORMAL_TRANSFORM);
            });

            // create camera

            (new S.Camera(device.stage("main"))).
                rotate(0, -Math.PI / 8).
                radius(250);

            S.runFrameInfoUpdate(app);
        }
    );
};