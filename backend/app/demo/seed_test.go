package demo_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"social-network/app/db/sqlite"
	"social-network/app/demo"
	"social-network/app/sessions"
	"social-network/server"
	"strings"
	"testing"
	"time"
)

func TestDemoSeedPreservesExistingDataAndIsRepeatable(t *testing.T) {
	runtime := t.TempDir()
	t.Setenv("DATABASE_PATH", filepath.Join(runtime, "social_network.db"))
	t.Setenv("MIGRATIONS_PATH", "file://../db/migrations")
	db := sqlite.ConnectDB()
	defer db.Close()
	sqlite.ApplyMigrations(db)
	_, err := db.Exec(`INSERT INTO users(id,email,password,first_name,last_name,nickname,date_of_birth) VALUES('existing-user','existing@example.test','test-only','Existing','Member','existing','1990-01-01')`)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO posts(id,user_id,content,privacy) VALUES('existing-post','existing-user','Keep this original post.','public')`); err != nil {
		t.Fatal(err)
	}
	assets, err := filepath.Abs("../../../frontend/public/images")
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 9, 10, 12, 0, 0, 0, time.UTC)
	for n := 0; n < 2; n++ {
		if err := demo.Seed(context.Background(), db, runtime, assets, now.Add(time.Duration(n)*time.Hour)); err != nil {
			t.Fatal(err)
		}
	}
	for table, want := range map[string]int{"users": 9, "posts": 13, "comments": 24, "likes": 45, "followers": 16} {
		var count int
		if err := db.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&count); err != nil || count != want {
			t.Fatalf("%s: got %d want %d (%v)", table, count, want, err)
		}
	}
	var changed int
	if err := db.QueryRow(`SELECT COUNT(*) FROM posts WHERE likes_count != (SELECT COUNT(*) FROM likes WHERE likes.post_id=posts.id) OR comments_count != (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id)`).Scan(&changed); err != nil || changed != 0 {
		t.Fatal("Counters changed during repeated seed", err, changed)
	}
	if err := db.QueryRow(`SELECT COUNT(*) FROM followers WHERE follower_id='existing-user' OR followed_id='existing-user'`).Scan(&changed); err != nil || changed != 0 {
		t.Fatal("Seed connected an existing account", err)
	}
	var original string
	if err := db.QueryRow(`SELECT content FROM posts WHERE id='existing-post'`).Scan(&original); err != nil || original != "Keep this original post." {
		t.Fatal("Original record changed", err)
	}
	var latest string
	if err := db.QueryRow(`SELECT MAX(created_at) FROM posts WHERE id!='existing-post'`).Scan(&latest); err != nil || latest != now.Add(-36*time.Minute).Format("2006-01-02 15:04:05") {
		t.Fatal("Repeat seed moved post timestamps", err, latest)
	}
	var personaCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE password='!demo-account-disabled' AND nickname LIKE '% · Demo'`).Scan(&personaCount); err != nil || personaCount != 8 {
		t.Fatal("Demo personas must be labeled and unable to sign in", err)
	}
	avatars, err := os.ReadDir(filepath.Join(runtime, "avatars"))
	if err != nil || len(avatars) != 8 {
		t.Fatal("Missing avatars", err)
	}
	uploads, err := os.ReadDir(filepath.Join(runtime, "uploads"))
	if err != nil || len(uploads) != 3 {
		t.Fatal("Missing campaign media", err)
	}

	// Exercise the same authenticated feed used by the application, without a browser session.
	if _, err := db.Exec(`INSERT INTO active_sessions(session_id,user_id,expires_at) VALUES('demo-test-session','existing-user',datetime('now','+1 hour'))`); err != nil {
		t.Fatal(err)
	}
	handler := server.NewHandler(db)
	request := httptest.NewRequest("GET", "/posts/all", nil)
	request.AddCookie(&http.Cookie{Name: sessions.SessionCookieName, Value: "demo-test-session"})
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var posts []map[string]any
	if response.Code != 200 || json.Unmarshal(response.Body.Bytes(), &posts) != nil || len(posts) != 13 {
		t.Fatalf("Seeded feed failed: %d %s", response.Code, response.Body.String())
	}
	for _, post := range posts {
		if post["id"] == "existing-post" {
			continue
		}
		if !strings.Contains(post["nickname"].(string), "Demo") {
			t.Fatal("Unlabeled sample post")
		}
	}
}
