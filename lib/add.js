
var { nodeChildren, getNode, getContainer, isContainer, setToExpandState, getToExpandState,
	verifyChildrenContainer, add: baseAdd, getDataset } = require("treeview-model");
var { NORMALIZE_GROUP_COUNT, INDEX_N_TEXT, INDEX_N_SUB, INDEX_N_PROP, normalize,
	addByIndex, updateByIndex } = require("layered-text");

var ele_id = require("ele-id");
var is_simple_object = require("is-simple-object");

var { getDataInfo, DATA_PARENT_ARRAY, DATA_INDEX } = require("./data-info.js");
var { tryUpdateChildren } = require("./update-children.js");
var { updateProperty } = require("./update-property.js");


/*
refer treeview-model.addNode()
	content.outerHtml/innerHtml/nameHtml/name are ignored;

addNode(el, content | text, options, childrenContainer)
	content
		.text
			the text part of a layered-text, or a layered-text array;
		.property
			the property part of a layered-text;
			ignore if 'text' is a layered-text array;

	options
		.depth
			1-N, -1(all), for adding layered-text;
*/
var addNode = function (el, content, options, childrenContainer) {
	//arguments

	//content
	if (typeof content === "string") content = { text: content };
	else if (!content) content = { text: "text" };
	else if (content instanceof Array) return addLayeredText(el, content, options, childrenContainer);

	var text = content.text || content.name || content.nameHtml || "text";
	if (text instanceof Array) return addLayeredText(el, text, options, childrenContainer);

	var property = content.property;
	if ((typeof text !== "string") ||
		(property && !is_simple_object(property))) {
		console.log("invalid data", text, property);
		return null;
	}

	//verify insert
	if (!(el = verifyChildrenContainer(el, options?.insert, childrenContainer))) return;

	//dataset
	var dataset = options?.dataset || getDataset(el)

	//get data before dom changed
	var isTop = childrenContainer && isContainer(el);
	var di = isTop ? null : getDataInfo(getNode(el), null, dataset);

	//expand existed
	if (!options?.insert && !childrenContainer && getToExpandState(el) === true) {
		tryUpdateChildren(el, null, options);
		setToExpandState(el, false);
	}

	//add dom
	var elNew = baseAdd(el, text, options, childrenContainer);
	if (!elNew) { return null; }

	//add data
	if (options?.insert) {
		//insert data
		addByIndex(di[DATA_PARENT_ARRAY], di[DATA_INDEX], text, property);
	}
	else {
		//append to children
		if (isTop) addByIndex(dataset[getContainer(el).id], -1, text, property);
		else updateByIndex(di[DATA_PARENT_ARRAY], di[DATA_INDEX], null, null, [text, property]);
	}

	elNew.setAttribute("lt-text", text);	//cache to confirm later
	updateProperty(elNew, property);

	if (!options?.insert && !isTop) {
		//parent children data index
		var eid = ele_id(elNew.parentNode);
		if (!(eid in dataset)) {
			//new data index
			dataset[eid] = di[DATA_PARENT_ARRAY][di[DATA_INDEX] + layered_text.INDEX_N_SUB];
		}
	}
	//console.log(this.data, this.dataIndex);

	return elNew;
}

//return the first added
var addLayeredText = function (el, layeredText, options, childrenContainer) {
	//layeredText
	if (!(layeredText instanceof Array)) {
		console.error("not a layered-text");
		return null;
	}

	var layeredText = normalize(layeredText);

	//verify insert
	if (!(el = verifyChildrenContainer(el, options?.insert, childrenContainer))) return;

	//dataset
	if (!options?.dataset) {
		options = options ? Object.create(options) : {};
		options.dataset = getDataset(el);
	}

	//expand existed
	if (!options?.insert && !childrenContainer && getToExpandState(el) === true) {
		tryUpdateChildren(el, null, options);
		setToExpandState(el, false);
	}

	//add
	var i, imax = layeredText.length, sub, subOptions;
	var elFirst, elNew, elChildren, elSubChildren, di;

	elChildren = childrenContainer ? el : nodeChildren(el, options.childrenTemplate || true);

	for (i = 0; i < imax; i += NORMALIZE_GROUP_COUNT) {
		elNew = addNode(
			options.insert ? el : elChildren,
			{ text: layeredText[i + INDEX_N_TEXT], property: layeredText[i + INDEX_N_PROP] },
			options,
			options.insert ? (void 0) : "true"
		);
		if (!elNew) {
			console.warn("add layered-text return null");
			return elFirst;
		}
		if (!elFirst) elFirst = elNew;

		//sub
		sub = layeredText[i + INDEX_N_SUB];
		if (sub && sub.length > 0) {

			elSubChildren = nodeChildren(elNew, options?.childrenTemplate || true);

			if (options?.depth > 0 || options?.depth === -1) {

				if (!subOptions) {	//init subOptions
					subOptions = options.insert
						? Object.create(options, { insert: { value: false } })	//only add mode for all sub
						: options;
				}

				if (subOptions.depth > 0) subOptions.depth--;	//change depth for sub

				//add and expand
				elNew = addLayeredText(elSubChildren, sub, subOptions, "true");

				if (subOptions.depth >= 0) subOptions.depth++;	//restore depth

				if (!elNew) {
					console.warn("add sub layered-text return null");
					return elFirst;
				}
			}
			else {
				//add 1 level
				di = getDataInfo(elNew);
				di[DATA_PARENT_ARRAY][di[DATA_INDEX] + INDEX_N_SUB] = sub

				setToExpandState(elNew, true);

				options.dataset[ele_id(elSubChildren)] = sub;
			}
		}
	}

	return elFirst;		//return the first
}

//module exports

module.exports = {
	addNode,		//overwrite
	add: addNode,	//overwrite

	addLayeredText,
};
