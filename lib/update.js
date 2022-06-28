
var { getNodeInfo, INFO_TYPE, INFO_NODE, update: baseUpdate } = require("treeview-model");

var { getDataInfo, DATA_PARENT_ARRAY, DATA_INDEX, getDataProperty } = require("./data-info.js");
var { updateProperty } = require("./update-property.js");

var is_simple_object = require("is-simple-object");

//return the updated node
//set property=false to remove the property
var updateNode = function (elNode, text, property, options) {
	//arguments
	var ni = getNodeInfo(elNode);
	if (!ni || ni[INFO_TYPE]) return null;

	elNode = ni[INFO_NODE];

	if ((typeof text !== "string" && text) ||	//text abnormal
		(property && !is_simple_object(property)) ||	//property abnormal
		(typeof text !== "string" && !property && property !== false)		//nothing update
	) {
		console.log("invalid data", text, property);
		return null;
	}

	//get data before dom changed
	var di = getDataInfo(elNode, null, options?.dataset);

	if (typeof text === "string") {
		elNode = baseUpdate(elNode, text, options);
		if (!elNode) return null;

		elNode.setAttribute("lt-text", text);	//cache to confirm later
	}

	layered_text.updateByIndex(di[DATA_PARENT_ARRAY], di[DATA_INDEX], text, property);
	//console.log(this.data, this.dataIndex);

	property = getDataProperty(di);
	updateProperty(elNode, layered_text.isEmptyProp(property) ? false : property);

	return elNode;
}

var removeProperty = function (elNode, options) {
	return updateNode(elNode, void 0, false, options);	//false to remove property
}

//module exports

module.exports = {
	updateNode,				//overwrite
	update: updateNode,		//overwrite

	removeProperty,

};