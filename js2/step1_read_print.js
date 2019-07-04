const { readStr } = require('./reader');
const { prStr } = require('./printer');

function read(expr) {
  return readStr(expr);
}

function eval(expr) {
  return expr;
}

function print(expr) {
  return prStr(expr);
}

function rep(expr) {
  return `${print(
    eval(
      read(expr)))}\n`;
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

