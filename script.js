var dom = {
	table : function (state)
	{
		var table = document.createElement('table');

		var row = this.row(document.createElement('td'));
		for (var i = 0; i < state.columns; ++i)
			row.appendChild(this.label(state.column(i)));

		table.appendChild(row);

		for (var r = 0; r < state.equations.length; ++r)
		{
			row = this.row(this.label(state.equations[r].b));

			for (var i = 0; i < state.columns; ++i)
				row.appendChild(this.rational(
					state.equations[r].v[i]
				));

			table.appendChild(row);
		}

		return table;
	},
	label : function (data)
	{
		var cell = document.createElement('td');
		var sub  = document.createElement('sub');

		this.setText(sub, data[1]);
		this.setText(cell, data[0]);
		cell.appendChild(sub);

		return cell;
	},
	rational : function (r)
	{
		var cell = document.createElement('td');

		if (r.d == 1)
		{
			this.setText(cell, (r.s *r.n))
			return cell;
		}
		else if (isNaN(r.d))
		{
			this.setText(cell, 'NaN');
			return cell;
		}

		var sub  = document.createElement('sub');
		var sup  = document.createElement('sup');
		var div  = document.createTextNode('/');

		this.setText(sup, (r.s * r.n));
		this.setText(sub, r.d);

		cell.appendChild(sup);
		cell.appendChild(div);
		cell.appendChild(sub);

		return cell;
	},
	row : function ()
	{
		var row = document.createElement('tr');
		for (val in arguments)
			row.appendChild(arguments[val]);

		return row;
	},
	setText : function (node, text)
	{
		if ('innerText' in node)
			node.innerText = text;
		else
			node.textContent = text;
	}
};

var factors =
{
	vals:
	{
		0: {},
		1: {},
		2: {2 : 1},
		3: {3 : 1}
	},
	get: function(n)
	{
		if (n in factors.vals)
			return factors.vals[n];

		var lim = Math.floor(Math.sqrt(n));

		for (i = 2; i <= lim; ++i)
		{
			if (n % i === 0)
			{
				factors.vals[n] = factors.merge(factors.get(i), factors.get(n / i));
				return factors.vals[n];
			}
		}
		factors.vals[n] = {};
		factors.vals[n][n] = 1;
		return factors.vals[n];
	},
	merge: function(a, b)
	{
		r = {};
		for (key in a)
			r[key] = a[key];

		for (key in b)
			if (key in r)
				r[key] += b[key];
			else
				r[key] = b[key];

		return r;
	},
	count: function(n)
	{
		var f = factors.get(n);
		var c = 0;
		for (k in f) c += f[k];
		return c;
	}
};

var input = {
	element: null,
	vars: 2,
	label: dom.label,
	row : dom.row,
	setText : dom.setText,
	box: function() {
		var box = document.createElement('td');
		box.appendChild(document.createElement('input'));
		return box;
	},
	plus : function () { return this.label(['+', '']); },
	equs : function () { return this.label(['<=', '']); },
	blnk : function () { return document.createElement('td') },
	init : function()
	{
		this.element = document.createElement('table');
		this.element.classList.add('input');

		this.element.appendChild(
			this.row(
				this.blnk(),
				this.label(['x',    1]),
				this.blnk(),
				this.label(['x',    2]),
				this.blnk(),
				this.label(['RHS', ''])
			)
		);

		var mode = document.createElement('select');
		mode.disabled='disabled';

		node = document.createElement('option');
		this.setText(node, 'max');
		mode.appendChild(node);

		var node = document.createElement('option');
		this.setText(node, 'min');
		mode.appendChild(node);

		this.element.appendChild(
			this.row(mode, this.box(), this.plus(), this.box(), this.blnk(), this.blnk())
		);

		this.addequ();

		return this.element;
	},
	addequ: function()
	{
		var row = this.row(this.blnk());
		for (var i = 0; i < this.vars - 1; ++i)
		{
			row.appendChild(this.box());
			row.appendChild(this.plus());
		}
		row.appendChild(this.box());
		row.appendChild(this.equs());
		row.appendChild(this.box());

		this.element.appendChild(row);
	},
	addvar: function()
	{
		var pos = 2 * this.vars;
		++this.vars;

		var row = this.element.children[0];
		var node = row.children[pos + 1];
		row.insertBefore(this.label(['x', this.vars]), node);
		row.insertBefore(this.blnk(), node);

		for (var i = 1; i < this.element.children.length; ++i)
		{
			var row = this.element.children[i];
			var node = row.children[pos];
			row.insertBefore(this.plus(), node);
			row.insertBefore(this.box(), node);
		}
	},
	tostate: function ()
	{
		var state = states.create(this.vars, this.element.children.length - 2);
		var equ  = {
			vals : new Array(state.columns),
			clear : function(base)
			{
				for (var i = 0; i < state.columns; ++i)
					if (i == base)
						this.vals[i] = 1;
					else
						this.vals[i] = 0;
			}
		};

		equ.clear(0);
		equ.vals[state.columns - 1] = 0;
		for (var j = 1; j <= this.vars; ++j)
			equ.vals[j] = '-' + (this.element.children[1].children[2*j-1].children[0].value || 0);

		state.setequation(0, state.column(0), util.rational(equ.vals));

		for (var i = 2; i < this.element.children.length; ++i)
		{
			equ.clear(i - 1 + this.vars);

			for (var j = 1; j <= this.vars; ++j)
				equ.vals[j] = this.element.children[i].children[2*j-1].children[0].value || 0;

			equ.vals[state.columns - 1] = this.element.children[i].lastChild.children[0].value || 0;

			state.setequation(i-1, state.column(i + state.variables -1), util.rational(equ.vals));
		}

		return state;
	}
};

