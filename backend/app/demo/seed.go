// Package demo provides opt-in fictional content for a local development database.
package demo

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type person struct{ key, first, last, initials, color, bio string }
type moment struct {
	author         int
	content, image string
}

var people = []person{
	{"maya", "Maya", "Chen", "MC", "#d9ff57", "Photographer chasing blue hour, good light and unplanned evenings."},
	{"omar", "Omar", "Hassan", "OH", "#c3d4f5", "Product designer. Coffee enthusiast. Always asking one more question."},
	{"leila", "Leila", "Noor", "LN", "#f1c4b1", "Making things by hand and finding beauty in the work in progress."},
	{"theo", "Theo", "Park", "TP", "#c8d8bc", "Collecting records, tiny cameras and ideas for the next weekend."},
	{"aisha", "Aisha", "Reed", "AR", "#dcc7ed", "Playlists for every mood. Here for the stories behind the songs."},
	{"nico", "Nico", "Rivera", "NR", "#e9d6ac", "City walks, slow mornings and a camera that comes everywhere."},
	{"hana", "Hana", "Sato", "HS", "#bcdedc", "Illustration, quiet spaces and the occasional very loud color."},
	{"sami", "Sami", "Khan", "SK", "#f2bdbc", "Building small things, sharing what I learn and finding my people."},
}

var moments = []moment{
	{0, "No big plans. Just a rooftop, the last light of the day and people who make an ordinary evening feel like something. More of this, please.", "common-afterhours.webp"},
	{1, "A design question for your coffee break: what is one tiny detail in an app that makes you love using it? Mine is coming back to exactly where I left off.", ""},
	{2, "A little studio reset. Cleared the desk, opened the windows and finally made room for the project I keep saying I’ll start. Consider this my accountability post.", "common-studio.webp"},
	{3, "Weekend essentials: a camera with one frame left, an album that deserves a full listen, and absolutely no notifications. What’s in your bag?", "common-objects.webp"},
	{4, "Building a playlist called ‘the long way home’. Send me the song that makes you miss your turn on purpose.", ""},
	{5, "The best part of a photo walk is usually the conversation between the photos. Found a new corner of the city and a reason to go back.", "common-afterhours.webp"},
	{6, "Today’s reminder from the studio: the rough version still counts. Share the sketch. Show the process. Someone else probably needs the encouragement too.", "common-studio.webp"},
	{7, "أجمل الأفكار تبدأ بمحادثة بسيطة. شاركوني شيئًا تعلمتموه هذا الأسبوع ✨\nThe best ideas often start with a small conversation. What did you learn this week?", ""},
	{0, "A few little things that made this week better: printing a photo instead of saving it, finishing a book, and leaving my phone in another room for an hour.", "common-objects.webp"},
	{1, "Made something small today that solved an annoying problem. No launch, no big announcement. Just that very satisfying feeling when a thing finally works.", ""},
	{2, "Creative people: where do you go when you’re stuck? A walk, a different project, a conversation, or an unreasonable amount of tea?", ""},
	{4, "Keeping a little space in the week for the people who make it feel lighter. This is your reminder to make the low-key plan happen.", "common-afterhours.webp"},
}

var replies = [][2]string{
	{"That blue-hour light gets me every time.", "The unplanned evenings are always the ones you remember."},
	{"An undo button that actually gives me enough time.", "When the keyboard shortcuts feel obvious. Small detail, huge difference."},
	{"The first messy version is officially allowed.", "A clear desk is such an underrated reset."},
	{"Notebook, headphones, and a book I keep lending to people.", "One frame left makes every shot a little more intentional."},
	{"Anything that starts quietly and ends like a film scene.", "I love a playlist with a very specific purpose."},
	{"Taking the long route is usually worth it.", "This is making me want to get outside with my camera."},
	{"Needed this today. Sharing the unfinished thing is the hard part.", "The process is often more interesting than the polished result."},
	{"تعلمت أن البداية الصغيرة أفضل من الانتظار. ✨", "That asking for feedback early saves a lot of guessing."},
	{"Printing the photo! That is going on my list.", "Small rituals make a surprisingly big difference."},
	{"Quiet wins deserve a little celebration too.", "That moment when it finally clicks is so satisfying."},
	{"A walk with no headphones. Works more often than it should.", "Tea first, then showing someone the part I can’t figure out."},
	{"Low-key plans are my favorite kind.", "Good reminder. Sending that message now."},
}

