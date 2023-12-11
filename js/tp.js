var img_dir = "./images/tp/";
var Dungeon_Names = ["Forest Temple", "Goron Mines", "Lakebed Temple", "Arbiters Grounds", "Snowpeak Ruins", "Temple of Time", "City in The Sky"];
var Key_Dungeon_Names = ["Forest Temple", "Goron Mines", "Lakebed Temple", "Arbiters Grounds", "Snowpeak Ruins", "Temple of Time", "City in The Sky"];
var Key_Dungeon_Names_Short = ["Forest_Temple", "Goron_Mines", "Lakebed_Temple", "Arbiters_Grounds", "Snowpeak_Ruins", "Temple_of_Time", "City_in_The_Sky"];
var Dungeon_Items_Remaining = {
	"Forest Temple": 12,
	"Goron Mines": 15,
	"Lakebed Temple": 23,
	"Arbiters Grounds": 14,
	"Snowpeak Ruins": 13,
	"Temple of Time": 13,
	"City in The Sky": 23
}
var Dungeon_Requirements = [
	["Boomerang", "Lantern", "Bomb Bag"], // Forest Temple
	["Iron_Boots", "Bow"], // Goron Mines
	["Zora_Armor", "Bomb Bag", "Iron_Boots", "Clawshot", "Wooden Sword", "Bow", "Boomerang"], // Lakebed Temple
	["Auru's_Memo", "Lantern", "Clawshot", "Spinner", "Wooden Sword", "Bomb Bag", "Ball_and_Chain"], // Arbiters Grounds
	["Coral Earring", "Snowpeak_Ruins_Ordon_Goat_Cheese", "Ball_and_Chain", "Bomb Bag"], // Snowpeak Ruins
	["Master Sword", "Broken Dominion Rod", "Lantern"], // Temple of Time
	["1 Sky Book Page", "2 Sky Book Pages", "3 Sky Book Pages", "Double Clawshot", "Ordon Sword", "Iron_Boots"], // City in The Sky
	["Double Clawshot", "Boomerang", "Spinner", "Master Sword", "Hidden Skill"] // Ganon
];
var Dungeon_Names_Short = ["for", "min", "lak", "arb", "sno", "tot", "sky", "gan"];

/* Create check location elements */
let column = document.getElementById("normalColumn1");
for(let i = 0; i < Data["areas"].length; i++) {
	let Area = Data["areas"][i];
	
	if(Data["game"] == "tp") {
		if (Area["name"] == "Kakariko Gorge") { column = document.getElementById("normalColumn2"); }
		else if (Area["name"] == "Northeast Hyrule Field") { column = document.getElementById("normalColumn3"); }
		else if (Area["name"] == "Lake Hylia") { column = document.getElementById("normalColumn4"); }
		else if (Area["name"] == "Zoras Domain") { column = document.getElementById("normalColumn5"); }
		else if (Area["name"] == "Forest Temple") { column = document.getElementById("dungeonColumn"); }
		/*else if (Area["name"] == "Lakebed Temple") { column = document.getElementById("normalColumn8"); }
		else if (Area["name"] == "Arbiter's Grounds") { column = document.getElementById("normalColumn9"); }
		else if (Area["name"] == "Temple of Time") { column = document.getElementById("normalColumn10"); }*/
	}
	
	let span = document.createElement("span");
	span.id = Area["name"]+"_span";
	
	let elem = document.createElement("small");
	elem.innerHTML = Area["display_name"];
	elem.className = "area_name";
	
	if(Data["game"] == "tp") {
		if(Area["name"] == "Forest Temple") {
			elem.id = "title_green";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Goron Mines") {
			elem.id = "title_red";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Lakebed Temple") {
			elem.id = "title_blue";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Arbiters Grounds") {
			elem.id = "title_orange";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Snowpeak Ruins") {
			elem.id = "title_white";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Temple of Time") {
			elem.id = "title_silver";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "City in The Sky") {
			elem.id = "title_lightblue";
			elem.className = "area_titles";
		}
	}
	span.appendChild(elem);
	//if(!Key_Dungeon_Names.includes(Area["name"]))
	span.appendChild(document.createElement("br"));
	
	if(Key_Dungeon_Names.includes(Area["name"])) {
		elem = document.createElement("span");
		elem.id = Area["name"]+"_Item_Count";
		elem.className = "superdot";
		elem.innerHTML = Area["item_count"];
		span.appendChild(elem);
		
		elem = document.createElement("span");
		elem.id = Area["name"]+"_Small_Key_Count";
		elem.className = "superdotSK";
		elem.innerHTML = Area["small_key_count"]; 
		span.appendChild(elem);
		
		elem = document.createElement("span");
		elem.id = Area["name"]+"_Big_Key_Count";
		elem.className = "superdotBK";
		elem.innerHTML = Area["big_key_count"];
		span.appendChild(elem);
		
		if(Data["game"] == "tp" && Area["name"] == "Snowpeak Ruins") {
			elem = document.createElement("img");
			elem.id = Area["name"]+"_Goat_Cheese";
			elem.className = "key_images";
			elem.src = "./images/tp/items/Snowpeak_Ruins_Ordon_Goat_Cheese.png";
			span.appendChild(elem);
			
			elem = document.createElement("img");
			elem.id = Area["name"]+"_Pumpkin";
			elem.className = "key_images";
			elem.src = "./images/tp/items/Snowpeak_Ruins_Ordon_Pumpkin.png";
			span.appendChild(elem);
		}
		
		span.appendChild(document.createElement("br"));
	}
	
	for(let j = 0; j < Area["locations"].length; j++) {
		
		let loc = Area["locations"][j];
		
		elem = document.createElement("input");
		elem.id = loc["name"];
		if(!Dungeon_Names.includes(Area.name) && column != document.getElementById("songdiv"))
			elem.className = "picture_input"; // 
		else
			elem.className = "other_input";
		elem.spellcheck = false;
		if(Area["area_image"] != undefined)
			elem.style.backgroundImage = "url('"+img_dir+"areas/"+Area["area_image"].replace("'", "")+".png')";
		else
			elem.className = "other_input";
		span.appendChild(elem);

		elem = document.createElement("small");
		elem.id = "text_" + loc["name"];
		elem.className = "ool_check_text";
		elem.onmousedown = click_check;
		elem.innerHTML = loc["display_name"];
		if(loc.description != undefined)
			elem.title = loc.description;
		span.appendChild(elem);
		
		elem = document.createElement("br");
		elem.id = "br_" + loc["name"];
		span.appendChild(elem);	
	}
	
	column.appendChild(span);
}

