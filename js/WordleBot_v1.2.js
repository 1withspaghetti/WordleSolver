class WordleBot {

    // The list of all possible words that can be entered into wordle
    wordList;

    constructor(wordList) {
        this.wordList = wordList;
    }

    evaluate(board) {
        if (board.length == 0) return "soare";
        var greens = [null,null,null,null,null];
        var yellows = [[],[],[],[],[]];
        var includes = [];
        var grays = [];

        // Assembles the board into more computer friendly lists shown above
        for (const row of board) {
            var rowIncludes = [];
            for (let i = 0; i < 5; i++) {
                if (row.score[i] == 2) {
                    greens[i] = row.word.charAt(i);
                    rowIncludes.push(row.word.charAt(i));
                } else if (row.score[i] == 1) {
                    yellows[i].push(row.word.charAt(i));
                    rowIncludes.push(row.word.charAt(i));
                } else 
                    grays.push(row.word.charAt(i));
            }
            for (const i of includes) {
                const l = rowIncludes.indexOf(i);
                if (l > -1) rowIncludes.splice(l, 1)
            }
            includes = includes.concat(rowIncludes);
        }

        // Checks evey word if it matches the criteria and gets a list
        var matches = [];
        for (const w of this.wordList) {
            if (matches.length < 6 && this.checkWord(w, greens, yellows, includes, grays)) {
                matches.push(w);
            }
        }
        // Detection for similar words with 3 or 4 greens on each
        // Otherwise returns the first word that matches the criteria
        if (6 - board.length < matches.length && board.length < 5 && greens.filter((v) => (v == null)).length <= 2) {
            // Gets the list of the "grays" out of the similar possible answers
            var possibleGrays = [];
            for (const match of matches) {
                for (let i = 0; i < 5; i++) {
                    if (match.charAt(i) != greens[i]) possibleGrays.push(match.charAt(i));
                }
            }
            // Finds a word that contains the most amount of grays found before
            var highestInfo = 0;
            var highestWord = "xxxxx";
            for (const w of this.wordList) {
                var info = 0;
                for (const g of possibleGrays) {
                    if (w.indexOf(g) != -1) info++;
                }
                if (info > highestInfo) {
                    highestInfo = info;
                    highestWord = w;
                    //console.log("New highest: "+w+" "+info);
                }
            }
            return highestWord;
        } else {
            return matches[0] || "xxxxx";
        }
    }
    
    // function for checking if a singular word matches the criteria
    checkWord(word, greens, yellows, includes, grays) {
        var used = [false,false,false,false,false]
        var newIncludes = includes;
        for (let i = 0; i < 5; i++) {
            if (greens[i] != null) {
                if (word.charAt(i) == greens[i]) {
                    used[i] = true;
                    const l = newIncludes.indexOf(word.charAt(i));
                    if (l > -1) newIncludes.splice(l, 1)
                }
                else return false;
            }
            if (yellows[i].includes(word.charAt(i))) return false;
        }
        for (let l of includes) {
            var found = false;
            for(let i = 0; i < word.length; i++) {
                if (!found && !used[i] && word.charAt(i) == l) {
                    used[i] = true;
                    found = true;
                }
            }
            if (found == false) return false;
        }
        for (let i = 0; i < 5; i++)
            if (!used[i] && grays.indexOf(word.charAt(i)) > -1) return false;
        /*console.log({
            "word":word,
            "used":used,
            "includes":includes,
            "newIncludes":newIncludes
        })*/
        return true;
    }
}