import type { Gate, GateId } from "@/lib/types";

// Teaching content for the four learner gate modules. Gate 5 (graded practical
// assessment) is not a module: it is the rubric applied to every build below.
// All compliance wording is a teaching draft pending sign-off by a qualified
// medical-affairs compliance, pharmacovigilance and privacy reviewer.

export const CONTENT_VERSION = "0.1.0-draft";
export const CONTENT_REVIEW_STATUS = "Not yet reviewed by compliance, PV or privacy experts";

export const GATES: Gate[] = [
  {
    id: "g1",
    rubricId: "D1.1",
    number: 1,
    title: "Your MSL week, rebuilt with AI",
    summary:
      "Map your recurring tasks, time them, and build prompt patterns for the three that cost the most time. The baseline you record here is re-timed at the capstone.",
    prerequisites: [],
    metric: "Baseline minutes per task, re-timed at the capstone",
    units: [
      {
        id: "audit",
        title: "Audit your week",
        minutes: 12,
        paragraphs: [
          "Before choosing any AI tool, write down what you actually do. List every task you repeat at least monthly: literature monitoring, pre-call planning, insight write-ups, congress coverage, internal reports, slide updates, email triage.",
          "For each task, estimate minutes per week from your last two typical weeks, not an ideal week. These numbers become your baseline, so be honest: a low baseline makes your later time savings look small, a high one makes them unbelievable.",
          "Mark the three tasks with the most minutes that are also low in judgement. Those are where AI pays back first.",
        ],
        keyPoints: [
          "List 8 or more recurring tasks",
          "Minutes per week from real weeks",
          "Pick three high-time, low-judgement tasks",
        ],
      },
      {
        id: "triage",
        title: "Literature triage with a cited output table",
        minutes: 15,
        paragraphs: [
          "A good triage prompt states the question, the inclusion rules, and the exact output you want. Ask for a table with one row per paper: citation, design, population, key finding, and whether it meets your inclusion rules, with a reason.",
          "Tell the model to use only the abstracts you supply and to write 'not stated' rather than guess. Then check every row against the abstract yourself. A row you cannot trace back to the source is removed, not edited to fit.",
          "Save the prompt as a card: the question, the rules, the table format and the verification step. You will reuse it every week.",
        ],
        keyPoints: [
          "Question + inclusion rules + output format",
          "Only supplied sources; 'not stated' over guessing",
          "Verify every row against the abstract",
        ],
      },
      {
        id: "precall",
        title: "Pre-call brief from public sources",
        minutes: 12,
        paragraphs: [
          "A pre-call brief draws on public, scientific sources only: the HCP's publications, trial registry entries they lead, and congress presentations. It does not draw on CRM exports or personal details pasted into a public tool.",
          "Ask the model for the HCP's research themes, recent publications with citations, and open scientific questions you could discuss. Every item needs a source link you have opened.",
          "The brief prepares a scientific conversation. It is never a list of selling points.",
        ],
        keyPoints: [
          "Public scientific sources only",
          "Every item linked to a source you opened",
          "Prepares scientific exchange, not promotion",
        ],
      },
      {
        id: "insight",
        title: "Field notes to a structured insight record",
        minutes: 12,
        paragraphs: [
          "Insights are only useful to your medical team if they arrive in a consistent shape. Turn rough notes into a record with: topic, the insight in one sentence, the evidence or context, therapeutic area, and suggested follow-up.",
          "Before any note goes into an AI tool, remove names and any patient details, and check the tool is approved for internal data (Gate 3 covers this in depth).",
          "Read the structured record against your notes. The model must not add certainty, numbers or conclusions the HCP did not express.",
        ],
        keyPoints: [
          "Consistent insight fields",
          "De-identify before AI",
          "No added certainty or numbers",
        ],
      },
    ],
    build: {
      title: "Task map and three prompt cards",
      minutes: 20,
      instructions: [
        "List your recurring tasks with baseline minutes per week.",
        "Write a prompt card for each of your three largest time sinks: purpose, prompt text, required inputs, output format, and the human check before use.",
        "Run one card on the 10 synthetic abstracts in this module and paste a short summary of the result.",
      ],
      fields: [
        { id: "taskMap", label: "Task map with baseline minutes", help: "One task per line: task — minutes per week" },
        { id: "promptCards", label: "Three prompt cards", help: "Purpose, prompt text, inputs, output format, human check" },
        { id: "testRun", label: "Test run on the synthetic abstracts", help: "What came back, and what you corrected after checking the sources" },
        { id: "reviewStep", label: "Your human review step", help: "Who checks the output, and against what, before it is used" },
      ],
    },
    drillTitle: "Reference set: 10 synthetic abstracts",
    drillIntro:
      "Use these invented abstracts to test your literature-triage prompt card. Question: in adults with moderate-to-severe disease, does the intervention improve the primary endpoint versus control? Include only randomised controlled trials.",
  },
  {
    id: "g2",
    rubricId: "D3.1",
    number: 2,
    title: "Keeping AI on the scientific side of the line",
    summary:
      "Catch where an AI draft drifts into promotion or unsolicited off-label content, and build that check into your prompts.",
    prerequisites: ["g1"],
    metric: "Share of seeded issues caught, before vs after",
    units: [
      {
        id: "drift",
        title: "How AI drafts become promotional",
        minutes: 12,
        paragraphs: [
          "Language models tend to write persuasively. Asked to summarise data, they emphasise benefits, soften limitations, and reach for superlatives such as 'best-in-class' or 'breakthrough'.",
          "In scientific exchange that drift is a compliance problem. Watch for unbalanced presentation of efficacy and safety, comparative claims without head-to-head evidence, and claims without a citation.",
          "Treat every AI draft as raw material that must be checked for tone and balance before anyone sees it.",
        ],
        keyPoints: ["Models write persuasively by default", "Balance efficacy and safety", "No uncited or comparative claims"],
      },
      {
        id: "unsolicited",
        title: "Unsolicited requests: answer the question asked",
        minutes: 12,
        paragraphs: [
          "When an HCP asks an unsolicited question, including about an unapproved use, your response should address that specific question, be scientific and balanced, and follow your company's medical-information process.",
          "An AI draft often answers a broader question than the one asked. Cut it back to the question, keep the citations, and route it through the process your company SOP sets out.",
          "Your compliance team applies current FDA guidance on unsolicited requests and on scientific information about unapproved uses. Follow their interpretation, not the model's.",
        ],
        keyPoints: ["Scope to the question asked", "Cited and balanced", "Route per company SOP"],
      },
      {
        id: "phrma",
        title: "PhRMA Code and Open Payments: what AI does not change",
        minutes: 10,
        paragraphs: [
          "Using AI does not change your obligations under the PhRMA Code or the Open Payments (Sunshine Act) reporting your company carries out.",
          "If an AI workflow helps you plan an interaction that involves a meal, a consulting arrangement or another transfer of value, the normal approvals and reporting still apply.",
          "Keep AI-generated material that you share externally within your company's approved materials and review processes.",
        ],
        keyPoints: ["Same Code obligations", "Same transfer-of-value reporting", "External material goes through review"],
      },
      {
        id: "guardrail",
        title: "Writing a guardrail block",
        minutes: 12,
        paragraphs: [
          "A guardrail block is a short set of instructions you add to every scientific prompt: write in neutral scientific language; present efficacy and safety together; cite every claim to a supplied source; do not compare products unless the source does; answer only the question asked; flag anything that may concern an unapproved use.",
          "The block reduces drift but does not remove it. You still review every output.",
        ],
        keyPoints: ["Neutral, balanced, cited", "Scope-limited", "Still review every output"],
      },
    ],
    build: {
      title: "Guardrail block and red-flag checklist",
      minutes: 15,
      instructions: [
        "Write a reusable guardrail block you will paste into your scientific prompts.",
        "Write a one-page red-flag checklist you use to review AI drafts.",
        "Describe how you route an off-label question in your company.",
      ],
      fields: [
        { id: "guardrail", label: "Guardrail block", help: "The instructions you add to every scientific prompt" },
        { id: "checklist", label: "Red-flag checklist", help: "What you check in every AI draft before use" },
        { id: "routing", label: "Off-label routing", help: "Which process an unsolicited off-label question goes through" },
        { id: "reviewStep", label: "Your human review step", help: "Who reviews the output before it leaves you" },
      ],
    },
    drillTitle: "Red-flag drill: a seeded AI draft",
    drillIntro:
      "An AI tool drafted this reply to an HCP who asked about Product X's effect on the primary endpoint in the approved indication. Select every sentence that needs correcting and choose why.",
  },
  {
    id: "g3",
    rubricId: "D3.2",
    number: 3,
    title: "Classify before you paste",
    summary:
      "Decide, before any prompt, what class of data you hold and which tool may receive it. This gate has a zero-tolerance pass rule.",
    prerequisites: ["g1"],
    metric: "Classification accuracy, before vs after",
    units: [
      {
        id: "classes",
        title: "Four data classes",
        minutes: 12,
        paragraphs: [
          "Public: published papers, approved labelling, public trial registry entries. Internal: your own working notes without identifiers, internal process documents. Confidential: non-public company information such as strategy documents and unpublished internal analyses. Restricted: patient details, embargoed congress or pre-publication data, non-public pipeline information, HCP personal data and CRM exports.",
          "Your company's policy defines its own classes. Use its names where they differ; the habit of classifying first is what matters.",
        ],
        keyPoints: ["Public, internal, confidential, restricted", "Classify before every prompt", "Company policy wins on names"],
      },
      {
        id: "tiers",
        title: "Consumer, enterprise and approved tools",
        minutes: 12,
        paragraphs: [
          "Tools differ in what happens to what you paste: whether it is retained, whether it can be used to train models, and who can access it. A consumer account and an enterprise contract for the same model can behave very differently.",
          "Only public data goes into public AI tools. Internal and confidential data go only into tools your company has approved for that class. Restricted data goes into an AI tool only when your company has approved that tool for that data, with the required agreements in place; otherwise it does not go into AI at all.",
          "Find your company's approved-tool list and keep it next to your prompt cards.",
        ],
        keyPoints: ["Same model, different contracts", "Match class to approved tool", "Restricted: no AI unless explicitly approved"],
      },
      {
        id: "minimise",
        title: "De-identification and minimisation",
        minutes: 12,
        paragraphs: [
          "Remove names, dates, locations and other identifiers, and cut any detail the task does not need, before AI processing. Minimisation is the default even in approved tools.",
          "Protected health information can arrive inside ordinary material: an HCP email describing a patient, a call note with a case. Where HIPAA applies, it must be handled only in arrangements your company has set up for it.",
        ],
        keyPoints: ["Strip identifiers first", "Cut what the task does not need", "Watch for PHI inside routine material"],
      },
      {
        id: "embargo",
        title: "Embargoes and pipeline data",
        minutes: 10,
        paragraphs: [
          "Congress data under embargo and unpublished results are restricted until the embargo lifts or the data are published. Pasting a late-breaking abstract into a public tool before release can breach the embargo.",
          "Non-public pipeline information stays out of AI tools unless your company has approved a tool for it.",
        ],
        keyPoints: ["Embargoed data is restricted", "Pipeline data is restricted", "When unsure, treat as restricted"],
      },
    ],
    build: {
      title: "Personal traffic-light card",
      minutes: 15,
      instructions: [
        "Take each task from your Gate 1 task map.",
        "For each, state the data class it involves and the tool tier it may use.",
        "Check each line against your company's approved-tool list and note where you are unsure.",
      ],
      fields: [
        { id: "card", label: "Traffic-light card", help: "Task — data class — allowed tool tier" },
        { id: "approvedList", label: "Your company's approved tools", help: "Which tools are approved for which class, or what you still need to find out" },
        { id: "minimisation", label: "Your minimisation steps", help: "What you remove before AI use" },
        { id: "reviewStep", label: "Your human review step", help: "Who checks data handling before use" },
      ],
    },
    drillTitle: "Sorting drill: 12 snippets",
    drillIntro:
      "For each snippet, choose its data class and the tool tier it may go into. Sending a restricted snippet to a public AI tool fails the drill outright.",
  },
  {
    id: "g4",
    rubricId: "D3.3",
    number: 4,
    title: "When AI surfaces an adverse event",
    summary:
      "Any possible adverse event or product-quality complaint found by an AI workflow pauses that item and goes to a person, who reports it through the company process.",
    prerequisites: ["g1", "g3"],
    metric: "Planted events caught, before vs after",
    units: [
      {
        id: "where",
        title: "Where adverse events hide",
        minutes: 10,
        paragraphs: [
          "AI now reads the places adverse events appear: call notes, HCP emails, meeting transcripts, congress Q&A, social posts and published case reports.",
          "A summary can bury an event in a single clause. Automations that summarise, tag or file material must look for events before they do anything else.",
        ],
        keyPoints: ["Notes, emails, transcripts, literature", "Summaries can bury events", "Check before summarising"],
      },
      {
        id: "elements",
        title: "Recognising a possible report",
        minutes: 12,
        paragraphs: [
          "Your company's pharmacovigilance SOP defines what must be reported and how fast. In training, treat anything that mentions a patient, a company product, and something that happened to the patient while on it as a possible adverse event to hand on.",
          "Product-quality complaints, such as a damaged pack, an odd colour or a device that failed, are handed on the same way.",
          "Your job is to recognise and hand on, not to judge causality or seriousness. That is the PV team's job.",
        ],
        keyPoints: ["Patient + product + event = hand it on", "Quality complaints too", "Do not judge causality"],
      },
      {
        id: "pause",
        title: "Building a flag-and-pause step",
        minutes: 12,
        paragraphs: [
          "Every automation you build gets an instruction at the start: if the material mentions a possible adverse event or product complaint, stop, mark the item, and do not summarise, file or reply to it.",
          "The flagged item comes to you. You report it through the company PV process within the timeline in your SOP. The AI tool never files, edits or closes a report.",
        ],
        keyPoints: ["Flag and pause first", "A person reports", "The tool never files the report"],
      },
      {
        id: "drill-intro",
        title: "Practising on a synthetic inbox",
        minutes: 8,
        paragraphs: [
          "The drill gives you an invented inbox of emails and call notes. Some contain planted events. Flag every item you would hand to PV.",
          "Missing a planted event fails the drill. Flagging an item that turns out not to need reporting is not penalised: when unsure, hand it on.",
        ],
        keyPoints: ["Missing an event fails", "Over-flagging is safe", "When unsure, hand it on"],
      },
    ],
    build: {
      title: "Flag-and-pause block and PV handoff note",
      minutes: 15,
      instructions: [
        "Add a flag-and-pause instruction block to your Gate 1 prompt cards.",
        "Write a handoff note template for passing a flagged item to your PV team.",
        "Test the block on one planted item from the drill and describe the result.",
      ],
      fields: [
        { id: "pauseBlock", label: "Flag-and-pause block", help: "The instruction added to the start of every automation" },
        { id: "handoff", label: "PV handoff note template", help: "What you send to PV, and through which channel per your SOP" },
        { id: "testResult", label: "Test on a planted event", help: "Which item you tested and what the tool did" },
        { id: "reviewStep", label: "Your human review step", help: "Who checks that nothing was missed" },
      ],
    },
    drillTitle: "Inbox drill: find the planted events",
    drillIntro:
      "This invented inbox mixes routine messages with possible adverse events and product complaints. Flag every item you would hand to your PV team.",
  },
];

export function getGate(id: string): Gate | undefined {
  return GATES.find((g) => g.id === id);
}

export const GATE_IDS: GateId[] = GATES.map((g) => g.id);
