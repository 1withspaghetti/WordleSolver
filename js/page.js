console.log(NYTWordPicks.length + " "+ NYTWordList.length)

var page_auto = document.getElementById("page_auto");
var page_gen = document.getElementById("page_gen");

var page_auto_button = document.getElementById("page_auto_button");
var page_gen_button = document.getElementById("page_gen_button");

// Page switching
page_auto_button.addEventListener("click", (e) => {
    page_auto.classList.remove("hidden");
    page_gen.classList.add("hidden");
    page_gen_button.classList.remove("selected");
    page_auto_button.classList.add("selected");
});
page_gen_button.addEventListener("click", (e) => {
    page_gen.classList.remove("hidden");
    page_auto.classList.add("hidden");
    page_auto_button.classList.remove("selected");
    page_gen_button.classList.add("selected");
});

/*  ####################  */
/*   Start of AutoSolve   */
/*  ####################  */

var paused = true

var vis_off = document.getElementById("visibility_off");
var vis_on = document.getElementById("visibility_on");

var nav_previous = document.getElementById("nav_previous");
var nav_play = document.getElementById("nav_play");
var nav_pause = document.getElementById("nav_pause");
var nav_next = document.getElementById("nav_next");
var nav_slider = document.getElementById("nav_slider");

// Showing/hiding the answer
vis_off.addEventListener("click", (e) => {
    vis_off.classList.add("hidden");
    vis_on.classList.remove("hidden");
});
vis_on.addEventListener("click", (e) => {
    vis_on.classList.add("hidden");
    vis_off.classList.remove("hidden");
});

// Controling the flow and pausing
nav_previous.addEventListener("click", (e) => {
    rewind();
});
nav_play.addEventListener("click", (e) => {
    nav_play.classList.add("hidden");
    nav_pause.classList.remove("hidden");
    //autoPlay = setInterval(playRound, autoPlayDelay);
    paused = false;
});
nav_pause.addEventListener("click", (e) => {
    nav_pause.classList.add("hidden");
    nav_play.classList.remove("hidden");
    //clearInterval(autoPlay);
    paused = true;
});
nav_next.addEventListener("click", (e) => {
    playRound();
});

var gamesWon = 0;
var gamesLost = 0;
var autoPlay;
var gameManager = new GameManager(NYTWordPicks, false);
var bot = new WordleBot(NYTWordList);
reset();

var timeToNext = 0;
function timer() {
    if (!paused) {
        if (timeToNext <= 0) {
            timeToNext = (nav_slider.max - nav_slider.value);
            playRound();
        } else timeToNext--;
    }
}
setInterval(timer, 1);

// Enters a single word or resets on win/lose
function playRound() {
    if (checkWin(gameManager.board[gameManager.board.length-1])) {
        gamesWon++;
        reset();
    } else if (gameManager.currentRow < 6) {
        var guess = bot.evaluate(gameManager.board);
        //var guess = gameManager.word;
        gameManager.submitWord(guess);
    } else {
        //clearInterval(autoPlay); return;
        gamesLost++;
        reset();
    }
    //playRound();
}

// Resets the board
function reset() {
    gameManager.reset();
    
    for (let i of document.getElementById("autogame").getElementsByTagName("ROW")) {
        while (i.firstChild) {
            i.removeChild(i.firstChild);
        }
        for (let l = 0; l < 5; l++)
            i.appendChild(document.createElement('l'))
    }
    document.getElementById("word").innerText = gameManager.word;
    updateStats();
}

// Undo a guess
function rewind() {
    if (gameManager.currentRow > 0) {
        gameManager.currentRow--;
        gameManager.board.pop();
        var row = document.getElementById("autogame").getElementsByTagName("ROW")[gameManager.currentRow];
        while (row.firstChild)
            row.removeChild(row.firstChild);
        for (let l = 0; l < 5; l++)
            row.appendChild(document.createElement('l'))
    } else {
        reset();
    }
}

// Check if all letters are green
function checkWin(row) {
    if (!row) return false;
    for (const r of row.score) if (r != 2) return false;
    return true;
}

// Updates the statistics at the bottom
function updateStats() {
    document.getElementById("games-played").innerText = gamesWon + gamesLost;
    document.getElementById("games-won").innerText = gamesWon;
    document.getElementById("win-percent").innerText = Math.round(gamesWon / (gamesWon + gamesLost) * 100) + "%";
}

