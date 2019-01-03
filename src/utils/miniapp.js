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
		if (__BAIDU__) {
			return swan.request(options);
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
		if (__BAIDU__) {
			return swan.getLocation(options);
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
		if (__BAIDU__) {
			return swan.openLocation(options);
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
		if (__BAIDU__) {
			return swan.getSystemInfo(options);
		}
	},
	getSystemInfoSync: (options) => {
		if (__WECHAT__) {
			return wx.getSystemInfoSync(options);
		}
		if (__ALIPAY__) {
			return mySystemInfo2wx(my.getSystemInfoSync(options));
		}
		if (__BAIDU__) {
			return swan.getSystemInfoSync(options);
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
		if (__BAIDU__) {
			return swan.getStorage(options);
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
		if (__BAIDU__) {
			return swan.getStorageSync(key);
		}
	},
	setStorage: (options) => {
		if (__WECHAT__) {
			return wx.setStorage(options);
		}
		if (__ALIPAY__) {
			return my.setStorage(options);
		}
		if (__BAIDU__) {
			return swan.setStorage(options);
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
		if (__BAIDU__) {
			return swan.setStorageSync(key, data);
		}
	},
	removeStorage: (options) => {
		if (__WECHAT__) {
			return wx.removeStorage(options);
		}
		if (__ALIPAY__) {
			return my.removeStorage(options);
		}
		if (__BAIDU__) {
			return swan.removeStorage(options);
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
		if (__BAIDU__) {
			return swan.removeStorageSync(key);
		}
	},
	clearStorage: (options) => {
		if (__WECHAT__) {
			return wx.clearStorage(options);
		}
		if (__ALIPAY__) {
			return my.clearStorage(options);
		}
		if (__BAIDU__) {
			return swan.clearStorage(options);
		}
	},
	clearStorageSync: () => {
		if (__WECHAT__) {
			return wx.clearStorageSync();
		}
		if (__ALIPAY__) {
			return my.clearStorageSync();
		}
		if (__BAIDU__) {
			return swan.clearStorageSync();
		}
	},
	redirectTo: (options) => {
		if (__WECHAT__) {
			return wx.redirectTo(options);
		}
		if (__ALIPAY__) {
			return my.redirectTo(options);
		}
		if (__BAIDU__) {
			return swan.redirectTo(options);
		}
	},
	navigateTo: (options) => {
		if (__WECHAT__) {
			return wx.navigateTo(options);
		}
		if (__ALIPAY__) {
			return my.navigateTo(options);
		}
		if (__BAIDU__) {
			return swan.navigateTo(options);
		}
	},
	navigateBack: (options) => {
		if (__WECHAT__) {
			return wx.navigateBack(options);
		}
		if (__ALIPAY__) {
			return my.navigateBack(options);
		}
		if (__BAIDU__) {
			return swan.navigateBack(options);
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
		if (__BAIDU__) {
			return swan.showModal(options);
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
		if (__BAIDU__) {
			return swan.showToast(options);
		}
	},
	hideToast: () => {
		if (__WECHAT__) {
			return wx.hideToast();
		}
		if (__ALIPAY__) {
			return my.hideToast();
		}
		if (__BAIDU__) {
			return swan.hideToast();
		}
	},
	showShareMenu: (options) => {
		if (__WECHAT__) {
			return wx.showShareMenu(options);
		}
		if (__ALIPAY__) {
			return null;
		}
		if (__BAIDU__) {
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
		if (__BAIDU__) {
			return swan.makePhoneCall(options);
		}
	},
	setNavigationBarTitle: (options) => {
		if (__WECHAT__) {
			return wx.setNavigationBarTitle(options);
		}
		if (__ALIPAY__) {
			return my.setNavigationBar(options);
		}
		if (__BAIDU__) {
			return swan.setNavigationBarTitle(options);
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
		if (__BAIDU__) {
			return swan.setNavigationBarColor(options);
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
			// console.log(options.current);
			return my.previewImage(options);
		}
		if (__BAIDU__) {
			return swan.previewImage(options);
		}
	},
	showTabBar: (options) => {
		if (__WECHAT__) {
			return wx.showTabBar(options);
		}
		if (__ALIPAY__) {
			return my.showTabBar(options);
		}
		if (__BAIDU__) {
			return swan.showTabBar(options);
		}
	},
	hideTabBar: (options) => {
		if (__WECHAT__) {
			return wx.hideTabBar(options);
		}
		if (__ALIPAY__) {
			return my.hideTabBar(options);
		}
		if (__BAIDU__) {
			return swan.hideTabBar(options);
		}
	},
	switchTab: (options) => {
		if (__WECHAT__) {
			return wx.switchTab(options);
		}
		if (__ALIPAY__) {
			return my.switchTab(options);
		}
		if (__BAIDU__) {
			return swan.switchTab(options);
		}
	},
	reLaunch: (options) => {
		if (__WECHAT__) {
			return wx.reLaunch(options);
		}
		if (__ALIPAY__) {
			return my.reLaunch(options);
		}
		if (__BAIDU__) {
			return swan.reLaunch(options);
		}
	},
	createAnimation: (options) => {
		if (__WECHAT__) {
			return wx.createAnimation(options);
		}
		if (__ALIPAY__) {
			return my.createAnimation(options);
		}
		if (__BAIDU__) {
			return swan.createAnimation(options);
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
		if (__BAIDU__) {
			return swan.login(options);
		}
	},
	checkSession: (options) => {
		if (__WECHAT__) {
			return wx.checkSession(options);
		}
		if (__ALIPAY__) {
			return null;
		}
		if (__BAIDU__) {
			return swan.checkSession(options);
		}
	},
	getUserInfo: (options) => {
		if (__WECHAT__) {
			return wx.getUserInfo(options);
		}
		if (__ALIPAY__) {
			return my.getAuthUserInfo(options);
		}
		if (__BAIDU__) {
			return swan.getUserInfo(options);
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
		if (__BAIDU__) {
			return null;
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
