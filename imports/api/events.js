import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Events = new Mongo.Collection('events');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('events', function eventsPublication() {
    return Events.find({
      //$or: [
        //{ owner: this.userId },
        //{ submissions: { $elemMatch: { submitterId: this.userId } } },  // Allow submitters to view
      //],
    });
  });
}

Meteor.methods({
  'events.insert'(object) {
    console.log('INSERTING...');
    const id = Events.insert({
      object,
      createdAt: new Date(),
      //owner: Meteor.userId(),
      //username: Meteor.user().username,
    });
    console.info(id);
    return id;
  },
  'events.remove'(eventId) {
    const event = events.findOne(eventId);

    Events.remove(eventId);
  },
  'events.submit'(eventId, times) {

    const event = Events.findOne(eventId);

    /* times should be in the format:
     *    { submitterId: submitterId, submitter: submitterName, times: [ ISODate(starttime), ISODate(endtime), ... ] }
     */
    Events.update(eventId,
      { $push: { submissions: times } }
    );
  },
});