/*  ####################  */
/*     Start of Solver    */
/*  ####################  */

var selectedRow = 0;
var selectedLetter = 0;

// Typing in letters
document.addEventListener("keypress", (e) => {
    if (page_gen_button.classList.contains("selected") && "abcdefghijklmnopqrstuvwxyz".includes(e.key)) {
        var elm = getLetter(selectedRow, selectedLetter);
        elm.innerHTML = e.key;
        elm.setAttribute("score","0");
        elm.classList.remove("selected");
        
        if (selectedRow < 5 || selectedLetter < 4) {
            selectedLetter++;
            if (selectedLetter > 4) {
                selectedLetter = 0;
                selectedRow++;
            }
        }
        getLetter(selectedRow, selectedLetter).classList.add("selected");
        document.getElementById("solve_suggestion").innerText = solve();
    }
})

// Backspace on a letter
document.addEventListener("keydown", (e) => {
    if (page_gen_button.classList.contains("selected") && e.key === "Backspace") {
        var elm = getLetter(selectedRow, selectedLetter);
        if (elm.innerHTML.length > 0) {
            elm.innerHTML = "";
            elm.removeAttribute("score");
            document.getElementById("solve_suggestion").innerText = solve();
        } else {
            elm.classList.remove("selected");
            if (selectedRow > 0 || selectedLetter > 0) {
                selectedLetter--;
                if (selectedLetter < 0) {
                    selectedLetter = 4;
                    selectedRow--;
                }
            }
            elm = getLetter(selectedRow, selectedLetter);
            elm.innerHTML = "";
            elm.removeAttribute("score");
            elm.classList.add("selected");
            document.getElementById("solve_suggestion").innerText = solve();
        }
    }
});

// Selecting a space
document.getElementById("inputgame").addEventListener("click", (e) => {
    if (e.target.tagName == "L") {
        getLetter(selectedRow, selectedLetter).classList.remove("selected");
        selectedRow = Array.prototype.indexOf.call(document.getElementById("inputgame").children, e.target.parentNode);
        selectedLetter = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
        getLetter(selectedRow, selectedLetter).classList.add("selected");
    }
});

// R-Clicking to change type
document.getElementById("inputgame").addEventListener('contextmenu', (e) => {
    e.preventDefault();
    var row = Array.prototype.indexOf.call(document.getElementById("inputgame").children, e.target.parentNode);
    var l = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
    var elm = getLetter(row,l);
    if (elm.getAttribute("score")) {
        var score = elm.getAttribute("score");
        score++;
        if (score > 2) score = 0;
        elm.setAttribute("score", score);
        document.getElementById("solve_suggestion").innerText = solve();
    }
});

// Clear and reset the board
document.getElementById("solve_clear").addEventListener("click", (e) => {
    for (let i of document.getElementById("inputgame").getElementsByTagName("ROW")) {
        while (i.firstChild) {
            i.removeChild(i.firstChild);
        }
        for (let l = 0; l < 5; l++)
            i.appendChild(document.createElement('l'))
    }
    selectedRow = 0;
    selectedLetter = 0;
    getLetter(selectedRow, selectedLetter).classList.add("selected");
    document.getElementById("solve_suggestion").innerText = "SOARE";
});

document.getElementById("solve_solve").addEventListener("click", (e) => {
    document.getElementById("solve_suggestion").innerText = solve();
});

// Solves and finds the next best word to enter
function solve() {
    var board = [];
    for (let row of document.getElementById("inputgame").getElementsByTagName("ROW")) {
        var data = {
            "word":"",
            "score":[]
        };
        for(let letter of row.getElementsByTagName("L")) {
            if (letter.hasAttribute("score") && letter.innerHTML.length > 0) {
                data.word += letter.innerHTML;
                data.score.push(parseInt(letter.getAttribute("score")));
            }
        }
        if (data.word.length == 5 && data.score.length == 5)
            board.push(data);
        else if (data.word.length > 0 || data.score.length > 0)
            return "Invalid Input";
    }
    var word = bot.evaluate(board);
    if (word == "xxxxx") return "No word matches criteria";
    return word.toUpperCase();
}

// Gets the letter at a certain position
function getLetter(row, l) {
    return document.getElementById("inputgame")
        .getElementsByTagName("ROW")[row]
        .getElementsByTagName("L")[l]
}