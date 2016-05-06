import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './submission.html';

Template.submission.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');
  console.log('submission templated loaded for id: ' + FlowRouter.getParam("eventId"));
});

Template.submission.events({

});

Template.submission.helpers({
  'event': function() {
    return Events.find({ _id: FlowRouter.getParam("eventId") } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {
    const eventId = FlowRouter.getParam("eventId");
    if (Events.find({ _id: eventId } ).count() == 0) {
      return [];
    }
    const endDate = Events.findOne({ _id: eventId } ).endDate;
    let days = [];
    for (let d = new Date(Events.findOne({ _id: eventId } ).startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push( { date: new Date(d) } );
    }
    return days;
  },
});
