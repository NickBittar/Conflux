import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './submission.html';

Template.submission.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');

});

Template.submission.events({

});

Template.submission.helpers({
  'event': function() {
    return Events.find({ _id: 'uE3ctXdLLLpNa5rvr' } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {
    const endDate = new Date('2016-05-06');
    let days = [];
    for (let d = new Date('2016-05-02'); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push( { date: new Date(d) } );
    }
    return days;
  },
});
