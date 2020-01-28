import Level from "./Level";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    // main character's jump height
    @property({tooltip: 'In height lengths'})
    jumpHeight = 0.5;

    // main character's jump duration
    @property
    jumpDuration = 0;

    // movement speed
    @property({tooltip: 'In player height per second'})
    maxSpeed = 0.7;

    // acceleration
    @property({ tooltip: 'In player height per second' })
    acceleration = 0.7;

    @property(cc.Node)
    canvas: cc.Node = null;

    // movement
    destination: cc.Vec2 = null;
    speed = cc.v2(0, 0);
    desiredSpeed = cc.v2(0, 0);

    jump() {
        let height = this.jumpHeight * (this.node.height * this.node.scaleY);
        var jumpUp = cc.moveBy(this.jumpDuration / 2, cc.p(0, height)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration / 2, cc.p(0, -height)).easing(cc.easeCubicActionIn());
        this.node.runAction(cc.sequence(jumpUp, jumpDown));
    }

    public moveToward(destination: cc.Vec2, dt: number) {
        this.destination = destination;
        if (!destination) {
            return;
        }

        let dx = destination.x - this.node.position.x;
        let dy = destination.y - this.node.position.y;

        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            destination = null;
            return;
        }

        var desiredSpeed = cc.v2(dx, dy);

        let height = this.node.height * this.node.scaleY;
        let scale = this.maxSpeed * height / desiredSpeed.mag();
        desiredSpeed = desiredSpeed.scaleSelf(cc.v2(scale, scale));

        let delta = desiredSpeed.sub(this.speed);

        let nearlyThere = height / 80;
        let slowDown = Math.min(1, Math.max(Math.abs(dx) / nearlyThere, Math.abs(dy) / nearlyThere));

        this.speed.x += delta.x * this.acceleration;
        this.speed.y += delta.y * this.acceleration;

        this.speed = this.speed.scaleSelf(cc.v2(slowDown, slowDown));

        this.node.x += this.speed.x * dt;
        this.node.y += this.speed.y * dt;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var self = this;

        this.node.on('touchstart', function (event: cc.Event.EventTouch) {
            self.jump();
            event.stopPropagation();
        }, this.node);

        this.node.on('touchmove', function (event: cc.Event.EventTouch) {
            event.stopPropagation();
        }, this.node);

        this.node.on('touchend', function (event: cc.Event.EventTouch) {
            event.stopPropagation();
        }, this.node);

        this.canvas.on('touchmove', function (event: cc.Event.EventTouch) {
            self.destination = self.canvas.convertToNodeSpaceAR(event.getLocation());
        }, this.node);

        this.canvas.on('touchend', function (event: cc.Event.EventTouch) {
            self.destination = self.canvas.convertToNodeSpaceAR(event.getLocation());
        }, this.node);
    }

    start () {

    }

    update(dt: number) {
        this.moveToward(this.destination, dt);
    }
}
