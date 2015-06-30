/**
@module ember
@submodule ember-htmlbars
*/

import Ember from 'ember';

var get = Ember.get;

export default function bindAttrClassHelper(params) {
  var value = params[0];

  if (Array.isArray(value)) {
    value = get(value, 'length') !== 0;
  }

  if (value === true) {
    return params[1];
  } if (value === false || value === undefined || value === null) {
    return '';
  } else {
    return value;
  }
}
