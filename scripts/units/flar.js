const AI = require("lib/AIs");
const Snd = require("lib/sounds");

/***Effects***/
const flarShieldDissolving = new Effect(120, e => {
  Draw.color(e.color);
  Draw.alpha(Math.max(Interp.pow5In.apply(e.fslope()) - 0.15, 0));
  Fill.poly(e.x, e.y, 6, e.rotation);
  e.scaled(20, s => {
     Draw.color(e.color.cpy().mul(1.25), e.color, s.fin());
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
	Draw.color(Color.valueOf("ff9c5a").cpy().mul(1.20));
	for (let i of Mathf.signs) {
		Drawf.tri(e.x, e.y, 13 * e.fout(), 24, e.rotation + sideAngle * i);
	}
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
    shootEffect: flirEyeShoot,
    hitSound: Sounds.explosion,
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

/***Abilities***/
const shieldDestroyingRange = extend(Ability, {
  shieldTake: 10,
  cone: 100,
  reload: 120,
  
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
      let dest = unit.angleTo(target);
      if (this.timer >= this.reload) { 
         if (Angles.within(unit.rotation(), dest, this.cone)) {
             enemy.shield -= Math.min(enemy.shield - this.shieldTake, 0);
             flarShieldDissolving.at(target.getX(), target.getY(), target.type.hitSize, target.team.color);
             Draw.z(Layer.bullet);
             Drawf.laser(unit.team, Core.atlas.find("laser"), Core.atlas.find("laser-end"), unit.getX(), unit.getY(), target.getX(), target.getY(), 0.60);
         }
      }
    }
    Draw.z();
    Draw.reset();
    this.timer = 0;
  },
});

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
	 drag: 0.01,
	 accel: 0.15,
	 flying: true,
     aimDst: 2,
     range: 120,
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