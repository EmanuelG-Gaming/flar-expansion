// Rotate AI, specific for Finch-related units
const rotateAI = prov(() => {
  let ai = extend(FlyingAI, {
    updateTargeting() {
      let rt = this.retarget();
      if (rt) this.target = this.findTarget(this.unit.x, this.unit.y, this.unit.type.range * 0.8, this.unit.type.targetAir, this.unit.type.targetGround);
      if (this.invalid(this.target)) this.target = null;
    }, 
    updateMovement() {
      if (this.command() == UnitCommand.attack) {
        if (this.target != null) {
          let dst = this.unit.type.range * 0.8 + this.target.type.hitSize + 10;
          this.unit.aim(this.target);
          this.circle(this.target, dst);
          if (!this.unit.type.weapons.each(w => { w.rotate })) this.unit.lookAt(this.target);
        }
        else this.super$updateMovement();	
      }
      if (this.command() == UnitCommand.rally) {
        let targetFlag = this.targetFlag(this.unit.x, this.unit.y, BlockFlag.rally, false);
        if (targetFlag != null) {
          let dstB = this.unit.type.range * 0.8 + targetFlag.block.size * Vars.tilesize;
          if (targetFlag.within(this.unit.x, this.unit.y, dstB)) this.circle(targetFlag, dstB);
          else this.moveTo(targetFlag, 0);
        }
        else this.super$updateMovement();
      }
    },
    findTarget(x, y, range, air, ground) {
      let t = null; // discrepancy detected: hfs go to jail for changing this
      t = Units.closestEnemy(this.unit.team, x, y, range, enemy => enemy.checkTarget(air, ground));
      if (t != null && t.within(this.unit.x, this.unit.y, this.unit.type.range * 0.8) && t.isValid()) return t;
      else this.super$findTarget(x, y, range, air, ground);
    },
  });
  return ai;
});

module.exports = {
  rotateAI: rotateAI 
};
