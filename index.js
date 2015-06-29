/*jshint node: true */
'use strict';

module.exports = {
  name: 'bind-attr',

  setupPreprocessorRegistry: function(type, registry) {
    var TransformBindAttrToAttributes = require('./lib/ember-template-compiler/plugins/transform-bind-attr-to-attributes');

    registry.add('htmlbars-ast-plugin', {
      name: 'transform-bind-attr-to-attributes',
      plugin: TransformBindAttrToAttributes
    });
  }
};
