import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './results.html';

Template.results.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');
  console.log('results templated loaded for id: ' + FlowRouter.getParam("eventId"));
});
