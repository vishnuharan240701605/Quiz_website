/* ================================================================
   games.js  –  ZenMind Brain Boost Games
   4 games: Memory Cards, Math Sprint, Quick Quiz, Word Puzzle
================================================================ */

// ── On page load: auto-start a game if ?game= param is present ──
window.addEventListener('load', function () {
  var gameParam = new URLSearchParams(window.location.search).get('game');
  if (gameParam) showGame(gameParam + '-game');
});


// ================================================================
//  NAVIGATION
// ================================================================

function showGame(gameId) {
  // Hide everything, then show the requested game section
  document.querySelectorAll('.container').forEach(function (el) {
    el.classList.add('hidden');
  });
  document.getElementById(gameId).classList.remove('hidden');

  // Initialise the correct game
  if (gameId === 'memory-game') initMemory();
  if (gameId === 'math-game')   initMath();
  if (gameId === 'quiz-game')   initQuiz();
  if (gameId === 'word-game')   initWord();
}

function showMenu() {
  document.querySelectorAll('.container').forEach(function (el) {
    el.classList.add('hidden');
  });
  document.getElementById('main-menu').classList.remove('hidden');
}

// Return to dashboard, keeping the username in the URL
function goToDashboard() {
  var user = new URLSearchParams(window.location.search).get('user')
          || localStorage.getItem('zenmind_user')
          || '';
  window.location.href = 'dashboard.html' + (user ? '?user=' + encodeURIComponent(user) : '');
}


// ================================================================
//  HELPER
// ================================================================

function shuffle(arr) {
  // Fisher-Yates shuffle
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}


// ================================================================
//  1. MEMORY CARDS
//     4×4 grid, 8 emoji pairs. Click to flip; matching pair stays
//     open; non-matching pair flips back after 900 ms.
// ================================================================

var EMOJIS = ['🍎', '🎮', '🌟', '🎵', '🚀', '🎨', '🌈', '🎭'];

var mem_flipped  = [];   // holds the 1-2 currently face-up cards
var mem_matched  = 0;    // number of matched pairs
var mem_locked   = false; // block clicks while animating

function initMemory() {
  mem_flipped = [];
  mem_matched = 0;
  mem_locked  = false;

  document.getElementById('memory-pairs').textContent  = '0';
  document.getElementById('memory-result').classList.add('hidden');

  // Build deck: each emoji appears twice, then shuffle
  var deck  = shuffle(EMOJIS.concat(EMOJIS));
  var board = document.getElementById('memory-board');
  board.innerHTML = '';

  deck.forEach(function (emoji) {
    var card = document.createElement('div');
    card.className       = 'memory-card';
    card.dataset.emoji   = emoji;
    card.addEventListener('click', function () { flipCard(card); });
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (mem_locked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  card.textContent = card.dataset.emoji;
  mem_flipped.push(card);

  if (mem_flipped.length === 2) {
    mem_locked = true;
    checkMemoryMatch();
  }
}

function checkMemoryMatch() {
  var a = mem_flipped[0];
  var b = mem_flipped[1];

  if (a.dataset.emoji === b.dataset.emoji) {
    // ✅ Matched
    a.classList.replace('flipped', 'matched');
    b.classList.replace('flipped', 'matched');
    mem_matched++;
    document.getElementById('memory-pairs').textContent = mem_matched;
    mem_flipped = [];
    mem_locked  = false;

    if (mem_matched === 8) {
      document.getElementById('memory-result').classList.remove('hidden');
    }
  } else {
    // ❌ No match – flip back after delay
    setTimeout(function () {
      a.classList.remove('flipped'); a.textContent = '';
      b.classList.remove('flipped'); b.textContent = '';
      mem_flipped = [];
      mem_locked  = false;
    }, 900);
  }
}


// ================================================================
//  2. MATH SPRINT
//     10 random questions (+, −, ×). Type answer and submit.
//     Score shown after all 10 questions.
// ================================================================

var math_score  = 0;
var math_qnum   = 0;   // 0-based index of current question
var math_answer = 0;   // correct answer for current question

function initMath() {
  math_score = 0;
  math_qnum  = 0;

  document.getElementById('math-score').textContent    = '0';
  document.getElementById('math-qnum').textContent     = '1';
  document.getElementById('math-feedback').textContent = '';
  document.getElementById('math-feedback').className   = 'feedback';
  document.getElementById('math-result').classList.add('hidden');
  document.getElementById('math-restart').classList.add('hidden');
  document.getElementById('math-box').classList.remove('hidden');

  generateMathQuestion();
}

function generateMathQuestion() {
  var ops = ['+', '−', '×'];
  var op  = ops[Math.floor(Math.random() * ops.length)];
  var a, b;

  if (op === '+') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    math_answer = a + b;

  } else if (op === '−') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * a) + 1;   // b ≤ a so result ≥ 0
    math_answer = a - b;

  } else {   // ×
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    math_answer = a * b;
  }

  document.getElementById('math-question').textContent = a + '  ' + op + '  ' + b + '  = ?';
  document.getElementById('math-input').value          = '';
  document.getElementById('math-feedback').textContent = '';
  document.getElementById('math-feedback').className   = 'feedback';
  document.getElementById('math-input').focus();
}

