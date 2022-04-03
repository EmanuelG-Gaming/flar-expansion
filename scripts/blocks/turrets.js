const shieldMaterializing = new Effect(40, e => {
  let offset = 8;
  let cone = 0.2;
  let angle = cone / 2 * 180 * e.fin();
  let angleOff = angle / 2;
  
  Draw.color(Pal.heal);
  Lines.stroke(1.25 * e.fslope());
  Tmp.v1.trns(e.rotation - 180, offset);
  let x = Tmp.v1.x, y = Tmp.v1.y;
  Lines.swirl(e.x + x, e.y + y, offset, cone / 2 * e.fin(), e.rotation - angle - angleOff);
  Lines.swirl(e.x + x, e.y + y, offset, cone / 2 * e.fin(), e.rotation + angle - angleOff);
}); 

const healingInferno = new Effect(40, e => {
	Draw.color(Pal.heal.cpy().mul(1.25), Pal.heal, Color.gray, e.fin());

    Angles.randLenVectors(e.id, 8, e.finpow() * 140 + 15, e.rotation, 10, (x, y) => {
        Fill.circle(e.x + x, e.y + y, 5 + e.fout() * 4);
    });
});

const IAmTheOverseer = new Effect(90, e => {
	Draw.color(Pal.heal, Color.white, e.fin());
	let interp = Interp.pow5In.apply(e.fin());
	Lines.stroke((1.5 + 1.2 * e.fout()) * Interp.pow5In.apply(e.fslope()));
	for (let i = 3; i > 0; i--) {
	    let w = 4 * 1.5 * i + 8, h = 2 * 1.5 * i + 4;
	    Lines.ellipse(
           e.x + Angles.trnsx(e.rotation, -i * 5), e.y + Angles.trnsy(e.rotation, -i * 5),
           4,
           w * interp, h * interp,
           e.rotation - 90
        );
    }
});

const overseerExplode = new Effect(20, e => {
	Draw.color(Pal.heal.cpy().mul(1.25), Pal.heal, e.fin());

    Angles.randLenVectors(e.id, 8, e.finpow() * 27 + 14, (x, y) => {
        Fill.circle(e.x + x, e.y + y, 3 + e.fout() * 3);
    });
});

const attendantCurve = extend(BasicBulletType, {
	healPercent: 0.5,
	frontColor: Color.white,
    backColor: Pal.heal,
    trailLength: 10,
    trailColor: Pal.heal,
    damage: 10,
    speed: 4,
    width: 8,
    height: 11,
    hitSize: 9,
    trailSize: 2,
    lifetime: 60,
    collidesTeam: true, 
    hitEffect: Fx.hitBulletBig,
    curveHeight: 40,
    vec: null,
    //muno's bullets but more curvy
    update(b) {
       this.super$update(b);
       if (b.fdata != 1) {
          Tmp.v3.set(b.x, b.y);
          //bettern't
          if (b.owner instanceof Turret.TurretBuild) {
              Tmp.v3.set(b.owner.targetPos);
          }
          else if (b.owner instanceof Unitc) {
              Tmp.v3.set(b.owner.aimX, b.owner.aimY);
          }
          this.vec = Tmp.v3;
          if (this.vec != null) {
             //item transfer moment
             Tmp.v1.set(b.x, b.y).lerp(Tmp.v2.set(this.vec.x, this.vec.y), b.fin())
             .add(Tmp.v2.sub(b.owner.x, b.owner.y).nor().rotate90(1).scl(Mathf.randomSeedRange(b.id, 1) * b.fslope() * this.curveHeight));
          }
          else b.fdata = 1;
          b.vel.setAngle(Angles.moveToward(b.rotation(), b.angleTo(Tmp.v1.x, Tmp.v1.y), Time.delta * 261 * b.fin()));
          
          if (b.within(Tmp.v3.x, Tmp.v3.y, b.hitSize)) b.fdata = 1;
       }
    },
});

