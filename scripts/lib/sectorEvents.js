//this is a pain to list
let twitterQuotes = [
    "ratio", "cope", "L",
    "smh", "cry about it",
    "worship me, and perish!",
    "i don't know who you are, but this is my world!\nand i have not authorized any changes to it\nyour judgment for interfering is death",
    "did you know that this isn't a place to use magic, madam or madame?",
    "why is everything in purple?",
    "you aren't worthy of the <insert name here> title...",
    "did your pathetic parents even cared about their pathetic children,\nenough to give them an even more pathetic name?",
    "SUCH an amazing display of power.\nYou must be so proud...\nand your strategy is equally impressive.\nAttacking blindly and hoping for a miracle.\nI hope that works...",
    "I was a little...aggravated.",
    { x: 0, y: 0 }
];

//now we all need all the ai units talking
//partial thanks to smol
const showMoving = (text, duration, unit) => {
   if (!(unit instanceof Posc)) return;
   let table = new Table(Styles.black3).margin(4);
   table.touchable = Touchable.disabled;
   table.update(() => {
      if (Vars.state.isMenu() || unit.dead) table.remove();
      let v = Core.camera.project(unit.x, unit.y + 12);
      table.setPosition(v.x, v.y, Align.center);
   });
   table.actions(Actions.delay(duration), Actions.fadeOut(duration + 1.6), Actions.remove());
   table.add(text).style(Styles.defaultLabel); //outline moment
   table.pack();
   table.act(0);
   //make sure it's at the back
   Core.scene.root.addChildAt(0, table);

   table.getChildren().first().act(0);
};

//may the poly spawn, the spawning with an effect
//now it's even more prone to canceling, only when this has twitter in it, but it does
const spawnUnits = (x, y, unit, twitter) => {
	let player = Vars.player;
	let core = player.closestCore();
	let px = x + core.x, py = y + core.y;
    let twitReplace = new ObjectMap();
	twitReplace.clear();
	
    if (core != null) {
       Sounds.respawn.at(px, py);
       Fx.spawn.at(px, py);
       let u = unit.create(core.team);
       let spawn = Vars.spawner.getFirstSpawn();
       
       u.set(px, py);
       u.rotation = spawn != null ? Angles.angle(px, py, spawn.worldx(), spawn.worldy()) : 0;
       Events.fire(new UnitCreateEvent(u, core));
       if (!Vars.net.client()) {
          u.add();
       }
       
       //it's too unoptimized
       let quote = twitterQuotes[Mathf.floor(Mathf.random() * twitterQuotes.length)];
       if (quote instanceof Object) {
      	twitReplace.put(spawn.worldx(), spawn.worldy());
       }
       if (twitter) {
          Time.run(60, run(() => {
          	showMoving(
                  quote instanceof Object ?
                  "(" + twitReplace.get(quote.x) / 8 + "," + twitReplace.get(quote.y) / 8 + ")" :
                  quote, 3, u,
              );
          }));
       }
    }
};

Events.on(WorldLoadEvent, s => {
   if (Vars.headless) return;
   
   let lifetime = 180;
   Time.run(lifetime + 10, run(() => {
  	let core = Vars.player.closestCore();
      if (core != null)  {
         //it's not that really necessary
         if (Vars.state.isCampaign()) {
            spawnUnits(
               0, ((core.block.size + 1) / 2) * Vars.tilesize,
               UnitTypes.poly, Core.settings.getBool("flar-expansion-twitterMode")
            );
         }
      }
   }));
});

module.exports = {
	showMoving: showMoving,
	spawnUnits: spawnUnits
};