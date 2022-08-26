
var { getContainer, getNode, getToExpandState, setOnClick: baseSetOnClick,
	clickName } = require("treeview-model");

var { getDataSub, getDataProperty } = require("./data-info.js");
var { tryUpdateChildren } = require("./update-children.js");
var { updateProperty } = require("./update-property.js");

var setOnClick = function (el, options) {
	var container = getContainer(el);
	if (!container) return;

	baseSetOnClick(container, options);
	var baseOnClick = container.onclick;
	options = baseOnClick("get-options");

	container.onclick = function (evt) {
		if (evt === "get-options") return options;

		//call treeview_model onclick as base
		var baseReturn = baseOnClick?.(evt);

		//this onclick
		var el = evt.target;

		if (el.classList.contains("tree-to-expand")) {
			var elNode = getNode(el);
			if (getToExpandState(elNode) === false) {
				tryUpdateChildren(elNode, getDataSub(elNode, null, options?.dataset), options);
			}
		}
		else if (el.classList.contains("lt-tree-prop")) {
			var elNode = getNode(el);
			updateProperty(elNode, getDataProperty(elNode, null, options?.dataset), true, options);
			clickName(elNode);
		}

		return baseReturn;
	}
}

//module exports

module.exports = {
	setOnClick,		//overwrite
}
