import Ember from 'ember';
import BindAttrClassHelper from 'bind-attr/helpers/-bind-attr-class';
import TransformBindAttrToAttributes from 'bind-attr/ember-template-compiler/plugins/transform-bind-attr-to-attributes';

export default {
  name: 'register-bind-attr-class',
  initialize: function(/*registry, app*/) {
    Ember.HTMLBars.registerPlugin('ast', TransformBindAttrToAttributes);
    Ember.HTMLBars._registerHelper('-bind-attr-class', BindAttrClassHelper);
  }
}
