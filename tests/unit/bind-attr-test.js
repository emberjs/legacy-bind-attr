/*globals equal */

import Ember from 'ember';
import { runAppend, runDestroy } from '../helpers/run-append';
import { moduleFor, test } from 'ember-qunit';

var computed = Ember.computed;
var EmberObject = Ember.Object;
var EmberView = Ember.View;
var compiler = Ember.__loader.require('ember-template-compiler');
var compile = compiler.compile;
var run = Ember.run;
var set = Ember.set;
var get = Ember.get;

// suppress deprecation warnings
if (Ember && Ember.ENV) {
  Ember.ENV._ENABLE_LEGACY_VIEW_SUPPORT = true;
}

var view, warnings, originalWarn;

moduleFor('helper:-bind-attr-class', {
  setup() {
    warnings = [];
    originalWarn = Ember.warn;
    Ember.warn = function(message, test) {
      if (!test) {
        warnings.push(message);
      }
    };
  },
  afterEach() {
    Ember.warn = originalWarn;
    runDestroy(view);
  }
});

test('should be able to bind element attributes using {{bind-attr}}', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr src=view.content.url alt=view.content.title}}>'),
    content: EmberObject.create({
      url: 'http://www.emberjs.com/assets/images/logo.png',
      title: 'The SproutCore Logo'
    })
  });

  runAppend(view);

  equal(view.$('img').attr('src'), 'http://www.emberjs.com/assets/images/logo.png', 'sets src attribute');
  equal(view.$('img').attr('alt'), 'The SproutCore Logo', 'sets alt attribute');

  run(function() {
    set(view, 'content.title', 'El logo de Eember');
  });

  equal(view.$('img').attr('alt'), 'El logo de Eember', 'updates alt attribute when content\'s title attribute changes');

  run(function() {
    set(view, 'content', EmberObject.create({
      url: 'http://www.thegooglez.com/theydonnothing',
      title: 'I CAN HAZ SEARCH'
    }));
  });

  equal(view.$('img').attr('alt'), 'I CAN HAZ SEARCH', 'updates alt attribute when content object changes');

  run(function() {
    set(view, 'content', {
      url: 'http://www.emberjs.com/assets/images/logo.png',
      title: 'The SproutCore Logo'
    });
  });

  equal(view.$('img').attr('alt'), 'The SproutCore Logo', 'updates alt attribute when content object is a hash');

  run(function() {
    set(view, 'content', EmberObject.extend({
      title: computed(function() {
        return 'Nanananana Ember!';
      })
    }).create({
      url: 'http://www.emberjs.com/assets/images/logo.png'
    }));
  });

  equal(view.$('img').attr('alt'), 'Nanananana Ember!', 'updates alt attribute when title property is computed');
});
