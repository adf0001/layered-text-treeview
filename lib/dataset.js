
var { getOptions } = require("treeview-model");

var getDataset = function (el) {
	return getOptions(el).dataset;
}

//module exports

module.exports = {
	getDataset,
}
