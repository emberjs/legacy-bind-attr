/*globals QUnit, equal, expect, ok, deepEqual, ignoreDeprecation, expectAssertion */

import Ember from 'ember';
import { initialize } from 'dummy/initializers/register-bind-attr';
import bindAttrClassHelper from 'dummy/helpers/-bind-attr-class';
import { runAppend, runDestroy } from '../helpers/run-append';
import AssertionAssert from 'ember-dev/test-helper/assertion';
import Deprecation from 'ember-dev/test-helper/deprecation';

var Namespace = Ember.__loader.require('ember-runtime/system/namespace')['default'];
var Registry = Ember.__loader.require('ember-runtime/system/container').Registry;
var observersFor = Ember.__loader.require('ember-metal/observer').observersFor;
var compile = Ember.__loader.require('ember-template-compiler').compile;
var SafeString = Ember.Handlebars.SafeString;
var EmberObject = Ember.Object;
var computed = Ember.computed;
var EmberView = Ember.View;
var run = Ember.run;
var set = Ember.set;
var get = Ember.get;

// suppress deprecation warnings
if (Ember && Ember.ENV) {
  Ember.ENV._ENABLE_LEGACY_VIEW_SUPPORT = true;
}

var registry, container, view;
var originalLookup = Ember.lookup;
var TemplateTests, lookup, warnings, originalWarn;

QUnit.module('ember-htmlbars: {{bind-attr}} [DEPRECATED]', {
  setup() {
    var assertion = new AssertionAssert({ Ember: Ember });
    var deprecation = new Deprecation({ Ember: Ember });
    var registry = new Registry();
    container = registry.container();
    assertion.inject();
    deprecation.inject();
    Ember.lookup = lookup = {};
    lookup.TemplateTests = TemplateTests = Namespace.create();
    registry.optionsForType('template', { instantiate: false });
    registry.register('view:toplevel', EmberView.extend());
    Ember.HTMLBars._registerHelper('-bind-attr-class', bindAttrClassHelper);
    initialize(); // registers the bind-attr transform bind attr as a HTMLBars plugin
    warnings = [];
    originalWarn = Ember.warn;

    Ember.warn = function(message, test) {
      if (!test) {
        warnings.push(message);
      }
    };
  },
  teardown() {
    runDestroy(view);
    runDestroy(container);

    registry = container = view = null;
    Ember.lookup = lookup = originalLookup;
    Ember.warn = originalWarn;
    TemplateTests = null;
  }
});

QUnit.test('should be able to bind element attributes using {{bind-attr}}', function() {
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

QUnit.test('should be able to bind to view attributes with {{bind-attr}}', function() {
  view = EmberView.create({
    value: 'Test',
    template: compile('<img src="test.jpg" {{bind-attr alt=view.value}}>')
  });

  runAppend(view);

  equal(view.$('img').attr('alt'), 'Test', 'renders initial value');

  run(function() {
    view.set('value', 'Updated');
  });

  equal(view.$('img').attr('alt'), 'Updated', 'updates value');
});


QUnit.test('should be able to bind to globals with {{bind-attr}}', function() {
  TemplateTests.set('value', 'Test');

  view = EmberView.create({
    template: compile('<img src="test.jpg" {{bind-attr alt=TemplateTests.value}}>')
  });

  runAppend(view);

  equal(view.$('img').attr('alt'), 'Test', 'renders initial value');
});

QUnit.test('should not allow XSS injection via {{bind-attr}}', function() {
  view = EmberView.create({
    template: compile('<img src="test.jpg" {{bind-attr alt=view.content.value}}>'),
    content: {
      value: 'Trololol" onmouseover="alert(\'HAX!\');'
    }
  });

  runAppend(view);

  equal(view.$('img').attr('onmouseover'), undefined);
  // If the whole string is here, then it means we got properly escaped
  equal(view.$('img').attr('alt'), 'Trololol" onmouseover="alert(\'HAX!\');');
});

QUnit.test('should be able to bind use {{bind-attr}} more than once on an element', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr src=view.content.url}} {{bind-attr alt=view.content.title}}>'),
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

QUnit.test('{{bindAttr}} can be used to bind attributes', function() {
  expect(2);

  view = EmberView.create({
    value: 'Test',
    template: compile('<img src="test.jpg" {{bindAttr alt=view.value}}>')
  });

  runAppend(view);

  equal(view.$('img').attr('alt'), 'Test', 'renders initial value');

  run(function() {
    view.set('value', 'Updated');
  });

  equal(view.$('img').attr('alt'), 'Updated', 'updates value');
});

QUnit.test('should be able to bind element attributes using {{bind-attr}} inside a block', function() {
  view = EmberView.create({
    template: compile('{{#with view.content as image}}<img {{bind-attr src=image.url alt=image.title}}>{{/with}}'),
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
});

QUnit.test('should be able to bind class attribute with {{bind-attr}}', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr class="view.foo"}}>'),
    foo: 'bar'
  });

  runAppend(view);

  equal(view.element.firstChild.className, 'bar', 'renders class');

  run(function() {
    set(view, 'foo', 'baz');
  });

  equal(view.element.firstChild.className, 'baz', 'updates rendered class');
});

