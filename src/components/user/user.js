import miniappComponent from 'utils/component.js';

let component = miniappComponent({
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
