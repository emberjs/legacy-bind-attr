import Ember from 'ember';

export default Ember.Component.extend({
  template: Ember.Handlebars.compile('<img {{bind-attr src=view.content.url alt=view.content.title}}>'),
  content: Ember.Object.create({
    url: 'http://guides.emberjs.com/v1.11.0/images/ember_logo.png',
    title: 'The SproutCore Logo'
  })
});
