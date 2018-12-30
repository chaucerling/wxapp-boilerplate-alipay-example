import {app, connector} from 'model';

let page = connector.connectPage({
	env: (state) => state.env,
	count: (state) => state.count.count,
})({
	data: {
		showUserComponent: false,
	},
	onShow() {
		console.log('page: onShow.call');
	},
	onHide() {
		console.log('page: onHide.call');
	},
	showUserInfo() {
		this.setData({showUserComponent: true});
	},
	hideUserInfo() {
		this.setData({showUserComponent: false});
	},
});
Page(page);
