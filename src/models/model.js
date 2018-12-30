import connector from 'weappx-weapp';
import weappx from 'weappx';
import envModel from './env.js';
import countModel from './count.js';

const app = weappx();
app.models([
	envModel,
	countModel,
]);
const store = app.start();
connector.setStore(store);

export {app, connector};
