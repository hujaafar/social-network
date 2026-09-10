# Common design and motion

## Direction

The requested references were Neo4flix (called New4flex in the request) and the user's Nexora commerce redesign. Their cinematic imagery, oversized typography and photographic depth inform Common. The stronger second direction uses a culture-magazine composition: charcoal framing, electric lime accents, condensed display type and a blue-hour rooftop campaign.

The sign-in screen is an immersive photographic spread alongside the form. On mobile it becomes a compact image header with the form in normal document flow. The signed-in feed immediately exposes search and posting, followed by a compact photographic circle discovery panel and real community content. The same identity continues through registration, circles, group details, profiles, account settings, messages, comments, empty states and notifications.

Manrope carries the working interface, Barlow Condensed carries the campaign and page headings, and Geist Mono carries small section markers. The palette is charcoal `#161914`, electric lime `#d9ff57`, paper `#f4f5ee`, and cobalt accents. Lime is paired with dark text. Body text remains 16px; secondary metadata is at least 12px.

## Motion

- `EditorialImage` maps element scroll progress to a small vertical translation and scale change. Its optional opening crop is disabled for the full-bleed campaign and compact discovery artwork.
- Route content enters over 350ms; the authentication heading settles over 850ms. Hover states move arrows and rotate the asterisk without adding a continuous animation loop.
- Feed entries animate once as they enter view; content is readable before the observer runs.
- Navigation retains native document scrolling. There is no wheel interception or artificial scroll distance.
- Desktop discovery content remains sticky while the feed moves.
- Mobile collapses the secondary column and changes chat to a contact/conversation sequence.
- Reduced motion removes the image transforms, clip animation, reveal motion and smooth scrolling.
- Framer Motion manages observers and subscriptions; custom socket and timer effects clean up on unmount.

## Images

The three campaign photographs were generated with the built-in `image_gen` tool, then encoded to WebP with Sharp. The studio and objects images use quality 84; the after-hours photograph uses quality 85. Creative content was not repainted or composited in code. They depict illustrative people and objects, not actual users or groups.

| Project file | Bytes | Placement |
|---|---:|---|
| `frontend/public/images/common-afterhours.webp` | 115988 | Authentication, feed campaign and navigation |
| `frontend/public/images/common-studio.webp` | 200740 | Profile cover |
| `frontend/public/images/common-objects.webp` | 179940 | Discovery and circles |

The [exact prompts](IMAGE_PROMPTS.txt) are retained. Text and actions are real HTML. Campaign images use Next Image; uploaded images and blob previews remain native images so GIFs and private media do not require an image-proxy allowlist.

`docs/assets/common-cover.svg` is the editable typographic repository cover. It uses the Common wordmark and asterisk geometry, and is separate from the generated photography. The README identifies campaign art accurately rather than presenting it as a product screenshot.

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
- Added branded not-found and route-error states, and made private-profile request failures visible while preventing duplicate submissions.
- Added pinned source formatting, editor conventions, a pull-request template and architecture/contribution guides. Vendored UI primitives are excluded from formatting.

The original Go/SQLite architecture and contributor history remain intact. Existing security policies and all mandatory project requirements have not undergone a comprehensive audit in this design task.
