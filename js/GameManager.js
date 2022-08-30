class GameManager {
    wordList;

    testMode;
    testIndex;

    board = [];
    word = "";
    currentRow = 0;

    constructor(wordList, test = false) {
        this.wordList = wordList;
        this.testMode = test;
        this.testIndex = 0;
    }
    
    reset() {
        this.currentRow = 0;
        this.board = [];
        if (this.testMode) {
            this.word = this.wordList[this.testIndex]
            this.testIndex++;
        } else //this.word = "being";
            this.word = this.wordList[Math.floor(Math.random()*this.wordList.length)];
    }
    
    submitWord(word="", delay=true) {
        if (word.length != 5) throw new Error("Invalid word: "+word);
        
        var row = document.getElementById("autogame").getElementsByTagName("ROW")[this.currentRow];
        for (let i = 0; i < word.length; i++) {
            let l = row.children[i];
            l.innerHTML = word.charAt(i);
        }
        var result = this.compareWord(word);
        for (let i = 0; i < word.length; i++) {
            let l = row.children[i];
            l.setAttribute("score",result[i]);
        }
        this.currentRow++;
        this.board.push({
            "word": word,
            "score": result
        });
    }
    
    compareWord(guess="") {
        var res = [0,0,0,0,0];
		var used = [false, false, false, false, false];
		for(let i = 0; i < 5; i++) {
			if (guess.charAt(i) == this.word.charAt(i)) {
				res[i] = 2;
				used[i] = true;
			}	
		}
		for(let i = 0; i < 5; i++) {
			var x = guess.charAt(i);
			for (let l = 0; l < 5; l++)
				if (x == this.word.charAt(l) && used[l] == false && res[i] == 0) {
					res[i] = 1;
					used[l] = true;
				}
		}
		return res;
    }
}