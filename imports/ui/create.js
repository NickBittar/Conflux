import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './create.html';

Template.body.onCreated(function bodyOnCreated() {
  $('#my-datepicker').datepicker();
});

Template.body.events({
  'click .submit-event'(event) {
    event.preventDefault();
    alert('Event created');
  },
});

$('#sandbox-container .input-daterange').datepicker({
  startDate: "today",
  todayBtn: "linked",
  autoclose: true,
  todayHighlight: true
});
