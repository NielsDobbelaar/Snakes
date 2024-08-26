class SocketHandler {
  constructor(address, uuid) {
    this.uuid = uuid;
    this.socket = new WebSocket(address);

    // When connected, send a message to the server
    this.socket.onopen = () => {
      console.log("Connected to server");
      this.socket.send(uuid);
    };

    // Listen for messages from the server
    this.socket.onmessage = (event) => {
      // check if the data is empty
      if (event.data == "null") return;

      // check if the data is a death message
      if (event.data.startsWith("death")) {
        getSnakes(null, snakes);
        nameInputSection.style.display = "block";
        printHighScores();
        return;
      }

      // if not its a game tick update
      let data = JSON.parse(event.data);

      let snakeData = data.map((snake) => {
        return {
          id: snake.id,
          tail: snake.tail,
          name: snake.name,
          playing: snake.playing,
          score: snake.score,
        };
      });

      let playingSnakes = snakeData.filter((snake) => snake.playing);

      let mySnake = playingSnakes.find((snake) => snake.id === this.uuid);
      playingSnakes = playingSnakes.filter((snake) => snake.id !== this.uuid);

      getSnakes(mySnake, playingSnakes);
    };

    // Handle errors
    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    // Handle this.socket close
    this.socket.onclose = () => {
      console.log("Disconnected from server");
      getSnakes(null, []);
    };
  }

  sendDirection = (direction) => {
    this.socket.send("dir" + direction);
  };
  sendStart = (name, nameInputSection) => {
    nameInputSection.style.display = "none";
    this.socket.send("start" + name);
  };
}

function generateUUID() {
  // Helper function to generate a random hex string of a given length
  function randomHex(len) {
    let result = "";
    for (let i = 0; i < len; i++) {
      result += Math.floor(Math.random() * 16).toString(16);
    }
    return result;
  }

  // Generate UUID parts
  const r = randomHex(16);
  const hex = [
    r.slice(0, 8), // 8 characters
    r.slice(8, 12), // 4 characters
    "4" + r.slice(13, 16), // 4 characters with version 4
    ((parseInt(r[16], 16) & 0x3) | 0x8).toString(16) + r.slice(17, 20), // 4 characters with variant
    r.slice(20, 32), // 12 characters
  ];

  const joined = hex.join("-");
  return joined.slice(0, -1); // remove the last character
}
