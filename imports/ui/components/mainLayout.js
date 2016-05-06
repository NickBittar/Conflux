import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './mainLayout.html';

Template.mainLayout.onCreated(function bodyOnCreated() {
  console.info('mainLayout templated created.');
});
