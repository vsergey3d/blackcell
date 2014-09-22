
window.onload = function () {

    var M = B.Math, R = B.Render, S = B.Sample;

    new S.App(R.makeDevice(
            document.getElementById("canvas")),
        [
            "shadow-mapping/",
            "surface.vs", "surface.fs", "light.vs", "light.fs", "shadow.vs", "shadow.fs",
            "media/",
            "amb_nx.png", "amb_ny.png", "amb_nz.png", "amb_px.png", "amb_py.png", "amb_pz.png",
            "planks_a.jpg", "planks_n.png", "planks_s.png"
        ],
        function (app) {

            var device = app.device(), boxMesh,
                light = {
                    position: M.makeVector3(40, 50, 0),
                    angle: Math.PI / 2.5,
                    color: M.makeColor(0.7, 1, 0.7),
                    intensity: 1.0,
                    radius: 300,
                    deviation: 1.0,
                    cutoff: 0.0
                },
                poissonDisk = [
                    M.makeVector2(0.1213327, -0.8805006),
                    M.makeVector2(-0.5847559, -0.5600705),
                    M.makeVector2(0.719427, -0.6545772),
                    M.makeVector2(0.3019427, -0.3722998),
                    M.makeVector2(0.8338173, -0.01207058),
                    M.makeVector2(0.1058532, 0.493913),
                    M.makeVector2(-0.4166561, 0.008259133),
                    M.makeVector2(0.6881066, 0.4903894),
                    M.makeVector2(-0.4334792, 0.6122243),
                    M.makeVector2(-0.9658591, 0.1548266),
                    M.makeVector2(0.02265698, 0.9906118)
                ];

            // create shadow stage

            device.stage("shadow").
                output(device.makeTarget(R.Format.RGBA, R.Format.DEPTH, 512, 512)).
                view(M.makeMatrix4().lookAt(light.position, M.Vector3.ZERO, M.Vector3.Z)).
                proj(M.makeMatrix4().perspective(light.angle, 1, 0.1, light.radius)).
                uniform("mxVP", R.Stage.VIEW_PROJ);

            // create main stage

            device.stage("main").
                output(device.target()).
                cleanup(M.makeColor().setHex(0xcccccc), 1).
                proj(M.makeMatrix4().perspective(Math.PI / 3,
                    device.canvas().width / device.canvas().height, 0.1, 1000)).
                uniform("mxVP", R.Stage.VIEW_PROJ).
                uniform("mxLVP", device.stage("shadow").viewProj()).
                uniform("viewPos", R.Stage.VIEW_POS).
                uniform("ambientCube", device.makeTexture([
                    app.image("amb_px.png"), app.image("amb_nx.png"), app.image("amb_py.png"),
                    app.image("amb_ny.png"), app.image("amb_pz.png"), app.image("amb_nz.png")
                ])).
                uniform("ambientIntensity", 0.5).
                uniform("lightPos", device.stage("shadow").viewPos()).
                uniform("lightDir", device.stage("shadow").viewDir()).
                uniform("lightAngle", Math.cos(light.angle * 0.5)).
                uniform("lightColor", light.color).
                uniform("lightParam", M.makeVector4(
                    light.radius, light.intensity, light.deviation, light.cutoff)).
                uniform("shadowMap", device.stage("shadow").output().color()).
                uniform("shadowMapSize", device.stage("shadow").output().size()).
                uniform("shadowSamples", poissonDisk);

            // create light

            device.material("light").
                pass(device.stage("main"),
                    device.makePass(app.text("light.vs"), app.text("light.fs")));

            device.instance("light", R.genSphere(device, 3, 16).computeBounds()).
                uniform("color", light.color);

            // create boxes

            boxMesh = R.genBox(device).computeBounds();

            device.material("wood").
                pass("shadow", device.makePass(app.text("shadow.vs"), app.text("shadow.fs"))).
                pass("main", device.makePass(app.text("surface.vs"), app.text("surface.fs"),
                    {"SHADOW_SAMPLE_COUNT": poissonDisk.length}).
                    sampler("shadowMap").filter(R.Filter.NONE).address(R.Address.CLAMP).pass().
                    sampler("albedoMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass().
                    sampler("normalMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass().
                    sampler("specularMap").filter(R.Filter.TRILINEAR).anisotropy(4).pass()).
                uniform("albedoMap", device.makeTexture(app.image("planks_a.jpg")).buildMips()).
                uniform("normalMap", device.makeTexture(app.image("planks_n.png")).buildMips()).
                uniform("specularMap", device.makeTexture(app.image("planks_s.png")).buildMips()).
                uniform("specularColor", M.makeColor(1, 1, 1)).
                uniform("specularPower", 32).
                uniform("specularIntensity", 2.5);

            S.generateRandomPoints(10, 5, 30, function (x, y, z) {

                device.instance("wood", boxMesh).
                    scale(8).move(x, y, z).
                    uniform("mxT", R.Instance.TRANSFORM).
                    uniform("mxNT", R.Instance.NORMAL_TRANSFORM);
            });

            // create plane

            device.instance("wood", R.genQuad(device, 500, 500, 2, 2).computeBounds()).
                rotate(M.Vector3.X, -Math.PI / 2).move(0, -50, 0).
                uniform("mxT", R.Instance.TRANSFORM).
                uniform("mxNT", R.Instance.NORMAL_TRANSFORM);

            // create camera

            (new S.Camera(device.stage("main"))).
                minVAngle(0).rotate(Math.PI / 4, Math.PI / 3).
                maxRadius(300).radius(200);

            S.runFrameInfoUpdate(app);
        },
        function (app) {

            var pos = M.makeVector3(),
                shadowStage = app.device().stage("shadow");

            // rotate light

            pos.copy(shadowStage.viewPos()).transform(M.makeMatrix4().rotationY(0.01));
            shadowStage.view(M.makeMatrix4().lookAt(pos, M.Vector3.ZERO, M.Vector3.Z));
        }
    );
};