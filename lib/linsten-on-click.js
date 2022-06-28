
var { getContainer, getNode, getToExpandState, listenOnClick: baseListenOnClick } = require("treeview-model");

var { getDataSub, getDataProperty } = require("./data-info.js");
var { tryUpdateChildren } = require("./update-children.js");
var { updateProperty } = require("./update-property.js");

var listenOnClick = function (el, options) {
	var container = getContainer(el);
	if (!container) return;

	baseListenOnClick(container, options);
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
				tryUpdateChildren(elNode, getDataSub(elNode), options);
			}
		}
		else if (el.classList.contains("lt-tree-prop")) {
			var elNode = getNode(el);
			updateProperty(elNode, getDataProperty(elNode, null, options?.dataset), true, options);
		}

		return baseReturn;
	}
}

//module exports

module.exports = {
	listenOnClick,
}
