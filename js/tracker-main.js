var CheckHistory = [];
var Checks_Remaining = 0;
var Checks_In_Logic = 0;
var Required_Dungeons = [];
var toFocus = null;

/* Add additional json data */
for(let i = 0; i < Data["areas"].length; i++) {
	let Area = Data["areas"][i];
	
	for(let j = 0; j < Area["locations"].length; j++) {
		let loc = Area["locations"][j];
		loc["can_logically_access"] = false;
		loc["can_access"] = false;
		loc["could_access"] = false;
		loc["can_peek"] = false;
		loc["could_peek"] = false;
		loc["item"] = "unknown";
		loc["forced_display"] = false;
	}
}

for(let i = 0; i < Data.items.length; i++) {
	let item = Data["items"][i];
	
	item["in_logic"] = false;
	item["obtained"] = false;
	item["could_have"] = false;	
	
	if(item.type != "item" && item.type != "key")
		continue;
	
	item["location"] = "unknown";
	item["area"] = "unknown";
	item["location_display"] = "unknown";
	item["area_display"] = "unknown";
	item["hinted"] = false;
}

/* Create item location elements */
column = document.getElementById("checkSummaryColumn1");
for(let i = 0; i < Data["items"].length; i++) {
	let item = Data["items"][i];
	if(item.type != "item")
		continue;
	
	if(Data["game"] == "mm") {
		if (Data["items"][i].name == "Bow Upgrade1") { column = document.getElementById("checkSummaryColumn2"); }
		if (Data["items"][i].name == "Bremen Mask") { column = document.getElementById("checkSummaryColumn3"); }
	}
	if(Data["game"] == "tp") {
		if (Data["items"][i].name == "Iron_Boots") { column = document.getElementById("checkSummaryColumn2"); }
		if (Data["items"][i].name == "Progressive_Sky_Book1") { column = document.getElementById("checkSummaryColumn3"); }
	}
	if(Data["game"] == "ww") {
		//if (Data["items"][i].name == "Progressive Sword1") { column = document.getElementById("checkSummaryColumn2"); }
	}
	
	let elem = document.createElement("small");
	elem.id = item.name+"_location";
	elem.className = "checkSummaryText";
	if(Data["game"] == "ww" && item.name == "Progressive Sword1")
		elem.style.display = "none";
	elem.innerHTML = item.display_name+" &#8594; ";
	elem.onmousedown = click_summary;
	column.appendChild(elem);
	
	elem = document.createElement("br");
	elem.id = "br_" + item.name;
	if(Data["game"] == "ww" && item.name == "Progressive Sword1") {
		
	}
	else
		column.appendChild(elem);
}

function isUpperCase(str) {
	if(!str.match("^[a-zA-Z\(\)]+$"))
		return false;
    return str === str.toUpperCase();
}

function isLowerCase(str) {
	if(!str.match("^[a-zA-Z\(\)]+$"))
		return false;
    return str === str.toLowerCase();
}

// Get an item json object
function getItem(name) {
	let item = Data.items.find(t=>t.name === name);
	if(item == undefined && name != "junk")
		console.log("failed to find item: "+name);
	return item;
}

// Get a progressive item json object
function getProgressiveItem(name) {
	let item = Data.progressive_items.find(t=>t.name === name);
	if(item == undefined && name != "junk")
		console.log("failed to find progressive_item: "+name);
	return item;
}

// Get a location json object
function getLocation(name) {
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		if(Area.locations.find(t=>t.name === name) != undefined) {
			let loc = Area.locations.find(t=>t.name === name);
			return(loc);
		}
	}
	console.log("failed to find location: "+name);
}

// Get an area json object
function getArea(name) {
	let Area = Data.areas.find(t=>t.name === name);
	if(Area == undefined && name != "junk")
		console.log("failed to find area: "+name);
	return Area;
}

// Get an area json object from a location name
function getAreaOfLoc(name) {
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		if(Area.locations.find(t=>t.name === name) != undefined) {
			return(Area);
		}
	}
	console.log("failed to find area of location: "+name);
}

function have_requirements(item, type, attribute, count) {
	// types: "logic", "access", "peek"
	// attributes: "logic", "obtained", "could_have"
	
	let have_required_items = true;
	for(let req of item[type+"_required"])
		if(req.includes(":")) {
			let arr = req.split(":");
			
			if(getItem(arr[0])[count] < arr[1])
				have_required_items = false;
		}
		else {
			if(!getItem(req)[attribute])
				have_required_items = false;
		}
	
	let have_conditional_items = false;
	for(let set of item[type+"_conditional"]) {
		let failed = false;
		for(let req of set)
			if(req.includes(":")) {
				let arr = req.split(":");
			
				if(getItem(arr[0])[count] < arr[1])
					failed = true;
			}
			else {
				if(!getItem(req)[attribute])
					failed = true;
			}
		if(!failed)
			have_conditional_items = true;
	}
	if(item[type+"_conditional"].length == 0)
		have_conditional_items = true;
	
	return(have_required_items && have_conditional_items);
}

