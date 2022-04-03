let modules = [
   //units
   "units/flar",
   //blocks
   "blocks/diminutive",
   "blocks/turrets",
   "blocks/shield",
   //sector events
   "lib/sectorEvents"
];
for (let m of modules) require(m);

function addToUnit(name) {
	let modInternalName = "flar-expansion";
	try {
	   return Vars.content.getByName(ContentType.unit, modInternalName + "-" + name);
	}
    catch (e) {
   	Log.warn(e.message);
	}
};

// MrDuck557's MoarWaterUnits or Anuke credits
//adds arbitrary units to the reconstructor plans
Events.on(ContentInitEvent, () => {
   Blocks.additiveReconstructor.addUpgrade(addToUnit("flar"), addToUnit("fler"));
   Blocks.multiplicativeReconstructor.addUpgrade(addToUnit("fler"), addToUnit("flir"));
   
   Blocks.additiveReconstructor.addUpgrade(addToUnit("meno"), addToUnit("mino"));
   Blocks.multiplicativeReconstructor.addUpgrade(addToUnit("mino"), addToUnit("muno"));
});

//dt moment
Events.on(ClientLoadEvent, () => {
   //literally a big chasm of <insert an opinion that isn't tolerated>
   Vars.ui.settings.graphics.checkPref(
      "twitterMode", Core.settings.getBool("flar-expansion-twitterMode"),
      bool => {
          Core.settings.put("flar-expansion-twitterMode", bool);
          
          let dialog = new BaseDialog("Twitter Mode");
          let width = 350;
          dialog.cont.table(Styles.none, t => {
          	t.defaults().center();
          	t.labelWrap(
                   Core.bundle.get("setting.twitterMode.description") + "\n\n[accent]Fun Fact[]: this doesn't need for a game reset."
              ).size(width, 0).row();
              t.button("Close", run(() => {
              	dialog.hide();
              })).size(100, 50).margin(4).padTop(12);
          });
          if (bool) {
             dialog.show();
          }
          else {
         	Log.info("Turned off!");
          }
      }
   );
});

// To make sure everything in Flar Expansion loaded successfully
Log.info("Flar Expansion successfully loaded.");