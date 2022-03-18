
// layered-text-treeview @ npm, layered-text treeview.

var ui_model_treeview = require("ui-model-treeview");
var ele_id = require("ele-id");
var layered_text = require("layered-text");

var htCss = require("htm-tool-css");	//require ht css

var layeredTextTreeview = {

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
		this.addSub(elView, layeredText, true);

		setTimeout(function () { elView.scrollTop = 0; }, 0);
	},

	addSub: function (parentNode, layeredText, isContainer) {
		var i, imax = layeredText.length, el, sub;
		for (i = 0; i < imax; i += layered_text.NORMALIZE_GROUP_COUNT) {
			sub = layeredText[i + layered_text.INDEX_N_SUB];
			if (sub && !sub.length) sub = null;

			el = ui_model_treeview.addChild(parentNode,
				{ contentHtml: this.formatContent(layeredText[i], sub) }, isContainer);

			el.setAttribute("lt-text", layeredText[i]);	//cache to confirm later

			if (sub) this.dataIndex[ele_id(el)] = sub;
		}
		if (el) {
			this.dataIndex[ele_id(el.parentNode)] = layeredText;
		}
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
			if (elChildren) {
				var toShow = (elChildren.style.display == "none");

				ui_model_treeview.setToExpandState(el.parentNode, toShow ? false : true);
				elChildren.style.display = toShow ? "" : "none";
			}
			else {
				var elNode = ui_model_treeview.getNode(el);
				var elText = elNode.getAttribute("lt-text");

				var idx = Array.prototype.indexOf.call(elNode.parentNode.childNodes, elNode);
				idx *= layered_text.NORMALIZE_GROUP_COUNT;
				var data = this.dataIndex[elNode.parentNode.id];
				//alert(data);

				if (data[idx] !== elText) {		//confirm
					console.log("text not match", data[idx], elText);
					throw "text not match";
				}

				this.addSub(elNode, data[idx + layered_text.INDEX_N_SUB]);
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

};

//module

exports.class = function (el, layeredText) {
	var o = Object.create(layeredTextTreeview);
	o.init(el, layeredText);
	return o;
}
