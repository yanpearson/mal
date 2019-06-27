function read(arg) {
  return arg;
}

function eval(arg) {
  return arg;
}

function print(arg) {
  return arg;
}

function rep(arg) {
  return read(
    eval(
      print(arg)
    )
  );
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

