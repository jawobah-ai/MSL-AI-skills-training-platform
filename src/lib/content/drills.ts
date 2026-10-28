import type { Abstract, DraftSentence, InboxItem, Snippet } from "@/lib/types";

// Every product, person, trial and number below is invented for training.
// "Velantib" is a fictional product approved (in this exercise) for adults
// with moderate-to-severe plaque psoriasis.

export const ABSTRACTS: Abstract[] = [
  { id: "a1", ta: "Immunology", title: "VEL-301: randomised, double-blind trial of velantib vs placebo in moderate-to-severe plaque psoriasis", text: "Adults (n=612) randomised 2:1. At week 16, 68% on velantib vs 9% on placebo reached the primary endpoint (PASI 75). Serious adverse events 2.9% vs 2.5%." },
  { id: "a2", ta: "Immunology", title: "Real-world persistence with velantib: a retrospective claims analysis", text: "Retrospective cohort of 1,840 patients. Median persistence 14 months. No control arm; primary endpoint not assessed." },
  { id: "a3", ta: "Immunology", title: "VEL-302: randomised trial of velantib vs active comparator", text: "Adults (n=488) randomised 1:1 to velantib or comparator. Week 16 PASI 75: 66% vs 58%. Infections more frequent with velantib (14% vs 10%)." },
  { id: "a4", ta: "Immunology", title: "Case series: velantib in palmoplantar disease", text: "Six patients treated off-protocol. Four improved. No control; adults; not the approved indication." },
  { id: "a5", ta: "Immunology", title: "VEL-201: phase 2 dose-ranging randomised trial", text: "Adults (n=210) randomised to three doses or placebo. Dose-dependent PASI 75 response at week 12. Study not powered for safety." },
  { id: "a6", ta: "Immunology", title: "Velantib pharmacokinetics in healthy volunteers", text: "Open-label, single-dose study in 24 healthy adults. Half-life 9 days. No efficacy endpoints." },
  { id: "a7", ta: "Immunology", title: "VEL-303: adolescent randomised trial", text: "Adolescents aged 12–17 (n=150) randomised to velantib or placebo. Week 16 PASI 75: 61% vs 12%. Population outside adult inclusion rule." },
  { id: "a8", ta: "Immunology", title: "Systematic review of IL-pathway agents in psoriasis", text: "Review of 31 trials. Velantib included from VEL-301 and VEL-302. Pooled estimates only; not a primary trial." },
  { id: "a9", ta: "Immunology", title: "VEL-304: randomised withdrawal study", text: "Adults responding at week 16 (n=320) re-randomised to continue velantib or switch to placebo. Maintenance of response at week 52: 79% vs 21%." },
  { id: "a10", ta: "Immunology", title: "Patient-reported itch with velantib: post-hoc analysis of VEL-301", text: "Post-hoc analysis of randomised data. Itch scores improved more with velantib. Not a prespecified endpoint." },
];

// Correct triage answer for the Gate 1 reference set, shown after a learner submits.
export const ABSTRACT_KEY: Record<string, { include: boolean; reason: string }> = {
  a1: { include: true, reason: "Adult RCT vs control, primary endpoint reported" },
  a2: { include: false, reason: "Observational, no control" },
  a3: { include: true, reason: "Adult RCT vs active control, primary endpoint reported" },
  a4: { include: false, reason: "Case series, outside approved indication" },
  a5: { include: true, reason: "Adult RCT vs placebo; week 12, note the different time point" },
  a6: { include: false, reason: "Healthy volunteers, no efficacy endpoint" },
  a7: { include: false, reason: "Adolescents, outside adult inclusion rule" },
  a8: { include: false, reason: "Systematic review, not a primary trial" },
  a9: { include: true, reason: "Adult randomised withdrawal; different endpoint, flag it" },
  a10: { include: false, reason: "Post-hoc, not the primary endpoint" },
};

export const SEEDED_DRAFT: DraftSentence[] = [
  { id: "s1", text: "Thank you for your question about velantib and the PASI 75 response in adults with moderate-to-severe plaque psoriasis." },
  { id: "s2", text: "In VEL-301, 68% of patients on velantib reached PASI 75 at week 16, compared with 9% on placebo (Doe et al., 2025)." },
  { id: "s3", text: "Velantib is clearly the best-in-class option and should be the first choice for your patients.", issue: { category: "promotional", critical: true, explanation: "Superlative and a treatment recommendation: promotional, not scientific exchange." } },
  { id: "s4", text: "In VEL-302, velantib outperformed the comparator on PASI 75 (66% vs 58%).", issue: { category: "unbalanced", critical: false, explanation: "Reports efficacy but omits the higher infection rate reported in the same trial." } },
  { id: "s5", text: "Velantib also works well in palmoplantar disease, so you may want to consider it there too.", issue: { category: "off-label", critical: true, explanation: "Unsolicited off-label suggestion outside the question asked, based on a six-patient case series." } },
  { id: "s6", text: "Serious adverse events were 2.9% with velantib and 2.5% with placebo in VEL-301." },
  { id: "s7", text: "Compared with all other IL-pathway agents, velantib has the fastest onset of action.", issue: { category: "comparative", critical: true, explanation: "Comparative claim with no head-to-head evidence supplied." } },
  { id: "s8", text: "Most dermatologists now prefer velantib for new patients.", issue: { category: "uncited", critical: false, explanation: "Uncited claim about prescriber preference." } },
  { id: "s9", text: "Response was maintained at week 52 in 79% of patients who continued velantib in VEL-304, vs 21% after switching to placebo." },
  { id: "s10", text: "Patients will be delighted with how quickly their skin clears.", issue: { category: "promotional", critical: false, explanation: "Emotive, promotional tone with no data." } },
  { id: "s11", text: "Please refer to the full prescribing information for complete safety information." },
];

