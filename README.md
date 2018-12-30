# wxapp-boilerplate-alipay-example

基于 [wxapp-boilerplate](https://raw.githubusercontent.com/cantonjs/wxapp-boilerplate) 脚手架 (2018-10-08 f763e71) ，添加了几个功能

- api 封装，并提供对应的 promise 方法 (以微信为标准)
- 自定义组件封装 (以微信为标准)
- 根据小程序环境选择编译不同的 app.json
- wxml 和 json 文件的关键字转换 (以微信为标准)
- 图片上传 (upyun)
- 状态管理 ([weappx](https://github.com/tolerance-go/weappx))

## api 封装

`src/utils/miniapp.js` 是小程序 api 的封装，`wx` 和 `my` 尽量不要在 `miniapp.js` 外部使用，要封装好再用 `miniapp` 调用

`miniapp.pro.func` 是将 `miniapp.func` 异步方法转换为 promise 方法

目前只封装了较为常用的 api, 可自行添加没有的封装的

## 自定义组件封装

`src/utils/component.js` 是对小程序自定义组件调用参数的封装，目前只是简单封装了 `props` 和 `triggerEvent`

## 编译不同的 app.json

因为微信和支付宝的 TabBar 设计规范是不一样的，需要配置两套不同的图片

在 `webpack.config.babel.js` 里配置 `appJsonFile` 的值，在 `copyPatterns` 里添加对应的图片文件路径

目前只是用作配置 TabBar 的图片，计划可以支持 `pages` 等参数

# wxml 和 json 文件的关键字转换

使用替换文本的方式在编译时转换, 原生组件的事件 key 和 json 文件的 key 能自动转换

自定义组件的事件 key 写法需要改成 `@bindXXXX ` (@bind后的第一个字母大写)，在组件里的调用方法不变

## 图片上传

配置文件 `upyun.js`

命令 `yarn upload_image`

## 状态管理

使用 [weappx](https://github.com/tolerance-go/weappx)，是基于 redux 的轻量级状态管理框架，api 类似 [dva](https://github.com/dvajs/dva)

`src/models/model.js` 中初始化好数据模型和连接器

在支付宝中使用遇到的问题 [issue](https://github.com/tolerance-go/weappx/issues/24)

解决方法有两个

- 不在外部直接修改 state，通过 dispatcher 修改
- 用 `lodash.cloneDeep` 复制 state 后再修改

## TODO

- [ ] 完善自定义组件封装
- [ ] 编译不同的 app.json , 支持其他参数
- [ ] 修复 weappx 在支付宝中使用的问题
- [ ] 支付宝自定义组件样式添加 scope

## issues

- 支付宝自定义组件样式没有单独的作用域，[主题](https://openclub.alipay.com/read.php?tid=11844&fid=65)
- 支付宝 navigator 组件的 open-type 设置为 navigateBack ，不生效, [主题](https://openclub.alipay.com/read.php?tid=12013&fid=65)
