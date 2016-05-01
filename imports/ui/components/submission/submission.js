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
  'Days': function() {
    return Events.find();
    Meteor.call("events.find", 'SChSe79yFAtLLrRef', function(error, result) {
      if(error) {
        console.error(error);
        return false;
      } else {
        console.info(result);
        return result;
      }
    });
  },
});