QUnit.test('should be able to bind unquoted class attribute with {{bind-attr}}', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr class=view.foo}}>'),
    foo: 'bar'
  });

  runAppend(view);

  equal(view.$('img').attr('class'), 'bar', 'renders class');

  run(function() {
    set(view, 'foo', 'baz');
  });

  equal(view.$('img').attr('class'), 'baz', 'updates class');
});

QUnit.test('should be able to bind class attribute via a truthy property with {{bind-attr}}', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr class="view.isNumber:is-truthy"}}>'),
    isNumber: 5
  });

  runAppend(view);

  equal(view.element.firstChild.className, 'is-truthy', 'renders class');

  run(function() {
    set(view, 'isNumber', 0);
  });

  ok(view.element.firstChild.className !== 'is-truthy', 'removes class');
});

QUnit.test('should be able to bind class to view attribute with {{bind-attr}}', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr class="view.foo"}}>'),
    foo: 'bar'
  });

  runAppend(view);

  equal(view.$('img').attr('class'), 'bar', 'renders class');

  run(function() {
    set(view, 'foo', 'baz');
  });

  equal(view.$('img').attr('class'), 'baz', 'updates class');
});

QUnit.test('should not allow XSS injection via {{bind-attr}} with class', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr class="view.foo"}}>'),
    foo: '" onmouseover="alert(\'I am in your classes hacking your app\');'
  });

  try {
    runAppend(view);
  } catch (e) {
  }

  equal(view.$('img').attr('onmouseover'), undefined);
});

QUnit.test('should be able to bind class attribute using ternary operator in {{bind-attr}}', function() {
  var content = EmberObject.create({
    isDisabled: true
  });

  view = EmberView.create({
    template: compile('<img {{bind-attr class="view.content.isDisabled:disabled:enabled"}} />'),
    content: content
  });

  runAppend(view);

  ok(view.$('img').hasClass('disabled'), 'disabled class is rendered');
  ok(!view.$('img').hasClass('enabled'), 'enabled class is not rendered');

  run(function() {
    set(content, 'isDisabled', false);
  });

  ok(!view.$('img').hasClass('disabled'), 'disabled class is not rendered');
  ok(view.$('img').hasClass('enabled'), 'enabled class is rendered');
});