func id(key string) string {
	return uuid.NewSHA1(uuid.NameSpaceURL, []byte("https://common.example/demo/v1/"+key)).String()
}

// SaveAsset only creates demo-owned files; mismatched existing files are never replaced.
func saveAsset(path string, content []byte) error {
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
	if os.IsExist(err) {
		existing, readErr := os.ReadFile(path)
		if readErr == nil && bytes.Equal(existing, content) {
			return nil
		}
		return fmt.Errorf("demo asset collision at %s", path)
	}
	if err != nil {
		return err
	}
	if _, err := file.Write(content); err != nil {
		file.Close()
		return err
	}
	return file.Close()
}

// Seed adds stable fictional records without updating or relating real accounts.
// Every relationship joins demo IDs; normal database triggers calculate counters.
func Seed(ctx context.Context, db *sql.DB, runtimeDir, assetsDir string, now time.Time) error {
	for _, directory := range []string{"avatars", "uploads"} {
		if err := os.MkdirAll(filepath.Join(runtimeDir, directory), 0755); err != nil {
			return err
		}
	}
	for _, name := range []string{"common-afterhours.webp", "common-studio.webp", "common-objects.webp"} {
		content, err := os.ReadFile(filepath.Join(assetsDir, name))
		if err != nil {
			return err
		}
		if err := saveAsset(filepath.Join(runtimeDir, "uploads", "demo-"+name), content); err != nil {
			return err
		}
	}
	for _, p := range people {
		avatar := fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="%s"/><text x="80" y="85" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="600" fill="#161914">%s</text></svg>`, p.color, html.EscapeString(p.initials))
		if err := saveAsset(filepath.Join(runtimeDir, "avatars", "demo-"+p.key+".svg"), []byte(avatar)); err != nil {
			return err
		}
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	exec := func(query string, args ...any) error { _, err := tx.ExecContext(ctx, query, args...); return err }
	stamp := func(t time.Time) string { return t.UTC().Format("2006-01-02 15:04:05") }
	for i, p := range people {
		// This sentinel is deliberately not a password hash: demo personas cannot sign in.
		if err := exec(`INSERT INTO users(id,email,password,first_name,last_name,nickname,about_me,avatar,date_of_birth,private,created_at)
			VALUES(?,?,?,?,?,?,?,?,?,0,?) ON CONFLICT(id) DO NOTHING`,
			id("user/"+p.key), p.key+"@demo.common.example", "!demo-account-disabled", p.first, p.last, p.first+" · Demo",
			"Fictional demo profile. "+p.bio, "demo-"+p.key+".svg", fmt.Sprintf("199%d-04-12", i), stamp(now.AddDate(0, 0, -40-i))); err != nil {
			return err
		}
	}
	for i, p := range people {
		for n := 1; n <= 2; n++ {
			other := people[(i+n)%len(people)]
			if err := exec(`INSERT INTO followers(id,follower_id,followed_id,status,request_type,created_at) VALUES(?,?,?,'accepted','manual',?) ON CONFLICT(id) DO NOTHING`,
				id("follow/"+p.key+"/"+other.key), id("user/"+p.key), id("user/"+other.key), stamp(now.AddDate(0, 0, -7))); err != nil {
				return err
			}
		}
	}
	for i, post := range moments {
		postID := id(fmt.Sprintf("post/%02d", i))
		created := now.Add(-time.Duration(36+i*180) * time.Minute)
		image := ""
		if post.image != "" {
			image = "demo-" + post.image
		}
		if err := exec(`INSERT INTO posts(id,user_id,content,image_url,privacy,created_at) VALUES(?,?,?,?,'public',?) ON CONFLICT(id) DO NOTHING`,
			postID, id("user/"+people[post.author].key), post.content, image, stamp(created)); err != nil {
			return err
		}
		for j, content := range replies[i] {
			author := people[(post.author+j+1)%len(people)]
			if err := exec(`INSERT INTO comments(id,post_id,user_id,content,image_url,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
				id(fmt.Sprintf("comment/%02d/%d", i, j)), postID, id("user/"+author.key), content, "", stamp(created.Add(time.Duration(4+j*7)*time.Minute))); err != nil {
				return err
			}
		}
		for j := 0; j < 2+i%5; j++ {
			author := people[(post.author+j+1)%len(people)]
			if err := exec(`INSERT INTO likes(id,post_id,user_id,created_at) VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING`,
				id(fmt.Sprintf("like/%02d/%d", i, j)), postID, id("user/"+author.key), stamp(created.Add(time.Duration(j+1)*time.Minute))); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}
