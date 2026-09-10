CREATE TABLE saved_posts (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_saved_posts_user_created ON saved_posts(user_id, created_at DESC, post_id);
CREATE INDEX idx_saved_posts_post ON saved_posts(post_id);
PRAGMA optimize;
