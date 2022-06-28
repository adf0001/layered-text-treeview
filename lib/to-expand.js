
var { setToExpandState: baseSetToExpandState } = require("treeview-model");

var { tryUpdateChildren } = require("./update-children.js");

//overwrite
var setToExpandState = function (el, state, text, updateChildrenDisplay) {
	var newState = baseSetToExpandState(el, state, text, updateChildrenDisplay);

	if (newState === false) tryUpdateChildren(el);

	return newState;
}

//module exports

module.exports = {
	setToExpandState,	//overwrite
};
