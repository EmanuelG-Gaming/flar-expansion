let modules = [
   //units
   "units/flar"
];
for (let m of modules) require(m);

// To make sure everything in Flar Expansion loaded successfully
Log.info("Flar Expansion successfully loaded.");