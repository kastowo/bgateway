var routesGroup = function(app, Group){
	app.get('/:apikey/Group', Group.get);
	app.post('/:apikey/Group', Group.post.group);
	app.post('/:apikey/Group/:group_id?/Member', Group.post.member);
}
module.exports = routesGroup;