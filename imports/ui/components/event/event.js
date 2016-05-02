import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './submission.html';

Template.event.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');

});

Template.event.events({

});

Template.event.helpers({
  'event': function() {
    return Events.find({ _id: 'uE3ctXdLLLpNa5rvr' } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {
    const endDate = new Date(Events.findOne({ _id: 'uE3ctXdLLLpNa5rvr' } ).endDate);
    let days = [];
    for (let d = new Date(Events.findOne({ _id: 'uE3ctXdLLLpNa5rvr' } ).startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push( { date: new Date(d) } );
    }
    return days;
  },
});
