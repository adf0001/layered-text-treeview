
var { getNodeInfo, INFO_TYPE, INFO_NODE, remove: baseRemove, getContainer, getOptions,
	getDataset } = require("treeview-model");

var { getDataInfo, DATA_PARENT_ARRAY, DATA_INDEX } = require("./data-info.js");

//return true if finished
var removeNode = function (elNode, options) {
	if (typeof options === "undefined") options = getOptions(elNode);

	//dataset
	if (!options?.dataset) {
		options = options ? Object.create(options) : {};
		options.dataset = getDataset(elNode);
	}

	if (elNode instanceof Array) {
		//for elNode array
		var anyReturn;
		elNode.forEach(v => { anyReturn = removeNode(v, options) || anyReturn; });
		return anyReturn;
	}

	//arguments
	var onlyChildren = options?.onlyChildren;

	var ni = getNodeInfo(elNode);
	if (!ni) return null;
	if (ni[INFO_TYPE] && !onlyChildren) return null;

	elNode = ni[INFO_NODE];
	var isTop = ni[INFO_TYPE] === "container";
	var containerId = getContainer(elNode).id;

	//get data before dom changed
	var di = isTop ? null : getDataInfo(elNode, null, options.dataset);

	//prepare data-index set to be removed
	var dikArray = [];	//data-index key array

	//check if the parent sub is empty after removing
	if (di && !onlyChildren) {
		if (di[DATA_PARENT_ARRAY].length === layered_text.NORMALIZE_GROUP_COUNT) {
			if (di[DATA_INDEX] !== 0 || elNode.parentNode.childNodes.length !== 1) {
				console.error("parent sub length fail");
				return;
			}
			dikArray.push(elNode.parentNode.id);
		}
		else if (elNode.parentNode.childNodes.length === 1) {
			console.error("parent node children number fail");
			return;
		}
	}

	//all descendant sub data index
	var nds = elNode.querySelectorAll(".tree-children");
	var i, imax = nds.length, ndid;
	for (i = 0; i < imax; i++) { dikArray.push(nds[i].id); }

	//remove dom
	if (!baseRemove(elNode, options)) return false;

	//remove data
	layered_text.removeByIndex(di[DATA_PARENT_ARRAY], di[DATA_INDEX], null, !!onlyChildren);

	//remove data index set
	var dataset = options.dataset;

	imax = dikArray.length;
	for (i = 0; i < imax; i++) {
		ndid = dikArray[i];
		//console.log("delete index "+ndid);
		if (ndid && (ndid in dataset) && ndid != containerId) delete dataset[ndid];
	}

	//console.log(dataset);
	return true;
}

var removeAllChildren = function (elNode, options) {
	options = options ? Object.create(options) : {};
	options.onlyChildren = true;

	return removeNode(elNode, options)
}

//module exports

module.exports = {
	removeNode,				//overwrite
	remove: removeNode,		//overwrite

	removeAllChildren,					//overwrite
	removeChildren: removeAllChildren,	//overwrite

};
