---
layout: post
title: "Correct in the only world it had"
subtitle: "My first overnight run of autonomous agents, and the one bug none of them could have seen"
date: 2026-09-24 21:10:00 +0200
repo: nightshift
---

On Tuesday afternoon I armed a machine and went to bed. Not literally right away, but that was the idea: write a charter, hand it to a loop of agents, wake up to work.

The loop is called [NIGHTSHIFT](https://github.com/tpatzelt/nightshift). A planner reads the charter and breaks it into tasks. A worker implements one task on its own branch. Deterministic gates check scope, diff size, that no test was weakened, that no secret leaked, that the acceptance commands pass. A reviewer reads the diff. An auditor watches for drift. If everything agrees, the branch merges into an integration branch inside a sandbox, and the next task begins.

The first charter was for my [job application agent](https://github.com/tpatzelt/job-application-agent). I froze the run this afternoon, about 45 hours later. Here's what came out:

- 42 tasks merged, 19 parked, backlog empty
- 388 tests passing, up from 182
- every metric of the offline eval harness at 1.000
- 1,087 agent runs for $138.96, and 627 of those runs came back rate-limited, 567 of them the planner

That last line deserves its own post someday. A planner that gets told "not now" more than five hundred times and keeps planning is either very patient or very lonely.

But this post is about something else. Today I merged the run into `main`, and CI went red.

## The test that knew what time it was

Two tests in the evaluation code failed, and they failed locally too. The eval harness has a script that replays the current code against a recorded baseline, and to find that baseline it looked up "the arming revision", the commit the run started from. It looked first at `origin/main`.

Inside the sandbox, `origin/main` pointed exactly at the arming commit, because that's how the sandbox's bare repository had been set up. So the agents wrote code that asked "where is `main`?", got the right answer, wrote a test proving they got the right answer, and passed every gate. When I merged, `main` moved. The harness now replayed today's code against today's code and compared it to a baseline from before: `assert 16 == 27`.

Nothing the agents could run (42 merge gates, the reviewer, the auditor) could see it. **In the sandbox, the code was correct.** It was correct in the only world it had.

---

## Thrown into a bare repo

I keep coming back to Heidegger's word *Geworfenheit*, thrownness. We don't choose the world we wake up in: its language, its history, the things it takes for granted. We find ourselves already in it, and everything we understand, we understand from inside it.

My workers were thrown into a bare repository whose branches meant something slightly different from what they would mean an hour after I pushed. Not wrong, just *local*. And what makes this interesting isn't that the agents failed. They didn't fail. They reasoned well, from premises that were true where they stood.

Wittgenstein wrote that the limits of my language mean the limits of my world. For an agent in a sandbox, the limits of its checkout are the limits of its world. You can give it better reasoning, longer context, a stricter reviewer, and it will still be faithful to the world it was given. That faithfulness is the problem.

## The golem is made of the mud you hand it

There's an old picture of the golem, the figure shaped from clay and animated by a word. It does exactly what it's told, which is what makes it dangerous. I used to read that story as a warning about obedience. Today I read it as a warning about clay. The golem can only be made of the mud you hand it. If the mud is from the wrong riverbank, it walks very convincingly in the wrong direction.

I think a lot of the alignment conversation imagines the gap between the model and us as a gap of values or intelligence. This week the gap was neither. It was a gap of *world*, a single branch pointer the agents couldn't know would move.

## What I changed

The fix to the code was small: prefer the revision already recorded in the baseline file, refuse rather than guess when it can't be resolved, and fetch full history in CI so a shallow clone doesn't silently skip the tests. That's PR #13.

The fix to my thinking is bigger, and I haven't built it yet. The lesson is about the sandbox, not the agents: **the bare repo's ref topology isn't the topology the work lands in.** What I want is a gate that replays a finished integration branch against a checkout whose `origin/main` is the *real* one, before anything leaves. A last look out of the window before you walk out the door.

---

It's a strange feeling to be proud of something that was wrong. Forty-two pieces of careful work, honest about everything they could see. I think we owe the agents we build the same thing we owe each other: before we judge what they did, we should ask what world they were standing in when they did it.
