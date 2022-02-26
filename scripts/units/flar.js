const AI = require("lib/AIs");
const Snd = require("lib/sounds");

let healA = Tmp.c1.set(Pal.heal);
healA.a = 0.75;

/***Effects***/
const flarShieldDissolving = new Effect(120, e => {
  Draw.color(e.color);
  Draw.alpha(Math.max(Interp.pow5In.apply(e.fslope()) - 0.15, 0));
  Fill.poly(e.x, e.y, 6, e.rotation);
  e.scaled(20, s => {
     Draw.color(Tmp.c1.set(e.color).mul(1.25), e.color, s.fin());
     Draw.alpha(s.fout());
     Lines.circle(e.x, e.y, e.rotation * 1.45 * s.fin());
  });
  Draw.reset();
}); 

const flirEyeTrail = new Effect(40, e => {
	Draw.color(Color.valueOf("ff9c5a"));
	Fill.circle(e.x, e.y, e.rotation * e.fout());
	Draw.reset();
});

const flirEyeShoot = new Effect(40, e => {
	let sideAngle = 90;
	Draw.color(Tmp.c1.set(Color.valueOf("ff9c5a")).mul(1.20));
	for (let i of Mathf.signs) {
		Drawf.tri(e.x, e.y, 13 * e.fout(), 24, e.rotation + sideAngle * i);
	}
	Draw.reset();
});

const flirShockwave = new Effect(20, e => {
	Draw.color(Color.white);
	let w = 12 * 1.5, h = 6 * 1.5;
	let interp = e.fin();
	Lines.stroke((1.5 + 1.2 * e.fout()) * Interp.pow5In.apply(e.fslope()));
	Lines.ellipse(
       e.x, e.y,
       5,
       w * interp, h * interp,
       e.rotation - 90
    );
	Draw.reset();
});

//dinamic explosion lmfao
const flirEyeDestruct = new Effect(120, e => {
    let intensity = 2;
	let baseLifetime = 26 + intensity * 15;
    e.lifetime = 43 + intensity * 35;
	Draw.color(Color.gray);
    Draw.alpha(0.9);
    for (let i = 0; i < 4; i++) {
        let lenScl = Mathf.randomSeed(e.id * 2 + i, 0.4, 1);
        let fi = i;
        e.scaled(e.lifetime * lenScl, b => {
            Angles.randLenVectors(e.id + fi - 1, Mathf.floor(3 * intensity), 14 * intensity * e.fin(Interp.pow10Out), (x, y) => {
               let fout = b.fout(Interp.pow5Out) * Mathf.random(0.5, 1);
               Fill.circle(e.x + x, e.y + y, fout * ((2 + intensity) * 1.8));
            });
        });

        e.scaled(baseLifetime, b => {
            b.scaled(5 + intensity * 2.5, i => {
                Lines.stroke((3.1 + intensity / 5) * i.fout());
                Lines.circle(e.x, e.y, (3 + i.fin() * 14) * intensity);
                Drawf.light(e.x, e.y, i.fin() * 14 * 2 * intensity, Color.white, 0.9 * e.fout());
            });

            Draw.color(Color.valueOf("ff9c5a"), Pal.lightOrange, Color.gray, e.fin());
            Lines.stroke((1.7 * e.fout()) * (1 + (intensity - 1) / 2));

            Draw.z(Layer.effect + 0.001);
            Angles.randLenVectors(e.id + 1, Math.floor(9 * intensity), 40 * intensity * e.finpow() + 0.001, (x, y) => {
                Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.finpow() + 0.001 * 4 * (3 + intensity));
                Drawf.light(e.x + x, e.y + y, (e.finpow() + 0.001 * 4 * (3 + intensity)) * 3.5, Draw.getColor(), 0.8);
            });
        });
    }
	Draw.reset();
});

const menoShieldAppear = new Effect(40, e => {
	let args = e.data;
	Draw.color(Pal.heal);
	Draw.alpha(0.75 * e.fout());
	/*
     * args[0] - shield's size
     * args[1] - shield's cone
	*/
    Lines.swirl(e.x, e.y, args[0] + 6 * e.fin(), args[1], e.rotation - 180 * args[1]);
	Draw.reset();
});

