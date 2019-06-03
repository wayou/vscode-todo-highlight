/* global suite, test */
const assert = require('assert');
const util = require('../src/util');

suite('Util Tests', () => {

	test('Escape RegEx', () => {
		let res = util.escapeRegExp('^(Hello)|Wonderf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$');
		assert.equal('\\^\\(Hello\\)\\|Wonderf\\[u\\]l\\(\\?:Regex\\)\\{2\\}A\\/B\\[c\\]\\+\\[0\\-9\\]\\*\\.\\$', res);
	});

	test('Escape RegEx Groups', () => {
		let res = util.escapeRegExpGroups('^(Hello)|Wonderf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$')
		if (parseFloat(process.version.replace('v', '')) > 9.0) {
			assert.equal('^(?:Hello)|Wonderf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$', res);
		} else {
			assert.equal('^\\(Hello\\)|Wonderf[u]l\\(?:Regex\\){2}\A/B[c]+[0-9]*.$', res);
		}
	});

});