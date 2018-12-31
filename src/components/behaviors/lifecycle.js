import {miniappBehavior} from 'utils/component.js';

export default miniappBehavior({
	lifetimes: {
		created() {
			console.info('component: lifetimes.created call');
		},
		attached() {
			console.info('component: lifetimes.attached call');
		},
		ready() {
			console.info('component: lifetimes.ready call');
		},
		moved() {
			console.info('component: lifetimes.moved call');
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
