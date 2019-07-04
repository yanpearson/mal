const { MalList, MalNumber, MalSymbol } = require('./types');

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
  while (token && token !== ')') {
    list.push(
      readForm(reader)
    );
    token = reader.peek();
  }
  return MalList.from(list);
}

function readAtom(reader) {
  const token = reader.next();
  // Numeric
  if (MalNumber.canParse(token)) {
    return MalNumber.parse(token);
  }
  // Symbol
  return MalSymbol.parse(token);
}

module.exports = Object.freeze({
  readStr,
});
