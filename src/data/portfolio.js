// ---------------------------------------------------------------------------
// Portfolio projects
// ---------------------------------------------------------------------------
// To add a new project, copy one { ... } block below and edit the fields.
// Order here = order shown on the page. Cards flow into new rows automatically
// (3 per row on desktop), so you can add as many as you like.
//
// Fields:
//   image        (required)  Path to the image under /public, e.g. "/assets/imgs/my-project.jpg".
//                            Images are shown as a square and center-cropped to fit.
//   title        (required)  Project name shown on the card.
//   description  (required)  Short summary, revealed on hover/tap. Write "&" normally.
//   tags         (optional)  Array of short labels shown as pills, e.g. ["React", "AWS"].
//   links        (optional)  Array of buttons, e.g. [{ label: "See Live", url: "https://..." }].
//                            Use tags OR links (the Chat App card uses links instead of tags).
// ---------------------------------------------------------------------------

export const projects = [
  {
    image: "/assets/imgs/folio-c.jpg",
    title: "Wealth Management IVR",
    description:
      "Enterprise IVR cloud migration to AWS — Amazon Connect, Lex V2 & Lambda. Led full delivery: requirement analysis, contact flow design, sprint planning & cross-team coordination.",
    tags: ["Amazon Connect", "Lex V2", "Lambda"],
  },
  {
    image: "/assets/imgs/folio-card.jpg",
    title: "Retail Payment Services",
    description:
      "Credit card IVR with NLU Main Menu & async Lambda — boosted speech recognition to 82% and IVR containment to 60% for critical payment flows.",
    tags: ["82% Recognition", "60% Containment", "NLU"],
  },
  {
    image: "/assets/imgs/folio-chat.jpg",
    title: "Chat App",
    description: "Web Socket real-time chat application.",
    links: [
      { label: "See Live", url: "https://ping-me.onrender.com/" },
      { label: "Source Code", url: "https://github.com/isushilpuri/node3-chat-app" },
    ],
  },
];
