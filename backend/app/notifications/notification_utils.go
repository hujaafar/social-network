package notifications

import (
	"database/sql"

	"github.com/google/uuid"
)

// CreateNotification adds a notification to the database
func CreateNotification(db *sql.DB, userID, notificationType, content, postID, relatedUserID, groupID, eventID string) error {
	notificationID := uuid.New().String()
	// Non-post notifications have no post foreign key; an empty string is not a valid reference.
	_, err := db.Exec(`
		INSERT INTO notifications (id, user_id, type, content, post_id, related_user_id, group_id, event_id)
		VALUES (?, ?, ?, ?, NULLIF(?, ''), ?, ?, ?)
	`, notificationID, userID, notificationType, content, postID, relatedUserID, groupID, eventID)
	if err != nil {
		return err
	}
	return nil
}
