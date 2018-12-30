import {app, connector} from 'model';

let page = connector.connectPage({
	env: (state) => state.env,
})({

});
Page(page);
