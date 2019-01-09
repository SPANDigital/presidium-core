const utils = module.exports;

utils.contains = function(a, obj) {
	let i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
};
