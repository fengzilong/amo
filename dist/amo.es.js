import regux from 'regux';
import logger from 'regux/logger';

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

var App =
/*#__PURE__*/
function () {
  function App() {
    _classCallCheck(this, App);

    var store = new regux.Store();

    if (process.env.NODE_ENV === 'development') {
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

export default index;
