---
date: 2025-11-22T14:17:51-08:00
title: "What AutoCon4 Taught Me"
description: "Four takeaways from AutoCon4 in 2025 that reshaped how I think about automation, reliability, and where I see my career going."
toc: true
tocOpen: true
renderMermaid: false
renderAnchorLinks: true
---

I went into AutoCon4 expecting to hear new tooling ideas, clever automation tricks, and maybe a few case studies to bring home. I walked out with something very different.

Instead of focusing on the latest frameworks or features, almost every speaker pushed a much deeper point.

{{< divider >}}

{{< twocol right="It is about data.<br>It is about safety.<br>It is about reducing risk and proving value." >}}
Automation is not about scripts.
{{< /twocol >}}

For me personally, it helped connect a lot of the frustrations I have been feeling at work with the bigger picture of what modern automation actually looks like.

This post is not meant to be a recap of the conference. It is the four ideas that influenced me the most, and that I plan to act on next.

## You cannot automate what you cannot model

{{< callout title="Key idea" >}}
If your data is wrong, your automation is wrong. It is that simple.
{{< /callout >}}

The strongest message that showed up in almost every session was this: you cannot automate what you cannot model. You need a reliable source of truth before anything meaningful can happen.

I felt this one immediately because it mirrors my biggest pain point today:

- fragmented data  
- inherited environments  
- hand built everything  
- an “inventory,” but not a real model  

We do not have versioned state. We do not have drift detection. We are missing the foundation almost every successful team described.

Hearing presenter after presenter talk about their pipelines, ingestion jobs, and data models made something click for me. The work I have been doing with NetBox, normalization, and mapping is more than a convenience. It is a required prerequisite for any future automation that I want to build.

Configs are the byproduct. The model is the product.

I always knew that having a valid source of truth was the cornerstone of automating, but thinking of it as the core of automation is a huge shift in my thought process. I previously viewed it as a foundational tool. Now I see how the source of truth is the beating heart of all the tools we use, automation or otherwise.

The final realization I came away with about a source of truth is that you do not need all of your data contained in one place. You need access to all of your data.

We can all agree there is no single product that covers every use case. I need to stop trying to force everything into one system and accept that I can combine multiple sources into a single logical source of truth.

### What I am going to do with this

- Treat my NetBox work as core infrastructure, not a side project  
- Design around “many systems, one model” instead of “one tool to rule them all”  

{{< divider >}}

## Validation comes before speed

{{< callout title="Key idea" >}}
Speed should not be the primary objective. The primary objective is to have valid data.
{{< /callout >}}

The goal is not faster config pushes. The goal is safer, more predictable operations. Every successful automation story I heard started with read only steps, prechecks, postchecks, and drift validation.

This hit home because I have been feeling stuck in high volume, reactive work for a long time. The lack of prechecks and structured workflows:

- creates chaos  
- increases outage minutes  
- puts an unrealistic cognitive load on engineers who are already stretched thin  

AutoCon4 made it clear that validation is not optional. It is step zero when automating a task. It is how you prevent bad changes, bad assumptions, and bad nights. It is also how you build confidence that the automation you ship will not surprise anyone.

I am keeping this thought in mind as I proceed to model brownfield configurations. I will be identifying the expectations of an object and checking for compliance. This may stir up more work in the beginning, but if we can validate that the state is desired before making any changes, that will reduce the oopsies that lead to outages.

### What I am going to do with this

- Build validation into my workflows first, not as an afterthought  
- Start by asking “what does this object even look like versus what we expect?”

{{< divider >}}

## AI accelerates good automation. It does not rescue bad automation

{{< callout title="Key idea" >}}
AI amplifies. It is not a shortcut around messy data. It just gets you an answer faster. If you give it good data, it gives you a good answer. If you give it incorrect data, you get an incorrect answer.
{{< /callout >}}

There was plenty of AI talk, but none of it was the hype I expected. The core concept being shared was surprisingly grounded. AI is a reasoning layer that sits on top of clean data, guardrails, and deterministic systems.

It does not replace engineers. It does not magically fix environments with inconsistent data or missing state.

This was reassuring because it means we do not need to chase the latest AI features just to say we use AI. We need to build the foundation that makes AI useful:

- structured data  
- versioned history  
- safety checks  
- clear workflows  

Once those exist, AI can help with summarizing, detecting patterns, suggesting actions, or accelerating troubleshooting. But putting AI in front of a messy network only amplifies the mess.

### What I am going to do with this

- Focus on building the context and guardrails AI would need, not “AI features” themselves  
- Treat AI as a future layer on top of good systems, not a fix for bad ones  

{{< divider >}}

## Start small, but start now

{{< callout title="Key idea" >}}
The problems feel huge. The work starts tiny.
{{< /callout >}}

The last takeaway is probably the one that I need to heed the most. I tend to zoom out and focus on too big of a picture, and it tends to overwhelm me.

However, every team that shared their story started small:

- one workflow  
- one migration pipeline  
- one troubleshooting bundle  
- one SoT schema  

No giant platform build. No big bang rollout.

I have been frustrated lately because it feels like the problems are too large and too interconnected to fix. But small steps are what it takes to get to the end of a hike.

Automation momentum comes from small, proven wins. Focus on automating a single workflow end to end, measure the results, see the value you create, and then expand. Small, methodical changes over time.

### What I am going to do with this

- Pick one workflow and build a tiny, end to end path: ingest → validate → change → validate  
- Capture metrics for that one workflow so I can show real impact, not just “cool tech”  

{{< divider >}}

## Closing

AutoCon4 did not just give me ideas. It gave me inspiration and direction. It helped me understand the difference between building scripts and building systems. It showed me that automation is not only about the speed of implementation. It is about modeling reality, validating intent, reducing risk, and building trust.

I am taking these lessons with me when I head back to work on Monday. I plan to focus on the work that builds toward safer, smarter, and more predictable operations.

One workflow at a time. That is where the real progress begins.
