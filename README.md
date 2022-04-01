# layered-text-treeview
layered-text treeview

# Install
```
npm install layered-text-treeview
```

# Usage example
```javascript

var layered_text_treeview = require("layered-text-treeview");

//dom
document.getElementById('divResult3').innerHTML =
	"<div id='name-click-msg' style='border:1px solid lightgrey;'>&nbsp;</div>" +
	"<div>" +
	"<span class='ht cmd' id='sp-cmd-add'>+add</span> " +
	"</div>" +
	"<div id='lt-treeview'></div>";

var el = document.getElementById('lt-treeview');

var data = ["aaa", "bbb",
	[
		"ccc",
		{ b: 2 }, ["eee"], "ddd"
	]
];

//.class(el, layeredText)
var tv = new layered_text_treeview.class(el);

tv.showProperty = "ellipsis";

//.updateView(layeredText)
tv.updateView(data);

document.getElementById('sp-cmd-add').onclick = function () {
	//.add(elNode, text, property, options)
	tv.add(tv.getSelected() || el, "" + (new Date()), { tm: (new Date()).getTime() },
		{ updateSelect: true });
};

```
