const { NIL, MalList, MalNumber, MalSymbol, MalBoolean, MalString, MalAtom } = require('./types');

function prStr(expr, printReadably) {
  if (NIL === expr) {
    return "nil";
  }
  if (MalSymbol.isSymbol(expr)) {
    return Symbol.keyFor(expr);
  }
  if (MalNumber.isNumber(expr)) {
    return String(expr);
  }
  if (MalBoolean.isBoolean(expr)) {
    return String(expr);
  }
  if (MalString.isString(expr)) {
    if (!printReadably) {
      return String(expr);
    }
    const str = String(expr)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
    return '"' + str + '"';
  }
  if (MalList.isList(expr)) {
    const str = expr.map(e => prStr(e))
      .join(' ');
    return '(' + str + ')';
  }
  if (MalAtom.isAtom(expr)) {
    return `(atom ${expr.get()})`;
  }
  if ('function' === typeof(expr)) {
    return '#<function>';
  }
  throw new Error(`Unable to call 'prStr' on expression: ${expr}`);
}

module.exports = Object.freeze({
  prStr,
});
