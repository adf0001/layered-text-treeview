
//global variable, for html page, refer tpsvr @ npm.
layered_text_treeview = require("../layered-text-treeview.js");
ui_model_treeview = require("ui-model-treeview");
layered_text = require("layered-text");

module.exports = {

	"layered_text_treeview": function (done) {
		if (typeof window === "undefined") throw "disable for nodejs";

		//dom
		document.getElementById('divResult3').innerHTML =
			"<div id='name-click-msg' style='border:1px solid lightgrey;'>&nbsp;</div>" +
			"<div>" +
			"<span class='ht cmd' id='sp-cmd-add'>+add</span>/" +
			"<span class='ht cmd' id='sp-cmd-add-lt' title='layered-text'>lt</span> " +
			"<span class='ht cmd' id='sp-cmd-insert'>+insert</span>/" +
			"<span class='ht cmd' id='sp-cmd-insert-lt' title='layered-text'>lt</span> " +
			"<span class='ht cmd' id='sp-cmd-insert-next'>+insert-next</span>/" +
			"<span class='ht cmd' id='sp-cmd-insert-next-lt' title='layered-text'>lt</span> &nbsp; " +
			"<span class='ht cmd' id='sp-cmd-remove'>-remove</span> " +
			"<span class='ht cmd' id='sp-cmd-remove-prop'>-remove prop</span> " +
			"<span class='ht cmd' id='sp-cmd-remove-children'>-remove children</span> &nbsp; " +
			"<span class='ht cmd' id='sp-cmd-update'>=update</span> &nbsp; " +
			"<label><input type='checkbox' id='chk-update-select' checked/>update-select</label> &nbsp; " +
			"depth<select id='selDepth'>" +
			"	<option value='1' selected>1/other</option>" +
			"	<option value='2'>2</option>" +
			"	<option value='3'>3</option>" +
			"	<option value='-1'>-1/all</option>" +
			"</select> &nbsp; " +
			"showProperty<select id='selShowProperty'>" +
			"	<option value='ellipsis'>ellipsis</option>" +
			"	<option value='first'>first</option>" +
			"	<option value='true'>true</option>" +
			"	<option value='' selected>false</option>" +
			"</select>" +
			"</div>" +
			"<div id='lt-treeview'></div>";

		var el = document.getElementById('lt-treeview');

		var data = ["aaa", "bbb",
			[
				"ccc If the input element exists in the list between the specified indices, the index () method returns the index of the element where it occurs first. We can observe this in the following example.",
				{ b: 2 }, ["eee"], "ddd"
			]
		];

		//.class(el, layeredText)
		var tv = new layered_text_treeview.class(el);

		//tv.showProperty = "ellipsis";
		//tv.showProperty = "first";
		//tv.showProperty = true;
		tv.showProperty = false;

		//.updateView(layeredText)
		tv.updateView(layered_text.normalize(data, true));

		el.addEventListener("click", function (evt) {
			var target = evt.target;
			if (target && target.classList.contains("tree-name")) {
				var s = target.textContent;
				if ((s.length > 50)) s = s.slice(0, 50) + "...";

				//.getDataInfo(elNode, dataInfo)
				var prop = tv.getDataProperty(target);
				s += " prop=" + JSON.stringify(prop);

				document.getElementById('name-click-msg').innerHTML = s;
			}
		})

		document.getElementById('selShowProperty').onchange = function (evt) {
			tv.showProperty = evt.target.value;
		};

		document.getElementById('sp-cmd-add').onclick = function () {
			//.add(elNode, text, property, options)
			tv.add(tv.selectedName || el, "" + (new Date()), { tm: (new Date()).getTime() },
				{ updateSelect: _ele('chk-update-select').checked });
		};
		document.getElementById('sp-cmd-add-lt').onclick = function () {
			tv.add(tv.selectedName || el, layered_text.normalize(data, true), null,
				{ updateSelect: _ele('chk-update-select').checked, depth: _ele('selDepth').value });
		};
		document.getElementById('sp-cmd-insert').onclick = function () {
			tv.add(tv.selectedName || el, "" + new Date(), { tm: (new Date()).getTime() },
				{ insert: true, updateSelect: _ele('chk-update-select').checked });
		};
		document.getElementById('sp-cmd-insert-lt').onclick = function () {
			tv.add(tv.selectedName || el, layered_text.normalize(data, true), null,
				{ insert: true, updateSelect: _ele('chk-update-select').checked, depth: _ele('selDepth').value });
		};
		document.getElementById('sp-cmd-insert-next').onclick = function () {
			//.insertNext(elNode, text, property, options)
			if (tv.selectedName) tv.insertNext(null, "" + new Date(), { tm: (new Date()).getTime() },
				{ updateSelect: _ele('chk-update-select').checked });
			else tv.add(el, "" + (new Date()), { tm: (new Date()).getTime() },
				{ updateSelect: _ele('chk-update-select').checked });
		};
		document.getElementById('sp-cmd-insert-next-lt').onclick = function () {
			//.insertNext(elNode, text, property, options)
			if (tv.selectedName) tv.insertNext(null, layered_text.normalize(data, true), null,
				{ updateSelect: _ele('chk-update-select').checked, depth: _ele('selDepth').value });
			else tv.add(el, layered_text.normalize(data, true), null,
				{ updateSelect: _ele('chk-update-select').checked, depth: _ele('selDepth').value });
		};
		document.getElementById('sp-cmd-remove').onclick = function () {
			//.remove(elNode, options)
			tv.remove(null, { updateSelect: _ele('chk-update-select').checked });	//remove the selected
		};
		document.getElementById('sp-cmd-remove-prop').onclick = function () {
			tv.removeProperty(null, { updateSelect: _ele('chk-update-select').checked });
		};
		document.getElementById('sp-cmd-remove-children').onclick = function () {
			tv.removeAllChildren(null, { updateSelect: _ele('chk-update-select').checked });
		};
		document.getElementById('sp-cmd-update').onclick = function () {
			//.update(elNode, text, property, options)
			tv.update(null, "" + (new Date()), { tm: (new Date()).getTime() },		//update the selected
				{ updateSelect: _ele('chk-update-select').checked });
		};

		return "ui-test";
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('layered_text_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
