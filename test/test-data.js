
//global variable, for html page, refer tpsvr @ npm.
layered_text_treeview = require("../layered-text-treeview.js");

module.exports = {

	"layered_text_treeview": function (done) {
		if (typeof window === "undefined") throw "disable for nodejs";

		//dom
		document.getElementById('divResult3').innerHTML =
			"<div id='name-click-msg' style='border:1px solid lightgrey;'></div><div id='lt-treeview'></div>";

		var el = document.getElementById('lt-treeview');

		var data = ["aaa", "bbb",
			[
				"ccc If the input element exists in the list between the specified indices, the index () method returns the index of the element where it occurs first. We can observe this in the following example.",
				{ b: 2 }, ["eee"], "ddd"
			]
		];

		var tv = layered_text_treeview.class(el, data);

		el.addEventListener("click", function (evt) {
			var target = evt.target;
			if (target && target.classList.contains("tree-name")) {
				document.getElementById('name-click-msg').innerHTML = target.textContent;
			}
		})

		return "ui-test";
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('layered_text_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
