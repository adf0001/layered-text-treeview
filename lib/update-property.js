
var { getOptions, nodePart } = require("treeview-model");
var { isEmptyProp } = require("layered-text");

/*
set layered-text property part
updateProperty(elNode, property [, showAll [, options]])

	property
		false
			to remove property elememt, set property to false;
		others
			as a layered-text property;

	showAll
		to show all property;

	options
		refer to .updateView();
*/
var updateProperty = function (elNode, property, showAll, options) {
	if (!options) options = getOptions(elNode);
	var showProperty = options?.showProperty;

	var el;
	if (property === false || !showProperty || showProperty === "hide") {
		el = nodePart(elNode, "lt-tree-prop");
		if (el) el.parentNode.removeChild(el);
		return;
	}

	if (!isEmptyProp(property)) {
		el = nodePart(elNode, "lt-tree-prop",
			{ outerHtml: "<span></span>" });

		var s = el.textContent;

		if (!showAll) {
			if (showProperty == "ellipsis") {
				if (!s || s.slice(-2) === "} ") s = "{...} ";	//space at end as not-expanded flag
				else showAll = true;
			}
			else if (showProperty == "first") {
				if (!s || s.slice(-2) === "} ") {		//space at end as not-expanded flag
					var cnt = 0;
					for (var i in property) {
						cnt++;
						if (cnt > 1) break;
						s = "{" + i + ":" + JSON.stringify(property[i]);
					}
					s += ((cnt > 1) ? ",...} " : "} ");		//space at end as not-expanded flag
				}
				else showAll = true;
			}
			else {
				s = JSON.stringify(property).replace(/\"([^\:\'\"\\\&\s]+)\"\:/g, "$1:") + " ";		//space at end as not-expanded flag
			}
		}

		if (showAll) s = JSON.stringify(property).replace(/\"([^\:\'\"\\\&\s]+)\"\:/g, "$1:");

		el.textContent = s;
	}
	else {
		el = nodePart(elNode, "lt-tree-prop");
		if (el) el.textContent = "";
	}
}

//module exports

module.exports = {
	updateProperty,
};
