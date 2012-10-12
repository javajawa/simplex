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

		document.body.appendChild(table);
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

