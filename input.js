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
	equs : function () { return this.label(['=', '']); },
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

		var mode = document.createElement('select');;

		var node = document.createElement('option');
		this.setText(node, 'min');
		mode.appendChild(node);

		node = document.createElement('option');
		this.setText(node, 'max');
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
		state.setequation(0, state.column(0), util.rational(equ.vals));

		for (var i = 1; i < this.element.children.length; ++i)
		{
			equ.clear(i + this.columns);

			for (var j = 1; j <= this.vars; ++j)
				equ.vals[j] = this.element.children[i].children[2*j-1].children[0].value;

			//equ.vals[state.columns - 1] = this.element.children[i].lastChild.children[0].value;

			state.setequation(i-1, state.column(i + state.vars -1), util.rational(equ.vals));
		}

		return state;
	}
};

