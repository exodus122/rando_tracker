var Checks_Remaining = 0;
var Checks_In_Logic = 0;
var Required_Dungeons = ["Woodfall Temple", "Snowhead Temple", "Great Bay Temple", "Stone Tower Temple"];
var img_dir = "./images/mm/";
var Dungeon_Names = ["Woodfall Temple", "Snowhead Temple", "Great Bay Temple", "Stone Tower Temple"];
var Key_Dungeon_Names = [];
var Key_Dungeon_Names_Short = [];
var Dungeon_Items_Remaining = {};

/* Create check location elements */
let column = document.getElementById("normalColumn1");

let songdiv = document.getElementById("songdiv");

let elem = document.createElement("small");
elem.innerHTML = "Songs";
elem.className = "area_name";
elem.id = "title_white";
elem.className = "area_titles";
songdiv.appendChild(elem);
songdiv.appendChild(document.createElement("br"));

for(let i = 0; i < Data["areas"].length; i++) {
	let Area = Data["areas"][i];
	
	if(Data["game"] == "mm") {
		if (Area["name"] == "East Clock Town") { column = document.getElementById("normalColumn2"); }
		else if (Area["name"] == "Road to Southern Swamp") { column = document.getElementById("normalColumn3"); }
		else if (Area["name"] == "Mountain Village") { column = document.getElementById("normalColumn4"); }
		else if (Area["name"] == "Zora Cape") { column = document.getElementById("normalColumn5"); }
		else if (Area["name"] == "Road to Ikana") { column = document.getElementById("normalColumn6"); }
		else if (Area["name"] == "Woodfall Temple") { column = document.getElementById("normalColumn7"); }
		else if (Area["name"] == "Stone Tower Temple") { column = document.getElementById("normalColumn8"); }
	}
	
	let span = document.createElement("span");
	span.id = Area["name"]+"_span";
	
	let elem = document.createElement("small");
	elem.innerHTML = Area["display_name"];
	elem.className = "area_name";
	if(Data["game"] == "mm") {
		if(Area["name"] == "Woodfall Temple") {
			elem.id = "title_green";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Snowhead Temple") {
			elem.id = "title_white";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Great Bay Temple") {
			elem.id = "title_blue";
			elem.className = "area_titles";
		}
		else if(Area["name"] == "Stone Tower Temple") {
			elem.id = "title_gold";
			elem.className = "area_titles";
		}
	}
	span.appendChild(elem);
	span.appendChild(document.createElement("br"));
	
	for(let j = 0; j < Area["locations"].length; j++) {
		
		let loc = Area["locations"][j];
		
		if(loc.type == "song") {
			elem = document.createElement("input");
			elem.id = loc["name"];
			elem.className = "other_input";
			elem.spellcheck = false;
			songdiv.appendChild(elem);

			elem = document.createElement("small");
			elem.id = "text_" + loc["name"];
			elem.className = "ool_check_text";
			elem.onmousedown = click_check;
			elem.innerHTML = loc["display_name"];
			if(loc.description != undefined)
				elem.title = loc.description;
			songdiv.appendChild(elem);
			
			elem = document.createElement("br");
			elem.id = "br_" + loc["name"];
			songdiv.appendChild(elem);
		}
		else { // not a song or gossip
			if(Data["game"] == "mm" && Area.name == "Stone Tower Temple" && loc.name == "Stone Tower Entrance Sun Switch") {
				let elem = document.createElement("small"); 
				elem.innerHTML = "ISTT"; 
				elem.className = "area_name";
				elem.id = "title_gold";
				elem.className = "area_titles";
				
				background = "";
				
				span.appendChild(elem); 
				span.appendChild(document.createElement("br"));
			}
			
			elem = document.createElement("input");
			elem.id = loc["name"];
			if(!Dungeon_Names.includes(Area.name) && column != document.getElementById("songdiv"))
				elem.className = "picture_input"; // picture_input
			else
				elem.className = "other_input";
			elem.spellcheck = false;
			if(!Area["name"].includes("Temple"))
				elem.style.backgroundImage = "url('"+img_dir+"areas/"+Area["name"].replace("'", "")+".png')";
			span.appendChild(elem);

			elem = document.createElement("small");
			elem.id = "text_" + loc["name"];
			if(loc.type == "gossip")
				elem.className = "gossip_text";
			else
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
	}
	
	column.appendChild(span);
}

// Close Help
var help_div1 = document.getElementById("help_div1");
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
  help_div1.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == help_div2) {
	help_div1.style.display = "none";
  }
}

/* FUNCTIONS */

function apply_settings() {
	let settings = Data.settings.find(t=>t.name === document.getElementById("settings_option").value);
	for(let i = 0; i < settings.starting_items.length; i++) {
		let item = getItem(settings.starting_items[i]);
		item.obtained = true;
		item.in_logic = true;
		item.could_have = true;
	}
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		for(let j = 0; j < Area["locations"].length; j++) {
			let loc = Area["locations"][j];
			if(settings.excluded_checks.includes(loc["name"])) {
				
				document.getElementById(loc.name).style.display = "none";
				document.getElementById("text_"+loc.name).style.display = "none";
				document.getElementById("br_"+loc.name).style.display = "none";
			}
			else if(document.getElementById("gossips_option").value == "OFF" && loc.type == "gossip") {
				document.getElementById(loc.name).style.display = "none";
				document.getElementById("text_"+loc.name).style.display = "none";
				document.getElementById("br_"+loc.name).style.display = "none";
			}
			else if(loc.item == "unknown") {
				document.getElementById(loc.name).style.display = "inline";
				document.getElementById("text_"+loc.name).style.display = "inline";
				document.getElementById("br_"+loc.name).style.display = "inline";
			}
		}
	}
	if(document.getElementById("settings_option").value == "Blitz") {
		document.getElementById("woth_input4").style.display = "inline";
		document.getElementById("woth_input5").style.display = "inline";
		document.getElementById("barren_input4").style.display = "none";
	}
	else if(document.getElementById("settings_option").value == "Scrubs") {
		document.getElementById("woth_input4").style.display = "none";
		document.getElementById("woth_input5").style.display = "none";
		document.getElementById("barren_input4").style.display = "inline";
	}
	else {
		document.getElementById("woth_input4").style.display = "none";
		document.getElementById("woth_input5").style.display = "none";
		document.getElementById("barren_input4").style.display = "none";
	}
}

function update() {	
	process_inputs();
	update_location_access();
	update_item_display();
	update_dungeon_checks_remaining();
	update_summary_text();
	woth_and_barren_processing();
	apply_settings();
}

update();
setInterval(update,250);
