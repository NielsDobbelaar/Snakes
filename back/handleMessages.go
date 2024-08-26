package main

import (
	"github.com/NielsDobbelaar/goUtils/assert"
	"github.com/gorilla/websocket"
	"strconv"
)

func HandleMessages(message string, ws *websocket.Conn) {
	// fmt.Println("Received message: " + message)
	// if message starts with dir
	if message[:3] == "dir" {
		// get the direction
		direction := message[3:4]
		mu.Lock()
		for i := 0; i < len(players); i++ {
			if players[i].ws == ws {
				// set the direction of the player
				// check if the direction is not the opposite of the current direction
				// if it is, do not change the direction
				currentDirInt, err := strconv.Atoi(players[i].direction)
				assert.AssertWithError(err == nil, "Error while converting currentDir string to int", err)
				newDirInt, err := strconv.Atoi(direction)
				assert.AssertWithError(err == nil, "Error while converting newDir string to int", err)

				if currentDirInt%2 != newDirInt%2 && players[i].playing {
					players[i].nextDirection = direction
				}
			}
		}
		mu.Unlock()
		return
	}
	if len(message) >= 5 && message[:5] == "start" {
		// get the name of the player
		name := message[5:]
		mu.Lock()
		for i := 0; i < len(players); i++ {
			if players[i].ws == ws {
				if players[i].playing {
					// if the player is already playing, do nothing
					mu.Unlock()
					return
				}
				// set the name of the player and set playing to true
				players[i].name = name
				players[i].playing = true
			}
		}
		mu.Unlock()
		return
	}

}
