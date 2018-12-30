export default {
	operator: 'username',
	password: 'pwd',
	tasks: [{
		bucket: 'bucket-name',
		prefix: 'miniapp', // upload path prefix
		// endpoint: '', //  API接入点
		directory: 'src/images', // 图片文件目录
		rename: (origin) => {
			return origin;
		},
	}],
};
