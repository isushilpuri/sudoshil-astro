// ---------------------------------------------------------------------------
// Services ("What I do" section)
// ---------------------------------------------------------------------------
// To add a new service, copy one { ... } block below and edit the fields.
// Order here = order shown on the page. Cards flow into a responsive grid
// (2 per row on desktop, 1 on mobile), so add as many as you like.
//
// Fields:
//   image        (required)  Path to the icon under /public, e.g. "/assets/imgs/x.svg".
//                            Rendered in a fixed square box (object-fit: contain),
//                            so any size/aspect ratio matches the others.
//   title        (required)  Service name.
//   description  (required)  Short summary shown on the card. Write "&" normally.
//   tags         (optional)  Array of short skill pills, e.g. ["NLU", "DynamoDB"].
// ---------------------------------------------------------------------------

export const services = [
  {
    image: "/assets/imgs/Connect.svg",
    title: "Amazon Connect",
    description:
      "5+ years designing end-to-end IVR contact flows for enterprise banking. Led Wealth Management, Retail Payment Services & 24/7 Banking delivery, managing a team of 5 engineers from requirement analysis through production.",
    tags: ["Contact Flows", "Team Lead", "Banking IVR"],
  },
  {
    image: "/assets/imgs/Lex.svg",
    title: "Amazon Lex V2",
    description:
      "Architected 30+ Lex V2 bots for banking IVR, achieving an 82% speech recognition rate. Expertise in NLU design, custom vocabulary, threshold-based confirmation, and complex bots — NLU Main Menu, Mobile Push Authentication, Stocks Info.",
    tags: ["NLU Design", "Custom Vocabulary", "82% Recognition"],
  },
  {
    image: "/assets/imgs/Lambda.svg",
    title: "AWS Lambda",
    description:
      "Engineered Python Lambda codehooks for Connect & Lex — user authentication, DynamoDB integration, data validation, and async API calls. Async Lambda implementation helped boost IVR containment to 60% on critical payment features.",
    tags: ["Python", "DynamoDB", "Async APIs"],
  },
  {
    image: "/assets/imgs/connect-ai-agent.svg",
    title: "Connect AI Agent",
    description:
      "Architected IVR self-service orchestration AI Agents for features like Credit Card Payments and IT Helpdesk to provide real-time generative AI assistance and automate self-service workflows using integrated knowledge bases and backend tools.",
    tags: ["Bedrock", "Knowledge Bases", "Orchestration"],
  },
  {
    image: "/assets/imgs/python-5.svg",
    title: "Python",
    description:
      "Primary language for all IVR codehook development — clean, testable Lambda functions for slot validation, API orchestration, DynamoDB reads/writes, and AWS service integrations across 30+ production bots.",
    tags: ["Lambda", "Slot Validation", "Testing"],
  },
];
