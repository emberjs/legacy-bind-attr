import Ember from 'ember';
import BindAttrClassHelper from 'bind-attr/helpers/-bind-attr-class';

export default {
  name: 'register-bind-attr-class',
  initialize: function(/*registry, app*/) {
    Ember.HTMLBars._registerHelper('-bind-attr-class', BindAttrClassHelper);
  }
}
