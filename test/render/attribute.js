
describe("B.Render.Attribute", function () {

    var R = B.Render,
        A = B.Render.Attribute,

        attributeToStr = B.Test.attributeToStr,

        attributes = [
            A.UINT,
            A.FLOAT,
            A.VECTOR2,
            A.VECTOR3,
            A.VECTOR4,
            A.POSITION,
            A.NORMAL,
            A.TANGENT,
            A.UV,
            A.COLOR
        ];

    it("should exist", function () {
        expect(B.Render.Attribute).to.exist;
    });

    describe("B.Render.attributeByteSize", function () {

        it("should return non-zero value for B.Render.Attribute", function () {

            var attr, i, l;

            for(i = 0, l = attributes.length; i < l; i += 1) {

                attr = attributes[i];
                expect(R.attributeByteSize(attr), attributeToStr(attr)).to.not.equal(0);
            }
        });

        it("should return zero value for unknown attribute type", function () {

            expect(R.attributeByteSize(-1)).to.equal(0);
            expect(R.attributeByteSize(10000)).to.equal(0);
        });
    });

    describe("B.Render.checkAttributes", function () {

        it("should return true if attribute declaration is correct", function () {

            var attrs = {
                "attr1": A.UINT,
                "attr2": A.FLOAT,
                "attr3": A.VECTOR2,
                "attr4": A.VECTOR3,
                "attr5": A.VECTOR4,
                "attr6": A.POSITION,
                "attr7": A.NORMAL,
                "attr8": A.TANGENT,
                "attr9": A.UV,
                "attr10": A.COLOR
            };

            expect(R.checkAttributes(attrs)).to.be.true;
        });

        it("should return false if no params passed", function () {
            expect(R.checkAttributes()).to.be.false;
        });

        it("should return false if empty object passed", function () {
            expect(R.checkAttributes({})).to.be.false;
        });

        it("should return false if any attribute type is unknown", function () {

            var attrs = {
                "attr1": A.UINT,
                "attr2": A.FLOAT,
                "attr3": A.VECTOR2,
                "attr4": -1,
                "attr5": A.VECTOR4
            };

            expect(R.checkAttributes(attrs)).to.be.false;
        });

        it("should return false if position attribute is not a single", function () {

            var attrs = {
                "attr1": A.POSITION,
                "attr2": A.FLOAT,
                "attr3": A.VECTOR2,
                "attr4": A.POSITION,
                "attr5": A.VECTOR4
            };

            expect(R.checkAttributes(attrs)).to.be.false;
        });

        it("should return false if normal attribute is not a single", function () {

            var attrs = {
                "attr1": A.NORMAL,
                "attr2": A.FLOAT,
                "attr3": A.VECTOR2,
                "attr4": A.NORMAL,
                "attr5": A.VECTOR4
            };

            expect(R.checkAttributes(attrs)).to.be.false;
        });
    });

    describe("B.Render.resolveAttributeAlias", function () {

        it("should resolve an alias to a type", function () {

            var i, l;

            for (i = 0, l = attributes.length; i < l; i += 1) {

                expect(attributes).to.include.members([R.resolveAttributeAlias(attributes[i])]);
            }
        });
    });

    describe("B.Render.fromGLAttributeActiveInfo", function () {

        var gl;

        before(function () {

            gl = new B.Test.FakeWebGLContext({});
        });

        it("should return non-zero value for B.Render.Attribute", function () {

            var correct = [
                    gl.UNSIGNED_INT,
                    gl.FLOAT,
                    gl.FLOAT_VEC2,
                    gl.FLOAT_VEC3,
                    gl.FLOAT_VEC4
                ],
                glAttr, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                glAttr = correct[i];
                expect(R.fromGLAttributeActiveInfo(gl, { type: glAttr }), glAttr).to.not.equal(0);
            }
        });

        it("should return undefined value for any other attribute type", function () {

            var incorrect = [
                    gl.UNSIGNED_BYTE,
                    gl.UNSIGNED_SHORT,
                    gl.FLOAT_MAT3,
                    gl.FLOAT_MAT4
                ],
                glAttr, i, l;

            for(i = 0, l = incorrect.length; i < l; i += 1) {

                glAttr = incorrect[i];
                expect(R.fromGLAttributeActiveInfo(gl, { type: glAttr }), glAttr).
                    to.equal(undefined);
            }
        });
    });
});