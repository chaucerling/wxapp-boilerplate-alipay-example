import connector from 'weappx-weapp';
import weappx from 'weappx';
import envModel from './env.js';

const app = weappx();
app.models([
	envModel,
]);
const store = app.start();
connector.setStore(store);

export {app, connector};
