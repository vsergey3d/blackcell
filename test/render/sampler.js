
describe("B.Render.Sampler", function () {

    var R = B.Render,
        F = R.Filter,
        A = R.Address,

        vs = ""+
            "void main()"+
            "{"+
            "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
            "}",

        fs = ""+
            "uniform sampler2D sampler2dUniform;"+
            "void main()"+
            "{"+
            "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
            "}"+
            "",

        addresses = [
            A.WRAP,
            A.MIRROR,
            A.CLAMP
        ],

        addressToStr = function (mode) {

            switch (mode) {
            case A.WRAP:
                return "WRAP";
            case A.MIRROR:
                return "MIRROR";
            case A.CLAMP:
                return "CLAMP";
            }
            return "unknown";
        },

        applySource = function (func) {

            var i, l = sources.length;

            for(i = 0; i < l; i += 1) {
                func(sources[i]);
            }
        },

        makeFrame = function (desc) {

            applySource(function (source) {

                material.uniform("sampler2dUniform", source);
                expect(function () {
                    device.frame();
                },
                "frame execution: " + desc).to.not.throw();
            });
        },

        sources = [],

        canvas, device, pass, sampler,
        target, stage, mesh, material, instance,
        glProgram, gl,
        programStub, attrStub, uniformStub;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
        pass = B.Test.makeTestPass(device);

        target = B.Test.makeTestTarget(device);
        stage = B.Test.makeTestStage(device, target);
        mesh = B.Test.makeTestMesh(device);

        sources.push(B.Test.makeTestDepth(device, true));
        sources.push(B.Test.makeTestTexture(device));
        sources.push(B.Test.makeTestTexture(device, 1));
        sources.push(B.Test.makeTestTexture(device).mip(0));
        sources.push(B.Test.makeTestTexture(device, 1).mip(0));
        sources.push(null);

        material = B.Test.makeTestMaterial(device, "material", stage, pass);
        instance = B.Test.makeTestInstance(device, "material", mesh);

        glProgram = pass._glProgram;
        gl = device._gl;

        programStub = sinon.stub(gl, "getProgramParameter");
        programStub.withArgs(glProgram, gl.ACTIVE_ATTRIBUTES).returns(1);
        programStub.withArgs(glProgram, gl.ACTIVE_UNIFORMS).returns(1);
        programStub.withArgs(glProgram, gl.LINK_STATUS).returns(true);

        attrStub = sinon.stub(device._gl, "getActiveAttrib");
        attrStub.returns({});
        attrStub.withArgs(glProgram, 0).
            returns({ type: gl.FLOAT_VEC3, name: "position" });

        uniformStub = sinon.stub(gl, "getActiveUniform");
        uniformStub.returns({});
        uniformStub.withArgs(glProgram, 0).
            returns({ size: 1, type: gl.SAMPLER_2D, name: "sampler2dUniform" });
    });

    after(function () {

        applySource(function (source) {
            source && source.free && source.free();
        });

        programStub.restore();
        attrStub.restore();
        uniformStub.restore();

        target && target.free();
        stage && stage.free();
        pass && pass.free();
        material && material.free();
        device && device.free();
    });

    it("should exist", function () {
        expect(B.Render.Sampler).to.exist;
    });

    it("should only be created by pass during compilation", function () {

        pass.compile(vs, fs);
        sampler = pass.sampler("sampler2dUniform");

        expect(sampler).to.be.instanceof(B.Render.Sampler);
        expect(sampler.pass()).to.equal(pass);
    });

    describe("#address", function () {

        it("should be B.Render.Address.WRAP by default", function () {

            expect(sampler.address()).to.deep.equal({ u: A.WRAP, v: A.WRAP });
        });

        it("should set texture addressing modes (common)", function () {

            var i, l, mode, str;

            for (i = 0, l = addresses.length; i < l; i += 1) {

                mode = addresses[i];
                sampler.address(mode);
                str = addressToStr(mode);
                expect(sampler.address(), str).to.deep.equal({ u: mode, v: mode });
                makeFrame(addressToStr(str));
            }
        });

        it("should set texture addressing modes (separated)", function () {

            var iu, lu, iv, lv, u, v, str;

            for (iu = 0, lu = addresses.length; iu < lu; iu += 1) {

                for (iv = 0, lv = addresses.length; iv < lv; iv += 1) {

                    u = addresses[iu];
                    v = addresses[iv];
                    sampler.address(u, v);
                    str = "u=" + addressToStr(u) + ", v=" + addressToStr(v);
                    expect(sampler.address(), str).to.deep.equal({ u: u, v: v });
                    makeFrame(addressToStr(str));
                }
            }
        });
    });

    describe("#filter", function () {

        var filters = [
                F.NONE,
                F.BILINEAR,
                F.TRILINEAR
            ],
            filterToStr = function (mode) {

                switch (mode) {
                case F.NONE:
                    return "NONE";
                case F.BILINEAR:
                    return "BILINEAR";
                case F.TRILINEAR:
                    return "TRILINEAR";
                }
                return "unknown";
            };

        it("should be B.Render.Filter.BILINEAR by default", function () {

            expect(sampler.filter()).to.equal(F.BILINEAR);
        });

        it("should set texture filtering mode", function () {

            var mode, i, l;

            for(i = 0, l = filters.length; i < l; i += 1){

                mode = filters[i];
                sampler.filter(mode);
                expect(sampler.filter(), filterToStr(mode)).to.equal(mode);
                makeFrame(filterToStr(mode));
            }
        });
    });

    describe("#anisotropy", function () {

        it("should return 1 by default", function () {

            expect(sampler.anisotropy()).to.equal(1);
            makeFrame("default anisotropy");
        });

        it("should not set value if texture anisotropy is not supported", sinon.test(function () {

            this.stub(device, "caps").returns({ readableDepth: true, samplerAnisotropy : false });

            sampler.anisotropy(8);
            expect(sampler.anisotropy()).to.equal(1);
            makeFrame("anisotropy not supported");
        }));

        it("should set new anisotropy level if texture anisotropy is supported", function () {

            sampler.anisotropy(8);
            expect(sampler.anisotropy()).to.equal(8);
            makeFrame("anisotropy level");
        });

        it("should set maximum anisotropy level if passed value is greater than maximum level",
            function () {

                var maxLevel = device.caps().samplerMaxAnisotropy;

                sampler.anisotropy(maxLevel + 1);
                expect(sampler.anisotropy()).to.equal(maxLevel);
                makeFrame("max anisotropy");
            }
        );

        it("should not throw if texture anisotropy is not supported", sinon.test(function () {

            sinon.stub(device, "_ext").withArgs("texture_filter_anisotropic").
                returns(null);

            sampler.anisotropy(8);
            makeFrame("anisotropy not supported");
        }));
    });
});