const { nil } = require('./types');

function Env(outer) {
  const env = { };

  function set(key, value) {
    env[key] = value;
  }

  function find(key) {
    const value = env[key];

    if (value) {
      return env;
    }

    if (!value && outer !== null) {
      return outer.find(key);
    }

    return nil;
  }

  function get(key) {
    const env = find(key);

    if (env) {
      return env[key];
    }

    throw new Error(`${Symbol.keyFor(key)} not found.`);
  }

  return Object.freeze({
    set,
    find,
    get,
  });
}

module.exports = Object.freeze({
  Env,
});
