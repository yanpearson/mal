const { MalList, MalNumber, MalSymbol } = require('./types');

function prStr(expr) {
  if (MalSymbol.isSymbol(expr)) {
    return Symbol.keyFor(expr);
  }
  if (MalNumber.isNumber(expr)) {
    return String(expr);
  }
  if (MalList.isList(expr)) {
    const str = expr.map(e => prStr(e))
      .join(' ');
    return `(${str})`;
  }
  throw new Error(`Unable to call 'prStr' on expression: ${expr}`);
}

module.exports = Object.freeze({
  prStr,
});
