// ---------------------------------------------------------------------------
// Portfolio projects
// ---------------------------------------------------------------------------
// To add a new project, copy one { ... } block below and edit the fields.
// Order here = order shown on the page. Cards flow into a responsive grid
// (3 per row on desktop), so add as many as you like.
//
// Fields:
//   image        (required)  Path to the image under /public, e.g. "/assets/imgs/x.jpg".
//                            Shown in a 16:10 frame, center-cropped to fit.
//   title        (required)  Project name shown on the card.
//   description  (required)  Short summary. Write "&" normally.
//   category     (optional)  Bucket used by the filter bar, e.g. "IVR" or "Web".
//                            Any new category automatically appears as a filter chip.
//   tags         (optional)  Array of short labels shown as pills, e.g. ["React", "AWS"].
//   links        (optional)  Array of buttons, e.g. [{ label: "See Live", url: "https://..." }].
//                            First link is emphasised. Use tags and/or links freely.
// ---------------------------------------------------------------------------

export const projects = [
  {
    image: "/assets/imgs/folio-c.jpg",
    title: "Wealth Management IVR",
    category: "IVR",
    description:
      "Enterprise IVR cloud migration to AWS — Amazon Connect, Lex V2 & Lambda. Led full delivery: requirement analysis, contact flow design, sprint planning & cross-team coordination.",
    tags: ["Amazon Connect", "Lex V2", "Lambda"],
  },
  {
    image: "/assets/imgs/folio-card.jpg",
    title: "Retail Payment Services",
    category: "IVR",
    description:
      "Credit card IVR with NLU Main Menu & async Lambda — boosted speech recognition to 82% and IVR containment to 60% for critical payment flows.",
    tags: ["82% Recognition", "60% Containment", "NLU"],
  },
  {
    image: "/assets/imgs/folio-chat.jpg",
    title: "Chat App",
    category: "Web",
    description: "WebSocket real-time chat application built on Node.js.",
    tags: ["Node.js", "WebSocket"],
    links: [
      { label: "See Live", url: "https://ping-me.onrender.com/" },
      { label: "Source Code", url: "https://github.com/isushilpuri/node3-chat-app" },
    ],
  },
];
