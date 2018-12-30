// inspired by https://github.com/douzi8/wxToAlipay/blob/master/lib/js/README.md
// 整合各小程序的api, 命名和调用参数以微信为标准
// 业务相关的api需要另外封装，例如用户授权，支付

import promisify from 'utils/promisify.js';

function noop() {}

// maps = {old_key: new_key}
function paramsMap(options, maps = {}) {
	let params = {};

	for (let key in options) {
		let myKey = maps.hasOwnProperty(key) ? maps[key] : key;
		params[myKey] = options[key];
	}
	return params;
}

function mySystemInfo2wx(systemInfo) {
	systemInfo.system = `${systemInfo.platform} ${systemInfo.system}`;
	// 支付宝小程序windowHeight可能拿到0
	if (!systemInfo.windowHeight) {
		systemInfo.windowHeight = parseInt(systemInfo.screenHeight * systemInfo.windowWidth / systemInfo.screenWidth, 10) - 40;
	}
	return systemInfo;
}

const miniapp = {
	request: (options) => {
		if (__WECHAT__) {
			return wx.request(options);
		}
		if (__ALIPAY__) {
			let params = paramsMap(options, {
				header: 'headers',
			});
			let success = params.success || noop;
			params.success = function (res) {
				let result = paramsMap(res, {
					headers: 'header',
					status: 'statusCode',
				});

				success(result);
			};
			if (params.method === 'POST') {
				let data = params.data || {};
				params.data = JSON.stringify(data);
			}
			return my.httpRequest(params);
		}
	},
	getLocation: (options) => {
		if (__WECHAT__) {
			// wgs84 返回 gps 坐标，gcj02（火星) 返回可用于 wx.openLocation 的坐标
			return wx.getLocation(options);
		}
		if (__ALIPAY__) {
			console.warn('alipay api: getLocation 只支持 gcj02 坐标系');
			options.type = 0; // 高德地图用的是 gcj02
			return my.getLocation(options);
		}
	},
	openLocation: (options) => {
		if (__WECHAT__) {
			return wx.openLocation(options);
		}
		if (__ALIPAY__) {
			options.scale = options.scale || 18;
			return my.openLocation(options);
		}
	},
	getSystemInfo: (options) => {
		if (__WECHAT__) {
			return wx.getSystemInfo(options);
		}
		if (__ALIPAY__) {
			let success = options.success || noop;
			options.success = function (res) {
				success(mySystemInfo2wx(res));
			};
			return my.getSystemInfo(options);
		}
	},
	getSystemInfoSync: () => {
		if (__WECHAT__) {
			return wx.getSystemInfoSync();
		}
		if (__ALIPAY__) {
			return mySystemInfo2wx(my.getSystemInfoSync());
		}
	},
	getStorage: (options) => {
		if (__WECHAT__) {
			return wx.getStorage(options);
		}
		if (__ALIPAY__) {
			let fail = options.fail || noop;
			let success = options.success;
			options.success = function (res) {
				if (!res.data) {
					fail(res);
				}
				else {
					success(res);
				}
			};
			return my.getStorage(options);
		}
	},
	getStorageSync: (key) => {
		if (__WECHAT__) {
			return wx.getStorageSync(key);
		}
		if (__ALIPAY__) {
			return my.getStorageSync({
				key: key,
			}).data;
		}
	},
	setStorage: (options) => {
		if (__WECHAT__) {
			return wx.setStorage(options);
		}
		if (__ALIPAY__) {
			return my.setStorage(options);
		}
	},
	setStorageSync: (key, data) => {
		if (__WECHAT__) {
			return wx.setStorageSync(key, data);
		}
		if (__ALIPAY__) {
			return my.setStorageSync({
				key: key,
				data: data,
			});
		}
	},
	removeStorage: (options) => {
		if (__WECHAT__) {
			return wx.removeStorage(options);
		}
		if (__ALIPAY__) {
			return my.removeStorage(options);
		}
	},
	removeStorageSync: (key) => {
		if (__WECHAT__) {
			return wx.removeStorageSync(key);
		}
		if (__ALIPAY__) {
			return my.removeStorageSync({
				key: key,
			});
		}
	},
	clearStorage: (options) => {
		if (__WECHAT__) {
			return wx.clearStorage(options);
		}
		if (__ALIPAY__) {
			return my.clearStorage(options);
		}
	},
	clearStorageSync: () => {
		if (__WECHAT__) {
			return wx.clearStorageSync();
		}
		if (__ALIPAY__) {
			return my.clearStorageSync();
		}
	},
	redirectTo: (options) => {
		if (__WECHAT__) {
			return wx.redirectTo(options);
		}
		if (__ALIPAY__) {
			return my.redirectTo(options);
		}
	},
	navigateTo: (options) => {
		if (__WECHAT__) {
			return wx.navigateTo(options);
		}
		if (__ALIPAY__) {
			return my.navigateTo(options);
		}
	},
	navigateBack: (options) => {
		if (__WECHAT__) {
			return wx.navigateBack(options);
		}
		if (__ALIPAY__) {
			return my.navigateBack(options);
		}
	},
	showModal: (options) => {
		if (__WECHAT__) {
			return wx.showModal(options);
		}
		if (__ALIPAY__) {
			// 支付宝不支持自定义按钮颜色
			if (options.showCancel === false) {
				let params = paramsMap(options, {
					confirmText: 'buttonText',
				});
				return my.alert(params);
			}
			else {
				let params = paramsMap(options, {
					confirmText: 'confirmButtonText',
					cancelText: 'cancelButtonText',
				});
				params.confirmButtonText = params.confirmButtonText || '确认';
				params.cancelButtonText = params.cancelButtonText || '取消';
				return my.confirm(params);
			}
		}
	},
	showToast: (options) => {
		if (__WECHAT__) {
			return wx.showToast(options);
		}
		if (__ALIPAY__) {
			let params = paramsMap(options, {
				title: 'content',
				icon: 'type',
			});
			params.duration = params.duration || 1500;
			if (params.type === 'loading') {
				params.type = 'none';
				console.warn('alipay api: showToast 不支持 type=loading, 暂时使用 none 代替');
			}
			return my.showToast(params);
		}
	},
	hideToast: () => {
		if (__WECHAT__) {
			return wx.hideToast();
		}
		if (__ALIPAY__) {
			return my.hideToast();
		}
	},
	showShareMenu: (options) => {
		if (__WECHAT__) {
			return wx.showShareMenu(options);
		}
		if (__ALIPAY__) {
			return null;
		}
	},
	makePhoneCall: (options) => {
		if (__WECHAT__) {
			return wx.makePhoneCall(options);
		}
		if (__ALIPAY__) {
			let params = paramsMap(options, {
				phoneNumber: 'number',
			});
			return my.makePhoneCall(params);
		}
	},
	setNavigationBarTitle: (options) => {
		if (__WECHAT__) {
			return wx.setNavigationBarTitle(options);
		}
		if (__ALIPAY__) {
			return my.setNavigationBar(options);
		}
	},
	setNavigationBarColor: (options) => {
		if (__WECHAT__) {
			return wx.setNavigationBarColor(options);
		}
		if (__ALIPAY__) {
			console.warn('alipay api: setNavigationBar 不支持 frontColor, animation');
			return my.setNavigationBar(options);
		}
	},
	previewImage: (options) => {
		if (__WECHAT__) {
			return wx.previewImage(options);
		}
		if (__ALIPAY__) {
			if (options.current) {
				options.current = options.urls.indexOf(options.current);
			}
			console.log(options.current);
			return my.previewImage(options);
		}
	},
	showTabBar: (options) => {
		if (__WECHAT__) {
			return wx.showTabBar(options);
		}
		if (__ALIPAY__) {
			return my.showTabBar(options);
		}
	},
	hideTabBar: (options) => {
		if (__WECHAT__) {
			return wx.hideTabBar(options);
		}
		if (__ALIPAY__) {
			return my.hideTabBar(options);
		}
	},
	switchTab: (options) => {
		if (__WECHAT__) {
			return wx.switchTab(options);
		}
		if (__ALIPAY__) {
			return my.switchTab(options);
		}
	},
	reLaunch: (options) => {
		if (__WECHAT__) {
			return wx.reLaunch(options);
		}
		if (__ALIPAY__) {
			return my.reLaunch(options);
		}
	},
	createAnimation: (options) => {
		if (__WECHAT__) {
			return wx.createAnimation(options);
		}
		if (__ALIPAY__) {
			return my.createAnimation(options);
		}
	},
	// TODO: 业务相关的api
	login: (options) => {
		if (__WECHAT__) {
			return wx.login(options);
		}
		if (__ALIPAY__) {
			return my.getAuthCode(options);
		}
	},
	checkSession: (options) => {
		if (__WECHAT__) {
			return wx.checkSession(options);
		}
		if (__ALIPAY__) {
			return null;
		}
	},
	getUserInfo: (options) => {
		if (__WECHAT__) {
			return wx.getUserInfo(options);
		}
		if (__ALIPAY__) {
			return my.getAuthUserInfo(options);
		}
	},
	requestPayment: (options) => {
		if (__WECHAT__) {
			return wx.requestPayment(options);
		}
		if (__ALIPAY__) {
			// https://docs.alipay.com/mini/api/openapi-pay
			let success = options.success || noop;
			let fail = options.fail || noop;
			options.success = function (res) {
				if (res.resultCode.toString() !== '9000') {
					fail(res);
				}
				success(res);
			};
			return my.tradePay(options);
		}
	},
};

miniapp.pro = {};
for (let key in miniapp) {
	if (miniapp.hasOwnProperty(key) && typeof miniapp[key] === 'function') {
		miniapp.pro[key] = promisify(miniapp[key]);
	}
}

export {
	miniapp as default,
};
