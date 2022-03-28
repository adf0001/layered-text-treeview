
// layered-text-treeview @ npm, layered-text treeview.

var _base = require("simple-text-treeview").class.prototype;
var create_assign = require("create-assign");

var ui_model_treeview = require("ui-model-treeview");
var ele_id = require("ele-id");
var layered_text = require("layered-text");
var is_simple_object = require("is-simple-object");
var htCss = require("htm-tool-css");	//require ht css

var INDEX_DATA = 0;
var INDEX_INDEX = 1;

var layeredTextTreeviewClass = function (el, layeredText) {
	this.init(el, layeredText);
}

layeredTextTreeviewClass.prototype = create_assign(
	_base,
	{
		INDEX_DATA: INDEX_DATA,
		INDEX_INDEX: INDEX_INDEX,

		data: null,		//a normalized layered-text object, refer layered-text @ npm
		dataIndex: null,	//map eid of node children, to layered-text

		init: function (container, layeredText) {
			container.onclick = this._onClick || (this._onClick = this.onClick.bind(this));

			_base.init.call(this, container);

			if (typeof layeredText !== "undefined") this.updateView(layeredText);
		},

		updateView: function (layeredText) {
			var elView = document.getElementById(this.containerId);

			if (!layered_text.isNormalized(layeredText)) layeredText = layered_text.normalize(layeredText);
			console.log(layeredText);

			this.data = layeredText;
			this.dataIndex = {};
			this.selectedName = null;

			//add root
			elView.innerHTML = "";
			this.updateChildren(elView, layeredText);

			setTimeout(function () { elView.scrollTop = 0; }, 0);
		},

		//to remove property elememt, set property===false
		updateProperty: function (elNode, property) {
			var el;
			if (property === false) {
				el = ui_model_treeview.nodePart(elNode, "lt-tree-prop");
				if (el) el.parentNode.removeChild(el);
				return;
			}

			if (!layered_text.isEmptyProp(property)) {
				el = ui_model_treeview.nodePart(elNode, "lt-tree-prop", { html: "<span style='margin-left:1.5em;color:gray;cursor:default;'></span>" });
				el.textContent = JSON.stringify(property);
			}
		},

		updateChildren: function (parentNode, layeredText) {
			var i, imax = layeredText.length, el, sub, prop;
			var nodeInfo = this.getNodeInfo(parentNode);

			for (i = 0; i < imax; i += layered_text.NORMALIZE_GROUP_COUNT) {
				el = _base.add.call(this, nodeInfo, layeredText[i]);

				el.setAttribute("lt-text", layeredText[i]);	//cache to confirm later

				sub = layeredText[i + layered_text.INDEX_N_SUB];
				if (sub && sub.length) {
					ui_model_treeview.setToExpandState(el, true);
					htCss.add(ui_model_treeview.nodeToExpand(el), "cmd");	//cursor & cmd
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
			dataInfo = this.getDataInfo(elNode, dataInfo);
			return dataInfo[INDEX_DATA][dataInfo[INDEX_INDEX] + layered_text.INDEX_N_SUB];
		},

		getDataProperty: function (elNode, dataInfo) {
			dataInfo = this.getDataInfo(elNode, dataInfo);
			return dataInfo[INDEX_DATA][dataInfo[INDEX_INDEX] + layered_text.INDEX_N_PROP];
		},

		//override
		onClick: function (evt) {
			_base.onClick.call(this, evt);

			var el = evt.target;

			if (el.classList.contains("tree-to-expand") && el.classList.contains("cmd")) {
				var elChildren = ui_model_treeview.nodeChildren(el.parentNode);
				if (!elChildren || !elChildren.hasChildNodes()) {
					var elNode = ui_model_treeview.getNode(el);

					ui_model_treeview.setToExpandState(elNode, false);	//update state before adding children, for the base will call the click by the state.

					ui_model_treeview.nodeChildren(elNode).style.display = "";
					this.updateChildren(elNode, this.getDataSub(elNode));
				}
			}
		},

		//override operation

		//return the added node
		add: function (elNode, text, property, options) {
			//arguments
			var nodeInfo = this.getNodeInfo(elNode);
			if (!nodeInfo) return null;

			elNode = nodeInfo[this.INDEX_INFO_NODE];
			var isNodeChildren = nodeInfo[this.INDEX_INFO_CHILDREN];
			var isTop = nodeInfo[this.INDEX_INFO_CONTAINER];

			//options
			options = options ? Object.create(options) : {};
			options.insert = options.insert && !isNodeChildren;	//only append for node children

			var updateSelect = options.updateSelect;
			options.updateSelect = false;		//stop update select

			if ((typeof text !== "string") ||
				(property && !is_simple_object(property))) {
				console.log("invalid data", text, property);
				return null;
			}

			//get data before dom changed
			var di = isTop ? null : this.getDataInfo(ui_model_treeview.getNode(elNode));

			//add dom
			var elNew = _base.add.call(this, nodeInfo, text, options);
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
			console.log(this.data, this.dataIndex);

			if (updateSelect) this.clickName(elNew);

			return elNew;
		},

		insertNext: function (elNode, text, property, options) {
			//arguments
			var nodeInfo = this.getNodeInfo(elNode);
			if (!nodeInfo) return null;

			elNode = nodeInfo[this.INDEX_INFO_NODE];

			//options
			options = options ? Object.create(options) : {};
			options.insert = !!elNode.nextSibling;

			return this.add(elNode.nextSibling || elNode.parentNode, text, property, options);
		},

		//return true if finished
		remove: function (elNode, options) {
			//arguments
			var nodeInfo = this.getNodeInfo(elNode);
			if (!nodeInfo || nodeInfo[this.INDEX_INFO_CHILDREN] || nodeInfo[this.INDEX_INFO_CONTAINER]) return null;

			elNode = nodeInfo[this.INDEX_INFO_NODE];

			//get data before dom changed
			var di = this.getDataInfo(elNode);

			//prepare data-index set to be removed
			var dikArray = [];	//data-index key array

			//check if the parent sub is empty after removing
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

			//all descendant sub data index
			var nds = elNode.querySelectorAll(".tree-children");
			var i, imax = nds.length, ndid;
			for (i = 0; i < imax; i++) { dikArray.push(nds[i].id); }

			//prepare next selected
			var elSelect = this.prepareRemoveSelect(elNode);

			//options
			var updateSelect = options && options.updateSelect;
			if (updateSelect) {
				options = Object.create(options);
				options.updateSelect = false;	//stop update selection
			}

			//remove dom
			if (!_base.remove.call(this, nodeInfo, options)) return false;

			//remove data
			layered_text.removeByIndex(di[INDEX_DATA], di[INDEX_INDEX]);

			//remove data index set
			imax = dikArray.length;
			for (i = 0; i < imax; i++) {
				ndid = dikArray[i];
				//console.log("delete index "+ndid);
				if (ndid && (ndid in this.dataIndex) && ndid != this.containerId) delete this.dataIndex[ndid];
			}

			console.log(this.data, this.dataIndex);

			if (updateSelect) {
				if (elSelect) this.clickName(elSelect);
				else if (elSelect === null) this.selectedName = null;	//just clean selected
			}

			return true;
		},

		//return the updated node
		//set property=false to remove the property
		update: function (elNode, text, property, options) {
			//arguments
			var nodeInfo = this.getNodeInfo(elNode);
			if (!nodeInfo || nodeInfo[this.INDEX_INFO_CHILDREN] || nodeInfo[this.INDEX_INFO_CONTAINER]) return null;

			elNode = nodeInfo[this.INDEX_INFO_NODE];

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
				elNode = _base.update.call(this, nodeInfo, text, options);
				if (!elNode) return null;

				elNode.setAttribute("lt-text", text);	//cache to confirm later
			}

			this.updateProperty(elNode, layered_text.isEmptyProp(property) ? false : property);

			layered_text.updateByIndex(di[INDEX_DATA], di[INDEX_INDEX], text, property);
			console.log(this.data, this.dataIndex);

			if (options && options.updateSelect) this.clickName(elNode);

			return elNode;
		},

		removeProperty: function (elNode, options) {
			return this.update(elNode, null, false, options);	//false to remove property
		},

	}
);

//module

exports.class = layeredTextTreeviewClass;
