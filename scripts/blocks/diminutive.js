const diminutiveReconstructor = extendContent(Reconstructor, "diminutiveReconstructor", {
  maxBulkUnits: 10,
  load() {
    this.super$load();
    this.region = Core.atlas.find(this.name);
    //dead, overrides a bunch of useless regions,
    //because of barbaric censorship
    this.topRegion = Core.atlas.find("clear-effect");
    this.inRegion = Core.atlas.find("clear-effect");
    this.outRegion = Core.atlas.find("clear-effect");
  },
  icons() {
    return [
      this.region
    ]
  },
  drawRequestRegion(req, list) {
     // No
     Draw.rect(this.region, req.drawx(), req.drawy());
     Drawf.select(req.drawx(), req.drawy(), this.size * Vars.tilesize / 2, Pal.accent);
     Draw.reset();
  },
});

diminutiveReconstructor.buildType = () => extend(Reconstructor.ReconstructorBuild, diminutiveReconstructor, {
   unitCount: 1,
   unitsCreated: -1,
   buildConfiguration(table) {  
	   this.super$buildConfiguration(table);
       table.table(Tex.button, t => {
         t.defaults().padBottom(4);
         this.addTextLine(t, "Configurations");
         let ucField, slid;
         slid = t.slider(1, diminutiveReconstructor.maxBulkUnits, 1, this.unitCount, null).width(140).get();
         slid.changed(run(() => {
            this.unitCount = slid.getValue();
            //ucField.text = slid.getValue();
         }));
         t.row();
         t.table(Styles.none, tt => {
            tt.add("Nr. of units: ");
         
            //deltanedas code :skull:
            ucField = tt.field(this.unitCount, text => {
           	if (text instanceof java.lang.Integer && canParsePositiveInt(text)) {
                  this.unitCount = parseInt(text);
                  slid.value = text;
               }
            }).width(140).padLeft(4);
            //ucField.validator = text => !isNaN(parseInt(text));
         }).margin(8).pad(4).row();
         
     	//t.image(Tex.whiteui, Pal.gray).growX().size(140 * 2, 3.5).row();
         t.label(() => "Aprox. time: " + "[lime]" + (Math.floor(diminutiveReconstructor.constructTime / Time.toSeconds) * this.unitCount) + " seconds[]").row();
         
         this.addTextLine(t, "Units");
         let buttonW = 50, buttonH = 50;
         //Vars.content.blocks().each(b => { if (b instanceof Reconstructor) { print("\n"); let upgrade = b.upgrades.toArray(); for (let i in upgrade) print(upgrade[i][0].localizedName + "[gray]->[]" + upgrade[i][1].localizedName)}})
         t.pane(Styles.defaultPane, tt => {
            let upgrade = diminutiveReconstructor.upgrades.toArray();
            //row indice
            let r = 0;
            for (let i in upgrade) {
               //upgraded unit's type
               let unit = upgrade[i][1];
               if (!unit.unlockedNowHost()) {
               	let locked = new Image(Icon.tree, Color.scarlet);
                   tt.add(locked).margin(4).pad(4).size(buttonW, buttonH);
                   locked.addListener(new Tooltip(t => t.background(Styles.black6).add("Unit's not unlocked!", Color.scarlet)));
               }
               else if (unit.isBanned()) {
               	let canceled = new Image(Icon.cancel, Color.scarlet);
                   tt.add(canceled).margin(4).pad(4).size(buttonW, buttonH);
                   canceled.addListener(new Tooltip(t => t.background(Styles.black6).add("Unit's banned!", Color.scarlet)));
               }
               else {
                 tt.button(new TextureRegionDrawable(unit.fullIcon), run(() => {
             	   for (let u = 0; u < this.unitCount; u++) {
                   	let x = this.x + Mathf.range(-16, 16), y = this.y + Mathf.range(-16, 16);
                       unit.spawn(this.team, x, y);
                       Fx.spawn.at(x, y);
                       Sounds.respawn.at(x, y);
                       //Events.fire(new UnitCreateEvent(unit, this, null));
                    }
                 })).size(buttonW, buttonH).margin(4).pad(4);
               }
               
               //add a row for every four buttons
               if (++r % 4 == 0) tt.row();
            }
         }).size(buttonW * 4 + 6 * 4, buttonH + 6 + 10);
       }).margin(8).pad(4).row();
   },
   addTextLine(table, text) {
   	let width = 140 * 2;
       table.add(text, Pal.gray).row();
   	table.image(Tex.whiteui, Pal.gray).growX().size(width, 3.5).row();
   },
   updateTile() {
   	//TODO: actually make this a real bulk-spawner
       /*
   	let unit = diminutiveReconstructor.upgrades.toArray()[0][1];
   	if (this.cons.valid()) {
   	   this.unitsCreated++;
       }
       if (this.unitsCreated != -1 && this.unitsCreated >= this.unitCount) {
       	this.unitsCreated %= 1;
           let x = this.x + Mathf.range(-16, 16), y = this.y + Mathf.range(-16, 16);
           unit.spawn(this.team, x, y);
           Fx.spawn.at(x, y);
           Sounds.respawn.at(x, y);
           //Events.fire(new UnitCreateEvent(unit, this));
       }
       this.unitsCreated = this.enabled ? 0 : -1;
       */
       if (this.unitsCreated != -1 && this.unitsCreated <= this.unitCount) {
          if (this.progress >= diminutiveReconstructor.constructTime) {
             if (this.moveInPayload(false) && this.cons.valid()) {
                this.payload = null;
                Fx.spawn.at(this.x, this.y);
                Sounds.respawn.at(this.x, this.y);
                this.unitsCreated += 1;
             }
          }
       }
       this.unitsCreated = this.enabled ? 0 : -1;
       this.super$updateTile(); 
   },
   draw() {
     this.super$draw();
     let rot = this.rotation * 90;
     let pr = this.progress;
     pr = Mathf.lerpDelta(pr, 5, 1);
     let fin = Interp.pow2Out.apply(this.fraction()), fout = 1 - fin,
         len = 1 * Vars.tilesize * 0.75, //length of the lines
         w = 1 * Vars.tilesize * 0.75; //width from the center to this
     let right = new Vec2(), left = new Vec2();
     
     right.trns(rot, len, w);
     left.trns(rot, len, -w);
     Draw.color(Color.black);
     Fill.rect(this.x, this.y, w, w);
     Lines.stroke(1.2, Color.valueOf("6e7080"));
     /*
     Lines.line(
        this.x + left.x / 2,
        this.y + left.y / 2,
        this.x - right.x + Angles.trnsx(rot, len) / 2,
        this.y - right.y + Angles.trnsy(rot, len) / 2
     );
     Lines.line(
        this.x + right.x / 2,
        this.y + right.y / 2,
        this.x - left.x + Angles.trnsx(rot, len) / 2,
        this.y - left.y + Angles.trnsy(rot, len) / 2
     );
     */
     Lines.lineAngleCenter(
        this.x + left.x / 2, this.y + left.y / 2,
        rot, w
     );
     Lines.lineAngleCenter(
        this.x + right.x / 2, this.y + right.y / 2,
        rot, w
     );
   },
   version() {
     return 1;
   },
   read(read, version) {
     this.super$read(read, version);
     if (version >= 1) {
       this.unitCount = read.i();
     }
   },
   write(write) {
	 this.super$write(write);
	 write.i(this.unitCount);
   },
});