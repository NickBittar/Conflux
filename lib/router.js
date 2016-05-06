FlowRouter.route('/create', {
    action: function(params) {
        BlazeLayout.render('create');
    }
});
FlowRouter.route('/submission/:eventId', {
    action: function(params) {
        BlazeLayout.render('submission');
    }
});
FlowRouter.route('/results/:eventId', {
    action: function(params) {
        BlazeLayout.render('results');
    }
});