const minoShoot = new Effect(60, e => {
   //make the code better, sheeple
   let rot = e.rotation;
   let len = 26, escapeLen = 15;
   let x = Angles.trnsx(rot, len), y = Angles.trnsy(rot, len);
   
   Draw.color(Color.white, Pal.heal, e.fin());
   Lines.stroke(1.4 * e.fslope());
   //what
   Tmp.v1.trns(rot + Math.sin(Time.time * 0.01) * 90, Mathf.dst(e.x, e.y, e.x + x, e.y + y));
   //try calculating the perpendicular opening vector
   Tmp.v2.trns(rot + 90, escapeLen * Interp.pow5In.apply(e.fin()));
   
   //unnecessary FAQ: why didn't you use the Mathf.signs loop? - ~~because it first didn't work, as if I've expected and the second curve started to become a line~~
   Lines.curve(
      e.x, e.y,
      e.x, e.y,
      e.x + Tmp.v1.x, e.y + Tmp.v1.y,
      e.x + x + Tmp.v2.x, e.y + y + Tmp.v2.y, 15
   );
   Lines.curve(
      e.x, e.y,
      e.x, e.y,
      e.x - Tmp.v1.x, e.y - Tmp.v1.y,
      e.x + x - Tmp.v2.x, e.y + y - Tmp.v2.y, 15
   );
   Draw.reset();
});

const munoShine = new Effect(20, e => {
   let lines = 15;
   let stroke = 8.5 * e.fslope();
   let candela = 0.2;
   
   Lines.stroke(stroke);
   for (let i = 0; i < lines; i++) {
      Draw.color(Tmp.c1.set(Pal.heal).mul(lines / (i + 1) + candela));
      for (let n in Mathf.signs) {
         Draw.alpha(1 - i / lines);
         Lines.spikes(e.x, e.y, i, i, 9, (i * e.fin() * 2 + Mathf.randomSeed(e.id, 360)) * n);
      }
   }
   Drawf.light(e.x, e.y, lines * (stroke / 2), Pal.heal, healA.a);
});

/***Bullets***/
//flare boss's nano debunked
const flerArcingLaser = extend(BasicBulletType, {
    damage: 7.5, 
    healPercent: 0.20, 
    collidesTeam: true,
    collides: false,
    absorbable: false,
    despawnEffect: Fx.none,
    shootEffect: Fx.shockwave,
    length: 128,
    sizeW: 8,
    sizeH: 8,
    lifetime: 55,
    speed: 0,
    keepVelocity: false, //no more free-moving lasers
    colors: [ Color.valueOf("ec7458aa"), Color.valueOf("ff9c5a"), Color.white ],
    interp: Interp.pow5In,
    draw(b) {
      // Shortened code, new it uses Angles.trns<x/y> instead of a vector
      let x = b.x + Angles.trnsx(b.rotation(), this.length * this.interp.apply(b.fin())), y = b.y + Angles.trnsy(b.rotation(), this.length * this.interp.apply(b.fin()));
      let sizeDiff = Mathf.absin(Time.time, 8, 1);
      
      for (let i = 0; i < this.colors.length; i++) {
        Draw.color(this.colors[i]);
        Lines.stroke((this.sizeW / 2) / (i + 1) + sizeDiff);
        Lines.lineAngle(
           b.x, b.y,
           b.rotation(),
           this.length * this.interp.apply(b.fin())
        );
        Drawf.tri(x, y, this.sizeW / (i + 1) + sizeDiff, this.sizeH / (i + 1) + sizeDiff, b.rotation()); 
      }
      Drawf.light(b.team, b.x, b.y, x, y, this.sizeW * 1.4, this.colors[0], 0.6); 
      Draw.reset();
    },
    update(b) {
      this.super$update(b);
      /*
      Tmp.v1.trns(b.rotation(), this.length * b.fslope());
      if (b.timer.get(0, 5)) {
    	nanoLaserCutter.at(b.x + Tmp.v1.x, b.y + Tmp.v1.y, b.rotation() + 90);
        nanoLaserCutter.at(b.x + Tmp.v1.x, b.y + Tmp.v1.y, b.rotation() - 90);
      } 
      Damage.damage(b.team, b.x + Tmp.v1.x, b.y + Tmp.v1.y, 8, this.damage); 
      */
      let x = b.x + Angles.trnsx(b.rotation(), this.length * this.interp.apply(b.fin())), y = b.y + Angles.trnsy(b.rotation(), this.length * this.interp.apply(b.fin()));
      if (b.timer.get(0, 6.5)) {
    	this.despawnEffect.at(x, y, b.rotation() + 90);
        this.despawnEffect.at(x, y, b.rotation() - 90);
      }
      
      // Something that'll also prevent healing abuse
      if (b.time < this.lifetime && b.fin() > 0.5) { 
         Damage.damage(b.team, x, y, 8, this.damage);
         // Now how do i heal the building properl- 
         if (this.healPercent > 0) {
            let build = Vars.world.buildWorld(x, y);
            if (build != null && build.team == b.team) {
               if (build instanceof Healthc && build.damaged()) {
                  // Ah yes, rewrite 99% of heal codes
                  build.heal(this.healPercent / 100 * build.maxHealth);
                  Fx.healBlockFull.at(build.getX(), build.getY(), build.block.size, this.colors[0]);
               }
            }
         }
      }
    },
    drawLight(b) {
       //nope
    },
}); 

