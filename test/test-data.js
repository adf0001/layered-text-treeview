
//global variable, for html page, refer tpsvr @ npm.
layered_text_treeview = require("../layered-text-treeview.js");
layered_text = require("layered-text");

base_test_data = require("treeview-model/test/test-data.js");

module.exports = {

	"layered_text_treeview": function (done, treeviewModel) {
		if (typeof window === "undefined") throw "disable for nodejs";

		if (treeviewModel) layered_text_treeview = treeviewModel;

		base_test_data["level-3"](
			function (err, data) {
				if (err) { done(err); return; }

				var container = layered_text_treeview.getContainer("nd1");

				var elTool = document.getElementById('div-tool');
				elTool.insertAdjacentHTML("beforeend",
					'<div style="border-bottom:1px solid gray;padding-bottom:0.3em;">' +
					'level-4/layered-text-treeview: ' +

					"<span id='name-click-msg'>&nbsp;</span>" +
					"<div>" +
					"<span class='-ht-cmd' id='sp-cmd-add'>+add</span>/" +
					"<span class='-ht-cmd' id='sp-cmd-add-lt' title='layered-text'>lt</span> " +
					"<span class='-ht-cmd' id='sp-cmd-insert'>+insert</span>/" +
					"<span class='-ht-cmd' id='sp-cmd-insert-lt' title='layered-text'>lt</span> " +
					"<span class='-ht-cmd' id='sp-cmd-insert-next'>+insert-next</span>/" +
					"<span class='-ht-cmd' id='sp-cmd-insert-next-lt' title='layered-text'>lt</span> &nbsp; " +
					"<span class='-ht-cmd' id='sp-cmd-remove'>-remove</span>/" +
					"<span class='-ht-cmd' id='sp-cmd-remove-children' title='remove children'>-children</span>/" +
					"<span class='-ht-cmd' id='sp-cmd-remove-prop' title='remove property'>-property</span> " +
					"<span class='-ht-cmd' id='sp-cmd-update'>=update</span> &nbsp; " +
					"depth<select id='selDepth'>" +
					"	<option value='1' selected>1/other</option>" +
					"	<option value='2'>2</option>" +
					"	<option value='3'>3</option>" +
					"	<option value='-1'>-1/all</option>" +
					"</select> &nbsp; " +
					"showProperty<select id='selShowProperty'>" +
					"	<option value='ellipsis'>ellipsis</option>" +
					"	<option value='first' selected>first</option>" +
					"	<option value='true'>true</option>" +
					"	<option value=''>false</option>" +
					"</select>" +
					"</div>" +
					"</div>"
				);

				var data = ["aaa", "bbb",
					[
						"ccc If the input element exists in the list between the specified indices, the index () method returns the index of the element where it occurs first. We can observe this in the following example.",
						{ b: 2, c: 3 }, ["eee"], "ddd"
					]
				];

				/*
				.updateView(el, layeredText, options)		//update view / init

					options:
						.dataset
							map eid of tree-children/tree-container, to layered-text

						.showProperty
							"show"(true)/"ellipsis"/"first"/"hide"(false/null)
				*/
				layered_text_treeview.initView(container, layered_text.normalize(data, true),
					{ showProperty: document.getElementById('selShowProperty').value });

				container.addEventListener("click", function (evt) {
					var target = evt.target;

					var elSelOne = layered_text_treeview.getOneSelected(target);
					if (elSelOne) {
						var s = layered_text_treeview.nodeName(elSelOne).textContent;
						if ((s.length > 50)) s = s.slice(0, 50) + "...";

						//.getDataInfo(elNode, dataInfo)
						var prop = layered_text_treeview.getDataProperty(elSelOne);
						s += " prop=" + JSON.stringify(prop);

						document.getElementById('name-click-msg').innerHTML = s;
					}
				})

				document.getElementById('selShowProperty').onchange = function (evt) {
					var options = layered_text_treeview.getOptions(container);
					options.showProperty = evt.target.value;
				};

				document.getElementById('sp-cmd-add').onclick =
					document.getElementById('sp-cmd-add-lt').onclick =
					document.getElementById('sp-cmd-insert').onclick =
					document.getElementById('sp-cmd-insert-lt').onclick =
					document.getElementById('sp-cmd-insert-next').onclick =
					document.getElementById('sp-cmd-insert-next-lt').onclick =
					document.getElementById('sp-cmd-remove').onclick =
					document.getElementById('sp-cmd-remove-children').onclick =
					document.getElementById('sp-cmd-remove-prop').onclick =
					document.getElementById('sp-cmd-update').onclick =
					function (evt) {
						var cmdId = evt?.target?.id;

						var elSel = layered_text_treeview.getSelected(container, true);
						var elSelOne = (elSel instanceof Array) ? elSel[elSel.length - 1] : elSel;

						var newName = (new Date()).toLocaleString();
						var newProp = { tm: (new Date()).getTime() };
						var elNew;

						var depthValue = parseInt(_ele('selDepth').value);

						if (cmdId === "sp-cmd-add") {
							elNew = layered_text_treeview.add(elSelOne || container,
								{ text: newName, property: newProp }, null, !elSelOne);
						}
						else if (cmdId === "sp-cmd-add-lt") {
							elNew = layered_text_treeview.add(elSelOne || container,
								layered_text.normalize(data, true), { depth: depthValue }, !elSelOne);
						}
						else if (cmdId === "sp-cmd-insert") {
							if (elSelOne) elNew = layered_text_treeview.insert(elSelOne,
								{ text: newName, property: newProp });
						}
						else if (cmdId === "sp-cmd-insert-lt") {
							if (elSelOne) elNew = layered_text_treeview.insert(elSelOne,
								layered_text.normalize(data, true), { depth: depthValue });
						}
						else if (cmdId === "sp-cmd-insert-next") {
							if (elSelOne) elNew = layered_text_treeview.insertNext(elSelOne,
								{ text: newName, property: newProp });
						}
						else if (cmdId === "sp-cmd-insert-next-lt") {
							if (elSelOne) elNew = layered_text_treeview.insertNext(elSelOne,
								layered_text.normalize(data, true), { depth: depthValue });
						}
						else if (cmdId === "sp-cmd-remove") {
							if (elSel) layered_text_treeview.remove(elSel);
						}
						else if (cmdId === "sp-cmd-remove-children") {
							if (elSel) layered_text_treeview.removeChildren(elSel);
						}
						else if (cmdId === "sp-cmd-remove-prop") {
							if (elSelOne) layered_text_treeview.removeProperty(elSelOne);
						}
						else if (cmdId === "sp-cmd-update") {
							if (elSelOne) layered_text_treeview.update(elSelOne,
								{ text: newName, property: newProp });
						}

						if (elNew && !layered_text_treeview.isSelectedMultiple(elNew)) {
							layered_text_treeview.clickName(elNew);
						}
						else {
							treeview_model.clickContainer(container);
						}
					};

			},
			layered_text_treeview,
			true
		);
		return "ui-test";
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('layered_text_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
