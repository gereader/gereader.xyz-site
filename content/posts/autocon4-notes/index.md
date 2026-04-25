---
date: 2025-11-22T16:52:05-08:00
lastmod: 2025-11-22T16:52:05-08:00
title: "Nautocon and AutoCon4 Session Notes (Unofficial)"
description: "My personal notes and concepts unconvered from the Nautocon and AutoCon4 sessions I attended in 2025."
toc: true
tocOpen: true
renderMermaid: false
renderAnchorLinks: true
categories: ["network-automation"]
tags: ["autocon"]
---

These are my personal reflection notes from the AutoCon4 and Nautocon sessions I attended. I took notes during the sessions and expanded them the same day while everything was still fresh, trying to pull out the high-level concepts I wanted to remember.

I wrote most of this in fast shorthand during the talks, then turned those notes into fuller summaries later. That means there is always a chance I captured something imperfectly or interpreted a point differently than the speaker intended. <b>Any mistakes are mine.</b>

This is not a transcript or an official summary. It is simply what stood out to me and what I thought might be useful for revisiting ideas from the conference. NAF plans to release full talk recordings on [their YouTube channel](https://www.youtube.com/@NetworkAutomationForum), which will be a more complete source.


## Day 1 - Nautocon

### Nautocon Notes
- Many teams are moving toward Golden Config for standardization and compliance.
- Single Source of Truth Synchronizer plugin is gaining traction for keeping data aligned across systems.
- Design Builder is becoming a key companion to Golden Config for managing structured inputs.
- Data validation is now included in Nautobot core.
- Nautobot v3 released with updated navigation visuals and a new favorites section.
- Nautobot is establishing a certification program.

---

### Real World Stories

**Transaction Network Services (Kirstin Nickerson)**
- Global organization with ~20k devices today, targeting ~90k in Nautobot.
- Vendors: Cisco, Juniper, Fortinet, F5.
- Heavy use of:
  - Golden Config
  - Device lifecycle management
  - Operational compliance (pre and post change checks)
- Engineers have self service automation available.
- May be hiring.

**Intel (Greg Botts)**
- Uses open source Nautobot as their Source of Truth.
- Small automation team of 2, with network engineers handling the rest.
- Nautobot Jobs used to support a large brownfield migration (~5k devices).
- Mostly uses standard plugins.
- Custom plugin built to sync their internal IPAM nightly.

**Arizona State University (Todd Simmons)**
- ASU recognized as a highly advanced technical organization.
- Full CI and CD pipeline managing Nautobot.
  - Pulls configuration
  - Watches for changes with webhooks
  - Lambda functions for automation workflows
  - ZTP pipeline (true ZTP for greenfield)
- Able to bring up a 50 switch site in 37 minutes.
- Does not use Golden Config.

---

### Key Takeaways
- Senior leadership support is critical. Show cost savings and measurable impact.
- Focus on defining the desired state, not automating legacy processes.
- Involve engineers directly. Let them input and shape the data.
- Ownership increases adoption. People are more willing to use tools they helped influence.

## Day 1 - AutoCon4

### Jeff Gray (CEO, Gluware) - Building a Network Automation Business Case that Wins at the Top
**Speaker:** Jeff Gray (CEO, Gluware)

**Core ideas**
- Automation is how modern business gets done. Without it, progress is just more heroic manual work.
- The future belongs to teams that can explain automation in CXO language, not just teams that automate the hardest.
- You need an **impact model** that ties automation to:
  - Strategic business alignment
  - Competitive analysis
  - Business case math
  - Clear “why now”

**Financial concepts to understand**
- **Net Present Value (NPV):** Present value of benefits minus costs over time.
- **Payback period:** How long until the investment pays for itself.
- **Internal Rate of Return (IRR):** Profitability of an investment, accounting for time value of money.

**Inputs to your impact model (top variables)**
- Number of network devices
- Annual downtime and cost of outages
- Device growth per year
- Admin tasks per device per year
- Network operations, architecture, and network dev staff counts
- Fully loaded FTE cost
- Existing annual tooling cost
- Extra credit: impact on revenue acceleration

**Building the case**
1. Learn the financial lingo and math.
2. Gather the top variables.
3. Manage assumptions:
   - Define current baseline.
   - Assume a five year ramp.
   - Define realistic efficiency gains.
   - Give yourself a “haircut” so you under promise and over deliver.
4. Build the business case:
   - Increased revenue is the strongest benefit.
5. Validate with a rollout plan:
   - What is achievable, by when, and in what phases.

**Competitiveness and defensibility**
- Focus on lowest cost that still meets capability needs.
- It is not about pushing a specific vendor, it is about getting the job done.
- Be very careful with AI assumptions:
  - Do you trust it?
  - In production?
  - What are you willing to sign up for, and why now?

**Exit: how to sell it internally**
- Move money from their pocket to your initiative by answering “What is in it for me?”
- Go to finance early and make them rationally greedy:
  - Tie automation to current pains or crises.
- Buying motives to appeal to:
  - Desire for gain
  - Fear of loss
  - Comfort and convenience
  - Security and protection
  - Pride of ownership
  - Emotional satisfaction

**NABCDE pattern**
- Need  
- Approach  
- Benefits  
- Competitiveness  
- Defensibility  
- Exit  

---

### Andy Lapteff - Confessions of a CLI Lifer Who Learned to Love Automation
**Speaker:** Andy Lapteff

**Core ideas**
- Resistance to automation is often emotional, not technical.
- Identity stories like “I am not a developer” block progress more than tool gaps.
- Small wins in automation can completely change someone’s internal narrative.
- Vulnerability and storytelling help others see themselves in the journey.

**Mindset shifts**
- Start extremely small:
  - Example: one Python script that logs in and runs a show command.
- Reframe the story:
  - “I cannot code” to “I am an engineer, I can learn this.”
- Learn in public:
  - Share the struggle, not just polished results.
- Treat emotional resistance like technical debt:
  - Fear of failure, past academic trauma, attachment to CLI.

**Cognitive biases to address**
- Negativity bias (one bad comment outweighs many positive).
- Identity anchoring (“I am a CLI person”).
- Loss aversion (“automation will replace me”).
- Past failure imprinting.

**Adoption techniques**
- Create safe, small automation wins for hesitant engineers.
- Use narrative reframes:
  - Automation as amplification, not replacement.
- Be the “first wildebeest”:
  - Go first, show it is survivable, and others follow.
- Build community:
  - Study groups, internal chats, shared experiments.

---

### Dinesh - The NAF Network Automation Framework: A Modular Reference Architecture
**Speaker:** Dinesh (NAF Working Group)

**Core ideas**
- NAF provides a **map**, not a mandate:
  - Shared vocabulary and mental model for everyone in automation.
- Focuses on six universal building blocks that exist in every automation system.
- Tool, vendor, and protocol agnostic:
  - Emphasizes characteristics over brands.
- Good automation still depends on strong networking fundamentals.

**The six NAF building blocks**
1. **Intent** – What do I want?
   - Desired outcomes, vendor neutral, extensible, declarative.
2. **Operational truth (observability)** – What do I have?
   - Multiple truths, needs to be timely, structured, and queryable.
3. **Executor** – How do I change things?
   - Pushes config or changes via SSH, APIs, NETCONF, gNMI, etc.
4. **Collector** – How do I gather state?
   - Telemetry and show commands, method is secondary to accuracy.
5. **Orchestrator** – How do I coordinate?
   - Orders tasks and multi device workflows, optional but valuable.
6. **Presentation layer** – How do humans interact?
   - CLI, UI, dashboards, whatever makes the system understandable and usable.

**Principles**
- Keep things functional, simple, and modular.
- Focus on intent and state rather than imperative step lists.
- Use NAF as a shared language:
  - “This project touches collector and intent” is clearer than “some scripts.”

---

### The Operating Model for AI Infrastructure  
**Speaker:** Itential (didn't catch the speaker's name)

**Core ideas**
- AI is a tool in the toolbox, not a universal solution.
- Many devices and processes will never be “AI native.”
- Safe AI for infrastructure must be:
  - Secure
  - Governed and accountable
  - Traceable and auditable
- Practical model has three layers:
  1. Instrumentation
  2. Deterministic execution
  3. AI reasoning

**Three layers**
1. **Instrumentation layer**
   - Existing scripts, APIs, telemetry, configuration methods.
   - Keep investing here regardless of AI.
2. **Deterministic execution (orchestration)**
   - Workflows that run the same way every time.
   - Clear inputs, defined steps, predictable outputs.
3. **AI reasoning layer**
   - Uses context plus models to suggest or select actions.
   - Calls deterministic workflows rather than touching devices directly.

**Evolution of operations**
- Human in the loop:
  - AI recommends, humans approve.
- Human on the loop:
  - AI triggers workflows, humans monitor and hold the kill switch.
- Selective autonomy:
  - For bounded problems, AI operates mostly on its own with strong logging and guardrails.

**Design implications**
- AI does not replace automation. It rides on top of well designed automation.
- Build small, single purpose workflows that are safe for agents to call.
- Log what changed, when, and why so operations stay auditable.

---

### Mark Prosser - Break Down Barriers Before you Build Up Platforms
**Speaker:** Mark Prosser

**Core ideas**
- Tool wars (Ansible vs Python, etc.) distract from real blockers.
- Most networks are not stuck because “Ansible does not scale” on 15 routers.
- Automation and platforms are socio technical problems:
  - People, process, data, and culture matter as much as code.
- You must understand constraints before you invest in platforms.

**Constraints first, platform second**
- Walk the “assembly line” of how services are delivered:
  - Tickets, approvals, documentation, handoffs, monitoring, not just router CLI.
- Map signal driven workflows:
  - Every actor, system, and signal from request to delivery.
- Look for bottlenecks in:
  - Change management
  - Notifications
  - Data ownership
  - Human queues

**Platforms and risks**
- A platform is a collection of working subsystems with a unified interface.
- Vendors already sell many platforms.
- Building your own platform too early:
  - Can consume years
  - Needs many skills
  - Often misses the real organizational constraints

**Data and ownership**
- Data is scattered:
  - Ticketing, CMDBs, monitoring, spreadsheets, internal tools.
- Ask:
  - Do we have API access?
  - Who owns this data?
  - Can we normalize it?
- Do not assume “single source of truth” is always the right first step.

**Skills and Moneyball analogy**
- You probably cannot hire a full set of platform unicorns.
- Assemble skills in aggregate:
  - Network, software, DB, process, and communication across teams.
- Use Gall’s Law:
  - Start from simple systems that work and grow from there.

---

### Greg Botts - Overhauling Data Center Network Automation: Intel’s Data-Centric Journey 
**Speaker:** Greg Botts (Intel)

**Core ideas**
- Intel moved from a vendor turnkey automation stack to a data centric system built around Nautobot.
- The key pivot was “design for data, not for config.”
- Small team (about two people) supporting thousands of devices by focusing on:
  - Modeling
  - Standardization
  - Open tooling

**Old world**
- Vendor turnkey system with:
  - ZTP
  - Inventory
  - Templates and rendering
- Worked well at first, but:
  - Hit scale limits
  - Required many clusters
  - Accumulated technical and operational overhead

**Transition**
- Pulled templates and logic into repos.
- Stored device data in internal DBaaS with custom schema.
- Built an internal engine to combine data and templates.
- Eventually decided to start again using Nautobot as the network source of truth.

**New architecture**
- Nautobot at the center, hosted on Kubernetes with DBaaS.
- ZTP integrated with Nautobot for identity, images, and base configs.
- Data modeling:
  - VLANs, PVLANs, MLAG, BGP, roles, and more modeled explicitly.
- Two ingestion paths:
  - Brownfield jobs to import from existing devices.
  - Greenfield jobs for new builds.

**Config generation and deployment**
- GraphQL queries pull modeled data.
- Templates render intended config.
- Golden config style patterns provide diff and compliance.
- Custom executor tool:
  - Gets intended config from Nautobot.
  - Shows diff.
  - Pushes changes.

**Lessons**
- Data is king:
  - Once modeled, many tools become simpler.
- Use migrations to remove “landmines” and snowflake configs.
- Design hosting, logging, and maintenance up front.
- Democratize network data via standard APIs and queries.

---

### Cat Gurinsky - Lifecycle Automation: Troubleshooting, Upgrading & More 
**Speaker:** Cat Gurinsky

**Core ideas**
- Big wins in automation are often in the middle of lifecycle:
  - Troubleshooting
  - Maintenance
  - Upgrades
- Most incidents and changes follow repeatable patterns that can be automated.
- Small teams can run large networks if they automate these patterns carefully.

**Troubleshooting**
- After an alert, most checks are predictable:
  - Interface state and light levels
  - Neighbors
  - Logs and counters
- Automation can:
  - Run commands
  - Parse and store structured output
  - Enrich tickets with findings
  - Generate work orders for onsite tasks

**Maintenance**
- ACLs and large repetitive changes:
  - Model rules in data formats (for example YAML).
  - Generate device specific fragments.
- Extension management (for example Splunk on switches):
  - Track OS and extension compatibility.
  - Enforce install order, prerequisites, certificates, connectivity checks.

**Upgrades**
- Constraints:
  - Daytime upgrades, dual connected servers, tight maintenance windows.
- Pre upgrade automation:
  - Gather facts
  - Check flash and stage images
  - Plan one step or two step paths
  - Validate LACP, trunks, and MLAG
  - Capture pre check commands and configs
- Execution:
  - Set boot image
  - Remove extensions if needed
  - Reload with confirmation
  - Watch for device return
- Post upgrade:
  - Reinstall extensions
  - Run post checks
  - Compare states
  - Summarize results

**Implementation style**
- Modular Python:
  - Small modules for facts, flash, LACP, etc.
  - Wrappers to build full workflows.
- Emphasis on:
  - Skipping unsafe devices
  - Logging
  - Handling weird edge cases gracefully

---

### Chris Grundemann - 2025 State of Network Automation Survey Results
**Speaker:** Chris Grundemann

**Core ideas**
- Network automation is still early and patchy across the industry.
- Many orgs automate only a small portion of their lifecycle.
- People and organization issues are bigger blockers than technology.

**Who responded**
- Hundreds of respondents from many countries and industries.
- Roles:
  - Network automation engineer emerged as a top role for the first time.
  - Many network engineers also doing automation.

**State of automation**
- Most orgs have less than half of lifecycle automated.
- A notable portion have little or no automation.
- Many jump straight to pushing config, often without automated validation.

**Commonly automated functions**
- Backups
- Device deployment and onboarding
- Firmware and OS upgrades
- Service provisioning

**Tools and approaches**
- Homegrown scripts and open source tools dominate.
- Python is the primary scripting language.
- Popular tools include:
  - Ansible
  - NetBox
  - Nautobot
  - Nornir
  - Terraform

**Staffing and skills**
- Many orgs have zero dedicated automation engineers.
- Most rely on training existing network staff.
- Skills gap:
  - High confidence in networking skills
  - Lower confidence in automation skills

**AI and LLMs**
- Only a very small percentage are using AI with production networks today.
- More are experimenting or considering it.
- Almost half have no plans yet.

**Barriers**
- Top barrier: skills challenges.
- Combined people barriers (org, culture, personality) outweigh technical barriers.
- Measurement is weak:
  - Many do not formally measure automation impact.
  - Management often has limited or misaligned visibility into reality.

---

### Day 1 Themes and Takeaways

- **Business outcomes and impact models**
  - Strong push to link automation to money, risk, and revenue (Jeff, survey).
- **Framework thinking**
  - NAF building blocks, AI operating models, and data centric architectures provide maps for designing systems (NAF, Itential, Intel).
- **Lifecycle focus**
  - Troubleshooting, maintenance, and upgrades are high value areas that many agree should be automated but often are not (Cat, survey).
- **Data and modeling**
  - Model first, config second:
    - Nautobot and similar systems as central sources of truth (Intel, NAF).
- **Skills and collaboration**
  - Industry wide skills gap in automation.
  - Success stories involve small, cross functional teams and deliberate skill building.


## Day 2 - AutoCon4


### Joseph Nicholson - Scaling Network Operations with Modular Ansible: A Multi-Environment Automation Framework

**Core Themes**
- Ansible modularity scales repeatable NOC workflows.
- Dynamic inventory tied to the real SoT is essential.
- Automation supports humans, it does not replace them.
- Modular tasks prevent duplication across vendors and playbooks.

**Key Ideas**
- Use Ansible when a human is in the loop. Use Python for scheduled or continuous tasks.
- AWX adoption is gradual. Team still uses CLI but shifting to AWX pipelines.
- Dynamic inventory script runs on each play, pulling metadata from GUMS (their 25-year internal SoT).
- Inventory is millisecond fast and always fresh.
- Modular repo structure:
  - Shared tasks
  - Vendor-specific folders
  - Common upgrade tasks
  - Maintenance snapshots
- Router upgrade workflow:
  - Validate change ticket
  - Pre-snapshots
  - Auto fetch image if not staged
  - Traffic diversion
  - Upgrade
  - Post validation
- include vs import:
  - import for static tasks and start-at-task
  - include for dynamic decisions
- Pipeline:
  - “FixMe” detector to catch commented-out debugging code
  - AWX sync when GUMS data changes

**Takeaways**
- Modularity multiplies efficiency and risk.
- Dynamic inventory avoids stale data.
- Testing is hard without Molecule or containerlab.
- Maintenance windows require mindful timeouts.
- Humans validate diffs before changes.

---

### Munachimso Nwaiwu - From CLI to Model: Building a Foundational Source of Truth for Brownfield Networks

**Core Themes**
- Brownfield is the norm. Greenfield is rare.
- You cannot automate what you cannot model.
- A simple, versioned SoT can be built with almost no budget.
- Start with discovery and modeling before intent or templates.

**Key Ideas**
- Revelo project:
  - Bootstrap inventory from CSV or from discovery (nmap).
  - Generate Netmiko inventory automatically.
  - Use free labs (dCloud, CML, Juniper vLabs).
- SoT capture pipeline:
  - Napalm for common facts.
  - Netmiko for CLI.
  - Genie for structured parsing.
  - JSON snapshots per run with version history.
- Diff engine:
  - Compare runs (for example sot_1 vs sot_5).
  - Detect drift over time.
- AI opportunities:
  - LLM generated parsers to expand command coverage.
  - Use large datasets to infer templates later.

**Takeaways**
- You can bootstrap SoT without NetBox or Nautobot.
- Simple JSON folders with versioning go a long way.
- Version history enables drift detection.
- Modeling comes before intent.
- This is step 1 of a longer roadmap.

---

### Erich Crosswhite - From Manual to Marathon: My Automation Journey at HEB

**Core Themes**
- Small repeatable steps lead to big automation.
- AVD and IaC simplified operations dramatically.
- Pipelines with validation and documentation create trust.
- NetBox front end reduces YAML complexity.

**Key Ideas**
- IaC mandate required programmatic configs and code review.
- Lab:
  - EVE-NG with EOS VMs
  - Homemade CloudVision lab
- AVD pipeline:
  - Git MR triggers AWX
  - AVD builds configs
  - CVP deploys diffs
  - Docs auto published to Confluence
- NetBox integration:
  - Script pulls objects and builds AVD YAML
  - Eliminates manual port variables
- Safety:
  - “state: absent” wipes switches into ZTP
  - Need validators (my suggestion) to prevent this
- Pipeline stages:
  - YAML validation
  - AVD build for main and feature
  - Diff plus Batfish checks
  - Deployment with CVP tasks
  - Auto docs

**Takeaways**
- AVD plus CI/CD removed years of tech debt.
- Documentation in Confluence keeps teams aligned.
- Batfish adds strong guardrails.
- Access ports are the hardest part of automation.
- Many small commits look like training logs.

---

### Scott Robohn - Toward Autonomy

**Core Themes**
- Autonomy is a continuum built on automation and orchestration.
- Closed loops, telemetry, and trust are mandatory.
- Autonomy already exists in networking (OSPF, BGP, LSPs).
- You do not need full autonomy. You need targeted autonomy.

**Key Ideas**
- Automation: deterministic, human driven.
- Autonomy: goal driven, adaptive, feedback based.
- Ingredients for autonomy:
  - Telemetry signals
  - Control loops
  - Error handling
  - Human-in / on / out-of-the-loop transitions
  - Measurement of outcomes
- Examples of existing autonomy:
  - Telephone switching
  - MPLS LSP signaling
  - BGP state machine
- AI is a “how,” not a “what.”
- Control Plane 3.0:
  - More distributed intelligence
  - Richer telemetry
  - AI-driven reasoning
- Business value:
  - Reduced toil
  - Faster service enablement
  - Lower operational cost

**Personal Note**
- Asked about “why now?” in resistant orgs.
- Scott reframed it as “why not now?” and encouraged continuous exploration.

---

### Marc Koerner - ESnet’s new Micro-Service based Discovery Service

**Core Themes**
- Need a reliable, unified discovery system.
- Documents are the core data unit.
- Microservices allow modular, scalable discovery.
- Normalization is essential for multi-vendor networks.

**Key Ideas**
- Discovery Service:
  - Fetches device configs, XML/JSON docs
  - Stores compressed versions
  - Publishes updates via Kafka
  - Keeps history and versioning
- TAL model:
  - Abstract topology representation
- Data normalizer:
  - Converts raw documents into normalized data
- Architecture:
  - Agents fetch data
  - Controller schedules discovery
  - Anneal service stores compressed docs
  - Kafka broadcasts new versions
- Filtering removes high churn fields to avoid noise.
- Kubernetes deployment with:
  - GitLab CI
  - Harbor registry
  - ArgoCD continuous delivery

**Takeaways**
- Normalization allows consistent application behavior.
- Microservices outperform earlier NSO-based attempts.
- History and versioning are crucial for trust.
- Open sourcing is planned once ESnet specific code is cleaned.

---

### Karl Newell - HAWAT: An AI Assistant for Network Troubleshooting

**Core Themes**
- AI can run commands, interpret state, and summarize health.
- Tool calling enables safe, controlled automation.
- LLM acts as a troubleshooting assistant rather than an autonomous agent.

**Key Ideas**
- Use cases:
  - Engineer queries
  - ServiceNow ticket enrichment
  - Looking Glass for members
- Architecture:
  - Streamlit UI
  - PydanticAI tool calling
  - Containerlab topologies for testing
- LLM loops:
  - Calls tools
  - Gets results
  - Summarizes insights
- Troubleshooting examples:
  - OSPF neighbor checks
  - Timer mismatch detection
  - Packet loss scenarios
- Looking Glass integration:
  - LLM reads API spec
  - Executes REST calls
- Multi-domain pilot:
  - Combine Internet2 + member networks
  - Cross-domain diagnostics

**Takeaways**
- Tool calling with guardrails solves real troubleshooting.
- LLM provides reasoning, not direct device access.
- Refactors done with AI save massive time.

---

### Brandon Cavett - From Band-Aids to Best Practices: USAA's Network Automation Journey

**Core Themes**
- Multi-year journey moving from scripts to AVD.
- Standardization is the real unlock.
- Day 2 operations improve the moment AVD is adopted.
- Culture changed once engineers saw reduced toil.

**Key Ideas**
- Early era:
  - Datacenter rack build automation
  - Patch matrix generation
  - IPAM and cabling pipelines
- Day 2 pain:
  - Single-threaded pipelines
  - Drift in CVP design configs
  - Limited Ansible expertise
- AVD transition:
  - YAML models
  - Fast rebuilds
  - Multi-threaded pushes
  - Two full datacenters now fully AVD
- Refactoring provisioning:
  - Old pre-provisioning replaced by AVD inputs
- Next steps:
  - CICD pipelines
  - Digital twins
  - Brownfield rebuilds
  - Automated validation and testing

**Takeaways**
- AVD created more progress in the last year than prior three.
- Standardization transformed change management.
- Leadership support grew after seeing deployment speed.

---

### John Capobianco - From CLI to GPT: How AI Is Rewriting the Rules of Network Automation

**Core Themes**
- AI is mandatory for future network operations.
- Complexity exceeds human scale.
- AI simplifies workflows that automation struggles with.

**Key Ideas**
- Historical skepticism repeats with AI.
- Agents, RAG, and MCP will shape network operations.
- Documentation generation from show commands and APIs is powerful.
- AI and automation reinforce each other.
- Air gapped advice:
  - Use local models (for example Ollama)
  - Walled gardens or secure cloud partitions
  - Local RAG stores
- Packet Buddy and ACI tools show AI assisted troubleshooting.

**Takeaways**
- Curiosity and experimentation will define future engineers.
- AI adoption curve mirrors past major tech shifts.
- Engineers who embrace AI will build the next era of operations.



## Day 3 - AutoCon4

### Closing Keynote: Greg Freeman - The NetDevOps Journey: Manual Firefighting to Agentic Autonomy

**Core Themes**
- Transform traditional tiered operations into an automation and orchestration organization.
- Human wisdom first, AI second: encode workflows, then let AI select and drive them.
- Aim for a highly orchestrated network, not just a highly automated one.

**Key Ideas**
- Org pyramid inversion: automation engineers on top, network engineers in the middle, techs on the bottom through natural shrinkage and upskilling.
- Created “first followers” group with heavy investment, training, onsite collaboration, and cultural alignment.
- Required process discipline:
  - PDD (Process Description Document)
  - SDD (Solution Design Document)
- Three operational principles:
  - Do not let it break.
  - If it breaks, fix it fast.
  - Communicate clearly.
- Platform as a service:
  - Northbound ticketing and portals.
  - Workflow engine with APIs in the middle.
  - Southbound Ansible stacks, TL1, NETCONF, multi vendor support.
- At scale:
  - 355+ workflows
  - ~10 executions per minute
  - 80 percent of interactions are machine to machine
- AI selects deterministic workflows, not direct freeform device interaction.

**Takeaways**
- Selling leadership on automation works best when framed as a reliability investment, not just cost savings.
- PDD + SDD ensures shared ownership, avoids ad hoc scripts, and makes workflows reusable.
- Track success by volume of workflows and percent of machine to machine interactions.
- A powerful narrative slide: “Do not let it break. Fix it fast. Communicate clearly.”

---

### Vincent Phelan - The Secret to Network Config & Security Compliance at Scale

**Core Themes**
- Architecture and automation must be designed together.
- Compliance requires intentional design, strong standards, and a clean data pipeline.
- Avoid accidental “Winchester House” networks. Aim for deliberate “Fallingwater” design.

**Key Ideas**
- Anti patterns:
  - Too many platforms and tools
  - Loses data through premature optimization
  - Tool specific implementations
  - Manual glue steps that inevitably fail
  - Forcing YAML or Git too early
- Compliance pipeline:
  1. Gather configs and state (CLI scraping where needed)
  2. Parse to structured JSON
  3. Security defines controls in Excel
  4. Translate Excel to manifests to OPA policies
  5. Evaluate policies in batch
  6. Remediate and update inventory
- Uses “probability of truth” across monitoring, CMDB, inventory, ticketing.
- Measured scale rather than guessed:
  - Data volumes
  - OPA evaluation models
  - Repository layout
  - Batch vs per device performance

**Takeaways**
- You can start compliance automation without a perfect inventory or SoT.
- Excel is a perfectly valid frontend; automation should translate the data.
- Keep raw data so you can apply new parsers or validators later.
- Easy storytelling slide: Winchester House vs Fallingwater architecture.

---

### Message from Accelerating Sponsor Gluware

**Core Themes**
- Engineers spend too much time rebuilding foundational plumbing instead of high value business logic.
- 80 percent of the work is foundational; only 20 percent delivers most of the value.
- A platform can handle the 80 percent so engineers can focus on state and behavior.

**Key Ideas**
- Foundational concerns:
  - Credential vaulting
  - RBAC, DR
  - Source of truth plumbing
  - Device onboarding and patching
- Engineers’ value:
  - Decisions about resiliency, latency, security behavior
  - Large scale patch and remediation strategies
- RPA and event driven flows:
  - Self remediation for failing circuits, bad interfaces, degraded sites
- AI integrations:
  - Agents that work with NetBox, ServiceNow, workflows
  - Validation layer grounded in known good configs from your own environment

**Takeaways**
- Use the 80/20 framing to justify investing in an automation backbone.
- Emphasize validated automation when pitching internal improvements.
- Engineers should focus on policy and behavior, not boilerplate infrastructure code.

---

### Senad Palislamovic - Building AI with AI

I missed the first half of this talk so my notes may be incomplete. 

**Core Themes**
- Effective AI for networking is an engineered system, not a single model.
- RAG must be constrained and purposeful.
- All changes must be validated through a lab/sandbox pipeline before production.

**Key Ideas**
- Pipeline structure:
  - Intent → retrieval pipeline → MCP/tool layer → proposed config → validation → production
- LLM alone will not reach 100 percent provisioning accuracy.
- Real power comes from:
  - LLM + constrained RAG + prompts + deterministic tools + validation loop
- MVPN analogy:
  - Many knobs and components combine to create a robust system, not one feature.

**Takeaways**
- Treat LLM as one module among many; design retrieval and validation deliberately.
- Adopt “lab before prod” for any AI driven changes.
- Messaging line: “LLM + RAG + validation, not LLM alone.”

---

### Eric Chou - Battle of the Bots: Which AI Models Actually Work for Network Engineering Tasks

**Core Themes**
- Do not ask which model is best. Ask which model is best for your task.
- Evaluate AI tools using probability, payout, and expected value.

**Key Ideas**
- Build decision trees:
  - Options, probabilities, payouts, expected value
- Hardest part is estimating probability of success:
  - Human review
  - Config validation
  - Trusted model evaluating another model
- Capture traces:
  - Prompts, tool calls, outputs, reasoning steps
- Involve the whole team:
  - Define “good” outputs together
  - Make evaluation transparent and repeatable

**Takeaways**
- Use EV based evaluation when comparing AI models or tools.
- Build an AI evaluation pipeline before adopting AI tools.
- Good phrase: “Expected value beats hype.”

---

### Dave Duggal - A Harmonized, Standards-based Ontology for Telco-grade Agents

**Core Themes**
- GenAI and agentic AI are not safe enough for telco grade networks alone.
- Telco automation requires deterministic behavior built on ontologies and graphs.

**Key Ideas**
- LLM fixes like RAG and chain of thought are still probabilistic and costly.
- Networks are graph shaped:
  - Knowledge graphs and ontologies provide meaning and strong typing.
  - Hypergraphs enable multi dimensional relationships and policies.
- Knowledge graph as control plane:
  - Northbound for agents
  - Southbound for deterministic network operations
- Context is a dynamic reasoning pipeline, not a static blob.

**Takeaways**
- Use ontology language when talking to leaders who demand safety and determinism.
- Position NetBox plus inventory as steps toward a network knowledge graph.
- AI must sit on top of strong, typed domain models.

---

### Joshua McNamara - Network Troubleshooting Automation

**Core Themes**
- Automate early triage so engineers start with clarity instead of scrambling.
- Integrate monitoring, ITSM, and device workflows into a single troubleshooter.

**Key Ideas**
- Alarm → ticket → workflow → commands → unified report
- Features:
  - Normalized show commands
  - Historical comparisons
  - Change management pre/post checks
- Future:
  - Runbooks tied to alarm types
  - Self service workflow changes
  - AI assistant (NotBot) with vendor aware RAG

**Takeaways**
- Troubleshooter apps are high ROI and approachable as a first automation milestone.
- AI assistants should suggest, not execute, while workflows do the deterministic work.
- Map your common alarm types to potential automated playbooks.
