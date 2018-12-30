import { resolve } from 'path';
import {
	DefinePlugin,
	EnvironmentPlugin,
	IgnorePlugin,
	optimize,
	ProvidePlugin,
} from 'webpack';
import WXAppWebpackPlugin, { Targets } from 'wxapp-webpack-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';
import MinifyPlugin from 'babel-minify-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import pkg from './package.json';
import cdnConfig from './upyun.js';
import { url } from 'inspector';

const { NODE_ENV, LINT } = process.env;
const isDev = NODE_ENV !== 'production';
const shouldLint = !!LINT && LINT !== 'false';
const srcDir = resolve('src');
const cdnPrefix = `https://${cdnConfig.tasks[0].bucket}/${cdnConfig.tasks[0].miniapp}`
const enableCdn = true;

const copyPatterns = []
	.concat(pkg.copyWebpack || [])
	.map(
		(pattern) =>
			typeof pattern === 'string' ? { from: pattern, to: pattern } : pattern,
	);

export default (env = {}) => {
	const min = env.min;
	const target = env.target || 'Wechat';
	const isWechat = env.target !== 'Alipay';
  const isAlipay = !isWechat;

  // 根据 target 编译不同的 json 文件
  const appJsonFile = isWechat ? 'app.json' : 'alipay.json';
  // 复制 json 配置里的图片
  if (isAlipay) {
    // copyPatterns.push({from: 'app.alipay.json', to: 'app.json', force: true});
    copyPatterns.push({from: 'images/alipay', to: 'images/alipay'});
  }

	const relativeFileLoader = (ext = '[ext]') => {
    const namePrefix = isWechat ? '' : '[path]';
		return {
			loader: 'file-loader',
			options: {
				useRelativePath: isWechat,
				name: `${namePrefix}[name].${ext}`,
				context: srcDir,
			},
		};
	};

	return {
		entry: {
			app: [
				// add promise polyfill into wechat mini program
				isWechat &&
					`es6-promise/dist/es6-promise.auto${isDev ? '.min' : ''}.js`,

				'./src/app.js',
			].filter(Boolean),
		},
		output: {
			filename: '[name].js',
			publicPath: '/',
			path: resolve('dist', isWechat ? 'wechat' : 'alipay'),
		},
		target: Targets[target],
		module: {
			rules: [
				{
					test: /\.js$/,
					include: /src/,
					exclude: /node_modules/,
					use: ['babel-loader', shouldLint && 'eslint-loader'].filter(Boolean),
				},
				{
					test: /\.wxs$/,
					include: /src/,
					exclude: /node_modules/,
					use: [
						relativeFileLoader(),
						'babel-loader',
						shouldLint && 'eslint-loader',
					].filter(Boolean),
        },
				{
					test: /\.(scss|wxss|acss)$/,
          include: /src/,
					use: [
						relativeFileLoader(isWechat ? 'wxss' : 'acss'),
						// cdn 路径
						{
							loader: 'string-replace-loader',
							options: {
								search: 'url\\("',
								replace: `url("${cdnPrefix}`,
								flags: 'g',
							},
						},
						{
							loader: 'sass-loader',
							options: {
								includePaths: [resolve('src', 'styles'), srcDir],
							},
						},
					],
				},
				{
					test: /\.(html|wxml|axml)$/,
					include: /src/,
					use: [
            relativeFileLoader(isWechat ? 'wxml' : 'axml'),
						{
							loader: 'wxml-loader',
							options: {
								root: srcDir,
								enforceRelativePath: true,
							},
						},
					],
        },
        {
					test: /\.(json|png|jpg|gif)$/,
          include: /src/,
          exclude: [resolve('src', appJsonFile)],
					use: relativeFileLoader(),
        },
        {
          test: /\.json$/,
          include: [resolve('src', appJsonFile)],
          loader: 'file-loader',
          options: {
            useRelativePath: isWechat,
            name: '[path]app.json',
            context: srcDir,
          },
        },
        // json 文件 key 替换
				isWechat ? {} : {
					test: /\.json$/,
					include: /src/,
					loader: 'string-replace-loader',
					options: {
						multiple: [
							{
								search: 'navigationBarTitleText',
								replace: 'defaultTitle',
								flags: 'g',
							},
							{
								search: 'navigationBarBackgroundColor',
								replace: 'titleBarColor',
								flags: 'g',
							},
							{
								search: 'enablePullDownRefresh',
								replace: 'pullRefresh',
								flags: 'g',
							},
							{
								search: 'usingComponents',
								replace: 'usingComponents',
								flags: 'g',
              },
              {
                search: 'list',
								replace: 'items',
								flags: 'g',
              },
              {
                search: 'text',
								replace: 'name',
								flags: 'g',
              },
              {
                search: 'iconPath',
								replace: 'icon',
								flags: 'g',
              },
              {
                search: 'selectedIconPath',
								replace: 'activeIcon',
								flags: 'g',
              }
						],
					},
				},
				// wxml 文件 key 替换
				isWechat ? {
          test: /\.(html|wxml|axml)$/,
					include: /src/,
					loader: 'string-replace-loader',
					options: {
						multiple: [
              // 组件绑定父组件事件
              {
                search: '\@bind',
								replace: 'bind:',
								flags: 'g',
              }
            ]
          }
        } : {
					test: /\.(html|wxml|axml)$/,
					include: /src/,
					loader: 'string-replace-loader',
					options: {
						multiple: [
               // 自定义组件绑定父组件事件
               {
                search: '\@bind',
								replace: 'on',
								flags: 'g',
              },
              // 一般组件
							{
								search: 'wx:if',
								replace: 'a:if',
								flags: 'g',
							},
							{
								search: 'wx:elif',
								replace: 'a:elif',
								flags: 'g',
							},
							{
								search: 'wx:else',
								replace: 'a:else',
								flags: 'g',
							},
							{
								search: 'wx:for',
								replace: 'a:for',
								flags: 'g',
							},
							{
								search: 'wx:for-index',
								replace: 'a:for-index',
								flags: 'g',
							},
							{
								search: 'wx:for-item',
								replace: 'a:for-item',
								flags: 'g',
							},
							{
								search: 'bindtap',
								replace: 'onTap',
								flags: 'g',
							},
							{
								search: 'catchtap',
								replace: 'catchTap',
								flags: 'g',
							},
							{
								search: 'bindinput',
								replace: 'onInput',
								flags: 'g',
							},
							{
								search: 'bindchange',
								replace: 'onChange',
								flags: 'g',
							},
							{
								search: 'bindfocus',
								replace: 'onFocus',
								flags: 'g',
							},
							{
								search: 'bindsubmit',
								replace: 'onSubmit',
								flags: 'g',
							},
							{
								search: 'bindscrolltolower',
								replace: 'onScrollToLower',
								flags: 'g',
              },
              {
								search: 'bindscroll',
								replace: 'onScroll',
								flags: 'g',
              },
              {
                search: 'bindtouchstart',
                replace: 'onTouchStart',
								flags: 'g',
              },
              {
                search: 'bindtouchmove',
                replace: 'onTouchMove',
								flags: 'g',
              }
						],
					},
				},
			],
		},
		plugins: [
			new EnvironmentPlugin({
				NODE_ENV: 'development',
			}),
			new DefinePlugin({
				__DEV__: isDev,
				__WECHAT__: isWechat,
				__ALIPAY__: isAlipay,
				// wx: isWechat ? 'wx' : 'my',
				// my: isWechat ? 'wx' : 'my',
			}),
			new WXAppWebpackPlugin({
				clear: !isDev,
        extensions: ['.js'],
        include: [appJsonFile],
        exclude: [appJsonFile === 'app.json' ? '' : 'app.json']
			}),
			new ProvidePlugin({
				'miniapp': [require('path').resolve(__dirname, 'src/utils/miniapp.js'), 'default'],
			}),
			new optimize.ModuleConcatenationPlugin(),
			new IgnorePlugin(/vertx/),
			shouldLint && new StylelintPlugin(),
			min && new MinifyPlugin(),
      new CopyPlugin(copyPatterns, { context: srcDir }),
		].filter(Boolean),
		devtool: isDev ? 'source-map' : false,
		resolve: {
			modules: [resolve(__dirname, 'src'), 'node_modules'],
			alias: {
				utils: require('path').resolve(__dirname, 'src/utils'),
				components: require('path').resolve(__dirname, 'src/components'),
				model: require('path').resolve(__dirname, 'src/models/model.js'),
			},
		},
		watchOptions: {
			ignored: /dist|manifest/,
			aggregateTimeout: 300,
		},
	};
};
