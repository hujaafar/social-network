package posts

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/app/sessions"
)

// A saved post is a reference, never a permission grant. Both feed reads and
// saving use this predicate so audience changes apply to saved posts immediately.
const visiblePost = `(
	posts.privacy = 'public'
	OR (posts.privacy = 'almost-private' AND (posts.user_id = ? OR EXISTS (
		SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = posts.user_id AND status = 'accepted'
	)))
	OR (posts.privacy = 'private' AND (posts.user_id = ? OR EXISTS (
		SELECT 1 FROM post_privacy WHERE post_id = posts.id AND user_id = ?
	)))
)`

func GetPostsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		userID, err := sessions.GetUserIDFromSession(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		feed := r.URL.Query().Get("feed")
		if feed != "" && feed != "all" && feed != "following" && feed != "saved" {
			http.Error(w, "Unknown feed", http.StatusBadRequest)
			return
		}
		query := `SELECT posts.id, posts.user_id, posts.content, COALESCE(posts.image_url, ''),
			posts.privacy, COALESCE(posts.likes_count, 0), COALESCE(posts.comments_count, 0), posts.created_at,
			COALESCE(users.nickname, ''), COALESCE(users.avatar, ''),
			EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?),
			saved.user_id IS NOT NULL
		FROM posts INNER JOIN users ON users.id = posts.user_id
		LEFT JOIN saved_posts saved ON saved.post_id = posts.id AND saved.user_id = ?
		WHERE ` + visiblePost
		args := []any{userID, userID, userID, userID, userID, userID}
		if feed == "following" {
			query += ` AND EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = posts.user_id AND status = 'accepted')`
			args = append(args, userID)
		}
		if feed == "saved" {
			query += ` AND saved.user_id IS NOT NULL ORDER BY saved.created_at DESC, posts.id DESC`
		} else {
			query += ` ORDER BY posts.created_at DESC, posts.id DESC`
		}
		rows, err := db.QueryContext(r.Context(), query, args...)
		if err != nil {
			http.Error(w, "Unable to load posts", http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		items := make([]Post, 0)
		for rows.Next() {
			var item Post
			if err := rows.Scan(&item.ID, &item.UserID, &item.Content, &item.ImageURL, &item.Privacy,
				&item.LikesCount, &item.CommentsCount, &item.CreatedAt, &item.Nickname, &item.Avatar,
				&item.HasLiked, &item.IsSaved); err != nil {
				http.Error(w, "Unable to read posts", http.StatusInternalServerError)
				return
			}
			items = append(items, item)
		}
		if rows.Err() != nil {
			http.Error(w, "Unable to read posts", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
	}
}

func SavePostHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost && r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		userID, err := sessions.GetUserIDFromSession(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		postID := r.URL.Query().Get("post_id")
		if postID == "" {
			http.Error(w, "Missing post ID", http.StatusBadRequest)
			return
		}
		if r.Method == http.MethodDelete {
			_, err = db.ExecContext(r.Context(), `DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?`, userID, postID)
			if err != nil {
				http.Error(w, "Unable to remove saved post", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		// Atomic visibility check and idempotent save; repeated requests keep the original save date.
		query := `INSERT INTO saved_posts(user_id, post_id)
			SELECT ?, posts.id FROM posts WHERE posts.id = ? AND ` + visiblePost + `
			ON CONFLICT(user_id, post_id) DO UPDATE SET post_id = excluded.post_id RETURNING post_id`
		err = db.QueryRowContext(r.Context(), query, userID, postID, userID, userID, userID, userID).Scan(&postID)
		if err == sql.ErrNoRows {
			http.Error(w, "Post unavailable", http.StatusNotFound)
			return
		}
		if err != nil {
			http.Error(w, "Unable to save post", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"post_id": postID, "is_saved": true})
	}
}
