import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './create.html';

Template.body.onCreated(function bodyOnCreated() {
  
});

Template.body.events({
  'click .submit-event'(event) {
    event.preventDefault();
    alert('Event created');
  },
});