function update_location_access() {
	
	if(toFocus != null && focus_counter > -1) {
		if(focus_counter < 1) {
			focus_counter += 1;
		}
		else {
			toFocus.focus();
			toFocus = null;
			focus_counter = -1;
		}
	}
	
	for(let item of Data.items) {
		
		if(item.type != "item" && item.type != "key")
			continue;
		
		if(item.location != "unknown") {
			if(getLocation(item.location).can_logically_access)
				item.in_logic = true;
			if(getLocation(item.location).can_access || item.obtained)
				item.could_have = true;
		}
	}
	
	for(let shortcut of Data.items) {
		
		if(shortcut.type != "shortcut")
			continue;
		
		shortcut.in_logic = have_requirements(shortcut, "logic", "in_logic", "count");
		if(shortcut.access_required == undefined) {
			shortcut.obtained = have_requirements(shortcut, "logic", "obtained", "count");
			shortcut.could_have = have_requirements(shortcut, "logic", "could_have", "count");
		}
		else {
			shortcut.obtained = have_requirements(shortcut, "access", "obtained", "count");
			shortcut.could_have = have_requirements(shortcut, "access", "could_have", "count");
		}
	}
	
	Checks_Remaining = 0;
	Checks_In_Logic = 0;
	
	// Key Dungeon could_have/could_peek
	/*let current_drc_keys_in_logic = 0;
	let min_drc_keys_in_logic = 0;
	let drc_keys_in_logic = 0;
	if (current_drc_keys_in_logic < 4) {
		let Area = getArea("Dragon Roost Cavern");
		if(Area != undefined) {
			for(i = 0; i < Area.locations.length; i++) {
				
			}
			let drc_keys = [["Dragon Roost Cavern - First Room"], ["Dragon Roost Cavern - Alcove With Water Jugs", "Dragon Roost Cavern - Boarded Up Chest", "Dragon Roost Cavern - Tingle Statue Chest", "Dragon Roost Cavern - Big Key Chest"], ["Dragon Roost Cavern - Chest Across Lava Pit", "Dragon Roost Cavern - Rat Room", "Dragon Roost Cavern - Rat Room Boarded Up Chest"], ["Dragon Roost Cavern - Birds Nest"]]
			let done = false;
			for (let i = 0; i < drc_keys.length; i++) {
				for (let j = 0; j < drc_keys[i].length; j++) {
					str = drc_keys[i][j];
					let loc = getLocation(str);
					if (!loc.can_logically_access && (loc.item == "small_key" || loc.item == "unknown" )) {
						min_drc_keys_in_logic = i;
						done = true;
						break;
					}
				}
				if (done) {break;}
			}
			if (!done) {min_drc_keys_in_logic = 5;}
		}
	}
	drc_keys_in_logic = Math.max(min_drc_keys_in_logic,current_drc_keys_in_logic);*/
	
	for(let Area of Data.areas) {
		let areaFullCleared = true;
		for(let loc of Area.locations) {
			
			let excluded_check = false;
			if(loc["types"] != undefined)
				for(let k = 0; k < loc["types"].length; k++) {
					if(settings.excluded_check_types.includes(loc["types"][k]))
						excluded_check = true;
				}
				
			if(Data["game"] == "ww") {
				if(!Required_Dungeons.includes("Forsaken Fortress") && loc.name == "Mailbox - Letter from Aryll") {
					excluded_check = true;
				}
				if(!Required_Dungeons.includes("Forbidden Woods") && loc.name == "Mailbox - Letter from Orca") {
					excluded_check = true;
				}
				if(!Required_Dungeons.includes("Earth Temple") && loc.name == "Mailbox - Letter from Baito") {
					excluded_check = true;
				}
			}
			
			if(loc.type == "gossip")
				continue;
			
			loc.can_logically_access = have_requirements(loc, "logic", "in_logic", "count");
			if(loc.access_required == undefined) {
				loc.can_access = have_requirements(loc, "logic", "obtained", "count");
				loc.could_access = have_requirements(loc, "logic", "could_have", "count");
			}
			else {
				loc.can_access = have_requirements(loc, "access", "obtained", "count");
				loc.could_access = have_requirements(loc, "access", "could_have", "count");
			}
			if(loc.peek_required == undefined) {
				if(loc.access_required == undefined) {
					loc.can_peek = have_requirements(loc, "logic", "obtained", "count");
					loc.could_peek = have_requirements(loc, "logic", "could_have", "count");
				}
				else {
					loc.can_peek = have_requirements(loc, "access", "obtained", "count");
					loc.could_peek = have_requirements(loc, "access", "could_have", "count");
				}
			}
			else {
				loc.can_peek = have_requirements(loc, "peek", "obtained", "count");
				loc.could_peek = have_requirements(loc, "peek", "could_have", "count");
			}
			
			// Show unknown checks
			if ((loc.item == "unknown" || loc.forced_display) && !excluded_check) {
				document.getElementById(loc.name).style.display = "inline-block";
				document.getElementById("text_"+loc.name).style.display = "inline-block";
				document.getElementById("br_"+loc.name).style.display = "inline-block";
				let excluded_check = false;
				if(loc["types"] != undefined)
					for(let k = 0; k < loc["types"].length; k++) {
						if(settings.excluded_check_types.includes(loc["types"][k]))
							excluded_check = true;
					}
				if(Data["game"] == "ww") {
					if(!Required_Dungeons.includes("Forsaken Fortress") && loc.name == "Mailbox - Letter from Aryll") {
						excluded_check = true;
					}
					if(!Required_Dungeons.includes("Forbidden Woods") && loc.name == "Mailbox - Letter from Orca") {
						excluded_check = true;
					}
					if(!Required_Dungeons.includes("Earth Temple") && loc.name == "Mailbox - Letter from Baito") {
						excluded_check = true;
					}
				}
				if(loc.type != "song" && !excluded_check)
					areaFullCleared = false;
			}
			else { // Hide known checks
				if(!loc.item.includes("Small_Key") && !loc.item.includes("Big_Key") && !loc.item.includes("Pumpkin") && !loc.item.includes("Goat_Cheese"))
					Dungeon_Items_Remaining[Area.name] -= 1;
				document.getElementById(loc.name).style.display = "none";
				document.getElementById("text_"+loc.name).style.display = "none";
				document.getElementById("br_"+loc.name).style.display = "none";
			}
			
			// Update check display class
			if(loc.can_logically_access) {
				if(loc.can_access)
					document.getElementById("text_"+loc.name).className = "logic_check_text";
				else
					document.getElementById("text_"+loc.name).className = "known_check_text";
				
				if(document.getElementById("text_"+loc.name).innerHTML != loc.display_name)
					document.getElementById("text_"+loc.name).innerHTML = loc.display_name;
				
				if(loc.item == "unknown" && (!Dungeon_Names.includes(Area.name) || Required_Dungeons.includes(Area.name)) && !excluded_check)
					Checks_In_Logic += 1;
			}
			else if(loc.can_access) {
				document.getElementById("text_"+loc.name).className = "access_check_text";
			}
			else if(loc.could_access) {
				document.getElementById("text_"+loc.name).className = "could_access_check_text";
			}
			else if(loc.can_peek) {
				document.getElementById("text_"+loc.name).className = "peek_check_text";
			}
			else if(loc.could_peek) {
				document.getElementById("text_"+loc.name).className = "could_peek_check_text";
			}
			else {
				document.getElementById("text_"+loc.name).className = "ool_check_text";
			}
			
			if(loc.item == "unknown" && (!Dungeon_Names.includes(Area.name) || Required_Dungeons.includes(Area.name)) && !excluded_check)
				Checks_Remaining += 1;
		}
		
		if(areaFullCleared && !Key_Dungeon_Names.includes(Area["name"]))
			document.getElementById(Area["name"]+"_span").style.display = "none";
		else
			document.getElementById(Area["name"]+"_span").style.display = "block";
	}
	
	
	
	document.getElementById("checks_remaining").innerHTML = "Remaining: "+Checks_Remaining+" ";
	document.getElementById("checks_in_logic").innerHTML = "In Logic: "+Checks_In_Logic;
}

