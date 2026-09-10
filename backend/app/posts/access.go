package posts

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"path/filepath"
	"social-network/app/sessions"
	"strings"
)

// CanView applies the same audience rules as feed and saved-collection reads.
func CanView(ctx context.Context, db *sql.DB, postID, userID string) (bool, error) {
	var visible bool
	err := db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM posts WHERE posts.id = ? AND `+visiblePost+`)`,
		postID, userID, userID, userID, userID).Scan(&visible)
	return visible, err
}

// RequireVisible does not distinguish a missing post from an inaccessible one.
func RequireVisible(db *sql.DB, w http.ResponseWriter, r *http.Request, postID, userID string) bool {
	visible, err := CanView(r.Context(), db, postID, userID)
	if err != nil {
		http.Error(w, "Unable to check post access", http.StatusInternalServerError)
		return false
	}
	if !visible {
		http.Error(w, "Post unavailable", http.StatusNotFound)
		return false
	}
	return true
}

// Uploaded media inherits its parent post's current audience, including comments
// and circle posts. An opaque filename is not an authorization credential.
func UploadHandler(db *sql.DB, directory string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "private, no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		userID, err := sessions.GetUserIDFromSession(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		name := strings.TrimPrefix(r.URL.Path, "/uploads/")
		if name == "" || name == "." || name == ".." || strings.ContainsAny(name, `/\`) {
			http.NotFound(w, r)
			return
		}
		var visible bool
		err = db.QueryRowContext(r.Context(), `SELECT EXISTS(
			SELECT 1 FROM posts WHERE (posts.image_url = ? OR EXISTS(
				SELECT 1 FROM comments WHERE comments.post_id = posts.id AND comments.image_url = ?
			)) AND `+visiblePost+`
			UNION ALL
			SELECT 1 FROM group_posts gp JOIN groups g ON g.id = gp.group_id
			WHERE gp.image_url = ? AND (g.creator_id = ? OR EXISTS(
				SELECT 1 FROM group_membership gm WHERE gm.group_id = gp.group_id AND gm.user_id = ? AND gm.status = 'member'
			))
		)`, name, name, userID, userID, userID, userID, name, userID, userID).Scan(&visible)
		if err != nil {
			http.Error(w, "Unable to check media access", http.StatusInternalServerError)
			return
		}
		if !visible {
			http.NotFound(w, r)
			return
		}
		file, err := os.Open(filepath.Join(directory, name))
		if err != nil {
			http.NotFound(w, r)
			return
		}
		defer file.Close()
		info, err := file.Stat()
		if err != nil || !info.Mode().IsRegular() {
			http.NotFound(w, r)
			return
		}
		http.ServeContent(w, r, name, info.ModTime(), file)
	})
}
