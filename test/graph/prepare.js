
B.Test.checkEvent = function (spy, caster, type, data) {

    var e = spy.getCall(0).args[0];

    expect(spy).to.be.calledOnce;
    expect(e).to.be.instanceof(B.Std.Event);
    expect(e.caster).to.equal(caster);
    expect(e.type).to.equal(type);
    expect(e.data).to.deep.equal(data);
};
