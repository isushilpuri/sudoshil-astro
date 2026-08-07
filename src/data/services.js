// ---------------------------------------------------------------------------
// Services ("What I Do?" section)
// ---------------------------------------------------------------------------
// To add a new service, copy one { ... } block below and edit the fields.
// Order here = order shown on the page. Cards flow into new rows automatically
// (4 per row on large screens, 2 on tablet), so you can add as many as you like.
//
// Fields (all required):
//   image        Path to the icon under /public, e.g. "/assets/imgs/my-icon.svg".
//                SVGs work best; the icon shrinks slightly on hover. Any image
//                dimensions/aspect ratio are fine — the card renders every icon
//                in the same fixed square box (object-fit: contain), so new
//                services automatically match the size of the existing ones.
//   title        Service name.
//   description  Short summary, revealed on hover. Write "&" normally.
// ---------------------------------------------------------------------------

export const services = [
  {
    image: "/assets/imgs/Connect.svg",
    title: "Amazon Connect",
    description:
      "5+ years designing end-to-end IVR contact flows for enterprise banking. Led Wealth Management, Retail Payment Services & 24/7 Banking delivery, managing a team of 5 engineers from requirement analysis through production.",
  },
  {
    image: "/assets/imgs/Lex.svg",
    title: "Amazon Lex V2",
    description:
      "Architected 30+ Lex V2 bots for banking IVR, achieving an 82% speech recognition rate. Expertise in NLU design, custom vocabulary, threshold-based confirmation, and complex bots — NLU Main Menu, Mobile Push Authentication, Stocks Info.",
  },
  {
    image: "/assets/imgs/Lambda.svg",
    title: "AWS Lambda",
    description:
      "Engineered Python Lambda codehooks for Connect & Lex — user authentication, DynamoDB integration, data validation, and async API calls. Async Lambda implementation helped boost IVR containment to 60% on critical payment features.",
  },
  {
    image: "/assets/imgs/connect-ai-agent.svg",
    title: "Connect AI Agent",
    description:
      "Architected IVR self-service orchestration AI Agents for features like Credit Card Payments and IT Helpdesk  to provide real-time generative AI assistance and automate self-service workflows using integrated knowledge bases and backend tools.",
  },
  {
    image: "/assets/imgs/python-5.svg",
    title: "Python",
    description:
      "Primary language for all IVR codehook development — clean, testable Lambda functions for slot validation, API orchestration, DynamoDB reads/writes, and AWS service integrations across 30+ production bots.",
  },
];