var rational =
{
	create : function(num, dom)
	{
		if (dom == 0) return null;

		sign = 1;
		if (num < 0) { sign = -sign; num = -num; }
		if (dom < 0) { sign = -sign; dom = -dom; }

		return this.simplify({s:sign,n:num,d:dom});
	},
	simplify : function(r)
	{
		if (r.n == 0)
			return {s:r.s,n:0,d:1};

		var num = factors.get(r.n);
		var dom = factors.get(r.d);

		for (k in dom)
			if (k in num)
			{
				var d = Math.pow(k, Math.min(dom[k], num[k]));
				r.n /= d; r.d /= d;
			}

		return r;
	},
	valueOf: function(r)
	{
		return r.s * r.n / r.d;
	},
	mul: function(a, b)
	{
		return this.simplify({s:a.s*b.s,n:a.n*b.n, d:a.d*b.d});
	},
	div: function(a, b)
	{
		return this.simplify({s:a.s*b.s,n:a.n*b.d, d:a.d*b.n});
	},
	invert: function (r)
	{
		return {s:r.s,n:r.d,d:r.n};
	},
	add: function (a, b)
	{
		var num = a.s * a.n * b.d + b.s * b.n * a.d;
		return this.simplify({s:Math.signum(num),n:Math.abs(num),d:a.d*b.d});
	},
	sub: function (a, b)
	{
		var num = a.s * a.n * b.d - b.s * b.n * a.d;
		return this.simplify({s:Math.signum(num),n:Math.abs(num),d:a.d*b.d});
	},
	parse : function(str)
	{
		str = str.toString();
		str = str.replace(this.doubleNeg, '');
		if (this.pattern.test(str))
		{
			var data = this.pattern.exec(str);
			return this.create(parseInt(data[1]), parseInt(data[2]));
		}
		else if (this.fpat.test(str))
		{
			var data = this.fpat.exec(str);
			if (typeof data[1] == 'undefined')
				var exp = 0;
			else
				var exp = data[1].length - 1;

			data = data[0].replace('.', '');
			data = parseInt(data);
			return this.simplify({s:Math.signum(data),n:Math.abs(data),d:Math.pow(10, exp)});
		}
		else
		{
			var val = parseFloat(str);
			if (val == 0)
				return {s:1,n:0,d:1};

			if (val < 0)
			{
				var sign = -1; val = -val;
			}
			else
			{
				var sign = 1;
			}

			var vals = []; var rem; var i = 0;

			while (++i < 6)
			{
				rem = val % 1;
				vals.push(Math.round(val - rem));

				if (rem == 0) break;
				val = 1 / rem;
			}

			var num = 1; var dom = vals.pop();
			while (vals.length > 0)
			{
				rem = vals.pop();
				var nd = dom * rem + num;
				num = dom; dom = nd;
			}

			return this.simplify({s:sign,n:dom,d:num});
		}
	},
	pattern : /(-?[0-9]+) ?\/ ?([0-9]+)/,
	doubleNeg : /--/g,
	fpat : /-?[0-9]+(.[0-9]+)?/
};

Math.signum = function(x)
{
	if (x < 0) return -1;
	if (x > 0) return  1;
	return 0;
};

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

var states = {
	history : new Array(),
	current : null,
	create : function ( v, s )
	{
		return {
			variables : v,
			slacks    : s,
			columns   : 2 + v + s,
			equations : [ ],
			column : function (col)
			{
				if (col <= this.variables)
					return ['x', col];

				if (col < this.columns - 1)
					return ['s', col - this.variables];

				if (col == this.columns - 1)
					return ['RHS', ''];

				return ['?', '?'];
			},
			rowbase : function (row)
			{
				return this.equations[row].b;
			},
			cell : function (row, col)
			{
				return this.equations[row].v[col]
			},
			setequation: function (row, base, values)
				{ states.setequation(this, row, base, values); }
		};
	},
	setequation : function ( state, row, base, values )
	{
		if (values.length != state.columns)
			return null;

		state.equations[row] = { b: base, v: values };
	},
	pivot : function (state, equation, variable)
	{
		if (variable < 1 || variable >= state.columns)
			return null;

		if (equation < 1 || equation >= state.equations)
			return null;

		var newState = this.create(state.variables, state.slacks);

		for (var i = 0; i < state.equations.length; ++i)
		{
			var row = new Array();
			var rowBasicVariable = state.rowbase(i);

			if (i == equation)
			{
				var factor = state.cell(i, variable);
				rowBasicVariable = state.column(variable);
				for (var j = 0; j < state.columns; ++j)
					row[j] = rational.div(state.cell(i, j), factor);
			}
			else
			{
				var factor = rational.sub(
					rational.parse('0/1'),
					rational.div(
						state.cell(i, variable),
						state.cell(equation, variable)
					)
				);

				for (var j = 0; j < state.columns; ++j)
					row[j] = rational.add(
						state.cell(i, j),
						rational.mul(state.cell(equation, j), factor)
					);
			}

			newState.setequation(i, rowBasicVariable, row);
		}

		return newState;
	}
};

var util = {
	rational : function (arr)
	{
		var ret = [];
		for (k in arr)
			ret[k] = rational.parse(arr[k]);

		return ret;
	}
};

