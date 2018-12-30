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
		let created = options.created || noop;
		options.didMount = function (...args) {
			this.data = {
				...this.data,
				...this.props,
			};
			this.triggerEvent = (eventName, eventDetail, eventOption) => {
				if (eventName.search(/^on/) < 0) {
					eventName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
				}
				this.props[eventName]({
					detail: eventDetail,
					option: eventOption,
				});
			};
			created.call(this, ...args);
		};
		options.props = {};
		Object.keys(options.properties || {}).map((k) => {
			options.props[k] = options.properties[k].value;
		});
		// console.log(options);
		// Component(options);
		return options;
	}
};

export {
	miniappComponent as default,
};
