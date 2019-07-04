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

module.exports = Object.freeze({
  MalList,
  MalNumber,
  MalSymbol,
});
