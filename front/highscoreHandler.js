const highScoresListElement = document.getElementById("highscores");

const printHighScores = () => {
  fetch("http://localhost:42069/highscores")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (!data) {
        highScoresListElement.innerHTML = "No high scores yet!";
        return;
      }
      highScoresListElement.innerHTML = "";
      data.forEach((score) => {
        let scoreElement = document.createElement("li");
        scoreElement.innerText = `${score.name}: ${score.score}`;
        highScoresListElement.appendChild(scoreElement);
      });
    });
};

printHighScores();

window.addEventListener(
  "keydown",
  function (e) {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1
    ) {
      e.preventDefault();
    }
  },
  false,
);
