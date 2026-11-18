---
layout: post
title: "Fifteen rules for a mind that forgets"
subtitle: "Unfalsifiable tests, a planner that writes commandments, and whether you can teach virtue to something with no memory"
date: 2026-11-11 22:30:00 +0100
repo: nightshift
---

NIGHTSHIFT finished its tenth run this afternoon. Twenty-four hours on [Wie Berlin radelt](https://github.com/tpatzelt/berlin-bike-data), my little study of when Berlin's shared bikes run out: 74 tasks merged, 13 parked, 319 agent runs, $56.05.

The numbers are fine. What I actually spent the evening reading was a file the planner keeps called `LESSONS.md`.

## Where the lessons came from

A month ago, run 6 on the same project parked 19 of 65 tasks. Half the worker spend went to tasks that never merged, and only 12 of 31 second attempts made it in. Workers kept making the same mistakes in new places, because each worker begins from nothing. It reads its task, does the work, and is gone. No worker remembers the last one.

So I gave the planner a new duty: distil findings that recur, from reviews and parked tasks, into **at most fifteen rules**, which every worker reads before starting and every reviewer enforces. Fifteen, because a list nobody can hold in mind is a list nobody follows.

Here are a few of the fifteen it wrote for run 10, verbatim:

> 3\. If your change breaks a test outside allowed_paths, stop and report which test pins the old rule. Do not edit around it.

> 5\. Check rendered HTML with html.parser, not substring or regex searches, and compare text against STRINGS[key][lang] for the page's own language so a language swap fails.

> 15\. Never raise a size or time budget in a test to make data fit; restructure the data.

Reading them felt like reading the inside of someone's notebook. Each rule is a scar.

---

## Tests that cannot fail

Rule 5 has a story behind it, and I found it in the other project the loop worked on, [Mein Pendel](https://github.com/tpatzelt/mein-pendel). During run 9 one task was simply to *inventory* how precise the web tests were, without changing anything. It found assertions like this:

```python
assert "Fußzeilen-Navigation" in text or "Footer navigation" in text
```

in a test parametrised over the language. It passes on the German page. It passes on the English page. It also passes on the German page *when the English one was asked for*, which is exactly the bug it should catch. It found tests that compared the whole German page to the whole English page with `!=`, so any difference at all would pass, and regexes like `datetime="[^"]+"` that accept any timestamp whatsoever.

Popper said a theory that no possible observation could contradict isn't scientific, not because it's false, but because it says nothing. These tests were Popper's nightmare in miniature. Green, always. Unfalsifiable. Every one of them had been written by an agent, approved by a reviewer, and merged, because a passing test looks exactly like a good test from the outside.

I want to be careful not to make this about agents. I've written `assert response.status_code == 200` and called it a test. The agents learned this from us. What they did was produce it at a volume where you could finally see the pattern.

## Rules and virtue

Here's what I keep circling. `LESSONS.md` is a code of conduct for beings that can't develop character. Aristotle thought virtue was a disposition built by habit: you become just by doing just things, until the doing is second nature and you no longer need the rule. That needs continuity. It needs a self that was there yesterday.

My workers have no yesterday. So the planner does the only thing you can do for a mind that forgets: it writes the habit down and hands it over every morning. Rules as prosthetic character.

And the rules are oddly wise in places. "Do not edit around it" isn't a coding guideline; it's a moral one: when the world resists you, report the resistance, don't hide it. "Restructure the data" instead of loosening the budget is the opposite of the unfalsifiable test. It asks you to change yourself rather than lower the bar until you clear it.

But a rule is not a virtue. A worker that follows rule 5 to the letter can still write a test that says nothing, in some way the fifteen rules didn't foresee. Practical wisdom, *phronesis*, is exactly the part that can't be written down: seeing what *this* situation asks for. The best I can do is keep the list short and alive, let it be rewritten by what breaks, and keep a human reading it.

---

There's a version of the alignment problem that's about values. There's another, quieter version that's about memory. How do you shape the character of something that wakes up new every time? Tonight my answer is: with fifteen sentences, rewritten by experience, read before every task, and checked by someone who does remember.

It isn't virtue. But it's how virtue starts for most of us too. Someone hands you a short list, and you follow it long enough that one day you don't need it.
