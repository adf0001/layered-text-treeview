
// layered-text-treeview @ npm, layered-text treeview.

var ui_model_treeview = require("ui-model-treeview");
var ele_id = require("ele-id");
var layered_text = require("layered-text");
var is_simple_object = require("is-simple-object");
var dispatch_event_by_name = require("dispatch-event-by-name");

var htCss = require("htm-tool-css");	//require ht css

var INDEX_DATA = 0;
var INDEX_INDEX = 1;

var layeredTextTreeview = {
	INDEX_DATA: INDEX_DATA,
	INDEX_INDEX: INDEX_INDEX,

	eleId: null,

	data: null,		//a normalized layered-text object, refer layered-text @ npm
	dataIndex: null,	//map eid of children container, to layered-text

	lastSelected: null,		//the name item of the tree-item

	init: function (el, layeredText) {
		this.eleId = ele_id(el);
		el.onclick = this._onClick || (this._onClick = this.onClick.bind(this));

		if (typeof layeredText !== "undefined") this.updateView(layeredText);
	},

	updateView: function (layeredText) {
		var elView = document.getElementById(this.eleId);

		if (!layered_text.isNormalized(layeredText)) layeredText = layered_text.normalize(layeredText);
		console.log(layeredText);

		this.data = layeredText;
		this.dataIndex = {};
		this.lastSelected = null;

		//add root
		elView.innerHTML = "";
		this.updateChildren(elView, layeredText, true);

		setTimeout(function () { elView.scrollTop = 0; }, 0);
	},

	updateChildren: function (parentNode, layeredText, isContainer) {
		var i, imax = layeredText.length, el, sub;
		for (i = 0; i < imax; i += layered_text.NORMALIZE_GROUP_COUNT) {
			sub = layeredText[i + layered_text.INDEX_N_SUB];
			if (sub && !sub.length) sub = null;

			el = ui_model_treeview.addNode(parentNode,
				{ contentHtml: this.formatContent(layeredText[i], sub) }, isContainer);

			el.setAttribute("lt-text", layeredText[i]);	//cache to confirm later

			if (sub) {
				//data index of children
				this.dataIndex[ele_id(ui_model_treeview.nodeChildren(el, true))] = sub;
			}
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

	clickName: function (el) {
		dispatch_event_by_name.click(ui_model_treeview.nodeName(el));
	},
	clickToExpand: function (el) {
		dispatch_event_by_name.click(ui_model_treeview.nodeToExpand(el));
	},

	onClick: function (evt) {
		var el = evt.target;

		if (el.classList.contains("tree-name")) {
			if (this.lastSelected) this.lastSelected.classList.remove("selected");
			htCss.add(el, "selected");
			this.lastSelected = el;
		}
		else if (el.classList.contains("tree-to-expand") && el.classList.contains("cmd")) {
			var elChildren = ui_model_treeview.nodeChildren(el.parentNode);
			if (elChildren && elChildren.hasChildNodes()) {
				var toShow = (elChildren.style.display == "none");

				ui_model_treeview.setToExpandState(el.parentNode, toShow ? false : true);
				elChildren.style.display = toShow ? "" : "none";

				if (!toShow && this.lastSelected && elChildren.contains(this.lastSelected)) {
					//un-select hidden node, and select current
					this.clickName(el.parentNode);
				}
			}
			else {
				var elNode = ui_model_treeview.getNode(el);
				this.updateChildren(elNode, this.getDataSub(elNode));
				ui_model_treeview.setToExpandState(elNode, false);
				//ui_model_treeview.nodeChildren(elNode).style.display = "";
			}
		}
	},
	_onClick: null,	//binding this

	formatContent: function (name, sub) {
		var toExpand = sub && sub.length > 0;
		var a = [];

		a[a.length] = "<span class='ht tree-to-expand" + (toExpand ? " cmd" : " disabled") + "'" +
			" style='padding:0em 0.5em;text-decoration:none;font-family:monospace;font-size:9pt;cursor:default;'>" +
			(toExpand ? "+" : ".") +
			"</span>";

		a[a.length] = "<span class='tree-name'>" + name + "</span>";

		return a.join("");
	},

	//operation

	add: function (elNode, text, property, insert, top) {
		//arguments
		if (typeof text !== "string" ||
			(property && !is_simple_object(property))) {
			console.log("invalid data", text, property);
			return null;
		}

		if (top) {
			if (!elNode || elNode.id != this.eleId) {
				console.log("invalid top node");
				return null;
			}
			insert = false;	//only append for top mode
		}
		else {
			elNode = ui_model_treeview.getNode(elNode || this.lastSelected);
			if (!elNode) {
				console.log("invalid node");
				return null;
			}
		}

		//add data
		var di = top ? null : this.getDataInfo(elNode);

		var el;
		if (insert) {
			//insert data
			layered_text.addByIndex(di[INDEX_DATA], di[INDEX_INDEX], text, property);

			//insert dom
			el = ui_model_treeview.addNode(elNode,
				{ contentHtml: this.formatContent(text), insert: insert }
			);
		}
		else {
			//append to children

			//expand existed
			if (!top && ui_model_treeview.getToExpandState(elNode) === true) {
				this.clickToExpand(elNode);
			}

			//append data
			if (top) layered_text.addByIndex(this.data, -1, text, property);
			else layered_text.updateByIndex(di[INDEX_DATA], di[INDEX_INDEX], null, null, [text, property]);

			//append dom
			el = ui_model_treeview.addNode(elNode,
				{ contentHtml: this.formatContent(text) },
				top		//container for top
			);

			if (!top) {
				//children data
				var eid = ele_id(el.parentNode);
				if (!(eid in this.dataIndex)) {
					//new data index
					this.dataIndex[eid] = di[INDEX_DATA][di[INDEX_INDEX] + layered_text.INDEX_N_SUB];
				}

				//children state
				ui_model_treeview.setToExpandState(elNode, false);		//set icon to '-'
				ui_model_treeview.nodeToExpand(elNode).classList.add("cmd");	//cursor & cmd
				ui_model_treeview.nodeChildren(elNode).style.display = "";	//expand hidden
			}
		}
		console.log(this.data, this.dataIndex);

		el.setAttribute("lt-text", text);	//cache to confirm later

		//select the new created
		this.clickName(el);
	},

	insertNext: function (elNode, text, property) {
		elNode = ui_model_treeview.getNode(elNode || this.lastSelected);
		if (!elNode) {
			console.log("invalid node");
			return null;
		}

		if (elNode.nextSibling) return this.add(elNode.nextSibling, text, property, true);
		else return this.add(elNode.parentNode, text, property, false, elNode.parentNode.id == this.eleId);
	},

	remove: function (elNode) {
		elNode = ui_model_treeview.getNode(elNode || this.lastSelected);
		if (!elNode) return;

		var di = this.getDataInfo(elNode);

		//remove data
		layered_text.removeByIndex(di[INDEX_DATA], di[INDEX_INDEX]);

		//remove all descendant sub data index
		var nds = elNode.querySelectorAll(".tree-children");
		var i, imax = nds.length, ndid;
		for (i = 0; i < imax; i++) {
			ndid = nds[i].id;
			if (ndid && (ndid in this.dataIndex)) delete this.dataIndex[ndid];
		}

		//prepare next selected
		var elSelect = elNode.nextSibling || elNode.previousSibling;
		var elParent = elSelect ? null : elNode.parentNode;
		var isTop = elParent && elParent.id == this.eleId;

		//remove dom
		elNode.parentNode.removeChild(elNode);

		//select next
		if (elSelect) this.clickName(elSelect);
		else {
			if (!isTop) {
				elParent = ui_model_treeview.getNode(elParent);

				this.clickName(elParent);

				//children state
				ui_model_treeview.setToExpandState(elParent, "disable");
				ui_model_treeview.nodeToExpand(elParent).classList.remove("cmd");
				ui_model_treeview.nodeChildren(elParent).style.display = "none";

				if (!di[INDEX_DATA].length) {
					//remove empty sub
					var elChildren = ui_model_treeview.nodeChildren(elParent);
					var eid = elChildren.id;
					if (eid in this.dataIndex) delete this.dataIndex[eid];
					elChildren.parentNode.removeChild(elChildren);
				}
				else {
					console.log("data length fail when removing");
				}
			}
			else {
				this.lastSelected = null;	//top data empty
			}
		}

		console.log(this.data, this.dataIndex);
	},

	update: function (elNode, text, property) {
		//arguments
		if (typeof text !== "string" ||
			(property && !is_simple_object(property))) {
			console.log("invalid data", text, property);
			return null;
		}

		elNode = ui_model_treeview.getNode(elNode || this.lastSelected);
		if (!elNode) {
			console.log("invalid node");
			return;
		}

		//update
		var di = this.getDataInfo(elNode);

		layered_text.updateByIndex(di[INDEX_DATA], di[INDEX_INDEX], text, property);
		console.log(this.data, this.dataIndex);

		ui_model_treeview.nodeName(elNode).textContent = text;
		elNode.setAttribute("lt-text", text);

		this.clickName(elNode);
	},

};

//module

exports.class = function (el, layeredText) {
	var o = Object.create(layeredTextTreeview);
	o.init(el, layeredText);
	return o;
}
