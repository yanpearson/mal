// Nil
const NIL = null;

// List
function isList(obj) {
  return Array.isArray(obj);
}

function fromArray(arr) {
  return Array.from(arr);
}

const MalList = Object.freeze({
  isList,
  from: fromArray,
});

// Number
function isNumber(obj) {
  return typeof(obj) === 'number';
}

function canParseNumber(str) {
  if (typeof(str) != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

function parseNumber(str) {
  if (!canParseNumber(str)) {
    throw new Error(`Cannot parse value as number: ${str}`);
  }
  return Number(str);
}

const MalNumber = Object.freeze({
  isNumber,
  canParse: canParseNumber,
  parse: parseNumber,
});

// Symbol
function isSymbol(obj) {
  return typeof(obj) === 'symbol';
}

function parseSymbol(str) {
  return Symbol.for(str);
}

const MalSymbol = Object.freeze({
  isSymbol,
  parse: parseSymbol,
});

// Boolean
function isBoolean(obj) {
  return typeof(obj) === 'boolean';
}

function canParseBoolean(str) {
  return str === 'true' || str === 'false';
}

function parseBoolean(str) {
  if (!canParseBoolean(str)) {
    throw new Error(`Cannot parse value as boolean: ${str}`);
  }
  if ('true' === str) {
      return true;
  }
  if ('false' === str) {
      return false;
  }
  throw new Error('Unexpected error.');
}

const MalBoolean = Object.freeze({
  isBoolean,
  canParse: canParseBoolean,
  parse: parseBoolean,
});

// String
function isString(obj) {
  return typeof(obj) === 'string';
}

function canParseString(str) {
  return str.startsWith('"');
}

function parseString(str) {
  if (!canParseString(str)) {
    throw new Error(`Cannot parse value as string: ${str}`);
  }

  if (!str.endsWith('"')) {
    throw new Error('(EOF|end of input|unbalanced).');
  }

  return str
    .slice(1, -1)
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

const MalString = Object.freeze({
  isString,
  canParse: canParseString,
  parse: parseString,
});

module.exports = Object.freeze({
  NIL,
  MalList,
  MalNumber,
  MalSymbol,
  MalBoolean,
  MalString,
});
