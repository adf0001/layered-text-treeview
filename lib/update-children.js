
var { getNodeInfo, INFO_NODE, INFO_TYPE, setToExpandState, add: baseAdd, getToExpandState,
	nodeChildren, getDataset } = require("treeview-model");
var { NORMALIZE_GROUP_COUNT, INDEX_N_SUB, INDEX_N_PROP, isEmptyProp } = require("layered-text");
var ele_id = require("ele-id");

var { updateProperty } = require("./update-property.js");

/*
update a node children
updateChildren(elChildrenContainer [, layeredText [, options]])
*/
var updateChildren = function (elChildrenContainer, layeredText, options) {

	var ni = getNodeInfo(elChildrenContainer);
	if (!ni[INFO_TYPE]) {
		console.error("not a children container");
		return null;
	}

	var dataset = options?.dataset || getDataset(elChildrenContainer);

	if (!layeredText) layeredText = dataset[elChildrenContainer.id];

	var i, imax = layeredText.length, el, sub, prop;
	//console.log("call updateChildren");

	for (i = 0; i < imax; i += NORMALIZE_GROUP_COUNT) {
		el = baseAdd(ni[INFO_NODE], layeredText[i], null, "true");

		el.setAttribute("lt-text", layeredText[i]);	//cache to confirm later

		sub = layeredText[i + INDEX_N_SUB];
		if (sub && sub.length) {
			setToExpandState(el, true);

			//data index of children
			dataset[ele_id(nodeChildren(el, true))] = sub;
		}

		prop = layeredText[i + INDEX_N_PROP]
		if (!isEmptyProp(prop)) updateProperty(el, prop, null, options);
	}

	if (el) {
		//data index
		var eid = ele_id(el.parentNode);
		if (!(eid in dataset)) dataset[eid] = layeredText;
	}
}

//like .updateChildren(), but check children part firstly
var tryUpdateChildren = function (el, layeredText, options) {
	var elChildren = nodeChildren(el);
	if (!elChildren || !elChildren.firstElementChild) {
		if (!elChildren) elChildren = nodeChildren(el, options?.childrenTemplate || true);
		
		updateChildren(elChildren, layeredText, options);
	}
}

//module exports

module.exports = {
	updateChildren,

	tryUpdateChildren,

};