QUnit.test('should be able to add multiple classes using {{bind-attr class}}', function() {
  var content = EmberObject.create({
    isAwesomeSauce: true,
    isAlsoCool: true,
    isAmazing: true,
    isEnabled: true
  });

  view = EmberView.create({
    template: compile('<div {{bind-attr class="view.content.isAwesomeSauce view.content.isAlsoCool view.content.isAmazing:amazing :is-super-duper view.content.isEnabled:enabled:disabled"}}></div>'),
    content: content
  });

  runAppend(view);

  ok(view.$('div').hasClass('is-awesome-sauce'), 'dasherizes first property and sets classname');
  ok(view.$('div').hasClass('is-also-cool'), 'dasherizes second property and sets classname');
  ok(view.$('div').hasClass('amazing'), 'uses alias for third property and sets classname');
  ok(view.$('div').hasClass('is-super-duper'), 'static class is present');
  ok(view.$('div').hasClass('enabled'), 'truthy class in ternary classname definition is rendered');
  ok(!view.$('div').hasClass('disabled'), 'falsy class in ternary classname definition is not rendered');

  run(function() {
    set(content, 'isAwesomeSauce', false);
    set(content, 'isAmazing', false);
    set(content, 'isEnabled', false);
  });

  ok(!view.$('div').hasClass('is-awesome-sauce'), 'removes dasherized class when property is set to false');
  ok(!view.$('div').hasClass('amazing'), 'removes aliased class when property is set to false');
  ok(view.$('div').hasClass('is-super-duper'), 'static class is still present');
  ok(!view.$('div').hasClass('enabled'), 'truthy class in ternary classname definition is not rendered');
  ok(view.$('div').hasClass('disabled'), 'falsy class in ternary classname definition is rendered');
});

QUnit.test('should be able to bind classes to globals with {{bind-attr class}}', function() {
  TemplateTests.set('isOpen', true);

  view = EmberView.create({
    template: compile('<img src="test.jpg" {{bind-attr class="TemplateTests.isOpen"}}>')
  });

  runAppend(view);

  ok(view.$('img').hasClass('is-open'), 'sets classname to the dasherized value of the global property');
});

QUnit.test('should be able to bind-attr to \'this\' in an {{#each}} block', function() {
  view = EmberView.create({
    template: compile('{{#each view.images}}<img {{bind-attr src=this}}>{{/each}}'),
    images: Ember.A(['one.png', 'two.jpg', 'three.gif'])
  });

  runAppend(view);

  var images = view.$('img');
  ok(/one\.png$/.test(images[0].src));
  ok(/two\.jpg$/.test(images[1].src));
  ok(/three\.gif$/.test(images[2].src));
});

QUnit.test('should be able to bind classes to \'this\' in an {{#each}} block with {{bind-attr class}}', function() {
  view = EmberView.create({
    template: compile('{{#each view.items}}<li {{bind-attr class="this"}}>Item</li>{{/each}}'),
    items: Ember.A(['a', 'b', 'c'])
  });

  runAppend(view);

  ok(view.$('li').eq(0).hasClass('a'), 'sets classname to the value of the first item');
  ok(view.$('li').eq(1).hasClass('b'), 'sets classname to the value of the second item');
  ok(view.$('li').eq(2).hasClass('c'), 'sets classname to the value of the third item');
});

QUnit.test('should be able to bind-attr to var in {{#each var in list}} block', function() {
  view = EmberView.create({
    template: compile('{{#each image in view.images}}<img {{bind-attr src=image}}>{{/each}}'),
    images: Ember.A(['one.png', 'two.jpg', 'three.gif'])
  });

  runAppend(view);

  var images = view.$('img');
  ok(/one\.png$/.test(images[0].src));
  ok(/two\.jpg$/.test(images[1].src));
  ok(/three\.gif$/.test(images[2].src));

  run(function() {
    var imagesArray = view.get('images');
    imagesArray.removeAt(0);
  });

  images = view.$('img');
  ok(images.length === 2, '');
  ok(/two\.jpg$/.test(images[0].src));
  ok(/three\.gif$/.test(images[1].src));
});

QUnit.test('should teardown observers from bind-attr on rerender', function() {
  view = EmberView.create({
    template: compile('<span {{bind-attr class="view.foo" name=view.foo}}>wat</span>'),
    foo: 'bar'
  });

  runAppend(view);

  equal(observersFor(view, 'foo').length, 1);

  run(function() {
    view.rerender();
  });

  equal(observersFor(view, 'foo').length, 1);
});

QUnit.test('should keep class in the order it appears in', function() {
  view = EmberView.create({
    template: compile('<span {{bind-attr class=":foo :baz"}}></span>')
  });

  runAppend(view);

  equal(view.element.firstChild.className, 'foo baz', 'classes are in expected order');
});

