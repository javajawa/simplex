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

