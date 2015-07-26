import Ember from 'ember';

export default Ember.Component.extend({
  content: Ember.Object.create({
    url: 'http://guides.emberjs.com/v1.11.0/images/ember_logo.png',
    title: 'The SproutCore Logo'
  })
});