const custodianShot = extend(BasicBulletType, {
  healPercent: 0.3,
  damage: 5,
  speed: 2,
  frontColor: Pal.heal,
  backColor: Pal.heal,
  width: 3,
  height: 8,
  lifetime: 60,
  pierce: true,
  pierceBuilding: true,
  collidesTeam: true,
  coneSize: 18,
  cone: 0.2, //0 - nothing, 1 - a full circle
  //meno but changed
  draw(b) {
    //this.super$draw(b);
    let dest = b.rotation();
    let offset = this.size() * b.fin();
    
    Draw.color(this.frontColor, this.backColor, b.fin());
    Draw.z(Layer.bullet);
    /*try offsetting the curve's position
    so that it looks like it's inside the bullet*/
    Tmp.v1.trns(dest - 180, offset);
    Lines.swirl(b.x + Tmp.v1.x, b.y + Tmp.v1.y, offset + 8, this.cone, dest - this.coneToDeg());
    Draw.z();
    Draw.reset();
  },
  update(b) {
    this.super$update(b);
    //spammy code
    Tmp.v1.trns(b.rotation() - 180, this.size() * b.fin());
    Units.nearbyEnemies(b.team, b.x + Tmp.v1.x, b.y + Tmp.v1.y, this.size() * b.fin() + 8, u => {
    	if (u != null && u.within(b.x + Tmp.v1.x, b.y + Tmp.v1.y, this.size() * b.fin() + 8)) {
    	   //totally avant stuff here
    	   let temp = Angles.angle(b.x + Tmp.v1.x, b.y + Tmp.v1.y, u.x, u.y);
           let tempDst = Mathf.dst(b.x + Tmp.v1.x, b.y + Tmp.v1.y, u.x, u.y);
           if (tempDst <= Math.pow(this.size(), 2) && Angles.within(temp, b.rotation(), this.coneToDeg())) {
    	      if (u instanceof Healthc) {
                  if (b.collided.size <= 0) u.damage(b.damage);
              }
           }
    	}
    });
  },
  drawLight(b) {
    //no
  },
  //cone to degrees
  coneToDeg() {
    return this.cone * 180;
  },
  size() {
    return this.coneSize;
  },
});

const curatorFire = extend(BasicBulletType, {
   hitSize: 9,
   width: 0,
   height: 0,
   lifetime: 20,
   damage: 25,
   speed: 7,
   pierce: true,
   collidesAir: false,
   collidesTeam: true,
   healPercent: 1,
   statusDuration: Time.toSeconds * 4,
   shootEffect: healingInferno,
   ejectEffect: Fx.none,
   hitEffect: Fx.hitFlamePlasma,
   despawnEffect: Fx.none,
   status: StatusEffects.electrified,
   keepVelocity: false,
   hittable: false,
});

