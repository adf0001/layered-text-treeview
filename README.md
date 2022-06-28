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

var container = document.getElementById('lt-container');

var data = ["aaa", "bbb",
	[
		"ccc",
		{ b: 2 }, ["eee"], "ddd"
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
layered_text_treeview.initView(container, layered_text.normalize(data, true));

```
