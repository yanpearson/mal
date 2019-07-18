const { readStr } = require('./reader');
const { prStr } = require('./printer');
const { NIL, MalList } = require('./types');
const { Env } = require('./env');
const { ns } = require('./core');

const replEnv = Env(null);

for(let key of Object.getOwnPropertySymbols(ns)) {
  replEnv.set(key, ns[key]);
}

replEnv.set(Symbol.for('eval'), ast => eval(ast, replEnv));

function read(expr) {
  return readStr(expr);
}

function eval(ast, env) {
  while (true) {
    const isList = MalList.isList(ast);

    if (!isList) {
      return evalAst(ast, env);
    }

    if (ast.length === 0) {
      return ast;
    }

    switch(ast[0]) {
      case Symbol.for('def!'):
        const symbol = ast[1];
        const value = eval(ast[2], env);

        env.set(symbol, value);

        return value;

      case Symbol.for('let*'):
        const letEnv = Env(env);
        const bindings = ast[1];

        for (let i = 0; i < bindings.length; i = i + 2) {
          const symbol = bindings[i];
          const value = eval(bindings[i+1], letEnv);

          letEnv.set(symbol, value);
        }

        env = letEnv;
        ast = ast[2];

        break;

      case Symbol.for('do'):
        if (ast.length === 1) {
          ast.push(NIL);
        }

        ast.slice(1, -1).forEach(x => {
          eval(x, env);
        });

        ast = ast.slice(-1)[0];

        break;

      case Symbol.for('if'):
        const predicate = ast[1];
        const predicateResult = eval(predicate, env);

        if (predicateResult || predicateResult === '' || predicateResult === 0) {
          ast = ast[2];
          break;
        }

        ast = ast.length >= 4 ? ast[3] : NIL;

        break;

      case Symbol.for('fn*'):
        const fn1 = function(...args) {
          return eval(ast[2], Env(env, ast[1], args));
        };

        fn1.isUserDefined = true;
        fn1.ast = ast[2];
        fn1.params = ast[1];
        fn1.env = env;

        return fn1;

      default:
        const evaluated = evalAst(ast, env);
        const [ fn2 ] = evaluated;
        const args = evaluated.slice(1);

        if (!fn2.isUserDefined) {
          return fn2.apply(null, args);
        }

        ast = fn2.ast;
        env = Env(fn2.env, fn2.params, args);

        break;
    }
  }
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
    return `${e}\n`;
  }
}

function evalAst(ast, env) {
  if (typeof(ast) === 'symbol') {
    const value = env.get(ast);

    if (value !== 0 && value === NIL) {
      throw new Error(`Symbol not found: ${Symbol.keyFor(ast)}`);
    }

    return value;
  }

  if (Array.isArray(ast)) {
    return ast.map(a => eval(a, env));
  }

  return ast;
}

// functions
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) ")")))))');

// prompt
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