function process_inputs() {
	let peeked = false;
	let hinted = false;
	
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		
		for(let j = 0; j < Area["locations"].length; j++) {
		
			let loc = Area["locations"][j];
			let val = document.getElementById(loc.name).value;
			
			if(loc.item != "unknown" || val == "" || (val != "x" && val.length != 3)) {
				continue;
			}
			if (isUpperCase(val.charAt(2)) && val.length == 3) {
				peeked = true;
				document.getElementById(loc.name).value = val.toLowerCase();
				val = document.getElementById(loc.name).value;
			}
			else if (isUpperCase(val.charAt(0)) && val.length == 3){
				hinted = true;
				document.getElementById(loc.name).value = val.toLowerCase();
				val = document.getElementById(loc.name).value;
			}
			
			if(val == "x") {
				loc.item = "junk";
				CheckHistory.push(loc.name);
				document.getElementById(loc.name).style.display = "none";
				document.getElementById("text_"+loc.name).style.display = "none";
				document.getElementById("br_"+loc.name).style.display = "none";
			}
			else {
				for(let k = 0; k < Data.items.length; k++) {
					let item = Data["items"][k];
					
					if (val == item.input && item.location == "unknown" && item.obtained == false) {
						loc.item = item.name;
						CheckHistory.push(loc.name);
						item.location = loc.name;
						item.area = Area.name;
						item.location_display = loc.display_name;
						item.area_display = Area.display_name;
						if(!peeked && !hinted) {
							item.obtained = true;
							item.could_have = true;
						}
						if(hinted)
							item.hinted = true;
						if (!item.obtained) {
							loc.forced_display = true; 
							document.getElementById(loc.name).style.backgroundImage= ""; 
							document.getElementById(loc.name).value = document.getElementById(loc.name).value.toUpperCase();
						}
						if(!loc.forced_display) {
							document.getElementById(loc.name).value = "";
							document.getElementById(loc.name).style.display = "none";
							document.getElementById("text_"+loc.name).style.display = "none";
							document.getElementById("br_"+loc.name).style.display = "none";
						}
						
						let found = false;
						for(let Area of Data.areas) {
							let areaFullCleared = true;
							for(let loc2 of Area.locations) {
								if(loc2.name == loc.name) {
									found = true;
									continue;
								}
								else if(!found)
									continue;
								
								if(!loc2.could_access && !loc2.could_peek)
									continue;
								document.getElementById(loc2.name).focus();
								break;
							}
							
							if(found)
								break;
						}
						
						break;
					}
				}
			}
		}
	}
}

