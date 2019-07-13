const { prStr } = require('./printer');
const { NIL, MalList } = require('./types');

const ns = {};

ns[Symbol.for('+')] = (a, b) => a + b;
ns[Symbol.for('-')] = (a, b) => a - b;
ns[Symbol.for('*')] = (a, b) => a * b;
ns[Symbol.for('/')] = (a, b) => a / b;

ns[Symbol.for('prn')] = (x) => {
  process.stdout.write(`${prStr(x, true)}\n`);
  return NIL;
};

ns[Symbol.for('list')] = (...xs) => MalList.from(xs);
ns[Symbol.for('list?')] = (x) => MalList.isList(x);
ns[Symbol.for('empty?')] = (x) => MalList.isList(x) ? x.length === 0 : true;
ns[Symbol.for('count')] = (x) => MalList.isList(x) ? x.length : 0;

ns[Symbol.for('=')] = (x, y) => {
  if (MalList.isList(x) && MalList.isList(y)) {
    if (x.length !== y.length) {
      return false;
    }
    for (let i = 0; i < x.length; i++) {
      if (x[i] !== y[i]) {
        return false;
      }
    }
    return true;
  }
  return x === y;
};

ns[Symbol.for('<')] = (x, y) => x < y;
ns[Symbol.for('<=')] = (x, y) => x <= y;
ns[Symbol.for('>')] = (x, y) => x > y;
ns[Symbol.for('>=')] = (x, y) => x >= y;
  
module.exports = Object.freeze({
  ns,
});
