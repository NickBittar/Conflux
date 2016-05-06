FlowRouter.route('/submission/:eventId', {
    action: function(params) {
      console.log("hi mom");
        BlazeLayout.render("mainLayout", {area: "create"});
    }
});