function checkMathAnswer() {
  if (math_qnum >= 10) return;

  var raw = document.getElementById('math-input').value.trim();
  if (raw === '') return;

  var fb = document.getElementById('math-feedback');

  if (parseInt(raw, 10) === math_answer) {
    math_score++;
    fb.textContent = '✅ Correct!';
    fb.className   = 'feedback correct';
  } else {
    fb.textContent = '❌ Wrong! Answer was ' + math_answer;
    fb.className   = 'feedback wrong';
  }

  document.getElementById('math-score').textContent = math_score;
  math_qnum++;

  if (math_qnum >= 10) {
    // All 10 done – show result
    setTimeout(function () {
      document.getElementById('math-box').classList.add('hidden');
      var res = document.getElementById('math-result');
      res.textContent = '🏁 Done!  You scored  ' + math_score + ' / 10';
      res.classList.remove('hidden');
      document.getElementById('math-restart').classList.remove('hidden');
    }, 850);
  } else {
    document.getElementById('math-qnum').textContent = math_qnum + 1;
    setTimeout(generateMathQuestion, 850);
  }
}


// ================================================================
//  3. QUICK QUIZ
//     8 multiple-choice questions. Click an option to answer.
//     Correct option turns green; wrong turns red. Next → button
//     appears after answering.
// ================================================================

var QUIZ = [
  {
    q: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    answer: 2
  },
  {
    q: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    answer: 1
  },
  {
    q: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    answer: 1
  },
  {
    q: 'What is 7 × 8?',
    options: ['54', '56', '48', '64'],
    answer: 1
  },
  {
    q: 'Which gas do plants absorb from the air?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    answer: 2
  },
  {
    q: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3
  },
  {
    q: 'Who wrote Romeo and Juliet?',
    options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'],
    answer: 1
  },
  {
    q: 'What is the chemical symbol for water?',
    options: ['CO₂', 'O₂', 'H₂O', 'NaCl'],
    answer: 2
  }
];

var quiz_index    = 0;
var quiz_score    = 0;
var quiz_answered = false;

function initQuiz() {
  quiz_index    = 0;
  quiz_score    = 0;
  quiz_answered = false;

  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-qnum').textContent  = '1';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-restart').classList.add('hidden');
  document.getElementById('quiz-box').classList.remove('hidden');

  loadQuizQuestion();
}

function loadQuizQuestion() {
  quiz_answered = false;
  var q = QUIZ[quiz_index];

  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('next-btn').style.display    = 'none';

  var optDiv = document.getElementById('quiz-options');
  optDiv.innerHTML = '';

  q.options.forEach(function (text, i) {
    var btn       = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = text;
    btn.addEventListener('click', function () {
      selectQuizAnswer(btn, i === q.answer, q.answer);
    });
    optDiv.appendChild(btn);
  });
}