QUnit.test('should allow either quoted or unquoted values', function() {
  view = EmberView.create({
    value: 'Test',
    source: 'test.jpg',
    template: compile('<img {{bind-attr alt="view.value" src=view.source}}>')
  });

  runAppend(view);

  equal(view.$('img').attr('alt'), 'Test', 'renders initial value');
  equal(view.$('img').attr('src'), 'test.jpg', 'renders initial value');

  run(function() {
    view.set('value', 'Updated');
    view.set('source', 'test2.jpg');
  });

  equal(view.$('img').attr('alt'), 'Updated', 'updates value');
  equal(view.$('img').attr('src'), 'test2.jpg', 'updates value');
});

QUnit.test('property before didInsertElement', function() {
  var matchingElement;
  view = EmberView.create({
    name: 'bob',
    template: compile('<div {{bind-attr alt=view.name}}></div>'),
    didInsertElement() {
      matchingElement = this.$('div[alt=bob]');
    }
  });
  runAppend(view);
  equal(matchingElement.length, 1, 'element is in the DOM when didInsertElement');
});

// QUnit.test('asserts for <div class=\'foo\' {{bind-attr class=\'bar\'}}></div>', function() {
//   ignoreDeprecation(function() {
//     expectAssertion(function() {
//       compile('<div class="foo" {{bind-attr class=view.foo}}></div>');
//     }, /You cannot set `class` manually and via `{{bind-attr}}` helper on the same element/);
//   });
// });
//
// QUnit.test('asserts for <div data-bar=\'foo\' {{bind-attr data-bar=\'blah\'}}></div>', function() {
//   ignoreDeprecation(function() {
//     expectAssertion(function() {
//       compile('<div data-bar="foo" {{bind-attr data-bar=view.blah}}></div>');
//     }, /You cannot set `data-bar` manually and via `{{bind-attr}}` helper on the same element/);
//   });
// });

QUnit.test('src attribute bound to undefined is empty', function() {
  var template;
  ignoreDeprecation(function() {
    template = compile('<img {{bind-attr src=view.undefinedValue}}>');
  });

  view = EmberView.create({
    template: template,
    undefinedValue: undefined
  });

  runAppend(view);

  ok(!view.element.firstChild.hasAttribute('src'), 'src attribute is empty');
});

QUnit.test('src attribute bound to null is not present', function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr src=view.nullValue}}>'),
    nullValue: null
  });

  runAppend(view);

  equal(view.element.firstChild.getAttribute('src'), null, 'src attribute is empty');
});

QUnit.test('src attribute will be cleared when the value is set to null or undefined', function() {
  var template = compile('<img {{bind-attr src=view.value}}>');

  view = EmberView.create({
    template: template,
    value: 'one'
  });

  runAppend(view);

  equal(view.element.firstChild.getAttribute('src'), 'one', 'src attribute is present');

  run(function() {
    set(view, 'value', 'two');
  });

  equal(view.element.firstChild.getAttribute('src'), 'two', 'src attribute is present');

  run(function() {
    set(view, 'value', null);
  });

  equal(view.element.firstChild.getAttribute('src'), '', 'src attribute is empty');

  run(function() {
    set(view, 'value', 'three');
  });

  equal(view.element.firstChild.getAttribute('src'), 'three', 'src attribute is present');

  run(function() {
    set(view, 'value', undefined);
  });

  equal(view.element.firstChild.getAttribute('src'), '', 'src attribute is empty');
});

// if (!EmberDev.runningProdBuild) {
//   QUnit.test('specifying `<div {{bind-attr style=userValue}}></div>` triggers a warning', function() {
//     var template;
//     template = compile('<div {{bind-attr style=view.userValue}}></div>');
//
//     view = EmberView.create({
//       template: template,
//       userValue: '42'
//     });
//
//     runAppend(view);
//
//     deepEqual(warnings, [styleWarning]);
//   });
// }

QUnit.test('specifying `<div {{bind-attr style=userValue}}></div>` works properly with a SafeString', function() {
  var template;
  template = compile('<div {{bind-attr style=view.userValue}}></div>');

  view = EmberView.create({
    template: template,
    userValue: new SafeString('42')
  });

  runAppend(view);

  deepEqual(warnings, [ ]);
});
