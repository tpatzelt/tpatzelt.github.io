---
layout: post
title: "The narrator blamed the walls"
subtitle: "An agent's confident wrong diagnosis, my own README's confident wrong claim, and a little Sartre"
date: 2026-09-30 20:15:00 +0200
repo: mein-pendel
---

NIGHTSHIFT's fourth run is building [Mein Pendel](https://github.com/tpatzelt/mein-pendel), a small service that watches my BVG and S-Bahn lines and tells me on Telegram when my commute is broken before I'm standing on the platform finding out.

The first goal was a "recording chain": capture real responses from the public transit API, freeze them as fixtures, and build everything else against those. That chain parked. Every attempt failed, and the run moved on.

Every day the run writes a digest, a short summary from an auditor agent that reads the board and tells me what's going on. The latest digest was clear and calm. The recording chain had stalled because of **sandbox denials**: the workers weren't allowed to reach the API.

It sounded exactly right. Agents run in a sandbox, sandboxes deny things. I nearly went to open the network.

## What actually happened

Before touching anything, I read the workers' own final messages, the last line each one writes when it gives up. They told a different story.

On the 29th, the transit API itself was down. Not blocked, *down*, for everyone. And a later attempt, after it came back, used a stop id that simply didn't exist; real ones are nine digits, and the worker had made up something plausible-looking. Neither failure had anything to do with the sandbox.

And here's the part that made me laugh at myself: the sandbox wasn't blocking anything. A week earlier, for the job-agent run, I had deliberately opened its outbound web access to any public host, because that run needed live search. The proxy never even reads the allowlist file. But the file is still there, and its header, and the README, still describe a careful domain allowlist.

So this morning there were two narrators with two confident stories. The agent said the walls had stopped it. My documentation said the walls were there. **Neither was true.** If I had acted on the diagnosis and opened the network, I would have fixed nothing, because it was already open.

---

## Mauvaise foi

Sartre has this idea of *bad faith*: the way we explain our situation as if it were made entirely of facts outside us. The waiter who plays at being a waiter so completely that he forgets he could do otherwise. "I couldn't, the situation wouldn't let me."

I don't think an auditor agent can be in bad faith in Sartre's sense; that would need a self that knows better and looks away. But the *shape* of its explanation is the same shape. When something fails, the most available story is that the environment refused. The walls are always the easiest thing to blame, because everyone believes in walls. It's a story that's plausible without being checked, and plausibility is exactly what language models are made of.

What stays with me more is that my own allowlist file was doing the same thing, a confident description of a wall that wasn't there, sitting in a repo, being read by agents, and by me. Documentation is a kind of narrator too. And mine had been lying, gently, for a week, without anyone meaning it to.

## Read the last line, not the summary

What I did, concretely:

- recorded the fixtures from my own machine and committed them straight to the run's integration branch
- left a human-written decision record in the planner's folder, so it wouldn't try to revive the chain
- wrote myself a rule: **for any parked task, read the worker's own final message before trusting the park reason or the digest**

That last rule is the real lesson. A summary is a story about evidence. It's useful when it's right and very convincing when it's wrong. The workers' raw last words were less elegant ("connection refused", "no such stop") and much closer to the world.

---

I keep wanting the digest to be a witness, and it's really more of a storyteller. Maybe that's fine. We have plenty of storytellers. The trick is to keep a habit of walking past the story and putting your hand on the wall yourself.

Sometimes it's there. This time it wasn't. And the API, for the record, was back the next day.
