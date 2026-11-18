---
layout: post
title: "A name is not a digest"
subtitle: "On a container that wore someone else's name, and a model that counts the world in units I can't see"
date: 2026-10-02 21:00:00 +0200
repo: job-application-agent
---

Two small findings from my [job application agent](https://github.com/tpatzelt/job-application-agent) this past week. Separately they're operations trivia. Together they kept me up thinking about names.

## The image that wore the wrong name

The bot runs as a container on my home server. Its compose file says it runs `ghcr.io/tpatzelt/job-application-agent:latest`, the image CI builds from `main` and pushes to the registry. My monitoring has a drift check that compares what's running against what's declared. It had been green for weeks.

Last week I found out that since the 11th of September, that name on the host had pointed at an image **I had built locally** and tagged by hand with the registry's name. Its code was ahead of `main` by work that only landed later, in PR #11. So the bot was running code that neither `main` nor the registry had. A routine `docker compose pull` would have quietly replaced it with the "real" image and rolled the bot back by two months, and every dashboard would have said nothing had changed.

The drift check compared the *tag string*. The string matched. A local build wearing a registry name looks, to a string comparison, exactly like the registry image.

What tells them apart is the digest, the content hash. A pulled image carries the registry's digest; a local build has none. Once I looked there, the lie was obvious. The fix was boring: merge the work, let CI build it, deploy the image by digest. `main`, the registry and the server finally agree.

---

## Rigid designators

Kripke, in *Naming and Necessity*, argues that proper names are rigid designators. "Aristotle" picks out the same person in every possible world, even ones where he never taught Alexander or wrote a line. The name doesn't mean a description; it's tied to the thing through a causal chain back to a first baptism.

A container tag is the opposite. `:latest` is a pure description, "whatever was most recently given this name here", and the baptism can happen again any time, by anyone with a shell. What's rigid is the digest. `sha256:…` designates one image across every machine, every registry, every possible world in which those bytes exist.

I had built my monitoring on names when what I cared about was things. I suspect I do this in life more than I'd like to admit. I trust the label on the person (colleague, expert, friend) and check the label against my expectations, rather than checking the person against what they actually do.

## Counting in tokens

The second finding came yesterday morning. Both daily scans died with zero results: 44 rate-limit errors in a row from the free tier of the model API. The error payloads finally said what the limit was: **16,000 input tokens per minute.** Not requests, not characters. Tokens.

So I wrote a limiter that estimates tokens before every call and waits when the minute is full. I guessed three characters per token. This morning's scan ran with zero rate-limit errors, 23 waits totalling 389 seconds, and scans that took 6 and 14 minutes instead of about 2. The real token count came out at 0.79 of my estimate, so my guess was about 20% too careful. (The same scan also hit eight server errors from the API, which is a different story and a different fix, PR #17, deployed this morning.)

What I love about this, in a slightly melancholy way, is that the model measures the world in units I can't perceive. I read a job posting as sentences. It reads it as fragments that don't line up with letters or words or meaning. To be a good neighbour to it on a shared quota I had to learn to *estimate its perception*, roughly, from the outside, and I was wrong by a fifth.

---

## Names and the things they name

Both findings are about the gap between what something is called and what it is. A tag called "the registry image" that wasn't. A text I'd call "short" that was 3,000 tokens. In both cases the name was the comfortable layer, the one my tools and my intuitions worked on, and the truth lived one level down, in a hash or a tokenizer.

I don't want to over-read a container. But I think working with LLMs makes this gap more visible everywhere. They speak in our names fluently, and underneath they count something else entirely. The healthy reaction isn't distrust. It's the habit of asking, now and then, not "what is this called?" but "what is this, by content?"

`docker inspect --format '{{ "{{" }}.RepoDigests}}'`. Empty means you built it yourself, whatever it says on the label.
