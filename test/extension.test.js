/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
var vscode = require('vscode');
var myExtension = require('../extension');

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {

    // Defines a Mocha unit test
    test("Something 1", function() {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});

suite("Keyword Highlighting Tests", function () {
  test("REVIEW: keyword is correctly processed", function () {
    // Simulate a user adding a custom "REVIEW:" keyword through settings
    const customKeywords = ["REVIEW:"];
    const customDefaultStyle = {}; // Assuming no custom default style for simplicity
    const isCaseSensitive = true; // Assuming case sensitivity is enabled

    const assembledData = util.getAssembledData(
      customKeywords,
      customDefaultStyle,
      isCaseSensitive
    );

    // Verify that the "REVIEW:" keyword is included and correctly processed
    assert.strictEqual(
      assembledData.hasOwnProperty("REVIEW:"),
      true,
      "REVIEW: keyword should be processed"
    );

    // Check if the style for "REVIEW:" matches the expected default style
    const reviewStyle = assembledData["REVIEW:"];
    assert.strictEqual(
      reviewStyle.color,
      "#fff",
      "Color should match default for REVIEW:"
    );
    assert.strictEqual(
      reviewStyle.backgroundColor,
      "#8a2be2",
      "Background color should match default for REVIEW:"
    );
    assert.strictEqual(
      reviewStyle.overviewRulerColor,
      "rgba(138,43,226,0.8)",
      "Overview ruler color should match default for REVIEW:"
    );
  });
});