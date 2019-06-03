/* global suite, test */
const assert = require('assert');
const util = require('../src/util');

suite('Util Tests', () => {

	// Test util.escapeRegExp
	suite('Escape RegEx', () => {

		test ("RegEx characters should be properly escaped", () => {
			let res = util.escapeRegExp('^(Hello)|Wonderf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$');
			assert.equal('\\^\\(Hello\\)\\|Wonderf\\[u\\]l\\(\\?:Regex\\)\\{2\\}A\\/B\\[c\\]\\+\\[0\\-9\\]\\*\\.\\$', res);
		});

	});

	// Test util.escapeRegExpGroups (if Node.js version > 9.0)
	if (parseFloat(process.version.replace('v', '')) > 9.0) {
		suite('Escape RegEx Groups', () => {

			test('Capturing groups should be turned into non-capturing ones', () => {
				let res = util.escapeRegExpGroups('(Hello) (World)');
				assert.equal(res, '(?:Hello) (?:World)');
			});

			test('Escaped parantheses should be ignored', () => {
				let res = util.escapeRegExpGroups('\\(Hello\\) \\(World\\)');
				assert.equal(res, '\\(Hello\\) \\(World\\)');
			});

			test('Non-capturing groups should be ignored', () => {
				let res = util.escapeRegExpGroups('(?:Hello) (?:World)');
				assert.equal(res, '(?:Hello) (?:World)');
			});

			test('Lookbehind and lookaheads should be ignored', () => {
				let res = util.escapeRegExpGroups('(?=Hello) (?<!World)');
				assert.equal(res, '(?=Hello) (?<!World)');
			});

			test('Groups preceded by one or multiple escaped backslashes (\\) should not be ignored', () => {
				let res = util.escapeRegExpGroupsLegacy('\\\\(Hello) \\\\\\\\(World)');
				assert.equal(res, '\\\\(?:Hello) \\\\\\\\(?:World)');
			});

			test('Mixing lookaheads, lookbehind and groups should still behave as expected', () => {
				let res = util.escapeRegExpGroups('^(Hello) (?!World)|(?<=Won)derf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$');
				assert.equal('^(?:Hello) (?!World)|(?<=Won)derf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$', res);
			});
			
		});
	}

	// Test util.escapeRegExpGroupsLegacy
	suite('Escape RegEx Groups (Legacy Version)', () => {

		test('Capturing groups should be turned into non-capturing ones', () => {
			let res = util.escapeRegExpGroupsLegacy('(Hello) (World)');
			assert.equal(res, '(?:Hello) (?:World)');
		});

		test('Escaped parantheses should be ignored', () => {
			let res = util.escapeRegExpGroupsLegacy('\\(Hello\\) \\(World\\)');
			assert.equal(res, '\\(Hello\\) \\(World\\)');
		});

		test('Non-capturing groups should be ignored', () => {
			let res = util.escapeRegExpGroupsLegacy('(?:Hello) (?:World)');
			assert.equal(res, '(?:Hello) (?:World)');
		});

		test('Lookaheads should be ignored', () => {
			let res = util.escapeRegExpGroupsLegacy('(?=Hello) (?!World)');
			assert.equal(res, '(?=Hello) (?!World)');
		});

		test('Lookbehinds should be removed', () => {
			let res = util.escapeRegExpGroupsLegacy('(?<=Hello) (?<!World)');
			assert.equal(res, ' ');
		});

		test('Groups preceded by one or multiple escaped backslashes (\\) should not be ignored', () => {
			let res = util.escapeRegExpGroupsLegacy('\\\\(Hello) \\\\\\\\(World)');
			assert.equal(res, '\\\\(?:Hello) \\\\\\\\(?:World)');
		});

		test('Mixing lookaheads, lookbehind and groups should still behave as expected', () => {
			let res = util.escapeRegExpGroupsLegacy('^(Hello) (?!World)|(?<=Won)derf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$');
			assert.equal('^(?:Hello) (?!World)|derf[u]l(?:Regex){2}\A/B[c]+[0-9]*.$', res);
		});

	});

});