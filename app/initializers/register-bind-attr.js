import TransformBindAttrToAttributes from 'transform-bind-attr-to-attributes';

export default {
  name: 'register-bind-attr',
  initialize: function() {
    Ember.HTMLBars.registerPlugin('ast', TransformBindAttrToAttributes);
  }
}
