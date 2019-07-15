const { readStr } = require('./reader');
const { prStr } = require('./printer');
const { Env } = require('./env');
const { ns } = require('./core');

const replEnv = Env();

for(let key of Object.getOwnPropertySymbols(ns)) {
  replEnv.set(key, ns[key]);
}

replEnv.set(Symbol.for('eval'), ast => eval(ast, replEnv));

function read(str) {
  return readStr(str);
}

function eval(ast, env) {

  trace(ast, env);

  while (true) {
    if (!Array.isArray(ast)) {
      return evalAst(ast, env);
    }

    if (ast.length === 0) {
      return ast;
    }

    switch (ast[0]) {
      case Symbol.for('def!'):
        const symbol = ast[1];
        const value = eval(ast[2], env);

        env.set(symbol, value);

        return value;

      case Symbol.for('let*'):
        const letEnv = Env(replEnv);
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
        ast.slice(1, -1).forEach(x => {
          eval(x, env);
        });
        ast = ast.slice(-1);
        break;

      case Symbol.for('if'):
        const predicate = ast[1];
        const result = eval(predicate, env);
        if (result || result === 0) {
          ast = ast[2];
          break;
        }
        ast = ast.length >= 4 ? ast[3] : Symbol.for('nil');
        break;

      case Symbol.for('fn*'):
        const getEnv = args => Env(env, ast[1], args);
        return {
          isUserDefined: true,
          ast: ast[2],
          params: ast[1],
          getEnv,
          //fn: () => eval(ast[2], Env(env, ast[1], arguments)),
        };

      default:
        const evaluated = evalAst(ast, env);
        const fn = evaluated[0];
        const args = evaluated.slice(1);

        if (!fn.isUserDefined) {
          return fn.apply(null, args);
        }

        ast = fn.ast;
        env = fn.getEnv(args);
        break;
    }
  }
}

function evalAst(ast, env) {
  if (typeof(ast) === 'symbol') {
    const value = env.get(ast);

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

function trace(ast, env) {
  if (false) {
    console.debug(`ast: ${print(ast)}env: ${env._dump()}`);
    console.debug('==================================================');
  }
}

function print(sexpr) {
  return `${prStr(sexpr)}\n`;
}

function rep(atom) {
  try {
    return print(eval(read(atom), replEnv));
  }
  catch (err) {
    return `${err.message}\n`;
  }
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

