const { NIL, MalList, MalNumber, MalSymbol, MalBoolean, MalString } = require('./types');

function Reader(tokens) {
  let _tokens = tokens;

  function next() {
    const [token, ...rest] = _tokens;
    _tokens = rest;
    return token;
  }

  function peek() {
    const [token] = _tokens;
    return token;
  }

  return Object.freeze({
    next,
    peek,
  });
}

function readStr(str) {
  return readForm(
      new Reader(
        tokenize(str)));
}

function tokenize(str) {
  const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return str
    .replace(/,/g, ' ')
    .match(re)
    .reduce((acc, cur) => {
      const token = cur.trim();
      if ('' !== token) {
        acc.push(token);
      }
      return acc;
  }, []);
}

function readForm(reader) {
  return reader.peek() === '(' ? readList(reader) : readAtom(reader);
}

function readList(reader) {
  reader.next();
  const list = [];
  let token = reader.peek();
  let balanced = false;
  while (token) {
    list.push(
      readForm(reader)
    );
    if (token === ')') {
      balanced = true;
      break;
    }
    token = reader.peek();
  }
  if (!balanced) {
    throw new Error('(EOF|end of input|unbalanced).');
  }
  return MalList.from(list.slice(0, -1));
}

function readAtom(reader) {
  const token = reader.next();
  // nil
  if ('nil' === token) {
    return NIL;
  }
  // Numeric
  if (MalNumber.canParse(token)) {
    return MalNumber.parse(token);
  }
  // Boolean
  if (MalBoolean.canParse(token)) {
    return MalBoolean.parse(token);
  }
  if (MalString.canParse(token)) {
    return MalString.parse(token);
  }
  // Symbol
  return MalSymbol.parse(token);
}

module.exports = Object.freeze({
  readStr,
});
