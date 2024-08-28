package main

import (
	"encoding/json"
	"fmt"
	"github.com/NielsDobbelaar/goUtils/assert"
	"github.com/gorilla/websocket"
	"math/rand/v2"
	"time"
)

const targetFPS = 5
const frameTime = time.Second / targetFPS
const growRate = 1

var lastGrow = time.Now()

type PlayerData struct {
	ID        string     `json:"id"`
	Playing   bool       `json:"playing"`
	Direction string     `json:"direction"`
	X         int        `json:"x"`
	Y         int        `json:"y"`
	Tail      []Location `json:"tail"`
	Name      string     `json:"name"`
	Score     int        `json:"score"`
}

func gameLoop() {
	var previousTime time.Time
	for {
		startTime := time.Now()

		if !previousTime.IsZero() {

			update()

			// Sleep to maintain target FPS
			sleepDuration := frameTime - time.Since(startTime)
			if sleepDuration > 0 {
				time.Sleep(sleepDuration)
			}
		}
		previousTime = startTime
	}
}

func update() {
	mu.Lock()
	handleMovement()
	handleCollisions()

	playersCopy := players
	mu.Unlock()

	broadcastGameState(playersCopy)
}

func handleMovement() {
	// move all the snakes based on their direction
	for i := 0; i < len(players); i++ {
		player := players[i]
		head := player.tail[0]

		if !player.playing {
			continue
		}
		if player.nextDirection != "" {
			player.direction = player.nextDirection
			player.nextDirection = ""
			players[i] = player
		}

		switch player.direction {
		case "1":
			head.Y--
		case "3":
			head.Y++
		case "4":
			head.X--
		case "2":
			head.X++
		}

		player.tail = append([]Location{head}, player.tail...)

		if !(time.Since(lastGrow) > time.Second*growRate) {
			players[i].tail = player.tail[:len(player.tail)-1]
		} else {
			players[i].tail = player.tail
			players[i].score += 10
		}
	}

	// calculate amout of players playing
	playingPlayers := 0
	for _, player := range players {
		if player.playing {
			playingPlayers++
		}
	}

	if time.Since(lastGrow) > time.Second*growRate || playingPlayers <= 1 {
		lastGrow = time.Now()
	}
}

func handleCollisions() {
	// possible refactor
	//  considering only 5 players max nested loop gives functionality to know
	//  which player is colliding with which player and scoring accordingly

	// handle snake collisons
	// collect all locations of all snakes
	allLocations := []Location{}
	for _, player := range players {
		if player.playing {
			allLocations = append(allLocations, player.tail...)
		}
	}

	for i := 0; i < len(players); i++ {
		player := players[i]

		if !player.playing {
			continue
		}

		head := player.tail[0]

		// check if the head of the snake collides with the wall
		if head.X < 0 || head.X >= boardWidth || head.Y < 0 || head.Y >= boardHeight {
			onPlayerDeath(player, i)
			return
		}

		// check if the head of the snake collides with another snake
		collisionCount := 0
		for j := 0; j < len(allLocations); j++ {
			if head == allLocations[j] {
				collisionCount++
			}
			if collisionCount > 1 {
				onPlayerDeath(player, i)
				return
			}
		}
	}

}

func onPlayerDeath(player Player, playerIdx int) {
	// calculate highscores and send deathmessage to client

	highScores.AddScore(player.name, player.score)
	fmt.Println(highScores.GetScores())

	var deathMessage []byte = []byte("death")
	err := player.ws.WriteMessage(websocket.TextMessage, deathMessage)
	assert.AssertWithError(err == nil, "error sending death message to player", err)
	fmt.Println("Player died:", player.id)

	// reset the player
	newLocation := Location{X: rand.IntN(boardWidth), Y: rand.IntN(boardHeight)}
	newTailSection := newLocation
	newTailSection.X = newLocation.X - 1
	player.tail = []Location{newLocation, newTailSection}

	player.direction = "2"
	player.playing = false
	player.name = ""
	player.score = 0
	players[playerIdx] = player
}

func broadcastGameState(playersCopy []Player) {
	var playerDataList []PlayerData

	// only send playing playersCopy
	var playingPlayers []Player
	for _, player := range playersCopy {
		if player.playing {
			playingPlayers = append(playingPlayers, player)
		}
	}

	for _, player := range playersCopy {
		playerData := PlayerData{
			ID:        player.id,
			Playing:   player.playing,
			Direction: player.direction,
			Tail:      player.tail,
			Name:      player.name,
			Score:     player.score,
		}
		playerDataList = append(playerDataList, playerData)
	}

	// Marshal the slice of PlayerData to JSON
	message, err := json.Marshal(playerDataList)
	if err != nil {
		panic("Error while encoding JSON: " + err.Error())
	}

	// Send the JSON message to each WebSocket connection
	for i := 0; i < len(playersCopy); i++ {
		player := playersCopy[i]
		if player.ws == nil {
			fmt.Printf("Player %d WebSocket connection is nil\n", i)
			continue
		}

		// Send the JSON message over the WebSocket connection
		err = player.ws.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			fmt.Printf("Error while sending message to player %d: %v\n", i, err)
			continue
		}
	}
}
