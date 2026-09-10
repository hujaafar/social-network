# Common design and motion

## Direction

The requested references were Neo4flix (called New4flex in the request) and the user's Nexora commerce redesign. Nexora's local source and design notes established oversized typography, ivory/ink surfaces, burnt orange details, photographic depth and scroll-linked movement. Common adapts that direction to a working social network.

The first signed-in screen offers search and posting immediately. A compact photographic spread sets the tone; it does not introduce an extra landing page before the feed. The same identity continues through registration, circles, group details, profiles, account settings, messages, comments and notifications.

## Motion

- `EditorialImage` maps element scroll progress to a small vertical translation and scale change, with an opening crop.
- Feed entries animate once as they enter view; content is readable before the observer runs.
- Navigation retains native document scrolling. There is no wheel interception or artificial scroll distance.
- Desktop discovery content remains sticky while the feed moves.
- Mobile collapses the secondary column and changes chat to a contact/conversation sequence.
- Reduced motion removes the image transforms, clip animation, reveal motion and smooth scrolling.
- Framer Motion manages observers and subscriptions; custom socket and timer effects clean up on unmount.

## Images

Both campaign photographs were generated with the built-in `image_gen` tool, then encoded to WebP with Sharp at quality 84. Creative content was not repainted or composited in code. They depict illustrative people and objects, not actual users or groups.

| Project file | Bytes | Placement |
|---|---:|---|
| `frontend/public/images/common-studio.webp` | 200740 | Sign-in, feed cover and profile cover |
| `frontend/public/images/common-objects.webp` | 179940 | Discovery and circles |

The [exact prompts](IMAGE_PROMPTS.txt) are retained. Text and actions are real HTML. Campaign images use Next Image; uploaded images and blob previews remain native images so GIFs and private media do not require an image-proxy allowlist.

## Behavior improvements

- Removed the mobile feed callback that threw an exception, the dead password-recovery link and the inactive GitHub login button.
- Added loading, empty and failure states, keyboard labels, focus visibility and dialogs with focus management.
- Made group search and chat contact search editable and functional.
- Added the actual notification page and a shared unread indicator, refreshed every 30 seconds independently from incoming-chat popups.
- Prevented duplicate post submissions and retained drafts after failures.
- Added a server acknowledgement for persisted private messages, stable message IDs and reconnect cleanup. Message drafts clear after acknowledgement.
- Corrected the profile date label to identify birth date rather than presenting it as a join date.
- Centralized HTTP/media/WebSocket origins and corrected Docker's browser-facing API configuration.
- Store absent notification post references as SQL NULL and read nullable fields safely.

The original Go/SQLite architecture and contributor history remain intact. Existing security policies and all mandatory project requirements have not undergone a comprehensive audit in this design task.