//it was supposed to be overseerLaserPointer, but yeah
const overseerCurve = extend(BasicBulletType, {
    damage: 20, 
    healPercent: 1, 
    collidesTeam: true,
    collides: false,
    absorbable: false,
    despawnEffect: Fx.none,
    shootEffect: IAmTheOverseer,
    length: 40,
    lifetime: 55,
    speed: 0,
    keepVelocity: false, //duh
    pierce: false,
    color: Pal.heal,
    vec: null,
    pierceCap: 3,
    init(b) {
        if (!b) return;
        //what
        let vec = new Vec2(0, 0);
        vec.set(b.x, b.y);
        if (b.owner instanceof Unitc) {
           vec.set(b.owner.aimX, b.owner.aimY);
        } else if (b.owner instanceof Turret.TurretBuild) {
           vec.set(b.owner.targetPos);
        }
        this.vec = vec;
    },
    draw(b) {
    	let rot = b.rotation + Mathf.randomSeed(b.id, -15, 15);
        let len = this.length;
        let offset = 5;
        let x = Angles.trnsx(rot, offset), y = Angles.trnsy(rot, offset);
        
        let stroke = Interp.pow5In.apply(b.fslope()) * 4;
        Draw.color(this.color);
        Draw.z(Layer.bullet);
        Lines.stroke(stroke);
        Lines.line(
            b.x + x, b.y + y,
            this.vec.x, this.vec.y
        );
        Draw.z();
        Draw.reset();
    },
    update(b) {
    	this.super$update(b);
        Units.nearbyEnemies(b.team, this.vec.x, this.vec.y, 13, u => {
        	if (u != null && u.team != b.team && u.within(this.vec.x, this.vec.y, 8) && u.isValid()) {
           	if (b.timer.get(0, 10)) {
              	b.collided.add(u.id);
                  if (b.type.pierceCap != -1 && b.collided.size <= b.type.pierceCap) this.hitEntity(b, u, u instanceof Healthc ? u.health : 0);
               }
            }
        });
    },
    hitEntity(b, entity, health) {
  	this.super$hitEntity(b, entity, health);
      let penX = Math.abs(entity.x - b.x), penY = Math.abs(entity.y - b.y);
      entity.trns(-b.vel.x, -b.vel.y);
      if (penX > penY) {
          entity.vel.x *= -1;
      } else {
          entity.vel.y *= -1;
      }
      overseerExplode.at(this.vec.x, this.vec.y);
      //custodianShot.create(b.owner, this.vec.x, this.vec.y, -b.rotation());
    },
});

const attendant = extend(PowerTurret, "attendant", {
  health: 120,
  powerUse: 0.8,
  reloadTime: 45,
  restitution: 0.03,
  range: 200,
  ammoUseEffect: Fx.none,
  targetAir: true,
  targetGround: true,
  shots: 2,
  shootSound: Sounds.missile,
  shootType: attendantCurve,
});

attendant.buildType = () => extendContent(PowerTurret.PowerTurretBuild, attendant, {
});

const custodian = extend(PowerTurret, "custodian", {
  health: 500,
  powerUse: 2,
  reloadTime: 60,
  restitution: 0.03,
  range: 300,
  shootLength: 1.2,
  burstSpacing: 3,
  ammoUseEffect: Fx.none,
  recoilAmount: 1.5,
  targetAir: true,
  targetGround: true,
  shootEffect: Fx.hitLancer,
  chargeTime: shieldMaterializing.lifetime - 1,
  chargeBeginEffect: shieldMaterializing, 
  shootSound: Sounds.release,
  shootType: custodianShot,
});

custodian.buildType = () => extendContent(PowerTurret.PowerTurretBuild, custodian, {
});

const curator = extend(PowerTurret, "curator", {
  health: 620,
  powerUse: 4.2,
  reloadTime: 8.5,
  restitution: 0.1,
  range: 150,
  heatColor: Pal.heal,
  ammoUseEffect: Fx.none,
  targetAir: false,
  targetGround: true,
  shots: 2,
  spread: 8,
  alternate: true,
  shootCone: 12,
  shootSound: Sounds.flame,
  shootType: curatorFire,
});

curator.buildType = () => extendContent(PowerTurret.PowerTurretBuild, curator, {
});

const overseer = extend(PowerTurret, "overseer", {
  health: 620,
  powerUse: 4.2,
  reloadTime: 21,
  restitution: 0.1,
  range: 150,
  heatColor: Pal.heal,
  ammoUseEffect: Fx.none,
  recoilAmount: 2.25,
  shootLength: 2.4,
  shots: 1,
  alternate: true,
  shootSound: Sounds.explosionbig,
  shootType: overseerCurve,
  hideDetails: false,
});

overseer.buildType = () => extendContent(PowerTurret.PowerTurretBuild, overseer, {
   rememberedUnits: new Seq(),
   draw() {
   	this.super$draw();
   },
});