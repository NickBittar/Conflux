import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Clipboard } from 'meteor/zenorocha:clipboard';
import { Events } from '/imports/api/events.js'
import './create.html';

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
        document.querySelector('#link-text').innerText = `http://localhost:3000/${result}`;
      }
    });
    $('.mdl-dialog__title').hide();
    $('.mdl-dialog__title').text("Event Created");
    $('.mdl-dialog__title').fadeIn();
    $('.mdl-spinner').fadeOut();
    $('.event-link').fadeIn();

  },
  'click #copy'(event) {
    console.log("CLICK");
    let clipboard = new Clipboard('#link-text');
    clipboard.on('success', function(e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);

        e.clearSelection();

        const data = { message: 'Link Coped to your Clipboard.', timeout: 3000,};
        document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(data);
    });

    clipboard.on('error', function(e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);

        const data = { message: 'Error Copying.', timeout: 3000,};
        document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(data);
    });

  },

});


$(document).ready(function(){
  $('#date-container .input-daterange').datepicker({
    startDate: "today",
    autoclose: true,
    todayHighlight: true
  });
});