function highlight(x) {
	if(x.style.opacity != 1)
		x.style.opacity = 1;
	else
		x.style.opacity = .2;
}

function update_item_display() {
	let item, itemToAdd, item3, item4, item5, item6, item7, temp_img, elem;
	
	for(let i = 0; i < Data.items.length; i++) {
		
		item = Data["items"][i];
		let nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
		if(nums.includes(item.name[item.name.length-1]) || item.type != "item")
			continue;
		
		temp_img = document.getElementById(item.name+"_img");
		if(item.obtained)
			temp_img.style.opacity =1;
		else
			temp_img.style.opacity =.2;
	}
	
	for(let i = 0; i < Data.progressive_items.length; i++) {
		let prog_item = Data.progressive_items[i];
		
		temp_img = document.getElementById(prog_item.name+"_img");
		for(let j = prog_item.stages.length-1; j >= 0; j--) {
			let stage_item = getItem(prog_item.stages[j]);
			
			if(prog_item.default_stage != undefined && !getItem(prog_item.stages[0]).obtained)
				temp_img.src = img_dir+"items/"+prog_item.default_stage+".png";
			else
				temp_img.src = img_dir+"items/"+stage_item.name+".png";
			
			if(stage_item.obtained) {
				temp_img.style.opacity =1;
				break;
			}
		}
		
		if(!getItem(prog_item.stages[0]).obtained)
			temp_img.style.opacity = .2;
	}
}

function highlight_dungeon_requirements() {
	
	for(let i = 0; i < Dungeon_Requirements.length; i++) {
		for(let j = 0; j < Dungeon_Requirements[i].length; j++) {
			let k = j+1;
			
			if(getItem(Dungeon_Requirements[i][j]).obtained) {
				document.getElementById(Dungeon_Names_Short[i]+"_req"+k).style.opacity = 1;
			}
			else {
				document.getElementById(Dungeon_Names_Short[i]+"_req"+k).style.opacity = .2;
			}
		}
	}
}

function click_check() {
	let id = this.id.substring('text_'.length);
	let loc = getLocation(id);
	let item;
	let Area = getAreaOfLoc(loc.name);
	
	if(event.button == 0) { // left click
		
		if(loc.item == "unknown") {
			CheckHistory.push(loc.name);
			loc.item = "junk";
		}
		else {
			item = getItem(loc.item);
		
			if(!loc.forced_display) {
				CheckHistory.push(loc.name);
				loc.item = "junk";
			}
			
			if(item != undefined) {
				if (loc.forced_display) {
					loc.forced_display = false;
					item.obtained = true;
				}
			}
		}
	}
	if(event.button == 2) { // right click
		
		if(Key_Dungeon_Names.includes(Area.name)) {
			let index = Key_Dungeon_Names.indexOf(Area.name);
			
			for(let i = 1; i <= Area.small_key_count; i++) {
				item = getItem(Key_Dungeon_Names_Short[index]+"_Small_Key"+i);
				if(item.obtained)
					continue;
				
				item.obtained = true;
				item.location = loc.name;
				item.area = Area;
				item.location_display = loc.display_name;
				CheckHistory.push(loc.name);
				loc.item = Key_Dungeon_Names_Short[index]+"_Small_Key"+i;
				break;
			}
		}
	}
	if(event.button == 1) { // middle click
		
		if(Key_Dungeon_Names.includes(Area.name)) {
			let index = Key_Dungeon_Names.indexOf(Area.name);
			
			for(let i = 1; i <= Area.big_key_count; i++) {
				item = getItem(Key_Dungeon_Names_Short[index]+"_Big_Key"+i);
				if(item.obtained)
					continue;
				
				item.obtained = true;
				item.location = loc.name;
				item.area = Area;
				item.location_display = loc.display_name;
				CheckHistory.push(loc.name);
				loc.item = Key_Dungeon_Names_Short[index]+"_Big_Key"+i;
				break;
			}
		}
	}
	
	document.getElementById(loc.name).style.display = "none";
	document.getElementById("text_"+loc.name).style.display = "none";
	document.getElementById("br_"+loc.name).style.display = "none";
	
	let found = false;
	for(let Area of Data.areas) {
		let areaFullCleared = true;
		for(let loc2 of Area.locations) {
			if(loc2.name == loc.name) {
				found = true;
				continue;
			}
			else if(!found)
				continue;
			
			if(!loc2.could_access && !loc2.could_peek)
				continue;
			
			focus_counter = 0;
			toFocus = document.getElementById(loc2.name);
			break;
		}
		
		if(found)
			break;
	}
	
	update();
}

