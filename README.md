<a name="readme-top"></a>

<br />
<div align="center">
  <h1 align="center">Snakes</h1>
</div>

## About

Snakes is a simple snake game made in go and javascript. The backend is made in go and the frontend is made in javascript. The backend is a server that runs the gameloop, receives/ handles user inputs and sends the current state of the game to the frontend using websockets. The frontend is a simple snake game that is played in the browser.

This simple game was made as a fun project during the summer break. The goals were to have some fun with p5js, learn a bit more about go and making a (simple) backend for a game.

if you want to play the game, you can find it [here](https://snakes.nielsdobbelaar.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Go][golang]][golang-url]
[![HTML][html]][html-url]
[![CSS][css]][css-url]
[![JavaScript][js]][js-url]
[![p5.js][p5js]][p5js-url]

## Getting Started

### Prerequisites

- Have go installed
- have a tool like live server installed

### Installation

#### Backend server

1. Clone the repo
   ```sh
   git clone https://github.com/NielsDobbelaar/Snakes
   ```
2. cd into the directory
   ```sh
   cd back
   ```
3. run the server
   ```sh
   go run .
   ```

#### Frontend

1. clone the repo
   ```sh
   git clone https://github.com/Nielsdobbelaar/Snakes
   ```
2. cd into the directory
   ```sh
   cd front
   ```
3. run the server with a tool like "live server"
   ```sh
   live-server
   ```

### Todo

- [ ] Implement different collision check to give points to "kills"
- [ ] Implement powerups like speed boost, or extra length
- [ ] Think of better way of handling head to head collision

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Credits

- [Niels Dobbelaar](https://github.com/NielsDobbelaar)

<!-- badges -->

[golang]: https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white
[html]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[css]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[js]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[p5js]: https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white

<!-- links -->

[golang-url]: https://go.dev/
[html-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[css-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[js-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[p5js-url]: https://p5js.org/
