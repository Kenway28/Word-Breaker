keys = document.querySelectorAll(".key:not(.clear, .enter)");
levelOverlay = document.querySelector(".level-overlay");
btnLevel = document.querySelector(".btn-level");
let myWord = document.querySelector(".myWord");
let $timer = document.querySelector(".timer");
let $history = document.querySelector(".history");
let levels = document.querySelectorAll(".level-list li");
let targetWord = "";
let counter = 0;
let timer = 0;
let levelNum = 0;
wordsArray = [];
let record = {};
if (localStorage.getItem("wordB") == null) {
  record = { "level-4": 0, "level-5": 0, "level-6": 0 };
} else {
  record = JSON.parse(localStorage.getItem("wordB"));
}

levels.forEach((lvl) => {
  lvl.dataset.best = `Best Time : ${timeConverter(
    record[`level-${lvl.textContent}`]
  )}`;
});
levelOverlay.addEventListener("click", (event) => {
  if (event.target === levelOverlay) {
    levelOverlay.classList.toggle("active");
  }
});
btnLevel.addEventListener("click", (event) => {
  levelOverlay.classList.toggle("active");
  levels.forEach((lvl) => {
    lvl.dataset.best = `Best Time : ${timeConverter(
      record[`level-${lvl.textContent}`]
    )}`;
  });
});

console.log(record);
/******************* */
levels.forEach((lvl) => {
  lvl.addEventListener("click", () => {
    lvl.classList.add("level");
    levelOverlay.classList.toggle("active");
    levelNum = lvl.textContent;
    getWord(lvl.textContent);
  });
});

async function getWord(levelName) {
  clearInterval(counter);
  $timer.textContent = "00:00:00";
  timer = 0;
  const response = await fetch(`./${levelName}-letter-words.json`).catch(
    (err) => alert(err)
  );
  const data = await response.json();
  wordsArray = data;
  let index = Math.floor(Math.random() * data.length);
  targetWord = data[index];
  console.log(targetWord, index);
  generateGame(targetWord);
}
function generateGame(word) {
  myWord.innerHTML = "";
  $history.innerHTML = "";
  keys.forEach((key) => (key.className = `key`));
  let line = document.createElement("div");
  line.className = "line";
  for (let j = 0; j < word.length; j++) {
    let letter = document.createElement("span");
    letter.className = "letter";
    line.appendChild(letter);
  }
  myWord.appendChild(line);
  counter = setInterval(() => {
    // console.log((timer += 1));

    $timer.innerHTML = timeConverter((timer += 1));
  }, 1000);
}

/******************* */

document.body.addEventListener("keydown", (event) => {
  let wordLine = document.querySelector(".myWord .line");

  if (event.key.match(/[a-z]/) && event.key.length == 1) {
    for (let i = 0; i < Array.from(wordLine.children).length; i++) {
      if (Array.from(wordLine.children)[i].innerHTML == "") {
        Array.from(wordLine.children)[i].innerHTML = event.key.toUpperCase();
        break;
      }
    }
  }
  if (event.key == "Backspace") {
    for (let i = Array.from(wordLine.children).length - 1; i > -1; i--) {
      if (Array.from(wordLine.children)[i].innerHTML != "") {
        Array.from(wordLine.children)[i].innerHTML = "";
        break;
      }
    }
  }
  if (event.key == "Enter") {
    let emptyLetter = wordLine.querySelectorAll(".letter:empty").length;
    let boxes = Array.from(wordLine.children);

    let inputWord = boxes.map((e) => e.textContent).join("");
    if (emptyLetter == 0 && wordsArray.includes(inputWord)) {
      boxes.forEach((box) => {
        box.style.transitionDelay = `${0.05 * boxes.indexOf(box)}s`;
        if (targetWord.includes(box.innerHTML)) {
          if (targetWord.charAt(boxes.indexOf(box)) === box.innerHTML) {
            box.className = "letter match";
          } else {
            box.className = "letter notPlaced";
          }
        } else {
          box.className = "letter noMatch";
        }

        keys.forEach((key) => {
          if (key.innerHTML.toUpperCase() == box.innerHTML) {
            key.className = `key ${box.className.split(" ")[1]}`;
          }
        });
      });
      let correctLetters = boxes.filter((e) =>
        e.classList.contains("match")
      ).length;

      let clone = wordLine.cloneNode(true);
      setTimeout(() => {
        $history.prepend(clone);
        for (let i = 0; i < Array.from(wordLine.children).length; i++) {
          Array.from(wordLine.children)[i].innerHTML = "";
          Array.from(wordLine.children)[i].className = "letter";
        }
      }, 1200);
      setTimeout(() => {
        if (correctLetters == targetWord.length) {
          clearInterval(counter);
          alert(`Winner... \nYour time is ${timeConverter(timer)}`);
          if (record[`level-${levelNum}`] < timer) {
            record[`level-${levelNum}`] = timer;
          }
          saveData(record);
        }
      }, 1500);
    } else {
      wordLine.classList.add("shake");
      setTimeout(() => {
        wordLine.classList.remove("shake");
      }, 870);
      // console.log("shake line");
    }
  }
});

function timeConverter(time) {
  let hours = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  let minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  let secends = Math.floor((time % 3600) % 60)
    .toString()
    .padStart(2, "0");
  // console.log(hours, minutes, secends);
  return `${hours}:${minutes}:${secends}`;
}

function saveData(record) {
  localStorage.setItem("wordB", JSON.stringify(record));
}
