var states = {
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
	}
};