function click_item(x) {
	
	let item_name = x.id.slice(0, -4);
	let item, itemToAdd, item3, item4, item5, item6, item7;
	
	if(getProgressiveItem(item_name) == undefined) { // if click non-progessive item
		item = getItem(item_name);
		if (x.style.opacity == 1) {
			item.obtained = false;
		}
		else {
			item.obtained = true;
		}
	}
	else { // if click progressive item
		let prog_item = getProgressiveItem(item_name);
		
		if(!getItem(prog_item.stages[0]).obtained) { // don't have first stage
			getItem(item_name+1).obtained = true;
		}
		else if(getItem(prog_item.stages[prog_item.stages.length-1]).obtained) { // have last stage
			for(let j = 1; j < prog_item.stages.length+1; j++) {
				getItem(item_name+j).obtained = false;
			}
		}
		else {
			for(let j = prog_item.stages.length-1; j >= 0; j--) {
				let stage_item = getItem(prog_item.stages[j]);
				if(stage_item.obtained) {
					let new_stage = j+2;
					if(new_stage <= prog_item.stages.length) {
						getItem(item_name+new_stage).obtained = true;
					}
					break;
				}
			}
		}
	}
	update();
}

function click_summary() {
	let type = event.button;
	let item = "";
	
	item = this.id.slice(0, -9);
	
	if(MarkedWotHItemArrow == null) {
		if(event.which == 3) { // right click, toggle if you have it or not
			Data.items.find(t=>t.name === item).obtained = !Data.items.find(t=>t.name === item).obtained;
			if(Data.items.find(t=>t.name === item).location != "unknown")
				Data.items.find(t=>t.name === item).could_have = getLocation(Data.items.find(t=>t.name === item).location).could_access;
		}
		else if(event.which == 1) { // left click, toggle if item is hinted by sometimes hint
			Data.items.find(t=>t.name === item).hinted = !Data.items.find(t=>t.name === item).hinted;
		}
	}
	else {
		let itemToAdd = document.getElementById(MarkedWotHItemArrow).getAttribute("data-item");
		
		if(event.which == 1) {
			
			if(ManualWotHItemLocked[itemToAdd] == undefined)
				ManualWotHItemLocked[itemToAdd] = [];
			if(ManualWotHItemPutInLogic[itemToAdd] == undefined)
				ManualWotHItemPutInLogic[itemToAdd] = [];
			
			if(item != itemToAdd) {
				if(ManualWotHItemPutInLogic[itemToAdd].includes(item))
					ManualWotHItemPutInLogic[itemToAdd].splice(ManualWotHItemPutInLogic[itemToAdd].indexOf(item), 1);
				if(ManualWotHItemLocked[itemToAdd].includes(item))
					ManualWotHItemLocked[itemToAdd].splice(ManualWotHItemLocked[itemToAdd].indexOf(item), 1);
				else
					ManualWotHItemLocked[itemToAdd].push(item);
			}
		}
		else if(event.which == 3) {
			
			if(ManualWotHItemPutInLogic[itemToAdd] == undefined)
				ManualWotHItemPutInLogic[itemToAdd] = [];
			if(ManualWotHItemLocked[itemToAdd] == undefined)
				ManualWotHItemLocked[itemToAdd] = [];
			
			if(item != itemToAdd) {
				if(ManualWotHItemLocked[itemToAdd].includes(item))
					ManualWotHItemLocked[itemToAdd].splice(ManualWotHItemLocked[itemToAdd].indexOf(item), 1);
				if(ManualWotHItemPutInLogic[itemToAdd].includes(item))
					ManualWotHItemPutInLogic[itemToAdd].splice(ManualWotHItemPutInLogic[itemToAdd].indexOf(item), 1);
				else
					ManualWotHItemPutInLogic[itemToAdd].push(item);
			}
		}
		
		MarkedWotHItemArrow = null;
	}
}

function update_dungeon_checks_remaining() {
	let items_remaining;
	
	for(let i = 0; i < Key_Dungeon_Names.length; i++) {
		let Area = getArea(Key_Dungeon_Names[i]);
		
		let count = Area.small_key_count;
		for(let j = 1; j < Area.small_key_count+1; j++) {
			if(getItem(Key_Dungeon_Names_Short[i]+"_Small_Key"+j).obtained)
				count -= 1;
		}
		document.getElementById(Key_Dungeon_Names[i]+"_Small_Key_Count").innerHTML = count;
		
		count = Area.big_key_count;
		for(let j = 1; j < Area.big_key_count+1; j++) {
			if(getItem(Key_Dungeon_Names_Short[i]+"_Big_Key"+j).obtained)
				count -= 1;
		}
		document.getElementById(Key_Dungeon_Names[i]+"_Big_Key_Count").innerHTML = count;
		
		document.getElementById(Key_Dungeon_Names[i]+"_Item_Count").innerHTML = Dungeon_Items_Remaining[Key_Dungeon_Names[i]];
	}
}

