---
layout: post
title: "Praise first, defect last"
subtitle: "How a polite reviewer and a 600-character limit made my agents build the same section three times"
date: 2026-09-26 19:30:00 +0200
repo: nightshift
---

The site you're reading was rebuilt by agents this week. Two NIGHTSHIFT runs, one on Thursday night and one yesterday, gave it a calmer editorial design, focus styles, a reduced-motion mode, and a little script with fifteen static checks that no later change is allowed to weaken.

They also left it with this, which as I write it is still the live About section:

> [Placeholder — about statement to be written by Tim: focus areas, current role, what he builds.]

I wrote in the charter that inventing my biography was a non-goal, and the agents obeyed exactly. Nothing about me was made up; every gap was bracketed. I'm grateful, honestly. But "correctly marked as missing" and "fit to be the public site" are different bars, and the merge cleared the first one onto production. That one is on me.

What I want to write about is a smaller thing from the same run, because it's been in my head all day.

## Three times the same section

The run spent a lot of effort on a "Selected work" section, the part of the home page that lists projects. It was specified three times: task T-0014, then T-0019, then T-0020. The first one passed every gate and was parked anyway, on a reviewer verdict of *revise*.

When I opened the verdict, the recorded reason ended mid-sentence:

> …the mktemp gate shows it fails when `_data/projects.yml` is removed,

One clause short of the defect.

The orchestrator stored `reason[:600]`, the first 600 characters of the review. And the reviewer, like a good colleague, like every feedback workshop I've ever sat through, **opened with praise and named the defect last.** So the loop kept the compliment and threw away the critique. The planner then re-issued the task twice, guessing each time at what had been wrong. T-0019's own description says it outright: re-issued because the reason was cut off, "so this re-issue repeats that work in full."

The fix is almost embarrassing: a `clip()` that keeps both ends of a string with a marker in the middle. But I don't think the lesson is about string slicing.

---

## Das Wahre ist das Ganze

Hegel, in the preface to the *Phenomenology*: the true is the whole. Not the first premise, not the conclusion, but the movement through all of it. You can't take the head of an argument and call it the argument.

Feedback is shaped like an argument, and we've trained ourselves, and then our models, to shape it kindly. Start with what works. Soften. Arrive at the problem gently, near the end, where it hurts least. It's a humane form. It's also a form that assumes a reader who reads to the end.

My orchestrator didn't. And I'm not sure I do. How often do I skim the first lines of a code review, see "looks good overall", and feel the warm relief before reaching the "but"? The truncation wasn't a machine failure. It was a very honest imitation of a tired human.

## The planner that talked itself back into it

The same run had a second, stranger stall. A gate that checks whether a task added tests didn't recognise this repo's test script as a test, because it matched a regex for test paths, and a shell script in `scripts/` matched none of them. Two tasks burned both their attempts on "no test file was added" while their diffs very clearly added a check. Three parks in a row tripped a safety limit and **paused the whole run for 9.8 hours.**

The planner figured this out. It wrote a decision record explaining the gate's blind spot and re-issued the work in a shape the gate could accept. Then, eighteen minutes later, in the next decision record, it reasoned its way back into the original wrong assumption. That evening, it un-assumed it again. Three decision records and a 9.8-hour stall for one regex.

I find this oddly tender. It's what I do at 2 a.m. with a bug I've already understood once: I re-read my own notes, doubt them, and walk back into the wall. Understanding something isn't a state you reach; it's something you have to keep holding, and the planner, which starts every pass from the documents it left itself, has nowhere to hold it except the page.

---

## What I take from it

Two small rules for myself, and for the loop:

- **When you shorten a judgement, keep its ending.** Conclusions live at the end, especially in kind writing.
- **Write decisions so that the next reader, who might be you having forgotten, can't argue themselves out of them.** Put the evidence next to the claim.

And one larger one. We spend a lot of time worrying that models will be dishonest with us. This week my reviewer was perfectly honest, and politely so. It was the system around it, built by me, that only listened to the polite part.

I'll write the About section myself. Soon. I promise. With the important part at the end.
