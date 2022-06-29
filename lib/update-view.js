
var { getContainer } = require("treeview-model");
var { isNormalized, normalize } = require("layered-text");

var ele_id = require("ele-id");

var { listenOnClick } = require("./linsten-on-click.js");
var { updateChildren } = require("./update-children.js");

//css style
var add_css_text = require("add-css-text");
var css = require("../layered-text-treeview.css");

/*
update view / init
	options:
		.dataset
			map eid of tree-children/tree-container, to layered-text

		.showProperty
			"show"(true)/"ellipsis"/"first"/"hide"(false/null)
*/
var updateView = function (el, layeredText, options) {
	//arguments
	var container = getContainer(el);
	if (!container) return;

	//init css
	if (css) {
		add_css_text(css, "layered-text-treeview-css");
		css = null;
	}

	if (!options) options = {};

	//layeredText
	if (!layeredText) layeredText = [];
	if (!isNormalized(layeredText)) layeredText = normalize(layeredText);

	//dataset
	if (!options.dataset) options.dataset = {};
	else {
		for (var i in options.dataset) delete options.dataset[i];	//clean it
	}
	options.dataset[ele_id(container)] = layeredText;

	//on-click event
	listenOnClick(container, options);

	//update view
	container.innerHTML = "";
	if (layeredText.length) updateChildren(container, layeredText, options);

	setTimeout(function () { container.scrollTop = 0; }, 0);	//scroll to top
}

//module exports

module.exports = {
	updateView,

	initView: updateView,	//to initialize view
};