/* FUNCTIONS */

function update_required_dungeons() {
	let value = document.getElementById("required_dungeon_input").value;
	let dungeons = []
	
	if(value.length == 6) {
		dungeons.push(value.slice(0, 2));
		dungeons.push(value.slice(2, 4));
		dungeons.push(value.slice(4, 6));
	}
	else
		dungeons = [];
	
	Required_Dungeons = [];

	let counter = 1;

	if(dungeons.includes("fo")) {
		if(!Required_Dungeons.includes("Forest Temple"))
			Required_Dungeons.push("Forest Temple");
		document.getElementById("forest_span").style.display = "block";
		if(document.getElementById("Forest Temple_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("Forest Temple_span"));
		counter += 1;
	}
	else {
		document.getElementById("forest_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("Forest Temple_span"));
	}
	
	if(dungeons.includes("go") || dungeons.includes("mi")) {
		if(!Required_Dungeons.includes("Goron Mines"))
			Required_Dungeons.push("Goron Mines");
		document.getElementById("mines_span").style.display = "block";
		if(document.getElementById("Goron Mines_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("Goron Mines_span"));
		counter += 1;
	}
	else {
		document.getElementById("mines_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("Goron Mines_span"));
	}
	
	if(dungeons.includes("la")) {
		if(!Required_Dungeons.includes("Lakebed Temple"))
			Required_Dungeons.push("Lakebed Temple");
		document.getElementById("lakebed_span").style.display = "block";
		if(document.getElementById("Lakebed Temple_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("Lakebed Temple_span"));
		counter += 1;
	}
	else {
		document.getElementById("lakebed_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("Lakebed Temple_span"));
	}
	
	if(dungeons.includes("ar") || dungeons.includes("gr")) {
		if(!Required_Dungeons.includes("Arbiters Grounds"))
			Required_Dungeons.push("Arbiters Grounds");
		document.getElementById("arbiters_span").style.display = "block";
		if(document.getElementById("Arbiters Grounds_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("Arbiters Grounds_span"));
		counter += 1;
	}
	else {
		document.getElementById("arbiters_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("Arbiters Grounds_span"));
	}
	
	if(dungeons.includes("sn")) {
		if(!Required_Dungeons.includes("Snowpeak Ruins"))
			Required_Dungeons.push("Snowpeak Ruins");
		document.getElementById("snowpeak_span").style.display = "block";
		if(document.getElementById("Snowpeak Ruins_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("Snowpeak Ruins_span"));
		counter += 1;
	}
	else {
		document.getElementById("snowpeak_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("Snowpeak Ruins_span"));
	}
	
	if(dungeons.includes("te") || dungeons.includes("ti")) {
		if(!Required_Dungeons.includes("Temple of Time"))
			Required_Dungeons.push("Temple of Time");
		document.getElementById("tot_span").style.display = "block";
		if(document.getElementById("Temple of Time_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("Temple of Time_span"));
		counter += 1;
	}
	else {
		document.getElementById("tot_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("Temple of Time_span"));
	}
	
	if(dungeons.includes("ci") || dungeons.includes("sk")) {
		if(!Required_Dungeons.includes("City in The Sky"))
			Required_Dungeons.push("City in The Sky");
		document.getElementById("cits_span").style.display = "block";
		if(document.getElementById("City in The Sky_span").parentElement != document.getElementById("dungeonColumn"+counter))
			document.getElementById("dungeonColumn"+counter).appendChild(document.getElementById("City in The Sky_span"));
		counter += 1;
	}
	else {
		document.getElementById("cits_span").style.display = "none";
		document.getElementById("dungeonColumn").appendChild(document.getElementById("City in The Sky_span"));
	}
}

function update_fused_shadows() {
	document.getElementById("shadow1_img").src = "./images/tp/items/shadow1_null.png";
	document.getElementById("shadow2_img").src = "./images/tp/items/shadow2_null.png";
	document.getElementById("shadow3_img").src = "./images/tp/items/shadow3_null.png";
	document.getElementById("shadow1_img").style.opacity = 0.2;
	document.getElementById("shadow2_img").style.opacity = 0.2;
	document.getElementById("shadow3_img").style.opacity = 0.2;
	for(let i = 0; i < Required_Dungeons.length; i++) {
		let shadow_num = i+1;
		temp_img = document.getElementById("shadow"+shadow_num+"_img");
		
		if(Required_Dungeons[i] == "Forest Temple") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_forest.png";
			if(getLocation("Forest Temple Diababa Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
		else if(Required_Dungeons[i] == "Goron Mines") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_mines.png";
			if(getLocation("Goron Mines Fyrus Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
		else if(Required_Dungeons[i] == "Lakebed Temple") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_lakebed.png";
			if(getLocation("Lakebed Temple Morpheel Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
		else if(Required_Dungeons[i] == "Arbiters Grounds") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_grounds.png";
			if(getLocation("Arbiters Grounds Stallord Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
		else if(Required_Dungeons[i] == "Snowpeak Ruins") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_ruins.png";
			if(getLocation("Snowpeak Ruins Blizzeta Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
		else if(Required_Dungeons[i] == "Temple of Time") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_time.png";
			if(getLocation("Temple of Time Armogohma Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
		else if(Required_Dungeons[i] == "City in The Sky") {
			temp_img.src = "./images/tp/items/shadow"+shadow_num+"_sky.png";
			if(getLocation("City in The Sky Argorok Heart Container").item != "unknown")
				temp_img.style.opacity = 1;
		}
	}
	
	let elem = document.getElementById("Snowpeak Ruins_Goat_Cheese");
	if(getItem("Snowpeak_Ruins_Ordon_Goat_Cheese").obtained)
		elem.style.opacity = 1;
	else
		elem.style.opacity = .2;
	
	elem = document.getElementById("Snowpeak Ruins_Pumpkin");
	if(getItem("Snowpeak_Ruins_Ordon_Pumpkin").obtained)
		elem.style.opacity = 1;
	else
		elem.style.opacity = .2;
	
	document.getElementById("poes_collected").innerHTML = getItem("Poe_Soul").count;
	elem = document.getElementById("Poe_Soul_img");
	if(getItem("Poe_Soul").count > 0)
		elem.style.opacity = 1;
	else
		elem.style.opacity = .2;
}

function update() {	
	Dungeon_Items_Remaining = {
		"Forest Temple": 12,
		"Goron Mines": 15,
		"Lakebed Temple": 23,
		"Arbiters Grounds": 14,
		"Snowpeak Ruins": 13,
		"Temple of Time": 13,
		"City in The Sky": 23
	}
	
	process_inputs();
	update_location_access();
	update_required_dungeons();
	update_item_display();
	highlight_dungeon_requirements();
	update_fused_shadows();
	update_dungeon_checks_remaining();
	update_summary_text();
	woth_and_barren_processing();
}

update();
setInterval(update,250);