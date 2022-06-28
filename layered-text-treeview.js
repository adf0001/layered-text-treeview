
// layered-text-treeview @ npm, layered-text treeview.

//default css style
var add_css_text = require("add-css-text");
add_css_text(require("./layered-text-treeview.css"));

//module exports

Object.assign(exports,
	require("treeview-model"),

	require("./lib/add.js"),
	require("./lib/insert.js"),
	require("./lib/remove.js"),
	require("./lib/update.js"),
	require("./lib/data-info.js"),
	require("./lib/dataset.js"),
	require("./lib/linsten-on-click.js"),
	require("./lib/update-children.js"),
	require("./lib/update-property.js"),
	require("./lib/update-view.js"),

);
