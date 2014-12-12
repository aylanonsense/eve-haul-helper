define([
	'server/helper/dumpCSV'
], function(
	dumpCSV
) {
	var loaded = false;
	var MARKET_GROUPS_LOOKUP = {};
	var ITEM_TYPE_LOOKUP = {};
	dumpCSV('./javascripts/server/data/invMarketGroups.csv')
		.then(function(rows) {
			for(var i = 0; i < rows.length; i++) {
				MARKET_GROUPS_LOOKUP[rows[i].MARKETGROUPID] = {
					marketGroupId: +rows[i].MARKETGROUPID,
					name: rows[i].MARKETGROUPNAME
				};
			}
			console.log("Loaded " + rows.length + " market groups!");
			return dumpCSV('./javascripts/server/data/invTypes.csv');
		})
		.then(function(rows) {
			var numItemTypes = 0;
			for(var i = 0; i < rows.length; i++) {
				if(rows[i].PUBLISHED === "1") {
					ITEM_TYPE_LOOKUP[rows[i].TYPEID] = {
						itemTypeId: +rows[i].TYPEID,
						name: rows[i].TYPENAME,
						marketGroupId: (rows[i].MARKETGROUPID ? +rows[i].MARKETGROUPID : null),
						marketGroupName: (rows[i].MARKETGROUPID ? MARKET_GROUPS_LOOKUP[rows[i].MARKETGROUPID].name : null),
						isIllegal: false
					};
					numItemTypes++;
				}
			}
			console.log("Loaded " + numItemTypes + " item types!");
			return dumpCSV('./javascripts/server/data/invContrabandTypes.csv');
		})
		.then(function(rows) {
			var numIllegalItems = 0;
			for(var i = 0; i < rows.length; i++) {
				if(ITEM_TYPE_LOOKUP[rows[i].TYPEID] && !ITEM_TYPE_LOOKUP[rows[i].TYPEID].isIllegal) {
					ITEM_TYPE_LOOKUP[rows[i].TYPEID].isIllegal = true;
					numIllegalItems++;
				}
			}
			console.log("Added an illegal status to " + numIllegalItems + " item types!");
			loaded = true;
		});

	function getById(itemTypeId) {
		if(!loaded) {
			throw new Error("ItemTypeLookup is not loaded yet!");
		}
		return ITEM_TYPE_LOOKUP[itemTypeId];
	}

	return {
		getById: getById
	};
});