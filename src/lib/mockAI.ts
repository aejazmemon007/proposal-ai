import type { BriefAnalysis, PricingSuggestion, ProposalContent, ScopeItem } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function analyzeBrief(brief: string): Promise<BriefAnalysis> {
  await delay(2800 + Math.random() * 600);

  const isDesign = /design|ui|ux|figma|wireframe/i.test(brief);
  const isDev = /develop|code|website|app|build|react|next/i.test(brief);
  const isBrand = /brand|logo|identity|visual/i.test(brief);
  const isMarketing = /marketing|seo|campaign|content|social/i.test(brief);

  let type = "Web Design";
  if (isDesign && !isDev) type = "UI/UX Design";
  if (isDev && !isDesign) type = "Web Development";
  if (isBrand) type = "Brand Identity";
  if (isMarketing) type = "Marketing & SEO";
  if (isDesign && isDev) type = "Full-Stack Product Design";

  return {
    project_type: type,
    project_summary:
      "A comprehensive redesign project focused on modernizing the digital experience and improving usability across key user flows.",
    client_goals: [
      "Modernize the existing interface to current design standards",
      "Improve user navigation and reduce task completion time",
      "Create a consistent visual language across all touchpoints",
      "Increase user engagement and feature discoverability",
    ],
    requirements: [
      "Responsive design for desktop, tablet and mobile",
      "Design system documentation",
      "Interactive prototype for stakeholder review",
      "Developer-ready Figma handoff",
    ],
    deliverables: [
      "Discovery & audit report",
      "Information architecture",
      "High-fidelity UI designs",
      "Interactive prototype",
      "Design system components",
      "Figma project with organized layers",
    ],
    constraints: [
      "Must align with existing brand colors",
      "Timeline sensitive—launch before Q4",
    ],
    timeline: "4–6 weeks",
    budget: "Not specified",
    risks: [
      "Scope may expand if additional screens are identified during discovery",
      "Stakeholder availability for feedback rounds",
    ],
    missing_information: [
      "Number of screens or user flows in scope",
      "Existing design system or component library?",
      "Developer handoff requirements (Figma only, or specs + assets)?",
      "Preferred design tool if not Figma",
      "Number of stakeholders involved in approval",
    ],
    suggested_scope: [
      "UX Audit",
      "Information Architecture",
      "User Flows",
      "Wireframes",
      "High-Fidelity UI Design",
      "Responsive Layouts",
      "Design System",
      "Interactive Prototype",
      "Developer Handoff",
    ],
    complexity: "Medium",
    assumptions: [
      "Client has existing brand guidelines available",
      "One primary decision-maker for approvals",
      "2 rounds of revisions are sufficient",
    ],
  };
}

export async function suggestPricing(
  data: {
    scopeItems: ScopeItem[];
    complexity: string;
    timeline: string;
    profession: string;
    experience: string;
    currency: string;
  }
): Promise<PricingSuggestion> {
  await delay(2200 + Math.random() * 500);

  const baseRates: Record<string, number> = {
    INR: 45000,
    USD: 2800,
    EUR: 2500,
    GBP: 2200,
    AUD: 4200,
    CAD: 3800,
  };

  const base = baseRates[data.currency] || 45000;
  const scopeMultiplier = Math.max(0.7, Math.min(1.8, data.scopeItems.filter((s) => s.included).length * 0.12));
  const complexityMultiplier = data.complexity === "High" ? 1.35 : data.complexity === "Low" ? 0.75 : 1;
  const expMultiplier = data.experience === "5+ years" ? 1.4 : data.experience === "3-5 years" ? 1.15 : data.experience === "1-3 years" ? 0.9 : 0.7;

  const recommended = Math.round((base * scopeMultiplier * complexityMultiplier * expMultiplier) / 1000) * 1000;

  return {
    low: Math.round(recommended * 0.75),
    recommended,
    premium: Math.round(recommended * 1.4),
    currency: data.currency,
    reasoning: `Based on the scope you've outlined (${data.scopeItems.filter((s) => s.included).length} deliverables), ${data.complexity.toLowerCase()} complexity, and your experience level, this range reflects fair market positioning for ${data.profession} work in your region. The recommended price gives you reasonable margin while remaining competitive.`,
    assumptions: [
      "Pricing excludes stock imagery, third-party tools, or development costs",
      "Based on 2 rounds of revisions included",
      "Assumes single stakeholder for approvals",
      "Timeline within the 4–8 week range",
    ],
  };
}

