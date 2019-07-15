const { NIL } = require('./types');

function Env(outer, binds, exprs) {
  const env = { };

  if (binds && exprs) {
    for (let i = 0; i < binds.length; i++) {
      set(binds[i], exprs[i]);
    }
  }

  function set(key, value) {
    env[key] = value;
  }

  function find(key) {
    const value = env[key];

    if (value !== undefined) {
      return env;
    }

    if (outer) {
      return outer.find(key);
    }

    return NIL;
  }

  function get(key) {
    const env = find(key);

    if (env) {
      return env[key];
    }

    throw new Error(`${Symbol.keyFor(key)} not found.`);
  }

  function dump() {
    for(let key of Object.getOwnPropertySymbols(env)) {
      console.log(`${Symbol.keyFor(key)}: ${env[key]}`);
    }
  }

  return Object.freeze({
    set,
    find,
    get,
    dump,
  });
}

module.exports = Object.freeze({
  Env,
});
