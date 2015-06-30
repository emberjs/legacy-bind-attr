import Ember from 'ember';

export default Ember.Component.extend({
  template: Ember.Handlebars.compile('<img {{bind-attr src=view.content.url alt=view.content.title}}>'),
  content: Ember.Object.create({
    url: 'http://www.emberjs.com/assets/images/logo.png',
    title: 'The SproutCore Logo'
  })
});
