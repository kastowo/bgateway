var routesGroup = function(app, Group){
	app.get('/:apikey/Group_', Group.get.group);
	app.get('/:apikey/GroupCharacteristic', Group.get.groupCharacteristic);
	app.get('/:apikey/GroupMember', Group.get.groupMember);

	app.post('/:apikey/group', Group.post.group);
	app.post('/:apikey/group-characteristic', Group.post.groupCharacteristic);
	app.post('/:apikey/group/:group_id/member', Group.post.groupMember);
}
module.exports = routesGroup;