function update_summary_text() {
	for(let i = 0; i < Data["items"].length; i++) {
		let item = Data["items"][i];
		
		if(item.type != "item")
			continue;
		
		let summary_text_elem = document.getElementById(item.name+"_location");
		if(item.in_logic) {
			if (!item.obtained)
				summary_text_elem.className = "checked_text_summary_not_have";
			else
				summary_text_elem.className = "checked_text_summary";
		}
		else if(item.obtained) {
			summary_text_elem.className = "checked_text_summary_have_ool";
		}
		else if(item.could_have) {
			summary_text_elem.className = "checked_text_summary_could_have";
		}
		else if(item.location != "unknown") {
			summary_text_elem.className = "checked_text_summary_known";
		}
		else {
			summary_text_elem.className = "checked_text_summary_ool";
		}
		
		if(item.location != "unknown")
			if(item.hinted)
				summary_text_elem.innerHTML = "* "+item.display_name+" &#8594; "+item.area_display+": "+item.location_display+" *";
			else
				summary_text_elem.innerHTML = item.display_name+" &#8594; "+item.area_display+": "+item.location_display;
		else
			summary_text_elem.innerHTML = item.display_name+" &#8594; ";
	}
}

function undo() {

	if (CheckHistory.length == 0)
		return;
	
	let lastCheck = CheckHistory[CheckHistory.length-1];
	let loc = getLocation(lastCheck);
	let item = getItem(loc.item);
	
	if(item != undefined) {
		item.in_logic = false;
		item.obtained = false;
		item.could_have = false;
		item.hinted = false;
		item.location = "unknown";
		item.location_display = "";
		item.area = "";
		item.area_display = "";
	}
	
	loc.item = "unknown";
	loc.forced_display = false;
	document.getElementById(loc.name).value = "";
	document.getElementById(loc.name).style.display = "inline-block";
	document.getElementById("text_"+loc.name).style.display = "inline-block";
	document.getElementById("br_"+loc.name).style.display = "inline-block";
	
	CheckHistory.pop();
	update();
	update();
	update();
}

var MarkedWotHItemArrow = null;
var ManualWotHItems = {};
var ManualInLogicItems = {};
var ManualOutOfLogicItems = {};
var ManualNotWotHItems = {};
var ManualWotHMinorItems = {};
var ManualWotHItemLocked = {};
var ManualWotHItemPutInLogic = {};

