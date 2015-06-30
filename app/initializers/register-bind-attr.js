import TransformBindAttrToAttributes from 'transform-bind-attr-to-attributes';

export function initialize() {
  Ember.HTMLBars.registerPlugin('ast', TransformBindAttrToAttributes);
}

export default {
  name: 'register-bind-attr',
  initialize: initialize
}
