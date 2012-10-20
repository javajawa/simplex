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

