import TransformBindAttrToAttributes from 'transform-bind-attr-to-attributes';

export function initialize() {
  console.log('registered!');
  Ember.HTMLBars.registerPlugin('ast', TransformBindAttrToAttributes);
}

export default {
  name: 'register-bind-attr',
  initialize: initialize
}
