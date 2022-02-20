let modules = [
   //units
   "units/flar",
   //blocks
   "blocks/diminutive"
];
for (let m of modules) require(m);

function addToUnit(name) {
	let modInternalName = "flar-expansion";
	return Vars.content.getByName(ContentType.unit, modInternalName + "-" + name);
};

// MrDuck557's MoarWaterUnits or Anuke credits
//adds arbitrary units to the reconstructor plans
Events.on(ContentInitEvent, () => {
   Blocks.additiveReconstructor.addUpgrade(addToUnit("flar"), addToUnit("fler"));
   Blocks.multiplicativeReconstructor.addUpgrade(addToUnit("fler"), addToUnit("flir"));
});

// To make sure everything in Flar Expansion loaded successfully
Log.info("Flar Expansion successfully loaded.");