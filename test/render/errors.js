
describe("B.Render.Error", function () {

    it("should exist", function () {
        expect(B.Render.Error).to.exist;
    });

    it("should be instanceof Error", function () {

        var err = new B.Render.Error("error");
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property("message").that.equal("error");
        expect(err).to.have.property("name").that.equal("B.Render.Error");
    });
});

describe("B.Render.GLError", function () {

    it("should exist", function () {
        expect(B.Render.GLError).to.exist;
    });

    it("should be instanceof Error", function () {

        var err = new B.Render.GLError("error", 1);
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property("message").that.equal("Internal WebGL error: error");
        expect(err).to.have.property("name").that.equal("B.Render.GLError");
    });

    it("should set webgl error code", function () {

        var err = new B.Render.GLError("error", 1);
        expect(err).to.have.property("code").that.equal(1);
    });
});

describe("B.Render.checkGLError", function () {

    var gl;

    before(function () {
        gl = new B.Test.FakeWebGLContext({});
    });

    it("should not throw if returned webgl error code is NO_ERROR", function () {

        var fn = function () { B.Render.checkGLError(gl, "no errors"); };
        expect(fn).to.not.throw();
    });

    it("should not throw if returned webgl error code is CONTEXT_LOST_WEBGL",
        sinon.test(function () {

            var fn = function () {
                B.Render.checkGLError(gl, "no errors");
            };

            this.stub(gl, "getError").returns(gl.CONTEXT_LOST_WEBGL);
            expect(fn).to.not.throw();
        })
    );

    it("should throw if webgl error is returned", sinon.test(function () {

        var errors = [
                gl.INVALID_ENUM,
                gl.INVALID_VALUE,
                gl.INVALID_OPERATION,
                gl.OUT_OF_MEMORY,
                gl.INVALID_FRAMEBUFFER_OPERATION
            ],
            errorToStr = function (error) {
                switch(error) {
                case gl.INVALID_ENUM:
                    return "invalid enum";
                case gl.INVALID_VALUE:
                    return "invalid value";
                case gl.INVALID_OPERATION:
                    return "invalid operation";
                case gl.OUT_OF_MEMORY:
                    return "out of memory";
                case gl.INVALID_FRAMEBUFFER_OPERATION:
                    return "invalid framebuffer operation";
                }
                return "unknown";
            },

            stub =  this.stub(gl, "getError"),
            fn = function () { B.Render.checkGLError(gl, "webgl error");},

            error, i,l;

        for(i = 0, l = errors.length; i < l; i += 1){

            error = errors[i];
            stub.returns(error);
            expect(fn, errorToStr(error)).to.throw(B.Render.GLError);
        }
    }));
});

describe("B.Render.checkGLFramebufferStatus", function () {

    var gl;

    before(function () {
        gl = new B.Test.FakeWebGLContext({});
    });

    it("should not throw if returned framebuffer status is FRAMEBUFFER_COMPLETE", function () {

        var fn = function () { B.Render.checkGLFramebufferStatus(gl, "complete"); };
        expect(fn).to.not.throw();
    });

    it("should throw if webgl error is returned", function () {

        var statuses = [
                gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
                gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
                gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
                gl.FRAMEBUFFER_UNSUPPORTED
            ],
            statusToStr = function (error) {
                switch(error) {
                case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    return "incomplete attachment";
                case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    return "incomplete missingattachment";
                case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    return "incomplete dimensions";
                case gl.FRAMEBUFFER_UNSUPPORTED:
                    return "framebuffer unsupported";
                }
                return "unknown";
            },

            stub = sinon.stub(gl, "checkFramebufferStatus").returns(gl.FRAMEBUFFER_UNSUPPORTED),
            fn = function () { B.Render.checkGLFramebufferStatus(gl, "framebuffer unsupported"); },

            status, i,l;

        for(i = 0, l = statuses.length; i < l; i += 1){

            status = statuses[i];
            stub.returns(status);
            expect(fn, statusToStr(status)).to.throw(B.Render.GLError);
        }
    });
});