function selectQuizAnswer(clicked, isCorrect, correctIndex) {
  if (quiz_answered) return;
  quiz_answered = true;

  // Disable all options
  var allBtns = document.querySelectorAll('.quiz-opt');
  allBtns.forEach(function (b) { b.disabled = true; });

  // Always highlight the correct answer green
  allBtns[correctIndex].classList.add('correct');

  if (isCorrect) {
    quiz_score++;
    document.getElementById('quiz-score').textContent = quiz_score;
  } else {
    // Highlight the user's wrong pick red
    clicked.classList.add('wrong');
  }

  document.getElementById('next-btn').style.display = 'inline-block';
}

function nextQuizQuestion() {
  quiz_index++;

  if (quiz_index >= QUIZ.length) {
    document.getElementById('quiz-box').classList.add('hidden');
    var res = document.getElementById('quiz-result');
    res.textContent = '🏆 Quiz Done!  You scored  ' + quiz_score + ' / ' + QUIZ.length;
    res.classList.remove('hidden');
    document.getElementById('quiz-restart').classList.remove('hidden');
  } else {
    document.getElementById('quiz-qnum').textContent = quiz_index + 1;
    loadQuizQuestion();
  }
}


// ================================================================
//  4. WORD PUZZLE
//     8 words shown scrambled. Type the correct word and submit.
//     A hint is shown for each word.
// ================================================================

var WORDS = [
  { word: 'BRAIN',  hint: 'Organ that controls the body'        },
  { word: 'FOCUS',  hint: 'Concentrated attention'              },
  { word: 'PUZZLE', hint: 'A problem or game to solve'          },
  { word: 'MEMORY', hint: 'Ability to recall information'       },
  { word: 'LEARN',  hint: 'Acquire knowledge or skill'          },
  { word: 'SMART',  hint: 'Having quick intelligence'           },
  { word: 'THINK',  hint: 'Use your mind to reason'             },
  { word: 'SPEED',  hint: 'Rate of movement or action'          }
];

var word_index   = 0;
var word_score   = 0;
var current_word = '';

function scrambleWord(word) {
  var letters = word.split('');
  // Keep shuffling until the result is actually different from the original
  do {
    shuffle(letters);
  } while (letters.join('') === word);
  return letters.join('');
}

function initWord() {
  word_index = 0;
  word_score = 0;

  document.getElementById('word-score').textContent    = '0';
  document.getElementById('word-num').textContent      = '1';
  document.getElementById('word-feedback').textContent = '';
  document.getElementById('word-feedback').className   = 'feedback';
  document.getElementById('word-result').classList.add('hidden');
  document.getElementById('word-restart').classList.add('hidden');
  document.getElementById('word-box').classList.remove('hidden');

  loadWordPuzzle();
}

function loadWordPuzzle() {
  var item    = WORDS[word_index];
  current_word = item.word;

  document.getElementById('word-hint').textContent      = item.hint;
  document.getElementById('scrambled-word').textContent = scrambleWord(current_word);
  document.getElementById('word-input').value           = '';
  document.getElementById('word-feedback').textContent  = '';
  document.getElementById('word-feedback').className    = 'feedback';
  document.getElementById('word-input').focus();
}

function checkWordAnswer() {
  var typed = document.getElementById('word-input').value.trim().toUpperCase();
  if (!typed) return;

  var fb = document.getElementById('word-feedback');

  if (typed === current_word) {
    word_score++;
    fb.textContent = '✅ Correct!';
    fb.className   = 'feedback correct';
    document.getElementById('word-score').textContent = word_score;
  } else {
    fb.textContent = '❌ Wrong! It was "' + current_word + '"';
    fb.className   = 'feedback wrong';
  }

  word_index++;

  if (word_index >= WORDS.length) {
    setTimeout(function () {
      document.getElementById('word-box').classList.add('hidden');
      var res = document.getElementById('word-result');
      res.textContent = '🎯 Done!  You scored  ' + word_score + ' / ' + WORDS.length;
      res.classList.remove('hidden');
      document.getElementById('word-restart').classList.remove('hidden');
    }, 950);
  } else {
    document.getElementById('word-num').textContent = word_index + 1;
    setTimeout(loadWordPuzzle, 950);
  }
}
