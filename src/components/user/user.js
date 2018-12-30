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
	lifetimes: {
		ready() {
			console.info('component: lifetimes.ready call');
		},
		detached() {
			console.info('component: lifetimes.detached call');
		},
	},
	pageLifetimes: {
		show() {
			console.info('component: pageLifetimes.show call');
		},
		hide() {
			console.info('component: pageLifetimes.hide call');
		},
	},
});
Component(component);
