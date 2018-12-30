import {app, connector} from 'model';

let page = connector.connectPage({
	env: (state) => state.env,
	count: (state) => state.count.count,
})({
	data: {
		showUserComponent: false,
	},
	showUserInfo() {
		this.setData({showUserComponent: true});
	},
	hideUserInfo() {
		this.setData({showUserComponent: false});
	},
});
Page(page);
