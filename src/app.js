import regux from 'regux';
import logger from 'regux/logger';

export default class App {
	constructor() {
		const store = new regux.Store();
		store.use( logger() );
		this._store = store;
	}
	getStore() {
		return this._store;
	}
	use( Component ) {
		Component.use( regux );
	}
	model( m = {} ) {
		const { name } = m;

		if ( !name ) {
			return console.error( 'Please provide name for model', m );
		}

		const store = this.getStore();
		store.registerModule( name, m );
	}
	getters( getters ) {
		const store = this.getStore();
		store.registerGetters( getters );
	}
	actions( actions = {} ) {
		const store = this.getStore();
		store.registerActions( actions );
	}
	start( App, selector ) {
		return new App( {
			store: this.getStore(),
		} ).$inject( document.querySelector( selector ) );
	}
};