function woth_and_barren_processing() {
	
	for(let i = 1; i <= 5; i++) {
		document.getElementById("woth"+i+"_title").innerHTML = "";
		for(let j = 1; j <= 15; j++) {
			document.getElementById("woth"+i+"_text"+j).innerHTML = "";
		}
	}
	
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		
		// Barren
		if(Area["inputs"].includes(document.getElementById("barren_input1").value.replace("2","")) 
			|| Area["inputs"].includes(document.getElementById("barren_input2").value.replace("2","")) 
			|| Area["inputs"].includes(document.getElementById("barren_input3").value.replace("2","")) 
			|| (document.getElementById("barren_input4") != undefined && Area["inputs"].includes(document.getElementById("barren_input4").value.replace("2","")))) {
			
			for(let j = 0; j < Area["locations"].length; j++) {
				let loc = Area["locations"][j];
				
				if(Key_Dungeon_Names.includes(Area.name))
					document.getElementById("text_"+loc.name).style.border = "1px solid red";
				else if(Dungeon_Names.includes(Area.name) && j == Area["locations"].length-1) {
					document.getElementById("text_"+loc.name).style.border = "1px solid red";
				}
				else
					loc.item = "junk";
			}
			
			if(Data["game"] == "ww") {
				// If these islands are barren, the dungeons on them are also barren
				if(Area.name == "Headstone Island") {
					let Area2 = Data.areas.find(t=>t.name === "Earth Temple");
					for(let j = 0; j < Area2["locations"].length; j++) {
						let loc2 = Area2["locations"][j];
						document.getElementById("text_"+loc2.name).style.border = "1px solid red";
					}
				}
				if(Area.name == "Forest Haven") {
					let Area2 = Data.areas.find(t=>t.name === "Forbidden Woods");
					for(let j = 0; j < Area2["locations"].length; j++) {
						let loc2 = Area2["locations"][j];
						document.getElementById("text_"+loc2.name).style.border = "1px solid red";
					}
				}
				if(Area.name == "Dragon Roost Island") {
					let Area2 = Data.areas.find(t=>t.name === "Dragon Roost Cavern");
					for(let j = 0; j < Area2["locations"].length; j++) {
						let loc2 = Area2["locations"][j];
						document.getElementById("text_"+loc2.name).style.border = "1px solid red";
					}
				}
			}
		}
	}
	
	// Item Hint (Wind Waker only)
	if(Data["game"] == "ww") {
		document.getElementById("item_hint_title1").innerHTML = "";
		document.getElementById("item_hint_text1").innerHTML = "";
		
		for(let i = 0; i < Data["areas"].length; i++) {
			let Area = Data["areas"][i];
			
			// Barren
			if(Area["inputs"].includes(document.getElementById("item_hint_input1").value.replace("2",""))) {
				document.getElementById("item_hint_title1").innerHTML = Area.name;
				document.getElementById("item_hint_title1").style.color = "chartreuse";
				
				for(let k = 0; k < Data.items.length; k++) {
					let item = Data["items"][k];
					
					if(item.input == "")
						continue;
					
					if (document.getElementById("item_hint_input2").value == item.input) {
						let new_img = "";
						
						if(item.image_name == undefined)
							new_img = item.name;
						else
							new_img = item.image_name;
						
						document.getElementById("item_hint_text1").innerHTML += "<img class = 'wothMajorImages' src=\"" + img_dir + "items/" + new_img + ".png" + "\">";
						break;
					}
				}
			}
		}
	}
	
	let area_counter = 1;
	let WotHColors = ["", "9cc4d9", "white", "d09cd9","b19cd9","cyan"];
	
	
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		for(let j = 0; j < Area["locations"].length; j++) {
			let loc = Area["locations"][j];
			document.getElementById("text_"+loc.name).style.border = "";	
		}
	}
	
	for(let h = 1; h <= 5; h++) {
		for(let i = 0; i < Data["areas"].length; i++) {
			let Area = Data["areas"][i];
			let tempArray = [];
			let tempArray3 = [];
			
			// WotH
			if(Area["inputs"].includes(document.getElementById("woth_input"+h).value.replace("2",""))) {
				
				document.getElementById("woth"+area_counter+"_title").innerHTML = Area.name;
				document.getElementById("woth"+area_counter+"_title").style.color = WotHColors[h];
				
				let row_counter = 1;
				
				for(let j = 0; j < Area["locations"].length; j++) {
					if(row_counter > 15)
						break;
					
					let loc = Area["locations"][j];
					
					document.getElementById("text_"+loc.name).style.border = "1px solid";
					
					if(Data["game"] == "ww") {
						if(loc.name == "Forsaken Fortress - Helmaroc King Heart Container" || loc.name == "Dragon Roost Cavern - Gohma Heart Container" || loc.name == "Forbidden Woods - Kalle Demos Heart Container" || loc.name == "Tower of the Gods - Gohdan Heart Container" || loc.name == "Earth Temple - Jalhalla Heart Container" || loc.name == "Wind Temple - Molgera Heart Container")
							continue;
						
						let val = document.getElementById("path_boss"+h).value;
						
						if(val != "hy" && val != "hyr" && loc.item.includes("Triforce Shard"))
							continue;
					}
						
					
					if(loc.item != "unknown" && loc.item != "junk" && !getItem(loc.item).hinted && !loc.item.includes("Small_Key") && !loc.item.includes("Big_Key") && !loc.item.includes("Pumpkin") && !loc.item.includes("Goat_Cheese")) {
						let new_img = "";
						if(getItem(loc.item).image_name == undefined)
							new_img = loc.item;
						else
							new_img = getItem(loc.item).image_name;
						
						document.getElementById("woth" + area_counter + "_text" + row_counter).innerHTML += "<img id = \"wothMajor" + area_counter + "_" + loc.item + "\"" + " class = 'wothMajorImages' src=\"" + img_dir + "items/" + new_img + ".png" + "\" onmousedown = 'markWothItem(this)' data-item = \"" + loc.item + "\">";
						
						if(ManualWotHItems[loc.item]) {
							document.getElementById("woth" + area_counter + "_text" + row_counter).style.display = "block";
							document.getElementById("wothMajor" + area_counter + "_" + loc.item).className = "manualWothImages";
						}
						else if(ManualNotWotHItems[loc.item]) {
							document.getElementById("woth" + area_counter + "_text" + row_counter).style.display = "none";
							document.getElementById("wothMajor" + area_counter + "_" + loc.item).className = "notWothItemImages";
						}
						else {
							document.getElementById("woth" + area_counter + "_text" + row_counter).style.display = "block";
							document.getElementById("wothMajor" + area_counter + "_" + loc.item).className = "wothMajorImages";
						}
						
						document.getElementById("woth" + area_counter + "_text" + row_counter).innerHTML += "<span onmousedown = 'markWothItemArrow(this)' id = \"wothItemArrow" + area_counter + "_" + loc.item + "\" data-item = \"" + loc.item + "\" class = 'woth_item_arrow'> &#8594; </span>";

						if(MarkedWotHItemArrow == "wothItemArrow" + area_counter + "_" + loc.item)
							document.getElementById("wothItemArrow" + area_counter + "_" + loc.item).style.color = "chartreuse";					
						
						if(ManualWotHItemLocked[loc.item] != undefined) {
							for(let q = 0; q < ManualWotHItemLocked[loc.item].length; q++) {
								let item = getItem(ManualWotHItemLocked[loc.item][q]);
								new_img = "";
								
								if(item.image_name == undefined)
									new_img = item.name;
								else
									new_img = item.image_name;
								
								document.getElementById("woth" + area_counter + "_text" + row_counter).innerHTML += "<img id = \"wothMinor" + area_counter + "_" + row_counter + "_" + item.name + "\"" + " class = 'wothImages' data-item = \"" + item.name + "\" data-parent = \"" + loc.item + "\" onmousedown = 'markMinorWothItem(this)' src=\"" + img_dir + "items/" + new_img + ".png" + "\">";
								
								if (ManualWotHMinorItems[item.name]) {
									document.getElementById("wothMinor" + area_counter + "_" + row_counter + "_" + item.name).style.setProperty("-webkit-filter", "drop-shadow(0px 0px 5px yellow)"); 
								}
							}
						}
						
						if(ManualWotHItemPutInLogic[loc.item] != undefined) {
							for(let q = 0; q < ManualWotHItemPutInLogic[loc.item].length; q++) {
								let item = getItem(ManualWotHItemPutInLogic[loc.item][q]);
								new_img = "";
								
								if(item.image_name == undefined)
									new_img = item.name;
								else
									new_img = item.image_name;
								
								document.getElementById("woth" + area_counter + "_text" + row_counter).innerHTML += "<img id = \"wothMinor" + area_counter + "_" + row_counter + "_" + item.name + "\"" + " class = 'putInLogicByWothItemImages' data-item = \"" + item.name + "\" data-parent = \"" + loc.item + "\" onmousedown = 'markMinorWothItem(this)' src=\"" + img_dir + "items/" + new_img + ".png" + "\">";
								
								if (ManualWotHMinorItems[item.name]) {
									document.getElementById("wothMinor" + area_counter + "_" + row_counter + "_" + item.name).style.setProperty("-webkit-filter", "drop-shadow(0px 0px 5px yellow)"); 
								}
							}
						}
						document.getElementById("woth" + area_counter + "_text" + row_counter).innerHTML += "<br>";
						
						tempArray.push(loc.item); 
						row_counter += 1;
					}
				}
				
				area_counter += 1;
			}
		}
	}
}

