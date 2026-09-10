package server

import (
	"bytes"
	"encoding/json"
	"github.com/gorilla/websocket"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"social-network/app/db/sqlite"
	"strings"
	"testing"
	"time"
)

// All records, cookies, and uploaded files in this test exist only in t.TempDir.
func TestSocialJourneys(t *testing.T) {
	t.Setenv("DATABASE_PATH", filepath.Join(t.TempDir(), "integration.db"))
	t.Setenv("MIGRATIONS_PATH", "file://../app/db/migrations")
	t.Setenv("FRONTEND_ORIGIN", "http://localhost:3100")
	db := sqlite.ConnectDB()
	defer db.Close()
	sqlite.ApplyMigrations(db)
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	imageData, err := os.ReadFile(filepath.Join(originalDir, "../../frontend/public/profile.png"))
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(t.TempDir()); err != nil {
		t.Fatal(err)
	}
	defer os.Chdir(originalDir)
	handler := NewHandler(db)
	request := func(cookies []*http.Cookie, method, route string, data any, status int) *httptest.ResponseRecorder {
		t.Helper()
		var body io.Reader
		contentType := "application/json"
		if fields, ok := data.(map[string]string); ok {
			buf := &bytes.Buffer{}
			writer := multipart.NewWriter(buf)
			for key, value := range fields {
				if key == "__test_png" {
					part, err := writer.CreateFormFile("file", "test.png")
					if err != nil {
						t.Fatal(err)
					}
					if _, err := io.WriteString(part, value); err != nil {
						t.Fatal(err)
					}
					continue
				}
				if err := writer.WriteField(key, value); err != nil {
					t.Fatal(err)
				}
			}
			writer.Close()
			body = buf
			contentType = writer.FormDataContentType()
		} else if data != nil {
			encoded, err := json.Marshal(data)
			if err != nil {
				t.Fatal(err)
			}
			body = bytes.NewReader(encoded)
		}
		req := httptest.NewRequest(method, route, body)
		req.Header.Set("Content-Type", contentType)
		for _, cookie := range cookies {
			req.AddCookie(cookie)
		}
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, req)
		if response.Code != status {
			t.Fatalf("%s %s: got %d, want %d: %s", method, route, response.Code, status, response.Body.String())
		}
		return response
	}
	decode := func(response *httptest.ResponseRecorder) map[string]any {
		t.Helper()
		var data map[string]any
		if err := json.Unmarshal(response.Body.Bytes(), &data); err != nil {
			t.Fatal(err)
		}
		return data
	}
	request(nil, "GET", "/posts/all", nil, 401)
	t.Log("PASS: unauthenticated feed rejected")
	var ids []string
	var sessions [][]*http.Cookie
	for _, name := range []string{"Maya", "Noah"} {
		registration := request(nil, "POST", "/register", map[string]string{"first_name": name, "last_name": "Test", "email": name + "@example.test", "password": "CommonTesting9!", "nickname": name, "date_of_birth": "1995-05-15"}, 201)
		ids = append(ids, decode(registration)["user_id"].(string))
		login := request(nil, "POST", "/login", map[string]any{"identifier": name + "@example.test", "password": "CommonTesting9!"}, 200)
		sessions = append(sessions, login.Result().Cookies())
	}
	a, b := sessions[0], sessions[1]
	t.Log("PASS: registration and cookie sessions")
	request(nil, "POST", "/login", map[string]any{"identifier": "Maya@example.test", "password": "incorrect"}, 401)
	t.Log("PASS: invalid credentials rejected")
	request(a, "POST", "/follow", map[string]any{"followed_id": ids[1]}, 200)
	t.Log("PASS: public follow")
	createdPost := decode(request(b, "POST", "/posts", map[string]string{"content": "A good conversation starts here.", "privacy": "public", "__test_png": string(imageData)}, 201))
	post := createdPost["post_id"].(string)
	media := request(a, "GET", "/uploads/"+createdPost["image_url"].(string), nil, 200)
	if !bytes.Equal(media.Body.Bytes(), imageData) {
		t.Fatal("Uploaded image changed")
	}
	if !strings.Contains(request(a, "GET", "/posts/all", nil, 200).Body.String(), post) {
		t.Fatal("New post missing from feed")
	}
	t.Log("PASS: post creation, PNG upload, serving and feed")
	request(a, "POST", "/posts/like?post_id="+post, nil, 201)
	if !strings.Contains(request(a, "GET", "/posts/all", nil, 200).Body.String(), `"has_liked":true`) {
		t.Fatal("Like missing")
	}
	t.Log("PASS: persisted like")
	request(a, "POST", "/posts/comments", map[string]string{"post_id": post, "content": "Here for the conversation."}, 201)
	if !strings.Contains(request(a, "GET", "/posts/comments/all?post_id="+post, nil, 200).Body.String(), "Here for the conversation") {
		t.Fatal("Comment missing")
	}
	t.Log("PASS: comment creation and retrieval")
	privatePost := decode(request(b, "POST", "/posts", map[string]string{"content": "Only for me.", "privacy": "private"}, 201))["post_id"].(string)
	if strings.Contains(request(a, "GET", "/posts/all", nil, 200).Body.String(), privatePost) {
		t.Fatal("Private post exposed")
	}
	t.Log("PASS: private post audience")
	request(nil, "POST", "/posts/save?post_id="+post, nil, 401)
	request(nil, "GET", "/posts/all?feed=saved", nil, 401)
	request(a, "GET", "/posts/all?feed=unknown", nil, 400)
	request(a, "POST", "/posts/save", nil, 400)
	request(a, "POST", "/posts/save?post_id=missing", nil, 404)
	request(a, "POST", "/posts/save?post_id="+privatePost, nil, 404)
	request(a, "POST", "/posts/save?post_id="+post, nil, 200)
	request(a, "POST", "/posts/save?post_id="+post, nil, 200)
	var savedCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM saved_posts WHERE user_id = ? AND post_id = ?`, ids[0], post).Scan(&savedCount); err != nil || savedCount != 1 {
		t.Fatal("Saving is not idempotent", err, savedCount)
	}
	if !strings.Contains(request(a, "GET", "/posts/all?feed=saved", nil, 200).Body.String(), `"is_saved":true`) {
		t.Fatal("Saved state missing")
	}
	if strings.Contains(request(b, "GET", "/posts/all?feed=saved", nil, 200).Body.String(), post) {
		t.Fatal("Another member can read saved posts")
	}
	request(b, "DELETE", "/posts/save?post_id="+post+"&user_id="+ids[0], nil, 204)
	if !strings.Contains(request(a, "GET", "/posts/all?feed=saved", nil, 200).Body.String(), post) {
		t.Fatal("Another member removed a saved reference")
	}
	request(b, "PUT", "/posts/privacy", map[string]any{"post_id": post, "privacy": "private", "allowed_users": []string{}}, 200)
	if strings.Contains(request(a, "GET", "/posts/all?feed=saved", nil, 200).Body.String(), post) {
		t.Fatal("Saved reference bypassed changed visibility")
	}
	request(a, "POST", "/posts/save?post_id="+post, nil, 404)
	request(b, "PUT", "/posts/privacy", map[string]any{"post_id": post, "privacy": "public"}, 200)
	request(a, "DELETE", "/posts/save?post_id="+post, nil, 204)
	request(a, "DELETE", "/posts/save?post_id="+post, nil, 204)
	if strings.Contains(request(a, "GET", "/posts/all?feed=saved", nil, 200).Body.String(), post) {
		t.Fatal("Removed save remains in collection")
	}
	ownedPost := decode(request(a, "POST", "/posts", map[string]string{"content": "A temporary moment.", "privacy": "public"}, 201))["post_id"].(string)
	followingFeed := request(a, "GET", "/posts/all?feed=following", nil, 200).Body.String()
	if !strings.Contains(followingFeed, post) || strings.Contains(followingFeed, ownedPost) || strings.Contains(followingFeed, privatePost) {
		t.Fatal("Following feed did not respect connections and visibility")
	}
	if strings.Contains(request(b, "GET", "/posts/all?feed=following", nil, 200).Body.String(), ownedPost) {
		t.Fatal("Following feed includes an unfollowed author")
	}
	request(b, "POST", "/posts/save?post_id="+ownedPost, nil, 200)
	request(a, "DELETE", "/posts/delete?id="+ownedPost, nil, 200)
	if err := db.QueryRow(`SELECT COUNT(*) FROM saved_posts WHERE post_id = ?`, ownedPost).Scan(&savedCount); err != nil || savedCount != 0 {
		t.Fatal("Deleted post retained saved references", err)
	}
	t.Log("PASS: saved posts, idempotency, account isolation, changed visibility, deletion cleanup and following feed")
	// Unicode limits count code points, not UTF-8 bytes or JavaScript UTF-16 units.
	unicodeText := strings.Repeat("م", 499) + "🎉"
	unicodePost := decode(request(a, "POST", "/posts", map[string]string{"content": unicodeText, "privacy": "public"}, 201))["post_id"].(string)
	request(a, "POST", "/posts", map[string]string{"content": unicodeText + "م", "privacy": "public"}, 400)
	unicodeComment := strings.Repeat("م", 249) + "🎉"
	request(b, "POST", "/posts/comments", map[string]string{"post_id": unicodePost, "content": unicodeComment}, 201)
	request(b, "POST", "/posts/comments", map[string]string{"post_id": unicodePost, "content": unicodeComment + "م"}, 400)
	if !strings.Contains(request(b, "GET", "/posts/comments/all?post_id="+unicodePost, nil, 200).Body.String(), unicodeComment) {
		t.Fatal("Unicode comment did not round-trip")
	}
	request(b, "POST", "/posts/like?post_id="+unicodePost, nil, 201)
	request(b, "POST", "/posts/save?post_id="+unicodePost, nil, 200)
	request(b, "DELETE", "/posts/delete?id="+unicodePost, nil, 403)
	// Simulate the final delete failing after dependent rows were removed.
	if _, err := db.Exec(`CREATE TEMP TRIGGER test_block_post_delete BEFORE DELETE ON posts BEGIN SELECT RAISE(ABORT, 'test failure'); END`); err != nil {
		t.Fatal(err)
	}
	request(a, "DELETE", "/posts/delete?id="+unicodePost, nil, 500)
	for _, table := range []string{"comments", "likes", "notifications", "saved_posts"} {
		var count int
		if err := db.QueryRow(`SELECT COUNT(*) FROM `+table+` WHERE post_id = ?`, unicodePost).Scan(&count); err != nil || count == 0 {
			t.Fatal("Failed delete lost related records", table, err)
		}
	}
	if _, err := db.Exec(`DROP TRIGGER test_block_post_delete`); err != nil {
		t.Fatal(err)
	}
	request(a, "DELETE", "/posts/delete?id="+unicodePost, nil, 200)
	for _, table := range []string{"comments", "likes", "notifications", "saved_posts"} {
		var count int
		if err := db.QueryRow(`SELECT COUNT(*) FROM `+table+` WHERE post_id = ?`, unicodePost).Scan(&count); err != nil || count != 0 {
			t.Fatal("Deleted post left related records", table, err)
		}
	}
	t.Log("PASS: Arabic and emoji at post/comment limits, over-limit rejection and retrieval")
	t.Log("PASS: owner-only deletion with related records and transactional rollback")
	group := decode(request(a, "POST", "/groups/create", map[string]any{"name": "The creative corner", "description": "A temporary test circle."}, 201))["group_id"].(string)
	request(b, "POST", "/groups/join", map[string]any{"group_id": group}, 200)
	if !strings.Contains(request(a, "GET", "/notifications/get", nil, 200).Body.String(), "group_join_request") {
		t.Fatal("Join notification missing")
	}
	request(a, "PUT", "/groups/join/respond", map[string]any{"group_id": group, "user_id": ids[1], "action": "accept"}, 200)
	if !strings.Contains(request(b, "GET", "/groups/user", nil, 200).Body.String(), group) {
		t.Fatal("Membership missing")
	}
	t.Log("PASS: circle join request, notification and membership approval")
	event := decode(request(a, "POST", "/groups/events/create", map[string]any{"group_id": group, "title": "Photo walk", "description": "Share your favorite frame.", "event_date": "2026-12-01T18:00:00Z"}, 201))["event_id"].(string)
	request(b, "POST", "/groups/events/rsvp", map[string]any{"event_id": event, "status": "going"}, 200)
	t.Log("PASS: events and RSVP")
	server := httptest.NewServer(handler)
	defer server.Close()
	dial := func(cookies []*http.Cookie) *websocket.Conn {
		t.Helper()
		header := http.Header{}
		req, _ := http.NewRequest("GET", server.URL, nil)
		for _, c := range cookies {
			req.AddCookie(c)
		}
		header.Set("Cookie", req.Header.Get("Cookie"))
		conn, _, err := websocket.DefaultDialer.Dial("ws"+strings.TrimPrefix(server.URL, "http")+"/chat/private", header)
		if err != nil {
			t.Fatal(err)
		}
		conn.SetReadDeadline(time.Now().Add(5 * time.Second))
		return conn
	}
	wsA, wsB := dial(a), dial(b)
	defer wsA.Close()
	defer wsB.Close()
	// A protocol exchange confirms both connections are registered without timing sleeps.
	if err := wsB.WriteJSON(map[string]string{"receiver_id": ids[0], "type": "typing"}); err != nil {
		t.Fatal(err)
	}
	var ready map[string]any
	if err := wsA.ReadJSON(&ready); err != nil || ready["type"] != "typing" {
		t.Fatal("Chat readiness exchange failed", err)
	}
	if err := wsA.WriteJSON(map[string]string{"receiver_id": ids[1], "message": "Hello from Common 👋", "type": "message"}); err != nil {
		t.Fatal(err)
	}
	var ack, incoming map[string]any
	if err := wsA.ReadJSON(&ack); err != nil {
		t.Fatal("No sender acknowledgement:", err)
	}
	if err := wsB.ReadJSON(&incoming); err != nil {
		t.Fatal("No recipient delivery:", err)
	}
	if ack["id"] != incoming["id"] || ack["message"] != "Hello from Common 👋" {
		t.Fatalf("Mismatched acknowledgement: %v / %v", ack, incoming)
	}
	if !strings.Contains(request(a, "GET", "/chat/history?with="+ids[1], nil, 200).Body.String(), ack["id"].(string)) {
		t.Fatal("Message not persisted")
	}
	t.Log("PASS: WebSocket acknowledgement, delivery, emoji and persisted history")
	request(a, "PUT", "/notifications/read-all", nil, 200)
	request(a, "GET", "/users/profile?user_id="+ids[0], nil, 200)
	if !strings.Contains(request(a, "GET", "/search?query=Noah", nil, 200).Body.String(), ids[1]) {
		t.Fatal("Search result missing")
	}
	t.Log("PASS: notification actions, profile and people search")
	wsB.Close()
	request(b, "POST", "/logout", nil, 200)
	request(b, "GET", "/posts/all", nil, 401)
	t.Log("PASS: logout invalidates the session")
}
