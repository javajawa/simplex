var util = {
	rational : function (arr)
	{
		var ret = [];
		for (k in arr)
			ret[k] = rational.parse(arr[k]);

		return ret;
	}
};

