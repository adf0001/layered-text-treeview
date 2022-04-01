
// layered-text-treeview @ npm, layered-text treeview.

var simple_text_treeview = require("simple-text-treeview");

var ui_model_treeview = require("ui-model-treeview");
var ele_id = require("ele-id");
var layered_text = require("layered-text");
var is_simple_object = require("is-simple-object");

var INDEX_DATA = 0;
var INDEX_INDEX = 1;

var layeredTextTreeviewClass = function (el, layeredText) {
	this.init(el, layeredText);
}

layeredTextTreeviewClass.prototype = {

	base: null,		//a simple-text-treeview object

	INDEX_DATA: INDEX_DATA,
	INDEX_INDEX: INDEX_INDEX,

	data: null,		//a normalized layered-text object, refer layered-text @ npm
	dataIndex: null,	//map eid of node children, to layered-text

	init: function (container, layeredText) {
		this.base = new simple_text_treeview.class(container);

		container.onclick = this._onClick || (this._onClick = this.onClick.bind(this));

		if (typeof layeredText !== "undefined") this.updateView(layeredText);
	},

	updateView: function (layeredText) {
		var elView = document.getElementById(this.base.containerId);

		if (!layered_text.isNormalized(layeredText)) layeredText = layered_text.normalize(layeredText);
		//console.log(layeredText);

		this.data = layeredText;
		this.dataIndex = {};
		this.base.selectedName = null;

		//add root
		elView.innerHTML = "";
		this.updateChildren(elView, layeredText);

		setTimeout(function () { elView.scrollTop = 0; }, 0);
	},

	getSelected: function () {
		return this.base.selectedName && ui_model_treeview.getNode(this.base.selectedName);
	},

	showProperty: null,		//"show"(true)/"ellipsis"/"first"/"hide"(false/null)

	//to remove property elememt, set property===false
	updateProperty: function (elNode, property, expanded) {
		var el;
		if (property === false || !this.showProperty || this.showProperty === "hide") {
			el = ui_model_treeview.nodePart(elNode, "lt-tree-prop");
			if (el) el.parentNode.removeChild(el);
			return;
		}

		if (!layered_text.isEmptyProp(property)) {
			el = ui_model_treeview.nodePart(elNode, "lt-tree-prop",
				{ html: "<span style='margin-left:1.5em;color:gray;cursor:default;'></span>" });

			var s = el.textContent;

			if (!expanded) {
				if (this.showProperty == "ellipsis") {
					if (!s || s.slice(-2) === "} ") s = "{...} ";	//space at end as not-expanded flag
					else expanded = true;
				}
				else if (this.showProperty == "first") {
					if (!s || s.slice(-2) === "} ") {		//space at end as not-expanded flag
						var cnt = 0;
						for (var i in property) {
							cnt++;
							if (cnt > 1) break;
							s = "{" + i + ":" + JSON.stringify(property[i]);
						}
						s += ((cnt > 1) ? ",...} " : "} ");		//space at end as not-expanded flag
					}
					else expanded = true;
				}
				else {
					s = JSON.stringify(property).replace(/\"([^\:\'\"\\\&\s]+)\"\:/g, "$1:") + " ";		//space at end as not-expanded flag
				}
			}

			if (expanded) s = JSON.stringify(property).replace(/\"([^\:\'\"\\\&\s]+)\"\:/g, "$1:");


			el.textContent = s;
		}
		else {
			el = ui_model_treeview.nodePart(elNode, "lt-tree-prop");
			if (el) el.textContent = "";
		}
	},

	updateChildren: function (parentNode, layeredText) {
		var i, imax = layeredText.length, el, sub;
		var nodeInfo = this.base.getNodeInfo(parentNode);

		for (i = 0; i < imax; i += layered_text.NORMALIZE_GROUP_COUNT) {
			el = this.base.add(nodeInfo, layeredText[i]);

			el.setAttribute("lt-text", layeredText[i]);	//cache to confirm later

			sub = layeredText[i + layered_text.INDEX_N_SUB];
			if (sub && sub.length) {
				this.base.updateToExpand(el, true);

				//data index of children
				this.dataIndex[ele_id(ui_model_treeview.nodeChildren(el, true))] = sub;
			}

			this.updateProperty(el, layeredText[i + layered_text.INDEX_N_PROP]);
		}
		if (el) {
			//data index
			var eid = ele_id(el.parentNode);
			if (!(eid in this.dataIndex)) this.dataIndex[eid] = layeredText;
		}
	},

	getNIndex: function (elNode) {
		return Array.prototype.indexOf.call(elNode.parentNode.childNodes, elNode);
	},
	getIndex: function (elNode) {
		return this.getNIndex(elNode) * layered_text.NORMALIZE_GROUP_COUNT;
	},

	//return dataInfo= [data, index]
	getDataInfo: function (elNode, dataInfo) {
		if (!dataInfo) dataInfo = [];

		elNode = ui_model_treeview.getNode(elNode);
		var elText = elNode.getAttribute("lt-text");

		var index = this.getIndex(elNode);
		var data = this.dataIndex[elNode.parentNode.id];
		//alert(data);

		if (data[index] !== elText) {		//confirm
			console.log("text not match", data[index], elText);
			throw "text not match";
		}

		dataInfo[INDEX_DATA] = data;
		dataInfo[INDEX_INDEX] = index;

		return dataInfo;
	},

	getDataSub: function (elNode, dataInfo) {
		dataInfo = (elNode instanceof Array) ? elNode : this.getDataInfo(elNode, dataInfo);
		return dataInfo[INDEX_DATA][dataInfo[INDEX_INDEX] + layered_text.INDEX_N_SUB];
	},

	getDataProperty: function (elNode, dataInfo) {
		dataInfo = (elNode instanceof Array) ? elNode : this.getDataInfo(elNode, dataInfo);
		return dataInfo[INDEX_DATA][dataInfo[INDEX_INDEX] + layered_text.INDEX_N_PROP];
	},

	//override
	onClick: function (evt) {
		this.base.onClick(evt);

		var el = evt.target;

		if (el.classList.contains("tree-to-expand") && el.classList.contains("cmd")) {
			var elChildren = ui_model_treeview.nodeChildren(el.parentNode);
			if (!elChildren || !elChildren.hasChildNodes()) {
				var elNode = ui_model_treeview.getNode(el);

				this.base.updateToExpand(elNode, false);

				this.updateChildren(elNode, this.getDataSub(elNode));
			}
		}
		else if (el.classList.contains("lt-tree-prop")) {
			var elNode = ui_model_treeview.getNode(el);
			this.updateProperty(elNode, this.getDataProperty(elNode), true);
			this.base.clickName(el);
		}
	},
	_onClick: null,	//binding this

	//return the added node
	//options.depth: 1-N, -1(all), for adding layered-text.
	add: function (elNode, text, property, options) {
		//arguments
		var nodeInfo = this.base.getNodeInfo(elNode);
		if (!nodeInfo) return null;

		elNode = nodeInfo[simple_text_treeview.INDEX_INFO_NODE];
		var isNodeChildren = nodeInfo[simple_text_treeview.INDEX_INFO_CHILDREN];
		var isTop = nodeInfo[simple_text_treeview.INDEX_INFO_CONTAINER];

		//options
		options = options ? Object.create(options) : {};
		options.insert = options.insert && !isNodeChildren;	//only append for node children
		if (options.depth > 0) options.depth--;

		var updateSelect = options.updateSelect;
		options.updateSelect = false;		//stop update select

		//text is array/layeredText
		if (text && (text instanceof Array)) {
			text = layered_text.normalize(text);

			var i, imax = text.length, elFirst = null, elNew, sub, subOptions = options, di;
			if (subOptions.insert) {	//only add for sub
				subOptions = Object.create(options);
				subOptions.insert = false;
			}

			for (i = 0; i < imax; i += layered_text.NORMALIZE_GROUP_COUNT) {
				elNew = this.add(nodeInfo, text[i + layered_text.INDEX_N_TEXT], text[i + layered_text.INDEX_N_PROP], options);
				if (!elNew) {
					console.warn("add layered-text return null");
					return elFirst;
				}
				if (!elFirst) elFirst = elNew;

				sub = text[i + layered_text.INDEX_N_SUB];
				if (sub) {
					if (options.depth > 0 || options.depth < 0) {
						//add and expand
						elNew = this.add(elNew, text[i + layered_text.INDEX_N_SUB], null, subOptions);
						if (!elNew) {
							console.warn("add sub layered-text return null");
							return elFirst;
						}
					}
					else {
						//add 1 level
						di = this.getDataInfo(elNew);
						di[INDEX_DATA][di[INDEX_INDEX] + layered_text.INDEX_N_SUB] = sub

						this.base.updateToExpand(elNew, true);

						this.dataIndex[ele_id(ui_model_treeview.nodeChildren(elNew, true))] = sub;
					}
				}
			}
			if (updateSelect && elFirst) this.base.clickName(elFirst);	//select the first
			return elFirst;		//return the first
		}

		if ((typeof text !== "string") ||
			(property && !is_simple_object(property))) {
			console.log("invalid data", text, property);
			return null;
		}

		//get data before dom changed
		var di = isTop ? null : this.getDataInfo(ui_model_treeview.getNode(elNode));

		//add dom
		var elNew = this.base.add(nodeInfo, text, options);
		if (!elNew) { return null; }

		//add data

		if (options.insert) {
			//insert data
			layered_text.addByIndex(di[INDEX_DATA], di[INDEX_INDEX], text, property);
		}
		else {
			//append to children
			if (isTop) layered_text.addByIndex(this.data, -1, text, property);
			else layered_text.updateByIndex(di[INDEX_DATA], di[INDEX_INDEX], null, null, [text, property]);
		}

		elNew.setAttribute("lt-text", text);	//cache to confirm later
		this.updateProperty(elNew, property);

		if (!options.insert && !isTop) {
			//parent children data index
			var eid = ele_id(elNew.parentNode);
			if (!(eid in this.dataIndex)) {
				//new data index
				this.dataIndex[eid] = di[INDEX_DATA][di[INDEX_INDEX] + layered_text.INDEX_N_SUB];
			}
		}
		//console.log(this.data, this.dataIndex);

		if (updateSelect) this.base.clickName(elNew);

		return elNew;
	},

	insertNext: function (elNode, text, property, options) {
		//arguments
		var nodeInfo = this.base.getNodeInfo(elNode);
		if (!nodeInfo) return null;

		elNode = nodeInfo[simple_text_treeview.INDEX_INFO_NODE];

		//options
		options = options ? Object.create(options) : {};
		options.insert = !!elNode.nextSibling;

		return this.add(elNode.nextSibling || elNode.parentNode, text, property, options);
	},

	//return true if finished
	remove: function (elNode, options) {
		//arguments
		var onlyChildren = options && options.onlyChildren;

		var nodeInfo = this.base.getNodeInfo(elNode);
		if (!nodeInfo) return null;
		if (nodeInfo[simple_text_treeview.INDEX_INFO_CHILDREN] && !onlyChildren) return null;

		elNode = nodeInfo[simple_text_treeview.INDEX_INFO_NODE];
		var isTop = nodeInfo[simple_text_treeview.INDEX_INFO_CONTAINER];

		//get data before dom changed
		var di = isTop ? null : this.getDataInfo(elNode);

		//prepare data-index set to be removed
		var dikArray = [];	//data-index key array

		//check if the parent sub is empty after removing
		if (di && !onlyChildren) {
			if (di[INDEX_DATA].length === layered_text.NORMALIZE_GROUP_COUNT) {
				if (di[INDEX_INDEX] !== 0 || elNode.parentNode.childNodes.length !== 1) {
					console.error("parent sub length fail");
					return;
				}
				dikArray.push(elNode.parentNode.id);
			}
			else if (elNode.parentNode.childNodes.length === 1) {
				console.error("parent node children number fail");
				return;
			}
		}

		//all descendant sub data index
		var nds = elNode.querySelectorAll(".tree-children");
		var i, imax = nds.length, ndid;
		for (i = 0; i < imax; i++) { dikArray.push(nds[i].id); }

		//prepare next selected
		var elSelect = this.base.prepareRemoveSelect(elNode, onlyChildren);

		//options
		var updateSelect = options && options.updateSelect;
		if (updateSelect) {
			options = Object.create(options);
			options.updateSelect = false;	//stop update selection
		}

		//remove dom
		if (!this.base.remove(nodeInfo, options)) return false;

		//remove data
		layered_text.removeByIndex(di[INDEX_DATA], di[INDEX_INDEX], null, !!onlyChildren);

		//remove data index set
		imax = dikArray.length;
		for (i = 0; i < imax; i++) {
			ndid = dikArray[i];
			//console.log("delete index "+ndid);
			if (ndid && (ndid in this.dataIndex) && ndid != this.containerId) delete this.dataIndex[ndid];
		}

		//console.log(this.data, this.dataIndex);

		//update select state
		this.base.updateRemoveSelect(elSelect, updateSelect);

		return true;
	},
	removeAllChildren: function () { return this.base.removeAllChildren.apply(this, arguments); },

	//return the updated node
	//set property=false to remove the property
	update: function (elNode, text, property, options) {
		//arguments
		var nodeInfo = this.base.getNodeInfo(elNode);
		if (!nodeInfo || nodeInfo[simple_text_treeview.INDEX_INFO_CHILDREN] ||
			nodeInfo[simple_text_treeview.INDEX_INFO_CONTAINER]) return null;

		elNode = nodeInfo[simple_text_treeview.INDEX_INFO_NODE];

		if ((typeof text !== "string" && text) ||	//text abnormal
			(property && !is_simple_object(property)) ||	//property abnormal
			(typeof text !== "string" && !property && property !== false)		//nothing update
		) {
			console.log("invalid data", text, property);
			return null;
		}

		//get data before dom changed
		var di = this.getDataInfo(elNode);

		if (typeof text === "string") {
			elNode = this.base.update(nodeInfo, text, options);
			if (!elNode) return null;

			elNode.setAttribute("lt-text", text);	//cache to confirm later
		}

		layered_text.updateByIndex(di[INDEX_DATA], di[INDEX_INDEX], text, property);
		//console.log(this.data, this.dataIndex);

		property = this.getDataProperty(di);
		this.updateProperty(elNode, layered_text.isEmptyProp(property) ? false : property);

		if (options && options.updateSelect) this.base.clickName(elNode);

		return elNode;
	},

	removeProperty: function (elNode, options) {
		return this.update(elNode, null, false, options);	//false to remove property
	},

};

//module

exports.class = layeredTextTreeviewClass;
