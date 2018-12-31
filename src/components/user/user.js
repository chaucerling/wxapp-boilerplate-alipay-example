import miniappComponent from 'utils/component.js';
import lifecycle from 'behaviors/lifecycle.js';

let component = miniappComponent({
	behaviors: [lifecycle],
	properties: {
		show: {
			type: Boolean,
			value: false,
		},
		name: {
			type: String,
			value: '',
		},
	},
	methods: {
		hideContainer() {
			this.triggerEvent('hide');
		},
	},
});
Component(component);