export const SNIPPETS: Snippet[] = [
  { id: "n1", text: "Abstract text of a paper published last year in a peer-reviewed journal.", correctClass: "public", allowedTiers: ["public-ai", "enterprise-ai", "approved-instance"], explanation: "Published literature is public." },
  { id: "n2", text: "Your own bullet notes on themes from three published papers, with no names.", correctClass: "internal", allowedTiers: ["enterprise-ai", "approved-instance"], explanation: "Your working notes are internal; use an approved enterprise tool." },
  { id: "n3", text: "An HCP's email: 'My patient, a 54-year-old man in Leeds, developed a rash after his third dose.'", correctClass: "restricted", allowedTiers: ["no-ai"], explanation: "Patient details and a possible adverse event: restricted, and it goes to PV, not into AI." },
  { id: "n4", text: "A late-breaking abstract shared with you under embargo until the congress session tomorrow.", correctClass: "restricted", allowedTiers: ["no-ai", "approved-instance"], explanation: "Embargoed data is restricted until released." },
  { id: "n5", text: "Approved prescribing information for a marketed product.", correctClass: "public", allowedTiers: ["public-ai", "enterprise-ai", "approved-instance"], explanation: "Approved labelling is public." },
  { id: "n6", text: "A CRM export listing HCP names, call history and preferences.", correctClass: "restricted", allowedTiers: ["no-ai", "approved-instance"], explanation: "HCP personal data and CRM exports are restricted." },
  { id: "n7", text: "Your medical team's internal slide on next year's field strategy.", correctClass: "confidential", allowedTiers: ["enterprise-ai", "approved-instance"], explanation: "Non-public strategy is confidential." },
  { id: "n8", text: "A public trial registry entry for an ongoing phase 3 study.", correctClass: "public", allowedTiers: ["public-ai", "enterprise-ai", "approved-instance"], explanation: "Registry entries are public." },
  { id: "n9", text: "Unpublished interim results from an internal company analysis.", correctClass: "restricted", allowedTiers: ["no-ai", "approved-instance"], explanation: "Unpublished results are restricted." },
  { id: "n10", text: "A de-identified insight: 'KOLs in this region want more real-world data on persistence.'", correctClass: "internal", allowedTiers: ["enterprise-ai", "approved-instance"], explanation: "De-identified insight is internal." },
  { id: "n11", text: "A document describing an unannounced compound in early development.", correctClass: "restricted", allowedTiers: ["no-ai", "approved-instance"], explanation: "Non-public pipeline information is restricted." },
  { id: "n12", text: "Your company's internal SOP on handling medical information requests.", correctClass: "confidential", allowedTiers: ["enterprise-ai", "approved-instance"], explanation: "Internal process documents are not public; treat as confidential unless your policy says internal." },
];

export const INBOX: InboxItem[] = [
  { id: "m1", source: "Email", from: "Dr A. Rivera", subject: "Slides from the regional meeting", body: "Thanks for the session yesterday. Could you send the slide deck on the VEL-301 design?" },
  { id: "m2", source: "Call note", from: "Your notes", subject: "Dr B. Chen, follow-up", body: "Discussed VEL-304 maintenance data. She mentioned one of her patients on velantib was admitted with a severe infection last month. Wants the latest safety summary.", plantedEvent: { kind: "adverse-event", explanation: "A patient, the product and an event (hospital admission with infection)." } },
  { id: "m3", source: "Email", from: "Congress office", subject: "Booth schedule", body: "Your booth shifts for next week's congress are attached." },
  { id: "m4", source: "Email", from: "Dr C. Okafor", subject: "Question on dosing interval", body: "Is there any data on extending the dosing interval beyond what is in the label?" },
  { id: "m5", source: "Transcript", from: "Advisory board", subject: "Session 2 excerpt", body: "Participant 3: we've seen headaches in a couple of our patients after starting velantib, nothing serious, but it keeps coming up.", plantedEvent: { kind: "adverse-event", explanation: "Patients on the product with a reported event (headaches), even though described as not serious." } },
  { id: "m6", source: "Email", from: "Pharmacy, City Hospital", subject: "Pens", body: "Two velantib pens from the same box had cracked housings when we opened them.", plantedEvent: { kind: "product-complaint", explanation: "Product-quality complaint: damaged device." } },
  { id: "m7", source: "Email", from: "Dr D. Haddad", subject: "Journal club", body: "We're discussing the systematic review of IL-pathway agents next month. Would you join?" },
  { id: "m8", source: "Call note", from: "Your notes", subject: "Dr E. Novak", body: "Interested in the palmoplantar case series. Asked if we have anything more robust." },
  { id: "m9", source: "Social post", from: "Patient forum (public)", subject: "Forum post shared by an HCP", body: "Started velantib in March and my vision has been blurry ever since. Anyone else?", plantedEvent: { kind: "adverse-event", explanation: "A possible event from a patient on the product; hand on per SOP even from social media." } },
  { id: "m10", source: "Email", from: "Medical information", subject: "Request closed", body: "The standard response letter you requested has been sent to Dr Okafor." },
];
