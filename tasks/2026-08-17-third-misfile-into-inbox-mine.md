---
title: Third external item in a row dropped into inbox/mine — the contract needs one sentence
date: 2026-08-17
priority: medium
status: open
area: content-system
---

# `inbox/mine/` has now been wrong three times in eight days

**Owner decision wanted**, and it is small: one sentence in `inbox/README.md`.

The 2026-08-17 ingest item — `Latent Space Podcast - Aug 03 2026` — was in `inbox/mine/`, which per
`inbox/README.md` means "I wrote this": `origin: human`, byline Wolfgang Gross, prose kept verbatim.

It is a transcript of a podcast episode. The item's own first four lines are the show name, the
episode date, the episode title with its two named guests, and the show's promotional blurb. The
body is a two-person interview conducted by a host who is neither of them. Following the folder hint
would have published Latent Space's episode under your name, so **the hint was overridden** and the
item was processed as external material: three `origin: agent` notes, no prose republished, original
archived intact at `sources/2026-08/latent-space-inference-engineering-baseten/`.

That is the third time, and the reason to open this file rather than just repeat the note in
`SOURCE.md`:

| Date | Item | What it actually was |
|---|---|---|
| 2026-08-10 | `Model Training as Code — Aleph Alpha.md` | Aleph Alpha's research blog post, by Michael Barlow, with a copyright line |
| 2026-08-14 | Sutskever's List, ch. 1–2 | Richard Heimann's book, published by Manning |
| 2026-08-17 | `Latent Space Podcast - Aug 03 2026` | a Latent Space episode transcript, two named guests |

Three out of the last three items in `inbox/mine/` were external material. Nothing has *ever* been
correctly filed there in the period these logs cover. So the folder is not being used the way the
contract describes it, and the override — which was written up as an exception on 2026-08-10 — is
now the normal path.

## The reading that fits the evidence

You are probably using `inbox/mine/` as "my stuff to process" rather than "my writing". Which is a
perfectly reasonable thing to want from a folder called *mine*, and it is not what the contract
says it means.

If that is right, the fix is not to change your habit. It is to write down what the folder actually
does, which the ingest agent has been doing correctly by accident for three items running:

> `inbox/mine/` marks material as yours to keep. It is overridden when the item carries another
> author's byline — a named author, a publisher, a copyright line, a podcast's guests — in which
> case the item is summarised as external material rather than republished under your name. The
> override only ever runs away from `origin: human`, never toward it.

That is the sentence proposed on 2026-08-10 and left unwritten because it is your contract to
change. Three data points later it is worth writing.

## Definition of done

- [ ] Confirm the reading above (or say the drops really were accidents, in which case nothing
      changes and this file gets deleted).
- [ ] If confirmed: add the sentence to the "Marking your own writing" section of
      `inbox/README.md`, and close `tasks/2026-08-10-inbox-mine-misfiled-item.md`, which is the
      same question asked once instead of three times.

## The thing that would actually be lost

Worth stating so the decision is not made on tidiness. The reason to care is not that the folder is
misleading — it is that if you ever *do* drop your own writing in there alongside a captured
article, an agent applying the override has to tell them apart from content alone. It has managed
three times because all three items were unambiguous: a copyright notice, a publisher, a show
blurb. A dictated fragment of your own thinking with no frontmatter has none of those markers, and
it will be filed correctly. A dictated fragment *about* an article, saved in the same file as the
article, will not be.

That is the case that has not come up yet and is the one to watch. It is also cheap to prevent from
your side: `origin: human` in the frontmatter is never overridden, because it is a statement rather
than a location.
