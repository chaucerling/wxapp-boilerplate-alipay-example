// 把普通函数变成promise函数
const promisify = (api) => {
	return (options, ...params) => {
		return new Promise((resolve, reject) => {
			api(Object.assign({}, options, {
				success: resolve,
				fail: reject,
			}), ...params);
			Promise.prototype.finally = function (callback) {
				let P = this.constructor;
				return this.then(
					(value) => P.resolve(callback()).then(() => value),
					(reason) => P.resolve(callback()).then(() => { throw reason; }),
				);
			};
		});
	};
};

export {
	promisify as default,
};
