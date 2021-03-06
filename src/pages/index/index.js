import {app, connector} from 'model';

let page = connector.connectPage({
	env: (state) => state.env,
	count: (state) => state.count.count,
})({
	data: {
		inputValue: 1,
	},
	inputChange({ detail: { value } }) {
		console.log(value);
		this.setData({
			inputValue: Number(value) || 0,
		});
	},
	plus() {
		const { inputValue } = this.data;
		app.dispatcher.count.plus(inputValue);
	},
	sub() {
		const { inputValue } = this.data;
		app.dispatcher.count.sub(inputValue);
	},
});
Page(page);
