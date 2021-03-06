(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.AMO = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var regux = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
  	module.exports = factory();
  }(commonjsGlobal, (function () {
  var handleComputed = ( function () {
  	// wrap the computed getter;
  	function wrapGet( get ) {
  		return function ( context ) {
  			return get.call( context, context.data );
  		};
  	}
  	// wrap the computed setter;
  	function wrapSet( set ) {
  		return function ( context, value ) {
  			set.call( context, value, context.data );
  			return value;
  		};
  	}

  	return function ( computed ) {
  		if ( !computed ) {
  			return;
  		}
  		var parsedComputed = {};
  		var handle, pair, type;
  		for ( var i in computed ) {
  			handle = computed[ i ];
  			type = typeof handle;

  			if ( handle.type === 'expression' ) {
  				parsedComputed[ i ] = handle;
  				continue;
  			}
  			if ( type !== 'string' ) {
  				pair = parsedComputed[ i ] = { type: 'expression' };
  				if ( type === 'function' ) {
  					pair.get = wrapGet( handle );
  				} else {
  					if ( handle.get ) {
  						pair.get = wrapGet( handle.get );
  					}
  					if ( handle.set ) {
  						pair.set = wrapSet( handle.set );
  					}
  				}
  			}
  		}
  		return parsedComputed;
  	};
  } )();

  // generate computed properties from getters
  var makeComputed = function ( target, getters ) {
  	Object.assign( target.computed || {}, handleComputed( getters ) );
  };

  var Scheduler = function Scheduler() {
  	this.t = null;
  	this.tasks = [];
  };
  Scheduler.prototype.add = function add ( task ) {
  	this.tasks.push( task );
  };
  Scheduler.prototype.run = function run ( main ) {
  		var this$1 = this;

  	if ( this.t ) {
  		clearTimeout( this.t );
  	}

  	this.t = setTimeout( function () {
  		main();

  		this$1.tasks.forEach( function ( task, i ) {
  			if ( typeof task === 'function' ) {
  				task();
  				this$1.tasks[ i ] = null;
  			}
  		} );
  		this$1.tasks.length = 0;
  	}, 0 );
  };

  // Credits: vue/vuex

  var devtoolsPlugin = function () { return function (store) {
  	var devtools = window && window.__REO_DEVTOOLS_HOOK__;

  	if ( !devtools ) {
  		return;
  	}

  	store._devtools = devtools;

  	devtools.emit( 'reo:init', store );
  	devtools.on( 'reo:travel-to-state', function (state) {
  		store.replaceState( state );
  	} );
  	devtools.on( 'reo:silent-travel-to-state', function (state) {
  		store.replaceState( state, {
  			silent: true
  		} );
  	} );

  	store.subscribe( function ( action, state ) {
  		devtools.emit( 'reo:reducer', action, state );
  	} );

  	store.subscribeViewUpdate( function () {
  		devtools.emit( 'reo:view-updated' );
  	} );
  }; };

  var Store = function Store( ref ) {
  	var this$1 = this;
  	if ( ref === void 0 ) ref = {};
  	var modules = ref.modules; if ( modules === void 0 ) modules = {};
  	var actions = ref.actions; if ( actions === void 0 ) actions = {};
  	var plugins = ref.plugins; if ( plugins === void 0 ) plugins = [];

  	Object.assign( this, {
  		_state: {},
  		_reducers: {},
  		_modules: modules,
  		_getters: {},
  		_actions: actions,
  		_plugins: plugins,
  		_subscribers: [],
  		_viewUpdateSubscribers: [],
  		scheduler: new Scheduler(),
  	} );

  	// register modules
  	Object.keys( modules )
  		.forEach( function (name) { return this$1.registerModule( name, modules[ name ] ); } );

  	// execute devtools manually
  	devtoolsPlugin()( this );
  	// execute other plugins
  	plugins.forEach( function (plugin) { return this$1.use( plugin ); } );
  };
  Store.prototype.use = function use ( plugin ) {
  	plugin( this );
  };
  Store.prototype.replaceState = function replaceState ( newState, ref ) {
  		if ( ref === void 0 ) ref = {};
  		var silent = ref.silent; if ( silent === void 0 ) silent = false;

  	this._state = newState;

  	if ( !silent ) {
  		this.syncView();
  	}
  };
  Store.prototype.getState = function getState () {
  	return this._state;
  };
  Store.prototype.getGetters = function getGetters () {
  	return this._getters;
  };
  Store.prototype.nextTick = function nextTick ( fn ) {
  	this.scheduler.add( fn );
  };
  Store.prototype.dispatch = function dispatch ( type, payload ) {
  		var this$1 = this;

  	var action;

  	if ( typeof type === 'string' ) {
  		action = { type: type, payload: payload };
  	} else if ( isValidMutation( type ) ) {
  		action = type;
  	} else {
  		return console.error( 'invalid dispatch params', arguments );
  	}

  	var act = this._actions[ action.type ];

  	if ( typeof act !== 'function' ) {
  		return console.error( 'action', action.type, 'not found' );
  	}

  	return act( {
  		getState: this.getState.bind( this ),
  		state: this.getState(),
  		get: function (key) {
  			var getters = this$1.getGetters();
  			var getterFn = getters[ key ];
  			if ( typeof getterFn !== 'function' ) {
  				return;
  			}

  			return getterFn( this$1.getState() );
  		},
  		commit: this.commit.bind( this ),
  		dispatch: this.dispatch.bind( this ),
  		nextTick: this.nextTick.bind( this ),
  	}, action.payload );
  };
  Store.prototype.commit = function commit ( type, payload ) {
  		var this$1 = this;

  	var mutation;

  	// e.g. mutation -> { type: 'foo', payload: 'bar' }
  	if ( typeof type === 'string' ) {
  		mutation = { type: type, payload: payload };
  	} else if ( isValidMutation( type ) ) {
  		mutation = type;
  	} else {
  		return console.error( 'invalid commit params', arguments );
  	}

  	var reducer = this._reducers[ mutation.type ];
  	if ( typeof reducer === 'function' ) {
  		var state = this.getState();
  		var moduleState = typeof reducer.key === 'undefined' ? state : state[ reducer.key ];

  		reducer( moduleState, mutation.payload );

  		// notify subscribers state has been changed
  		this._applySubscribers( mutation, state );

  		this.scheduler.run( function () { return this$1.syncView(); } );
  	} else {
  		console.error( 'reducer', mutation.type, 'not found' );
  	}
  };
  Store.prototype.syncView = function syncView () {
  	this._host.forEach( function (h) { return h.$update(); } );
  	this._viewUpdateSubscribers.forEach( function (fn) { return fn(); } );
  };
  Store.prototype.host = function host ( target ) {
  	if ( !this._host ) {
  		this._host = [];
  	}
  	this._host.push( target );
  };
  Store.prototype.subscribe = function subscribe ( fn ) {
  	if ( typeof fn !== 'function' ) {
  		return;
  	}

  	this._subscribers.push( fn );
  };
  Store.prototype.subscribeViewUpdate = function subscribeViewUpdate ( fn ) {
  	if ( typeof fn !== 'function' ) {
  		return;
  	}

  	this._viewUpdateSubscribers.push( fn );
  };
  Store.prototype.registerModule = function registerModule ( name, module ) {
  		if ( name === void 0 ) name = '';
  		if ( module === void 0 ) module = {};

  	if ( !name ) {
  		return console.error( 'Please provide a name when register module' );
  	}

  	// attach module state to root state
  	this._state[ name ] = module.state || {};

  	var reducers = module.reducers || {};
  	for ( var j in reducers ) {
  		reducers[ j ].key = name;
  	}

  	reducers = addNSForReducers( reducers, name );

  	// attach module reducers to root reducers
  	Object.assign( this._reducers, reducers );
  };
  Store.prototype.registerActions = function registerActions ( actions ) {
  		if ( actions === void 0 ) actions = {};

  	Object.assign( this._actions, actions );
  };
  Store.prototype.registerGetters = function registerGetters ( getters ) {
  		if ( getters === void 0 ) getters = {};

  	Object.assign( this._getters, getters );
  };
  Store.prototype._applySubscribers = function _applySubscribers ( mutation, state ) {
  	var subscribers = this._subscribers;

  	for ( var i = 0, len = subscribers.length; i < len; i++ ) {
  		var subscriber = subscribers[ i ];
  		subscriber( mutation, state );
  	}
  };

  function addNSForReducers( reducers, ns ) {
  	var tmp = {};
  	Object.keys( reducers ).forEach( function (key) {
  		tmp[ (ns + "/" + key) ] = reducers[ key ];
  	} );
  	return tmp;
  }

  function isValidMutation( mutation ) {
  	return typeof mutation.type !== 'undefined';
  }

  function isStore( ins ) {
  	return ins && ins instanceof Store;
  }

  /* eslint-disable no-loop-func */

  var regux = function (Component) {
  	// one store in Component scope
  	var store;
  	Component.implement( {
  		events: {
  			$config: function $config() {
  				if ( isStore( this.store ) ) {
  					if ( store ) {
  						// store already exists
  						console.warn( 'store already exists' );
  						console.warn( 'old store:', store );
  						console.warn( 'new store:', this.store );
  						console.warn( 'new store will be used' );
  					}

  					// save store
  					store = this.store;
  					store.host( this );
  					delete this.store;
  				}

  				if ( !store ) {
  					return console.warn( 'store not found' );
  				}

  				this.$store = store;
  				this.commit = store.commit.bind( store );
  				this.dispatch = store.dispatch.bind( store );
  				this.nextTick = store.nextTick.bind( store );

  				var commonGetters = store.getGetters();

  				var ref = this;
  				var getters = ref.getters; if ( getters === void 0 ) getters = {};
  				Object.keys( getters ).forEach( function (key) {
  					var getter = getters[ key ];

  					// if getter is string, try getting it from commonGetters
  					if ( typeof getter === 'string' ) {
  						getter = commonGetters[ getter ];
  					}

  					if ( typeof getter === 'function' ) {
  						getters[ key ] = function () {
  							return getter( store.getState() );
  						};
  					}
  				} );
  				makeComputed( this, getters );
  			}
  		}
  	} );
  };

  regux.Store = Store;

  return regux;

  })));
  });

  var logger = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
  	module.exports = factory();
  }(commonjsGlobal, (function () {
  // Credits: fcomb/redux-logger

  function createLogger( ref ) {
  	if ( ref === void 0 ) ref = {};
  	var collapsed = ref.collapsed; if ( collapsed === void 0 ) collapsed = true;
  	var transformer = ref.transformer; if ( transformer === void 0 ) transformer = function (state) { return state; };
  	var mutationTransformer = ref.mutationTransformer; if ( mutationTransformer === void 0 ) mutationTransformer = function (mut) { return mut; };

  	return function (store) {
  		var prevState = JSON.parse( JSON.stringify( store.getState() ) );
  		store.subscribe( function ( mutation, state ) {
  			var nextState = JSON.parse( JSON.stringify( state ) );
  			var time = new Date();
  			var formattedTime = " @ " + (pad( time.getHours(), 2 )) + ":" + (pad( time.getMinutes(), 2 )) + ":" + (pad( time.getSeconds(), 2 )) + "." + (pad( time.getMilliseconds(), 3 ));
  			var message = "commit " + (mutation.type) + formattedTime;

  			if ( collapsed ) {
  				console.groupCollapsed( message );
  			} else {
  				console.group( message );
  			}

  			console.log( '%c prev state', 'color: #9E9E9E; font-weight: bold', transformer( prevState ) );
  			console.log( '%c commit', 'color: #03A9F4; font-weight: bold', mutationTransformer( mutation ) );
  			console.log( '%c next state', 'color: #4CAF50; font-weight: bold', transformer( nextState ) );

  			console.groupEnd( message );

  			prevState = nextState;
  		} );
  	};
  }

  function repeat( str, times ) {
  	return ( new Array( times + 1 ) ).join( str );
  }

  function pad( num, maxLength ) {
  	return repeat( '0', maxLength - num.toString().length ) + num;
  }

  return createLogger;

  })));
  });

  var App =
  /*#__PURE__*/
  function () {
    function App() {
      _classCallCheck(this, App);

      var store = new regux.Store();

      {
        store.use(logger());
      }

      this._store = store;
    }

    _createClass(App, [{
      key: "getStore",
      value: function getStore() {
        return this._store;
      }
    }, {
      key: "use",
      value: function use(Component) {
        Component.use(regux);
      }
    }, {
      key: "model",
      value: function model() {
        var m = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var name = m.name;

        if (!name) {
          return console.error('Please provide name for model', m);
        }

        var store = this.getStore();
        store.registerModule(name, m);
      }
    }, {
      key: "getters",
      value: function getters(_getters) {
        var store = this.getStore();
        store.registerGetters(_getters);
      }
    }, {
      key: "actions",
      value: function actions() {
        var _actions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var store = this.getStore();
        store.registerActions(_actions);
      }
    }, {
      key: "start",
      value: function start(App, selector) {
        return new App({
          store: this.getStore()
        }).$inject(document.querySelector(selector));
      }
    }]);

    return App;
  }();

  function index () {
    return new App();
  }

  return index;

})));
