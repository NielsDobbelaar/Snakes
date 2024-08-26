package main

import (
	"encoding/json"
	"net/http"
	"sort"
)

type Score struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

type HighScoresList struct {
	HighScores []Score `json:"highScores"`
}

func (h *HighScoresList) AddScore(name string, score int) {
	h.HighScores = append(h.HighScores, Score{name, score})

	sort.Slice(h.HighScores, func(i, j int) bool {
		return h.HighScores[i].Score > h.HighScores[j].Score
	})

	if len(h.HighScores) > 10 {
		h.HighScores = h.HighScores[:10]
	}
}

func (h *HighScoresList) GetScores() []Score {
	return h.HighScores
}

func handleGetHighScores(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(highScores.GetScores())
}
