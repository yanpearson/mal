const { readStr } = require('./reader');
const { prStr } = require('./printer');
const { MalList } = require('./types');

const replEnv = {
  [Symbol.for('+')]: (a, b) => a + b,
  [Symbol.for('-')]: (a, b) => a - b,
  [Symbol.for('*')]: (a, b) => a * b,
  [Symbol.for('/')]: (a, b) => a / b,
};


function read(expr) {
  return readStr(expr);
}

function eval(ast, env) {
  const isList = MalList.isList(ast);

  if (!isList) {
    return evalAst(ast, env);
  }

  if (ast.length === 0) {
    return ast;
  }

  const evaluated = evalAst(ast, env);
  const fn = evaluated[0];
  const args = evaluated.slice(1);

  return fn(...args);
}

function print(expr) {
  return prStr(expr, true);
}

function rep(expr) {
  try {
    return `${print(
      eval(
        read(expr), replEnv))}\n`;
  }
  catch (e) {
    return `${e.message}\n`;
  }
}

function evalAst(ast, env) {
  if (typeof(ast) === 'symbol') {
    const value = env[ast];

    if (value == null) {
      throw new Error(`Symbol not found: ${Symbol.keyFor(ast)}`);
    }

    return value;
  }

  if (Array.isArray(ast)) {
    return ast.map(a => eval(a, env));
  }

  return ast;
}


const prompt = 'user> ';

process.stdin.setEncoding('utf8');

process.stdout.write(prompt);

process.stdin.on('readable', () => {
  let chunk;

  while ((chunk = process.stdin.read()) !== null) {
    process.stdout.write(rep(chunk));
  }

  process.stdout.write(prompt);
});

process.stdin.on('end', () => {
  // eof received
  process.stdout.write('\n');
});