const flirBolt = extend(LaserBoltBulletType, {
	width: 4,
	height: 16,
	backColor: Color.valueOf("ff9c5a"),
	frontColor: Color.white,
    damage: 30,
    splashDamage: 40,
    splashDamageRadius: 32,
    lifetime: 50,
    speed: 6.5,
    despawnEffect: Fx.none,
    hitEffect: flirEyeDestruct,
    smokeEffect: Fx.shootSmallSmoke,
    shootEffect: new MultiEffect(flirEyeShoot, flirShockwave),
    hitSound: Sounds.explosion,
});

const minoBeam = extend(ContinuousLaserBulletType, {
   absorbable: true,
   keepVelocity: true,
   length: 20,
   width: 5,
   damage: 6.5,
   colors: [ healA, Pal.heal, Color.white ],
   hitColor: Pal.heal,
   lightColor: healA,
   shootEffect: minoShoot,
   smokeEffect: Fx.greenLaserChargeSmall,
   speed: 4,
   lifetime: 100,
   drag: 0.035,
   shake: 0,
   oscScl: 1,
   oscMag: 0.5,
   fadeTime: 120,
   makeFire: false,
   incendChance: 0.15,
   collidesTeam: true,
   healPercent: 0.3,
});

const munoArray = extend(BasicBulletType, {
	//quad moment
	sprite: "large-bomb",
    width: 30,
    height: 30,
    maxRange: 30,
    ignoreRotation: true,
    backColor: Pal.heal,
    frontColor: Color.white,
    mixColorTo: Color.white,
    hitSound: Sounds.plasmaboom,
    shootCone: 180,
    ejectEffect: Fx.none,
    hitShake: 4,
    collidesAir: false,
    lifetime: 30,
    despawnEffect: munoShine,
    hitEffect: Fx.massiveExplosion,
    keepVelocity: false,
    spin: 2,
    shrinkX: 0.7,
    shrinkY: 0.7,
    speed: 0,
    collides: false,
    healPercent: 4,
    damage: 25,
    splashDamage: 40,
    splashDamageRadius: 50,
});

/***Weapons***/
const flerDivergent = extend(Weapon, "flerDivergent", {
    reload: 15,
    alternate: false,
    ejectEffect: Fx.none,
    top: false,
    shots: 3,
    shotDelay: 20,
    inaccuracy: 8.5,
    shootSound: Sounds.laser,
    mirror: false,
    x: 0,
    y: 0,
    rotate: false,
    bullet: flerArcingLaser
});

const flirEye = extend(Weapon, "flirEye", {
    reload: 110,
    shots: 1,
    inaccuracy: 2.75,
    alternate: false,
    ejectEffect: Fx.none,
    top: false,
    shootSound: Snd.gigablast,
    mirror: false,
    x: 0,
    y: 0,
    rotate: true,
    bullet: flirBolt
}); 

const minoLaser = extend(Weapon, "minoLaser", {
    reload: 160,
    shots: 1,
    alternate: true,
    ejectEffect: Fx.none,
    top: false,
    shootSound: Sounds.laser,
    firstShotDelay: Fx.greenLaserChargeSmall.lifetime - 1,
    mirror: true,
    x: 3,
    y: 0,
    rotate: false,
    bullet: minoBeam
}); 

const munoBomber = extend(Weapon, "clear-effect", {
    reload: 30,
    shots: 1,
    alternate: true,
    ejectEffect: Fx.none,
    top: false,
    shootSound: Sounds.mineDeploy,
    x: 0,
    y: 0,
    rotate: false,
    bullet: munoArray
}); 

