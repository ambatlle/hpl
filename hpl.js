import fs from 'fs';

function handsDef() {
  return {
    '👈': moveLeft,
    '👉': moveRight,
    '👇': dec,
    '👆': inc,
    '🤜': repeatIfNotZero,
    '🤛': repeatIfZero,
    '👊': print
  }
}

function createLoopFunction(hand, instructions) {
  let fnLoop = handsDef()[hand];
  return function (tape, tapeIndex) {
    return fnLoop(instructions, tape, tapeIndex);
  }
}

function createFunction(hand) {
  let fn = handsDef()[hand];
  return function (tape, tapeIndex) {
    return fn(tape, tapeIndex);
  }
}

const parseHands = (hands, position = 0, opened = null) => {
  let currentPosition = position;
  let parsed = { context: [], position: 0};
  let currentHand = null;

  while (currentPosition < hands.length) {
    currentHand = hands[currentPosition];

    if ((currentHand === '🤜' && (opened === null || opened === '🤜')) || (currentHand === '🤛' && (opened === null || opened === '🤛'))) {
      let loopInstructions = parseHands(hands, currentPosition + 1, currentHand);
      currentPosition = loopInstructions.position;
      let fn = createLoopFunction(currentHand, loopInstructions.context);
      parsed.context[parsed.context.length] = fn;
    } else if ((opened === '🤜' && currentHand === '🤛') || (opened === '🤛' && currentHand === '🤜')) {
      return { context: parsed.context, position: currentPosition };
    }
    else {
      parsed.context[parsed.context.length] = createFunction(currentHand);
    }
    currentPosition = currentPosition + 1;
  }
  return parsed;
}

const repeatIfZero = (instructions, tape, tapeIndex) => {
  let loopTapeIndex = tapeIndex;
  while (tape[loopTapeIndex] === 0) {
    for(let i = 0; i < instructions.length; i++) {
      loopTapeIndex = instructions[i](tape, loopTapeIndex);
    }
  }
  return loopTapeIndex;
}

const repeatIfNotZero = (instructions, tape, tapeIndex) => {
  let loopTapeIndex = tapeIndex;
  while (tape[loopTapeIndex] !== 0) {
    for(let i = 0; i < instructions.length; i++) {
      loopTapeIndex = instructions[i](tape, loopTapeIndex);
    }
  }
  return loopTapeIndex;
}

const moveLeft = (tape, currentTapeIndex) => {
  return currentTapeIndex - 1;
}

const moveRight = (tape, currentTapeIndex) => {
  if (currentTapeIndex + 1 >= tape.length) {
    tape[tape.length] = 0;
  }
  return currentTapeIndex + 1;
}

const inc = (tape, currentTapeIndex) => {
  tape[currentTapeIndex] = (tape[currentTapeIndex] + 1) % 256;
  return currentTapeIndex;
}

const dec = (tape, currentTapeIndex) => {
  tape[currentTapeIndex] = (((tape[currentTapeIndex] - 1) % 256) + 256) % 256;
  return currentTapeIndex;
}

const print = (tape, currentTapeIndex) => {
  process.stdout.write(String.fromCharCode(tape[currentTapeIndex]));
  return currentTapeIndex;
}

const main = () => {
  const tokens = [...fs.readFileSync(process.argv[2] || './inputs/hello.txt', 'utf-8')];
  var execTree = parseHands(tokens);
  let tape = [0];
  let tapeIndex = 0;
  for(let i = 0; i < execTree.context.length; i++) {
    tapeIndex = execTree.context[i](tape, tapeIndex);
  }
}

main();