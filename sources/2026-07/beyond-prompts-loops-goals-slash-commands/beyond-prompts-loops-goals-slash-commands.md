---
title: "How to use /loops, /goals and other Powerful Slash Commands as a Non-Engineer"
source: "https://departmentofproduct.substack.com/p/beyond-prompts-how-to-use-loops-goals"
author:
  - "[[Rich Holmes]]"
published: 2026-07-21
created: 2026-07-27
description: "🧠 Your ultimate guide to Claude Code and Codex slash commands for Non-Engineers"
tags:
  - "clippings" <- clipped due to pay wall
---
*🔒 [The Knowledge Series](https://departmentofproduct.substack.com/t/knowledge-series) breaks down emerging AI technologies with practical playbooks designed specifically for product teams. Get 100+ guides and practical tutorials covering everything from **Claude Code** and **MCP** to **agentic workflows**, vibe coding, and more.*

---

> *“You don’t even need to prompt models any more, you should tell them, this is what I’m doing, figure it out.”*

This is the advice that OpenAI’s Katia Guzman gave to attendees at a recent event in Paris where she explained that this shift from traditional prompting to goal setting is one of the trends that she’s most excited about.

Other AI leaders seem to agree. Claude Code’s creator Boris Cherny said that “I don’t prompt Claude anymore. I have loops running that prompt Claude and figure out what to do. My job is to write loops” and ex-Google exec Addy Osmani says that loop engineering is “replacing yourself as the person who prompts the agent”.

So it’s fair to say that loops and goals are quickly becoming an essential part of AI workflows. And these new capabilities are now baked directly into Claude with dedicated **/goal** and **/loop** slash commands.

Understanding how slash commands like this work can make working inside AI tools a lot faster since they’re essentially shortcuts to getting stuff done quickly. But the trouble is, keeping up to date with the latest commands is proving to be increasingly difficult.

In the past few months alone, new commands like these have been added, some have been merged together and others have been deprecated entirely.

This makes keeping up with commands pretty difficult and so in this Knowledge Series, we’re going to take a look at some of the most powerful commands that are worth knowing about today as a PM, designer or non-engineer when working with Claude Code and Codex.

![](https://substackcdn.com/image/fetch/$s_!V16K!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a790bbd-2789-4221-84ef-9bb4686f17f0_2654x1836.png)

A preview of the interactive guide included with 100+ slash commands you can use in Claude Code and Codex

We’ll include an interactive guide of the full list of over 100+ currently supported commands as well as a deeper guide to some essential commands that are worth experimenting with right now to support your every day, non-engineering workflows.

#### Coming up:

- What exactly are slash commands in Claude Code and Codex?
- **Essential slash commands** worth knowing about today for non-engineers
- Downloadable, **interactive guide** to 100+ slash commands with practical examples of each one, explained for PMs / non-engineers

---

![](https://substackcdn.com/image/fetch/$s_!ugXZ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5c58c04-f6a6-4e12-861d-53ccdb5ec348_26x34.png)

Knowledge Series

### What are /slash commands in Claude Code and Codex?

Before we dig into some practical examples together let’s first take a look at what slash commands are and the basic categories of commands.

For this, we’ll be using the Claude Code and ChatGPT / Codex desktop apps for reference.

![](https://substackcdn.com/image/fetch/$s_!s4-9!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf6236bd-1bc0-4940-8a5f-7451bf07b918_2351x1701.png)

Slash commands are typed shortcuts, starting with /, that control an AI coding agent's session. Rather than asking the model to do something in natural language, you're issuing a direct instruction to the tool itself.

#### Why is knowing about slash commands helpful?

When you know which commands to use, they can accelerate your workflows by setting up recurring schedules, reducing the need to constantly repeat yourself and potentially save you money on token spend, too. More on that later.

**The 3 basic types of slash commands**

There are 3 basic types of slash commands that you can use:

1. **Built-in commands** - these ship with the tool itself and handle session mechanics.
2. **Custom/user-defined commands** - markdown files you write yourself that expand into a prompt when invoked.
3. **Tool/connector-exposed commands** - slash commands surfaced by connected MCP servers or plugins rather than defined locally.

For this Knowledge Series, we’re mainly going to focus on the native, built-in commands that come shipped with Claude Code and Codex and some custom commands you can build that work with those native ones.

### Powerful slash commands worth knowing about - with practical examples of how to use them

Now let’s take a look at some examples powerful slash commands you can use in your every day workflows. These commands have been specifically chosen because they deliver the clearest everyday payoff for non-engineers: less time re-explaining context, fewer wasted tokens and greater visibility into how you’re using Claude / Codex so that you can improve how you work.

#### /goal

The /goal command sets a completion condition and Claude keeps working toward it across multiple turns without you having to prompt each step.

![](https://substackcdn.com/image/fetch/$s_!k1GS!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0e3806d5-7d65-47cd-8d0c-d8c8f4ad0acf_2305x1735.png)

In other words, you run the /goal command followed by the outcome that you want and the work continues until that outcome is achieved. Instead of giving it Claude / Codex one task, you describe what "done" looks like, in a single sentence, and it just keeps working on its own until that's actually true.

This flips the traditional prompting playbook on its head a little and it can be helpful for scenarios where your task is well-defined and verifiable.

But it’s not suitable for scenarios which require human judgement (think important strategic decisions) or anything which is security sensitive where the cost of getting it wrong is too high.

**Basic examples**