/***Abilities***/
const shieldDestroyingRange = extend(Ability, {
  shieldTake: 10,
  cone: 100,
  reload: 120,
  alpha: 0,
  timer: 0,
  target: null,
  localized() {
    return Core.bundle.format("ability-flar-expansion-shieldDestroyingRange");
  },
  draw(unit) {
    if (Vars.state.isPaused()) return;
    let target = this.target;
    target = Units.closestEnemy(unit.team, unit.getX(), unit.getY(), 64, u => u != unit && u.shield > 0);
    
    if (target != null && target.team != unit.team &&
      target.within(unit.getX(), unit.getY(), 64) && target.checkTarget(true, true) && target.isValid()) {
      this.timer += Time.delta;
      if (this.timer >= this.reload) { 
          enemy.shield -= Math.min(enemy.shield - this.shieldTake, 0);
          flarShieldDissolving.at(target.getX(), target.getY(), target.type.hitSize, target.team.color);
          this.alpha = 1;
      }
      Draw.z(Layer.bullet);
      Draw.alpha(this.alpha);
      Drawf.laser(unit.team, Core.atlas.find("laser"), Core.atlas.find("laser-end"), unit.getX(), unit.getY(), target.getX(), target.getY(), 0.60);
    }
    this.alpha = Mathf.lerpDelta(this.alpha, 0, 0.0001);
    Draw.z();
    Draw.reset();
    this.timer = 0;
  },
});

/*Attack unit section*/
const flar = extendContent(UnitType, "flar", {
	 health: 65,
	 speed: 3.15,
	 hitSize: 6,
	 drag: 0.01,
	 accel: 0.35,
	 flying: true,
     aimDst: 0.5,
     range: 30,
     engineSize: 1.25,
}); 
flar.abilities.add(shieldDestroyingRange);
flar.constructor = () => extend(UnitEntity, {});
flar.defaultController = AI.rotateAI;

const fler = extendContent(UnitType, "fler", {
	 health: 230,
	 speed: 2.0,
	 hitSize: 8,
	 aimDst: 2.4,
     range: 110,
	 drag: 0.01,
	 accel: 0.15,
	 flying: true,
     engineOffset: 9,
}); 
fler.weapons.add(flerDivergent);
fler.constructor = () => extend(UnitEntity, {});

const flir = extendContent(UnitType, "flir", {
	 health: 670,
	 armor: 3,
	 speed: 0.9,
	 hitSize: 24,
	 drag: 0.01,
	 accel: 0.10,
	 flying: true,
	 lowAltitude: true,
	 rotateShooting: false,
     aimDst: 2,
     range: 200,
     engineOffset: 16.5,
     engineSize: 4,
     
     eyeballRad: 4,
     radInline: 2,
     corneaLength: 1,
     corneaSize: 1.2,
});
flir.weapons.add(flirEye);

flir.constructor = () => extend(UnitEntity, {
   corneaAngle: 0,
   draw() {
     this.super$draw();
     let dest = this.angleTo(this.aimX, this.aimY);
     let destFall = this.rotation - (90 + 180);
     let offsetX = Angles.trnsx(this.corneaAngle, flir.corneaLength),
         offsetY = Angles.trnsy(this.corneaAngle, flir.corneaLength);
     let deadAlpha = 1;
     if (this.dead) {
        this.corneaAngle = Mathf.range(0, 360);
        deadAlpha = this.elevation;
     } else {
     	if (this.rotateShooting) {
             this.corneaAngle = this.rotation;
         } else this.corneaAngle = Angles.moveToward(this.corneaAngle, dest, flir.rotateSpeed * Time.delta);
         if (!Vars.state.isPaused() && this.corneaAngle != dest) {
         	flirEyeTrail.at(this.x + offsetX, this.y + offsetY, flir.corneaSize);
         }
     }
     Draw.color(Color.valueOf("ff9c5a"));
     Draw.alpha(deadAlpha);
     Draw.z(Layer.effect);
     Lines.stroke(flir.radInline / 2);
     Lines.circle(this.x, this.y, flir.eyeballRad);
     Fill.circle(this.x + offsetX, this.y + offsetY, flir.corneaSize);
     Draw.z();
     Draw.reset();
   },
});

