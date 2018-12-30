// 微信 properties 可以用 setData 修改，this.triggerEvent('fn', data) 调用父组件的方法
// 支付宝 props 不能用 setData 修改，只能通过 this.props.fn(data) 调用父组件的方法更新
// wxml 的事件绑定用 @bindXXXX (@bind后的第一个字母大写)
// 另外的解决方法是用 model 管理父子组件的数据共享问题

function noop() {}

const miniappComponent = function (options) {
	if (__WECHAT__) {
		let created = options.created || noop;
		options.created = function (...args) {
			let triggerEvent = this.triggerEvent;
			this.triggerEvent = (eventName, eventDetail = {}, eventOption = {}) => {
				eventName = eventName.replace(/^(on|bind)/, '');
				eventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
				triggerEvent(eventName, eventDetail, eventOption);
			};
			created.call(this, ...args);
		};
		// Component(options);
		return options;
	}
	if (__ALIPAY__) {
		let newOptions = {};
		let methods = options.methods || {};
		let lifetimes = options.lifetimes || {};
		let created = lifetimes.detached || methods.detached || options.detached || noop;
		let attached = lifetimes.attached || methods.attached || options.attached || noop;
		let ready = lifetimes.ready || methods.ready || options.ready || noop;
		let moved = lifetimes.moved || methods.moved || options.moved || noop;
		let detached = lifetimes.detached || methods.detached || options.detached || noop;
		let pageLifetimes = options.pageLifetimes || {};
		if (options.pageLifetimes) {
			console.warn('page 首次加载不会触发 pageLifetimes.show，因为组件创建时才会注入方法到 onShow');
		}
		let pageOnShow = pageLifetimes.show || noop;
		let pageOnHide = pageLifetimes.hide || noop;
		newOptions.didMount = function (...args) {
			let componentThis = this;
			this.data = {
				...this.data,
				...this.props,
			};
			this.properties = this.data;
			this.id = this.$id;
			this.triggerEvent = (eventName, eventDetail, eventOption) => {
				if (eventName.search(/^on/) < 0) {
					eventName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
				}
				this.props[eventName]({
					detail: eventDetail,
					option: eventOption,
				});
			};
			let onShow = this.$page.onShow || noop;
			this.$page.onShow = function (...pageArgs) {
				pageOnShow.call(componentThis);
				onShow.call(this, ...pageArgs);
			};
			let onHide = this.$page.onHide || noop;
			this.$page.onHide = function (...pageArgs) {
				pageOnHide.call(componentThis);
				onHide.call(this, ...pageArgs);
			};
			created.call(this, ...args);
			attached.call(this, ...args);
			ready.call(this, ...args);
		};
		newOptions.didUpdate = moved;
		newOptions.didUnmount = detached;
		newOptions.methods = options.methods;
		newOptions.data = options.methods;
		newOptions.props = {};
		Object.keys(options.properties || {}).map((k) => {
			newOptions.props[k] = options.properties[k].value;
		});
		// console.log(options);
		// Component(options);
		return newOptions;
	}
};

export {
	miniappComponent as default,
};
