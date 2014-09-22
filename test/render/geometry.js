
describe("B.Render.genQuad", function () {

    var R = B.Render,
        A = R.Attribute,

        quadMesh, canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    afterEach(function () {
        quadMesh && quadMesh.free();
    });

    it("should make quad mesh", function () {

        quadMesh = R.genQuad(device);
        expect(quadMesh).to.be.instanceof(R.Mesh);
        expect(quadMesh.device()).to.equal(device);
    });

    it("should make mesh which has positions, normals, tangents and uv-coordinates",
        function () {

            quadMesh = R.genQuad(device);

            expect(quadMesh.attribute("position"), "position").to.exist.and.equal(A.POSITION);
            expect(quadMesh.attribute("normal"),"normal").to.exist.and.equal(A.NORMAL);
            expect(quadMesh.attribute("tangent"), "tangent").to.exist.and.equal(A.TANGENT);
            expect(quadMesh.attribute("uv"), "uv").to.exist.and.equal(A.UV);
        }
    );

    it("should make quad mesh with default parameters if not passed", function () {

        quadMesh = R.genQuad(device);
        expect(quadMesh.vertices(), "vertices").to.have.length.above(0);
        expect(quadMesh.indices(), "indices").to.have.length.above(0);
    });

    it("should make quad mesh with passed parameters", function () {

        quadMesh = R.genQuad(device, 5.0, 5.0, 0.5, 0.5);
        expect(quadMesh.vertices(), "vertices").to.have.length.above(0);
        expect(quadMesh.indices(), "indices").to.have.length.above(0);
    });
});

describe("B.Render.genBox", function () {

    var R = B.Render,
        A = R.Attribute,

        boxMesh, canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    afterEach(function () {
        boxMesh && boxMesh.free();
    });

    it("should make box mesh", function () {

        boxMesh = R.genBox(device);
        expect(boxMesh).to.be.instanceof(R.Mesh);
        expect(boxMesh.device()).to.equal(device);
    });

    it("should make mesh which has positions, normals, tangents and uv-coordinates",
        function () {

            boxMesh = R.genBox(device);

            expect(boxMesh.attribute("position"), "position").to.exist.and.equal(A.POSITION);
            expect(boxMesh.attribute("normal"), "normal").to.exist.and.equal(A.NORMAL);
            expect(boxMesh.attribute("tangent"), "tangent").to.exist.and.equal(A.TANGENT);
            expect(boxMesh.attribute("uv"), "uv").to.exist.and.equal(A.UV);
        }
    );

    it("should make box mesh with default parameters if not passed", function () {

        boxMesh = R.genBox(device);
        expect(boxMesh.vertices(), "vertices").to.have.length.above(0);
        expect(boxMesh.indices(), "indices").to.have.length.above(0);
    });

    it("should make box mesh with passed parameters", function () {

        boxMesh = R.genBox(device, 5.0, 5.0, 5.0, 0.5, 0.5);
        expect(boxMesh.vertices(), "vertices").to.have.length.above(0);
        expect(boxMesh.indices(), "indices").to.have.length.above(0);
    });
});

describe("B.Render.genSphere", function () {

    var R = B.Render,
        A = R.Attribute,

        sphereMesh, canvas, device;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
    });

    after(function () {
        device && device.free();
    });

    afterEach(function () {
        sphereMesh && sphereMesh.free();
    });

    it("should make sphere mesh", function () {

        sphereMesh = R.genSphere(device);
        expect(sphereMesh).to.be.instanceof(R.Mesh);
        expect(sphereMesh.device()).to.equal(device);
    });

    it("should make mesh which has positions, normals, tangents and uv-coordinates",
        function () {

            sphereMesh = R.genSphere(device);

            expect(sphereMesh.attribute("position"), "position").to.exist.and.equal(A.POSITION);
            expect(sphereMesh.attribute("normal"), "normal").to.exist.and.equal(A.NORMAL);
            expect(sphereMesh.attribute("tangent"), "tangent").to.exist.and.equal(A.TANGENT);
            expect(sphereMesh.attribute("uv"), "uv").to.exist.and.equal(A.UV);
        }
    );

    it("should make sphere mesh with default parameters if not passed", function () {

        sphereMesh = R.genSphere(device);
        expect(sphereMesh.vertices(), "vertices").to.have.length.above(0);
        expect(sphereMesh.indices(), "indices").to.have.length.above(0);
    });

    it("should make sphere mesh with passed parameters", function () {

        sphereMesh = R.genSphere(device, 5.0, 8, 0.5, 0.5);
        expect(sphereMesh.vertices(), "vertices").to.have.length.above(0);
        expect(sphereMesh.indices(), "indices").to.have.length.above(0);
    });
});