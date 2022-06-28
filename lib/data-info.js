
var { getNode } = require("treeview-model");
var { NORMALIZE_GROUP_COUNT, INDEX_N_SUB, INDEX_N_PROP } = require("layered-text");
var { getDataset } = require("./dataset.js");

var getElementIndex = function (elNode) {
	return Array.prototype.indexOf.call(elNode.parentNode.children, elNode);
}

var getArrayIndex = function (elNode) {
	return getElementIndex(elNode) * NORMALIZE_GROUP_COUNT;
}

var DATA_PARENT_ARRAY = 0;
var DATA_INDEX = 1;

/*
getDataInfo(elNode [, dataInfo [, dataset]])

return dataInfo= [parentArray, arrayIndex/index]
*/
var getDataInfo = function (elNode, dataInfo, dataset) {
	if (!dataInfo) dataInfo = [];

	elNode = getNode(elNode);
	var elText = elNode.getAttribute("lt-text");

	if (!dataset) dataset = getDataset(elNode);

	var index = getArrayIndex(elNode);
	var data = dataset[elNode.parentNode.id];
	//alert(data);

	if (data[index] !== elText) {		//confirm
		console.log("text not match, " + data[index] + ", " + elText);
		throw "text not match";
	}

	dataInfo[DATA_PARENT_ARRAY] = data;
	dataInfo[DATA_INDEX] = index;

	return dataInfo;
}

/*
getDataSub(elNode [, dataInfo [, dataset]])
getDataSub(dataInfo)
*/
var getDataSub = function (elNode, dataInfo, dataset) {
	dataInfo = (elNode instanceof Array) ? elNode : getDataInfo(elNode, dataInfo, dataset);
	return dataInfo[DATA_PARENT_ARRAY][dataInfo[DATA_INDEX] + INDEX_N_SUB];
}

/*
getDataProperty(elNode [, dataInfo [, dataset]])
getDataProperty(dataInfo)
*/
var getDataProperty = function (elNode, dataInfo, dataset) {
	dataInfo = (elNode instanceof Array) ? elNode : getDataInfo(elNode, dataInfo, dataset);
	return dataInfo[DATA_PARENT_ARRAY][dataInfo[DATA_INDEX] + INDEX_N_PROP];
}

//module exports

module.exports = {
	DATA_PARENT_ARRAY,
	DATA_INDEX,

	getElementIndex,
	getNormalizeIndex: getElementIndex,
	getArrayIndex,

	getDataInfo,

	getDataSub,
	getDataProperty,

};
