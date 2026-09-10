// seed-demo is an explicit local operation; it is never called by migrations or startup.
package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"social-network/app/demo"
	"time"

	_ "modernc.org/sqlite"
)

func main() {
	runtimeFlag := flag.String("runtime-dir", "", "Existing isolated local runtime containing social_network.db")
	assetsFlag := flag.String("assets-dir", "", "Common campaign directory: frontend/public/images")
	flag.Parse()
	if *runtimeFlag == "" || *assetsFlag == "" {
		log.Fatal("Both -runtime-dir and -assets-dir are required")
	}
	runtimeDir, err := filepath.EvalSymlinks(*runtimeFlag)
	if err != nil {
		log.Fatal(err)
	}
	runtimeDir, err = filepath.Abs(runtimeDir)
	if err != nil {
		log.Fatal(err)
	}
	// Refuse repository roots and backend checkouts, including the tracked legacy DB.
	for _, marker := range []string{"go.mod", "package.json", ".git"} {
		if _, err := os.Stat(filepath.Join(runtimeDir, marker)); err == nil {
			log.Fatal("Choose an isolated runtime directory outside the source checkout")
		}
	}
	database := filepath.Join(runtimeDir, "social_network.db")
	if info, err := os.Stat(database); err != nil || !info.Mode().IsRegular() {
		log.Fatal("An existing migrated runtime database is required")
	}
	db, err := sql.Open("sqlite", database+"?_pragma=busy_timeout(5000)&_pragma=foreign_keys(1)")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	var version, dirty int
	if err := db.QueryRow("SELECT version, dirty FROM schema_migrations").Scan(&version, &dirty); err != nil || version < 22 || dirty != 0 {
		log.Fatal("Run the application migrations successfully before adding demo content")
	}
	if err := demo.Seed(context.Background(), db, runtimeDir, *assetsFlag, time.Now()); err != nil {
		log.Fatal(err)
	}
	fmt.Println("Demo content ready: 8 fictional profiles, 12 posts, 24 comments and 45 reactions. Existing records were preserved.")
}
