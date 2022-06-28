
var { createInsertByAdd } = require("treeview-model");

var { addNode } = require("./add.js");

var insertNode = createInsertByAdd(addNode);
var insertNodeToNext = createInsertByAdd(addNode, true);

//module exports

module.exports = {
	insertNode,				//overwrite
	insert: insertNode,		//overwrite

	insertNodeToNext,				//overwrite
	insertNext: insertNodeToNext,	//overwrite

};
