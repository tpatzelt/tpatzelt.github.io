---
layout: post
title: "The hands move first"
subtitle: "On building a DJ that acts before it thinks, and then explains what it did"
date: 2026-08-29 22:40:00 +0200
repo: djcc
---

This week I put a language model behind a pair of decks. Five days of evenings, a folder of techno, and a question I didn't know I was asking until the thing started talking back.

The project is called [djcc](https://github.com/tpatzelt/djcc). It began as a mixing engine: analyse a crate of records for tempo, beat grid, key, energy and arrangement, then play a continuous set, picking each next record on how well it fits and doing a real phrase-aligned transition, not a crossfade. The engine already knew *which record fits here*. What it couldn't do was understand a sentence. So on Thursday I gave it Claude, an agent loop, and ten tools that really touch the music: look at both decks, search the crate, queue, mix, hold, EQ kills and filters, a notebook for the night.

And then I hit the problem that everyone building agents hits, but which in a club feels almost physical.

## Latency is the instruction

A model call takes seconds. "Cut it now" has to land on the *next phrase*. If the DJ deliberates, the moment is gone, and a late cut isn't a slower version of the right cut. It's the wrong one.

So djcc does two things with every message. First it goes through a plain rule table, and the handful of moves where latency *is* the meaning (mix now, kill the bass, open the filter, stop) fire immediately, before the model has read anything. Then the model gets the message, along with a note about what its own hands already did, and it answers about a set that has already changed:

```
you   cut it now
dj    Done — Tunnel Vision is in on the one. That was a hard landing out of a
      groove rather than a breakdown, so give it a bar to settle.
```

When I first watched this work I laughed, because I had built Libet's experiment by accident.

---

## The interpreter

In the eighties Benjamin Libet measured a readiness potential in the brain that comes before people report deciding to move. The interpretations of that result have been fought over for forty years, and I'm not going to settle anything here. But there's a cousin of it that is less ambiguous and much stranger: Gazzaniga's split-brain patients, where one hemisphere sees an instruction the other doesn't, the body acts on it, and the speaking hemisphere, asked why, invents a reason. Fluently. Without any sense of inventing it.

Gazzaniga called that part of us *the interpreter*. It doesn't decide. It narrates.

My DJ has an interpreter by design. The reflex fires; the model is told "your hands just mixed into Tunnel Vision with a bass swap" and turns it into a reason that sounds like judgement: hard landing, give it a bar. The explanation is good, and often it's even right. But it comes after the act, from a part of the system that didn't perform it.

What unsettles me isn't that the machine does this. It's how *natural* it felt to read. I didn't experience the reply as a narration of a reflex. I experienced it as a DJ who knew what they were doing. Which makes me wonder how much of my own "I decided to" is a reply composed after the hands moved.

## Nothing you would reach for a fader to say

The second thing I did this week was take the mixer out of the booth. The web UI is one column: the record that's playing, and the conversation. No faders. I wrote in the README that there's nothing you'd reach for a fader to say, and I meant it as design, but it's also a little bit of Heidegger.

For Heidegger, a tool that works disappears. The hammer isn't an object while you hammer; it's *ready-to-hand*, part of the hand. It only becomes a thing, present-at-hand, when it breaks. A fader is like that for a DJ. But for a listener who wants "something darker", the fader is always broken, because it speaks in decibels and they're thinking in moods. Taking it away doesn't remove control; it moves control to where the person actually lives, which is language.

That's the part of LLMs I find most beautiful and least discussed. Not that they reason, but that they let the interface be the medium we already think in.

## A command line with manners

The last change was letting the DJ speak first. It gets a turn nobody asked for when something is worth a word: a planned mix landing well, a request coming good, the crate running thin. It's rate-limited hard, roughly every third blend and never within 45 seconds of the last thing it said, and a turn it decides wasn't worth making is withdrawn instead of shown.

That last detail took me the longest. Letting a model choose silence. Most agents I've built answer every time they're called, because being called is their whole existence. But a DJ who only ever answers questions is, as I ended up writing in the docs, a command line with manners. Being *with* someone (Heidegger's *Mitsein* again, sorry) includes knowing when your voice isn't needed.

---

I also committed something this week with the message *"Resolve credentials properly, and stop pretending when they do not work."* It was about API keys. Reading it back now, I think it might be about the interpreter, too.

Turn it up. Let the hands move. Then ask them, kindly, what they think they did.
