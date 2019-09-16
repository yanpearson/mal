const { readStr } = require('./reader');
const { prStr } = require('./printer');
const { NIL, MalList, MalSymbol, MalError } = require('./types');
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
    if (!MalList.isList(ast)) {
      return evalAst(ast, env);
    }

    ast = macroExpand(ast, env);

    if (!MalList.isList(ast)) {
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
        const userFn = function(...args) {
          return eval(ast[2], Env(env, ast[1], args));
        };

        userFn.isUserFn = true;
        userFn.ast = ast[2];
        userFn.params = ast[1];
        userFn.env = env;

        return userFn;

      case Symbol.for('quote'):
        return ast[1];

      case Symbol.for('quasiquote'):
        const isPair = xs => Array.isArray(xs) && xs.length && xs.length > 0;
        const quasiquote = ast => {
          if (!isPair(ast)) {
            return [Symbol.for('quote'), ast];
          }

          if (ast[0] === null) {
            return [Symbol.for('list'), NIL];
          }

          if (!ast[0]) {
            return [];
          }

          if (Symbol.for('unquote') === ast[0]) {
            return ast[1];
          }

          if (Symbol.for('splice-unquote') === ast[0][0]) {
            return [Symbol.for('concat'), ast[0][1], quasiquote(ast.slice(1))];
          }

          return [Symbol.for('cons'), quasiquote(ast[0]), quasiquote(ast.slice(1))];
        };

        ast = quasiquote(ast[1]);

        break;

      case Symbol.for('defmacro!'):
        const macroFn = eval(ast[2], env);

        macroFn.isMacro = true;

        env.set(ast[1], macroFn);

        return ast[1];

      case Symbol.for('macroexpand'):
        return macroExpand(ast[1], env);

      case Symbol.for('try*'):
        try {
          return eval(ast[1], env);
        }
        catch (err) {
          if (!Symbol.for('catch*') === ast[2][0]) {
            throw new Error('The catch* symbol was not found inside a try* clause.');
          }

          const throwEnv = Env(env);
          throwEnv.set(ast[2][1], typeof(err.throwedValue) === 'undefined' ? err.message : err.throwedValue);

          return eval(ast[2][2], throwEnv);
        }

      default:
        const evaluated = evalAst(ast, env);
        const [ fn2 ] = evaluated;
        const args = evaluated.slice(1);

        if (!fn2.isUserFn) {
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
    return `${e.message}\n`;
  }
}

function evalAst(ast, env) {
  if (typeof(ast) === 'symbol') {
    const value = env.get(ast);

    if (value !== 0 && value === NIL) {
      throw MalError({ message: `Symbol not found: ${Symbol.keyFor(ast)}` });
    }

    return value;
  }

  if (Array.isArray(ast)) {
    return ast.map(a => eval(a, env));
  }

  return ast;
}

function isMacroCall(ast, env) {
  if (!MalList.isList(ast)) {
    return false;
  }

  if (ast.lenght === 0) {
    return false;
  }

  if (!MalSymbol.isSymbol(ast[0])) {
    return false;
  }

  const v = env.find(ast[0]);

  if (v === NIL) {
    return false;
  }
  
  return env.get(ast[0]).isMacro;
}

function macroExpand(ast, env) {
  while (isMacroCall(ast, env)) {
    const symbol = ast[0];
    const fn = env.get(symbol);
    ast = fn.apply(null, ast.slice(1));
  }
  return ast;
}

// functions
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) ")")))))');
rep("(def! not (fn* (a) (if a false true)))");

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

