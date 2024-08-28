const highScoresListElement = document.getElementById("highscores");

const printHighScores = () => {
  // fetch("https://snakes-production.up.railway.app/highscores")
  fetch("http://localhost:8080/highscores")
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
        let listElement = document.createElement("li");
        let nameElement = document.createElement("p");
        let scoreElement = document.createElement("p");
        nameElement.innerText = score.name;
        scoreElement.innerText = score.score;
        listElement.appendChild(nameElement);
        listElement.appendChild(scoreElement);

        highScoresListElement.appendChild(listElement);
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
