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
    return Events.find({ _id: '8oB5r2TfRCKBrDdey' } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {
    if (Events.find({ _id: '8oB5r2TfRCKBrDdey' } ).count() == 0) {
      return [];
    }
    const endDate = Events.findOne({ _id: '8oB5r2TfRCKBrDdey' } ).endDate;
    let days = [];
    for (let d = new Date(Events.findOne({ _id: '8oB5r2TfRCKBrDdey' } ).startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push( { date: new Date(d) } );
    }
    return days;
  },
});
