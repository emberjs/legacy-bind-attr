/*jshint node: true */
'use strict';

var VersionChecker = require('ember-cli-version-checker');
var triggered = false;

module.exports = {
  name: 'bind-attr',

  included: function(app) {
    app.import('vendor/transform-bind-attr-to-attributes/index.js');
  },

  setupPreprocessorRegistry: function(type, registry) {
    var checker = new VersionChecker(this);
    this._checkerForEmber = checker.for('ember', 'bower');

    if (this._checkerForEmber.gt('2.0.0-beta.1')) {
      var TransformBindAttrToAttributes = require('./vendor/transform-bind-attr-to-attributes');

      registry.add('htmlbars-ast-plugin', {
        name: 'transform-bind-attr-to-attributes',
        plugin: TransformBindAttrToAttributes
      });
    } else {
      if (!triggered) {
        console.warn('legacy-bind-attr is not required for Ember 2.0.0-beta.1 and earlier, please remove from your `package.json`.');
        triggered = true;
      }
    }
  }
};