export async function generateProposal(
  data: {
    clientName: string;
    company?: string;
    projectName: string;
    projectType: string;
    brief: string;
    scopeItems: ScopeItem[];
    price: number;
    currency: string;
    pricingModel: string;
    style: string;
    timeline?: string;
    analysis?: BriefAnalysis;
  },
  onProgress?: (step: number, label: string) => void
): Promise<ProposalContent> {
  const steps = [
    "Analyzing client brief...",
    "Structuring project scope...",
    "Building deliverables list...",
    "Writing proposal content...",
    "Personalizing your proposal...",
    "Finalizing...",
  ];

  for (let i = 0; i < steps.length; i++) {
    await delay(700 + Math.random() * 900);
    onProgress?.(i + 1, steps[i]);
  }

  const currencySymbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$" };
  const sym = currencySymbols[data.currency] || "₹";
  const includedScope = data.scopeItems.filter((s) => s.included);

  return {
    title: data.projectName,
    introduction: `Thank you for the opportunity to work on ${data.projectName}. After reviewing your brief carefully, I have a clear picture of what you're looking for and I'm confident I can deliver results that meet your goals.\n\nThis proposal outlines the scope, timeline, and investment for the project. Everything here is open to discussion—my goal is to make sure we're aligned before we begin.`,
    project_understanding: `${data.company ? `${data.company} is` : "You are"} looking for a ${data.projectType.toLowerCase()} that addresses specific gaps in the current experience. Based on your brief, the key challenge is ${data.analysis?.client_goals?.[0]?.toLowerCase() || "improving the overall user experience and bringing the product up to modern standards"}.\n\nThe project needs to move efficiently without cutting corners on quality. I've structured the scope to focus on the highest-impact areas first.`,
    goals: data.analysis?.client_goals || [
      "Deliver a polished, professional result that reflects well on your brand",
      "Keep the process collaborative and transparent throughout",
      "Meet the agreed timeline with clear milestones",
      "Provide work that's ready to use without back-and-forth",
    ],
    proposed_solution: `My approach starts with a focused discovery phase to understand the context before touching any design or code. From there, I work in iterative stages—so you see progress early and can give feedback when it matters most, not at the end.\n\nI'll document decisions along the way, so the handoff is clean and your team can continue building on the work.`,
    scope: includedScope.map((s) => s.title),
    deliverables: includedScope.map((s) => s.description || s.title),
    timeline: [
      { phase: "Discovery & Audit", duration: "Week 1", description: "Review existing materials, define objectives, align on success criteria" },
      { phase: "Strategy & Architecture", duration: "Week 1–2", description: "Information architecture, user flows, low-fidelity wireframes" },
      { phase: "Design", duration: "Week 2–4", description: "High-fidelity UI design, component library, responsive layouts" },
      { phase: "Review & Refinements", duration: "Week 4–5", description: "Client feedback rounds, refinements, final polish" },
      { phase: "Delivery & Handoff", duration: "Week 5–6", description: "Final files, documentation, developer handoff package" },
    ],
    investment: {
      total: data.price,
      currency: data.currency,
      model: data.pricingModel,
      breakdown: `Total project investment: ${sym}${data.price.toLocaleString()}`,
    },
    payment_terms: `To proceed, a 50% deposit (${sym}${Math.round(data.price * 0.5).toLocaleString()}) is required before work begins. The remaining 50% (${sym}${Math.round(data.price * 0.5).toLocaleString()}) is due upon final delivery.\n\nPayment accepted via bank transfer or UPI. Work does not begin until the deposit is received.`,
    revisions: "This proposal includes 2 rounds of revisions at each major milestone. Additional revision rounds can be arranged at my standard hourly rate. Revisions are changes to the agreed scope—new requirements are treated as scope additions.",
    exclusions: [
      "Stock photography, illustration, or icon purchases",
      "Copywriting or content creation",
      "Web development or coding (unless specified)",
      "Printing or production costs",
      "Social media management",
    ],
    assumptions: data.analysis?.assumptions || [
      "Client will provide existing brand assets within 3 business days of project start",
      "One primary point of contact for approvals",
      "Feedback provided within 3 business days of each submission",
      "Scope does not expand significantly from what's outlined here",
    ],
    terms: `All deliverables remain property of ${data.company || "the client"} upon receipt of final payment. I retain the right to display the work in my portfolio unless otherwise agreed in writing.\n\nIf the project is paused for more than 30 days due to client delays, a restart fee may apply. Either party may terminate the agreement with 7 days written notice; work completed to date is billable.\n\n[Note: This is a template. Have this reviewed by a legal professional before use in client-facing proposals.]`,
    next_steps: `If this proposal looks right to you, here's how we move forward:\n\n1. Confirm you'd like to proceed (a reply to this proposal works)\n2. Sign the project agreement\n3. Submit the initial deposit\n4. I'll send a project kick-off document with everything we need to get started\n\nIf you have questions about anything here, I'm happy to jump on a quick call or answer via message. Looking forward to working together on ${data.projectName}.`,
  };
}

export async function rewriteSection(
  section: string,
  content: string,
  instruction: string
): Promise<string> {
  await delay(1800 + Math.random() * 600);

  const shortened = content.split(". ").slice(0, 2).join(". ") + ".";
  const expanded = content + "\n\nFurthermore, the approach ensures that all work is delivered with full transparency and attention to detail. Each phase builds on the last, creating a foundation for long-term success.";

  if (/shorten|brief|concise/i.test(instruction)) return shortened;
  if (/expand|detail|longer/i.test(instruction)) return expanded;
  if (/professional/i.test(instruction)) {
    return content.replace(/I'll/g, "I will").replace(/don't/g, "do not").replace(/can't/g, "cannot");
  }
  if (/persuasive|compelling/i.test(instruction)) {
    return content + "\n\nClients who have gone through this process consistently report that the structured approach saves time, reduces revision cycles, and results in work they're genuinely proud to launch.";
  }

  return `${content}\n\n[Rewritten based on: "${instruction}"] This section has been refined to improve clarity and alignment with your client's priorities.`;
}
