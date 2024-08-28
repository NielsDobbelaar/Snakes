package main

import (
	"fmt"
	"github.com/NielsDobbelaar/goUtils/assert"
	"github.com/gorilla/websocket"
	"math/rand/v2"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

type Location struct {
	Y int `json:"y"`
	X int `json:"x"`
}

type Player struct {
	id            string
	ws            *websocket.Conn
	playing       bool
	direction     string
	tail          []Location
	name          string
	nextDirection string
	score         int
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for simplicity
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

const initialSocketTimeout = 8 * time.Second
const maxConnections = 5
const boardWidth = 100
const boardHeight = 75

var (
	players    []Player
	highScores HighScoresList
	mu         sync.Mutex
)

func writeResponse(ws *websocket.Conn, message string) {
	err := ws.WriteMessage(websocket.TextMessage, []byte(message))
	assert.AssertWithError(err == nil, "error writing message", err)
}

func handleConnection(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	assert.AssertWithError(err == nil, "Failed to upgrade connection", err)

	defer ws.Close()

	if len(players) >= maxConnections {
		writeResponse(ws, "Server is full")
		return
	}

	// read first message
	ws.SetReadDeadline(time.Now().Add(initialSocketTimeout))
	for {
		// Read message from client
		_, msg, err := ws.ReadMessage()

		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				fmt.Println("Connection closed cleanly")
				fmt.Println("Total players: " + strconv.Itoa(len(players)))
				return
			}
			assert.AssertWithError(err == nil, "error reading message", err)
		}

		// handle new player added
		playerID := string(msg)

		mu.Lock()
		newLocation := Location{X: rand.IntN(50), Y: rand.IntN(40)}
		newTailSection := newLocation
		newTailSection.X = newLocation.X - 1

		tail := []Location{newLocation, newTailSection}
		players = append(players, Player{id: playerID, ws: ws, direction: "2", playing: false, tail: tail, name: "", nextDirection: "", score: 0})

		fmt.Println("Player added with id: " + playerID)
		fmt.Println("Total players: " + strconv.Itoa(len(players)))
		mu.Unlock()

		ws.SetReadDeadline(time.Time{})

		break
	}

	// read rest of messages
	for {
		// Read message from client
		_, msg, err := ws.ReadMessage()

		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				fmt.Println("Connection closed cleanly")
				mu.Lock()
				for i := 0; i < len(players); i++ {
					if players[i].ws == ws {
						players = append(players[:i], players[i+1:]...)
					}
				}
				mu.Unlock()

				break
			}
			assert.AssertWithError(err == nil, "error reading message", err)
		}
		HandleMessages(string(msg), ws)
	}
}

// Middleware to handle CORS
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from 'http://127.0.0.1:8080'
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// Allow specific headers
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		// Allow specific methods
		w.Header().Set("Access-Control-Allow-Methods", "GET")
		// Pass to the next handler
		next.ServeHTTP(w, r)
	})
}

func main() {
	fmt.Println("game started")
	highScores.AddScore("Niels", 1000)
	highScores.AddScore("Niels", 500)
	go gameLoop()

	fmt.Println("starting server")
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleConnection(w, r)
	})

	mux.HandleFunc("/highscores", func(w http.ResponseWriter, r *http.Request) {
		handleGetHighScores(w, r)
	})

	handler := enableCORS(mux)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Server started on :" + port)
	err := http.ListenAndServe(":"+port, handler)

	assert.AssertWithError(err == nil, "Server failed to start", err)

}
