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

