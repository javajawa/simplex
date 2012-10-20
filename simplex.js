var simplex = {
	init : function()
	{
		if (!this.checkLoaded())
			return window.setTimeout('simplex.init()', 100);

		document.getElementById('input').appendChild(input.init());
	},
	checkLoaded : function()
	{
		if (typeof(factors) == 'undefined') return false;
		if (typeof(rational) == 'undefined') return false;
		if (typeof(dom) == 'undefined') return false;
		if (typeof(states) == 'undefined') return false;
		if (typeof(util) == 'undefined') return false;
		if (typeof(input) == 'undefined') return false;
		return true;
	},
	begin : function ()
	{
		document.getElementById('input').style.display = 'none';
		var state = input.tostate();
		this.setCurrent(state);
		this.addToHistory(state);
	},
	positionInParent: function (node)
	{
		var pos = -1;
		while (node != null)
		{
			++pos;
			node = node.previousSibling;
		}
		return pos;
	},
	setCurrent : function (state)
	{
		states.current = state;
		var table = dom.table(state);
		var div   = document.getElementById('current');
		while (div.hasChildNodes())
			div.removeChild(div.firstChild);

		div.appendChild(table);
	},
	addToHistory : function (state)
	{
		states.history.push(state);
		var table = dom.table(state);
		var div = document.getElementById('history');
		div.insertBefore(table, div.firstChild);
	},
	clkCurrent : function (event)
	{
		if (event.target.nodeName === 'TD')
		{
			var column = this.positionInParent(event.target) - 1;
			if (column < 0)
				return;

			var row = event.target.parentNode;
			row = this.positionInParent(row) - 1;
			if (row < 1)
				return;

			var state = states.pivot(states.current, row, column);
			this.setCurrent(state);
			this.addToHistory(state);
		}
	},
	auto : function ()
	{
		var state = states.current;
		var val = 0; var col = 0;
		var rhs = state.columns - 1;

		// First, find the most negative objective row column
		for (var i = 1; i < rhs; ++i)
		{
			var cellVal = rational.valueOf(state.cell(0, i));
			if (cellVal < val)
			{
				val = cellVal; col = i;
			}
		}
		if (val >= 0)
			return;

		val = 0; var row = 0;
		// Find the greatest ratio
		for (var i = 1; i < state.equations.length; ++i)
		{
			var cellVal = rational.div(state.cell(i, col), state.cell(i, rhs));
			var cellVal = rational.valueOf(cellVal);
			if (cellVal > val)
			{
				val = cellVal; row = i;
			}
		}
		if (val <= 0)
			return;

		var state = states.pivot(state, row, col);
		this.setCurrent(state);
		this.addToHistory(state);

		this.auto();
	}
};

simplex.init();