/*Support Unit Section*/
const meno = extendContent(UnitType, "meno", {
	 health: 60,
	 speed: 1.85,
	 hitSize: 6,
	 drag: 0.01,
	 accel: 0.35,
	 flying: true,
	 rotateShooting: false,
	 rotateSpeed: 4,
	 buildSpeed: 0.2,
     aimDst: 0.5,
     range: 30,
     engineSize: 1.35,
     engineOffset: 3.65,
     
     maxShields: 100,
});
meno.defaultController = () => extend(BuilderAI, {});

meno.constructor = () => extend(UnitEntity, {
  shldAngle: 0,
  shldPoints: 0,
  shldCone: 0.30, //0 - nothing, 1 - a full circle
  regenerating: false,
  draw() {
    this.super$draw();
    let dest = this.angleTo(this.aimX, this.aimY);
    if (!this.dead) {
  	if (this.rotateShooting) {
        this.shldAngle = this.rotation;
      } else this.shldAngle = Angles.moveToward(this.shldAngle, dest, meno.rotateSpeed * Time.delta * this.speedMultiplier);
    }
    let alpha = Mathf.clamp(0, this.shldPoints, meno.maxShields) / meno.maxShields;
    
    Draw.color(Pal.heal);
    Draw.z(Layer.effect);
    Draw.alpha(Math.max(alpha - 0.5, 0));
    Lines.lineAngle(this.x, this.y, this.shldAngle - this.shieldToDeg(), this.size());
    //now try to offset the line, so that it looks like it's on the shield
    Lines.lineAngle(this.x, this.y, this.shldAngle + this.shieldToDeg() - Math.PI * Lines.getStroke() * 2.5, this.size());
    Draw.alpha(alpha);
    Lines.swirl(this.x, this.y, this.size(), this.shldCone, this.shldAngle - this.shieldToDeg());
    Draw.z();
  },
  update() {
    this.super$update();
    let size = this.size();
    Groups.bullet.intersect(this.x - size, this.y - size, size * 2, size * 2).each(b => {
    	if (b != null && b.team != this.team && b.owner != this) {
    	   //totally avant stuff here
    	   let temp = Angles.angle(this.x, this.y, b.x, b.y);
           let tempDst = Mathf.dst(b.x, b.y, this.x, this.y);
           if (tempDst <= Math.pow(size, 2) && Angles.within(temp, this.shldAngle, this.shieldToDeg())) {
    	      // phase's wall deflect goes brr
              let penX = Math.abs(this.x - b.x), penY = Math.abs(this.y - b.y);
              if (this.shldPoints > 0) {
                 if (b.damage <= meno.maxShields) {
                   if (b.type.reflectable) {
                     b.trns(-b.vel.x, -b.vel.y);
                     if (penX > penY) {
                        b.vel.x *= -1;
                     } else {
                        b.vel.y *= -1;
                     }
                     b.owner = this;
                     b.team = this.team;
                     b.time += 1; 
                     this.shldPoints -= Math.max(0, b.damage);
                   }
                 }
                 if (this.regenerating) {
                    menoShieldAppear.at(this.x, this.y, this.shldAngle, [size, this.shldCone]);
                 }
                 this.regenerating = false;
              }
           }
    	}
    });
    if (this.regenerating) this.shldPoints = Mathf.lerpDelta(this.shldPoints, meno.maxShields, 0.005);
    else {
       //wait two seconds before regenerating
       Time.run(120, run(() => {
      	this.regenerating = true;
       }));
    }
  },
  //size for shields
  size() {
    return meno.hitSize * 1.25;
  },
  //shield's cone to degrees
  shieldToDeg() {
    return this.shldCone * 180;
  },
});

const mino = extendContent(UnitType, "mino", {
	 health: 230,
	 armor: 1,
	 speed: 1.25,
	 hitSize: 9.25,
	 drag: 0.01,
	 accel: 0.35,
	 flying: true,
	 range: 90,
     aimDst: 10,
     engineOffset: 8.50,
});
mino.weapons.add(minoLaser);

mino.constructor = () => extend(UnitEntity, {});

const muno = extendContent(UnitType, "muno", {
	 health: 550,
	 armor: 2,
	 speed: 1.4,
	 hitSize: 24,
	 drag: 0.01,
	 accel: 0.10,
	 flying: true,
	 circleTarget: true,
     aimDst: 2,
     range: 100,
     engineOffset: 16.5,
     engineSize: 4,
});
muno.weapons.add(munoBomber);

muno.constructor = () => extend(UnitEntity, {});