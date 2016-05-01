import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './create.html';
import '../submission/submission.html';

Template.body.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');
});

Template.body.events({
  'submit .new-event'(event) {
    event.preventDefault();

    const form = event.target;
    const name = form['event-name'].value;
    const startDate = form['start-date'].value;
    const endDate = form['end-date'].value;
    const password = form['password'].value;

    let errors = "";
    if(!name.length) {
      errors += ' Check name';
    }
    if(!startDate || !endDate)
    {
      errors += ' Check date';
    }
    if(errors)
    {
      const data = {
        message: 'Error Processing:' + errors,
        timeout: 3000,
      };
      document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(data);
      return false;
    }

    document.querySelector('dialog').showModal();

    const newEvent = {
        eventName: name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        password: password,
    }

    console.info(newEvent);

    Meteor.call("events.insert", newEvent, function(error, result) {
      if(error) {
        console.error(error);
        return false;
      } else {
        console.info(result);
        document.querySelector('#link-text').innerHTML = `<a href="http://localhost:3000/${result}">http://localhost:3000/${result}</a>`;
      }
    });
    $('.mdl-dialog__title').hide();
    $('.mdl-dialog__title').text("Event Created");
    $('.mdl-dialog__title').fadeIn();
    $('.mdl-spinner').hide();
    $('.event-link').fadeIn();
  },
  'click .close'(event)
  {
    document.querySelector('dialog').close();
  },
});


$(document).ready(function(){
  $('#date-container .input-daterange').datepicker({
    startDate: "today",
    autoclose: true,
    todayHighlight: true
  });

});
