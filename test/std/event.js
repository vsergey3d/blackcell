
describe("B.Std.Listenable", function() {

    var S = B.Std;

    it("should exist", function () {
        expect(S.Listenable).to.exist;
    });

    describe("[functional]", function() {

        var obj = new S.Listenable(),
            type = "onEvent",
            handler1 = sinon.spy(),
            handler2 = sinon.spy(),
            handler3 = sinon.spy(),
            data = { a: 1, b: "abc" },
            e;

        beforeEach(function() {

            handler1.reset();
            handler2.reset();
            handler3.reset();
        });

        it("should not throw if event is not added", function() {

            expect(function () {
                obj.trigger(type, data);
            }).to.not.throw();
        });

        it("should add event", function() {

            obj.on(type, handler1);
            obj.trigger(type, data);
            expect(handler1).to.be.called;
        });

        it("should pass event object to handler", function() {

            obj.trigger(type, data);
            expect(handler1).to.be.called;

            e = handler1.getCall(0).args[0];
            expect(e.data, "data").to.equal(data);
            expect(e.type, "type").to.equal(type);
            expect(e.caster, "caster").to.equal(obj);
            expect(e.receiver, "receiver").to.equal(obj);
        });

        it("should add handler with the same event type", function() {

            obj.on(type, handler2);
            obj.trigger(type, data);
            expect(handler1, "1").to.be.called;
            expect(handler2, "2").to.be.called;
        });

        it("should raise only newest event if '.omitted' set to true", function() {

            var passFn = function(e) { e.omitted = true; },
                handler = sinon.spy(passFn);

            obj.on(type, handler);
            obj.trigger(type, data);
            expect(handler1, "1").not.to.be.called;
            expect(handler2, "2").not.to.be.called;
            expect(handler, "pass").to.be.called;
            obj.off(type, handler);
        });

        it("should add the same event type with filter", function() {

            var filter = function() { return false; };

            obj.on(type, handler3, filter);
            obj.trigger(type, data);
            expect(handler1, "1").to.be.called;
            expect(handler2, "2").to.be.called;
            expect(handler3, "3").not.to.be.called;
            obj.off(type, handler3, filter);
        });

        it("should add the same event type with filter [advance filter]", function() {

            var obj2 = new S.Listenable(obj),
                filter = function(e) {
                    return e.caster === obj2;
                };

            obj2.bubbling(true).on(type, handler3, filter);
            obj2.trigger(type, data);
            expect(handler1, "1").to.be.called;
            expect(handler2, "2").to.be.called;
            expect(handler3, "3").to.be.called;
            obj2.off(type, handler3, filter);
        });

        it("should add several events", function() {

            obj.on("onAnotherEvent", handler3);
            obj.trigger("onAnotherEvent", data);
            expect(handler1, "1").not.to.be.called;
            expect(handler2, "2").not.to.be.called;
            expect(handler3, "3").to.be.called;
            obj.off("onAnotherEvent", handler3);
        });

        it("should remove event handler1", function() {

            obj.off(type, handler1);
            obj.trigger(type, data);
            expect(handler1, "1").not.to.be.called;
            expect(handler2, "2").to.be.called;
        });

        it("should remove event handler2", function() {

            obj.off(type, handler2);
            obj.trigger(type, data);
            expect(handler1, "1").not.to.be.called;
            expect(handler2, "2").not.to.be.called;
        });

        it("should not throw an error if there are no handlers to remove", function() {

            obj.off(type, handler1);
            obj.trigger(type, data);
            expect(handler1, "1").not.to.be.called;
            expect(handler2, "2").not.to.be.called;
            expect(handler3, "3").not.to.be.called;

            obj.off("onUnknown", handler1);
        });

        it("should add several events (using space-separated types)", function() {

            obj.on("onEventA onEventB onEventC", handler1);
            obj.trigger("onEventA", data);
            expect(handler1, "1").to.be.called;
            obj.trigger("onEventB", data);
            expect(handler1, "1").to.be.called;
            obj.trigger("onEventC", data);
            expect(handler1, "1").to.be.called;
        });

        it("should remove several events (using space-separated types)", function() {

            obj.off("onEventA onEventB onEventC", handler1);
            obj.trigger("onEventA", data);
            expect(handler1, "1").not.to.be.called;
            obj.trigger("onEventB", data);
            expect(handler1, "1").not.to.be.called;
            obj.trigger("onEventC", data);
            expect(handler1, "1").not.to.be.called;
        });

        it("should make en event object", function() {

            var event = obj.makeEvent(type, data);

            expect(event).to.be.instanceof(S.Event);
            expect(event).to.have.property("type").that.equal(type);
            expect(event).to.have.property("caster").that.equal(obj);
            expect(event).to.have.property("data").that.equal(data);
            expect(event).to.have.property("stopped").that.equal(false);
            expect(event).to.have.property("omitted").that.equal(false);
        });

        it("should accept an event object as trigger argument", function() {

            var event = obj.makeEvent(type, data);

            obj.on(type, handler1);

            obj.trigger(event);
            expect(handler1).to.be.called;

            e = handler1.getCall(0).args[0];
            expect(e.data, "data").to.equal(data);
            expect(e.type, "type").to.equal(type);
            expect(e.caster, "caster").to.equal(obj);
            expect(e.receiver, "receiver").to.equal(obj);
        });
    });

    describe("[hierarchy]", function() {

        var parent = new S.Listenable(),
            node2 = new S.Listenable(parent),
            node1 = new S.Listenable(node2),
            node0 = new S.Listenable(node1),

            type = "onEvent",
            n1Handler = sinon.spy(),
            n2Handler = sinon.spy(),
            pHandler = sinon.spy(),
            e;

        node1.on(type, n1Handler).bubbling(true);
        node2.on(type, n2Handler).bubbling(true);
        parent.on(type, pHandler).bubbling(true);

        beforeEach(function() {

            n1Handler.reset();
            n2Handler.reset();
            pHandler.reset();
        });

        it("should raise event hierarchically", function() {

            node1.trigger(type);
            expect(n1Handler, "node1").to.be.called.and.calledBefore(n2Handler);
            expect(n2Handler, "node2").to.be.called.and.calledBefore(pHandler);
            expect(pHandler, "parent").to.be.called;
        });

        it("should set info to event object", function() {

            node1.trigger(type, 5);
            e = pHandler.getCall(0).args[0];
            expect(e.data, "data").to.equal(5);
            expect(e.type, "type").to.equal(type);
            expect(e.caster, "caster").to.equal(node1);
            expect(e.receiver, "receiver").to.equal(parent);
        });

        it("should pass event to parent if bubbling is disabled", function() {

            node2.bubbling(false);
            expect(node2.bubbling()).to.be.a("boolean").and.equal(false);

            node1.trigger(type);
            expect(n1Handler, "node1").to.be.called.and.calledBefore(n2Handler);
            expect(n2Handler, "node2").to.be.called.and.calledBefore(pHandler);
            expect(pHandler, "parent").not.to.be.called;

            node2.bubbling(true);
            expect(node2.bubbling()).to.be.a("boolean").and.equal(true);
        });

        it("should not raise event hierarchically if '.stopped' set to true", function() {

            var fn = function(e) { e.stopped = true; };

            node0.on(type, fn);
            node0.trigger(type);
            expect(n1Handler, "node1").not.to.be.called;
            expect(n2Handler, "node2").not.to.be.called;
            expect(pHandler, "parent").not.to.be.called;
            node0.off(type, fn);
        });
    });
});