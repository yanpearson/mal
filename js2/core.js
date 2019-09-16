const fs = require('fs');

const { readStr } = require('./reader');
const { prStr } = require('./printer');
const { NIL, MalList, MalAtom, MalBoolean, MalSymbol, MalError } = require('./types');

const ns = {};

const writeLine = x => process.stdout.write(`${x}\n`);

ns[Symbol.for('+')] = (a, b) => a + b;

ns[Symbol.for('-')] = (a, b) => a - b;

ns[Symbol.for('*')] = (a, b) => a * b;

ns[Symbol.for('/')] = (a, b) => a / b;

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

ns[Symbol.for('read-string')] = x => readStr(x);

ns[Symbol.for('slurp')] = x => fs.readFileSync(x).toString('utf8');

ns[Symbol.for('pr-str')] = (...xs) => xs.map(x => prStr(x, true)).join(' ');

ns[Symbol.for('str')] = (...xs) => xs.map(x => prStr(x, false)).join('');

ns[Symbol.for('prn')] = (...xs) => {
  const result =  xs.map(x => prStr(x, true)).join(' ');
  writeLine(result);
  return NIL;
};

ns[Symbol.for('println')] = (...xs) => {
  const result =  xs.map(x => prStr(x, false)).join(' ');
  writeLine(result);
  return NIL;
};

ns[Symbol.for('atom')] = x => MalAtom(x);

ns[Symbol.for('atom?')] = x => MalAtom.isAtom(x);

ns[Symbol.for('deref')] = x => x.get();

ns[Symbol.for('reset!')] = (x, y) => {
  x.set(y);
  return y;
};

ns[Symbol.for('swap!')] = (x, y, ...zs) => {
  const value = x.get();
  const result = y(value, ...zs);
  x.set(result);
  return result;
};

ns[Symbol.for('cons')] = (x, xs = []) => (x !== NIL) ? [x, ...xs] : xs;

ns[Symbol.for('concat')] = (...xs) => xs.reduce((acc, cur) => [...acc, ...cur], []);

ns[Symbol.for('nth')] = (xs = [], x) => {
  if (x > xs.length - 1) {
    throw MalError({ message: 'Index out of range' });
  }
  return xs[x];
};

ns[Symbol.for('first')] = (xs = []) => NIL === xs || xs.length === 0 ? NIL : xs[0];

ns[Symbol.for('rest')] = (xs = []) => NIL === xs || xs.length <= 1 ? NIL : xs.slice(1);

ns[Symbol.for('throw')] = x => {
  throw MalError({ throwedValue: x });
};

ns[Symbol.for('apply')] = (f, ...xs) => {
  const args = xs.reduce((acc, x) => acc.concat(x), []);
  return f.apply(null, args);
};

ns[Symbol.for('map')] = (f, xs = []) => xs.map(x => f(x));

ns[Symbol.for('nil?')] = x => x === NIL;

ns[Symbol.for('true?')] = x => MalBoolean.isBoolean(x) && x === true;

ns[Symbol.for('false?')] = x => MalBoolean.isBoolean(x) && x === false;

ns[Symbol.for('symbol?')] = x => MalSymbol.isSymbol(x);

module.exports = Object.freeze({
  ns,
});