function markWothItemArrow(x) {
	if(MarkedWotHItemArrow == x.id)
		MarkedWotHItemArrow = null;
	else
		MarkedWotHItemArrow = x.id;
	update();
}

function markWothItem(x) {
	if(event.which == 1 && ManualWotHItems[x.getAttribute("data-item")] != true) {
		ManualWotHItems[x.getAttribute("data-item")] = true;
		ManualNotWotHItems[x.getAttribute("data-item")] = false;
	}
	else if(event.which == 3 && ManualNotWotHItems[x.getAttribute("data-item")] != true) {
		ManualNotWotHItems[x.getAttribute("data-item")] = true;
		ManualWotHItems[x.getAttribute("data-item")] = false;
	}
	else {
		ManualWotHItems[x.getAttribute("data-item")] = false;
		ManualNotWotHItems[x.getAttribute("data-item")] = false;
	}
	update();
}

function markMinorWothItem(x) {
	let theItem = x.getAttribute("data-item");
	let theParent = x.getAttribute("data-parent");
	
	if(event.which == 1) {
		if(ManualWotHMinorItems[theItem] == undefined || ManualWotHMinorItems[theItem] == false)
			ManualWotHMinorItems[theItem] = true;
		else
			ManualWotHMinorItems[theItem] = false;
	}
	else if(event.which == 2) {
		if(ManualWotHItemLocked[theParent].includes(theItem)) {
			ManualWotHItemLocked[theParent].splice(ManualWotHItemLocked[theParent].indexOf(theItem), 1);
			ManualWotHItemPutInLogic[theParent].push(theItem);
		}
		else if(ManualWotHItemPutInLogic[theParent].includes(theItem)) {
			ManualWotHItemPutInLogic[theParent].splice(ManualWotHItemPutInLogic[theParent].indexOf(theItem), 1);
			ManualWotHItemLocked[theParent].push(theItem);
		}
	}
	else if(event.which == 3 && ManualNotWotHItems[theItem] != true) {
		if(ManualWotHItemLocked[theParent].includes(theItem))
			ManualWotHItemLocked[theParent].splice(ManualWotHItemLocked[theParent].indexOf(theItem), 1);
		if(ManualWotHItemPutInLogic[theParent].includes(theItem))
			ManualWotHItemPutInLogic[theParent].splice(ManualWotHItemPutInLogic[theParent].indexOf(theItem), 1);
		
		ManualWotHMinorItems[theItem] = false;
	}
	update();
}

function resetWoth(num) {
	for(let i = 0; i < Data["areas"].length; i++) {
		let Area = Data["areas"][i];
		
		for(let j = 0; j < Area["locations"].length; j++) {
			let loc = Area["locations"][j];
			
			if(ManualNotWotHItems[loc.item])
				ManualNotWotHItems[loc.item] = false;
		}	
	}
}

window.onbeforeunload = popup;
function popup() {
  return '';
}

// Prevent Ctrl+Scroll Wheel Zooming
document.addEventListener('wheel', function(e) {
  e.ctrlKey && e.preventDefault();
}, {
  passive: false,
});

// Disable middle mouse button click scrolling
document.body.onmousedown = function(e) { if (e.button === 1) return false; }

document.onkeydown = function(e) {
	// Press Ctrl+Z to undo last check
	if (e.ctrlKey && e.which == 90) {
		e.preventDefault();
		undo();
	}
	// Press "=" key to add 1 poe
	if (e.which == 187 && Data["game"] == "tp" && getItem("Poe_Soul").count < 60) {
		getItem("Poe_Soul").count += 1;
		update();
	}
	// Press "-" key to subtract 1 poe
	if (e.which == 189 && Data["game"] == "tp" && getItem("Poe_Soul").count > 0) {
		getItem("Poe_Soul").count -= 1;
		update();
	}
	if (e.which >= 112 && e.which <= 123 && e.which != 116 && e.which != 122) {
		e.preventDefault();
	}
	if (e.which >= 112 && e.which <= 123 && e.which != 116 && e.which != 122) {
		e.preventDefault();
	}
}