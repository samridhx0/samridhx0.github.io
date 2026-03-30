# Open Source Has a Sustainability Problem and We're All Pretending It Doesn't

The Log4Shell vulnerability dropped in December 2021. It affected basically every Java application in existence. The exploit was trivial - a single string in a log message could trigger remote code execution. The damage was real and widespread.

Log4j is maintained by volunteers. At the time of the vulnerability, the primary maintainer was doing it in his spare time. No company paid him. No fund supported the project. Just a person, maintaining a library that hundreds of billions of dollars of infrastructure depended on, for free.

That's the situation. That's the open source sustainability problem in one example.

## How We Got Here

Open source grew up on a simple idea: scratch your own itch, share the code. Linus Torvalds needed an OS for his computer. Richard Stallman needed a free compiler. They wrote them. Others contributed. Things got big.

The model worked great when "big" meant thousands of developers and universities. It gets complicated when "big" means "every bank, every hospital, every government system, every cloud provider runs this code."

The value created is astronomical. The compensation for the people who created and maintain it often isn't.

## The Dependency Chain is Terrifying

Run `npm install` on a modern JavaScript project. Read the output. You'll often see hundreds or thousands of packages installed.

Each of those packages is a dependency. Each dependency has maintainers. Some are well-funded (backed by companies). Many are maintained by one or two people who just... do it.

The `leftpad` incident in 2016 should have been a wake-up call. A developer unpublished a package that was 11 lines of code. The entire npm ecosystem broke. Builds failed at companies worth billions.

Not because the code was complex. Because the dependency graph had grown so tangled that a tiny package nobody thought about had become load-bearing infrastructure.

```bash
# Curious about your own project's dependency depth?
npm ls --depth=0   # direct dependencies
npm ls             # the whole tree (brace yourself)
```

## The "Just Contribute Back" Problem

The standard response to sustainability concerns is "if you use open source, contribute back." And yes, ideally. But:

A Fortune 500 company has lawyers, security reviews, contributor license agreements, procurement processes. Contributing a patch means navigating all of that. So instead of contributing, they file a bug and wait. Or they just live with the bug.

The companies that do this best - Red Hat historically, Google with Go and Chromium, Mozilla with Firefox - actually employ people to work on open source full time. But most companies don't. They take the code, ship the product, move on.

## What's Actually Working

A few models have found some traction:

**Open Core**: GitLab, HashiCorp (before they changed licenses), Elastic. Core is open source, enterprise features cost money. Works okay until the company decides the open core isn't enough and changes the license (see: HashiCorp's BSL move, Elastic leaving Apache 2.0).

**Sponsorship**: GitHub Sponsors, Open Collective, Liberapay. Individual developers can get some income from grateful users. This works for high-profile projects. It doesn't work for the mid-tier stuff - the critical libraries nobody has heard of.

**Foundations**: Apache Foundation, Linux Foundation, CNCF. Shared governance, shared funding, sometimes shared staffing. Works well for infrastructure projects where companies have an interest in the commons remaining healthy.

**Tidelift**: Pays maintainers for security guarantees and SLA-style commitments. Interesting model but limited reach.

None of these are fully solved.

## The License Wars Are a Symptom

Redis, MongoDB, Elasticsearch, HashiCorp - all changed away from permissive open source licenses in the last few years. The reason given is always some version of "cloud providers are monetizing our work without giving back."

That's true. AWS offering a managed Redis service while contributing essentially nothing to the Redis project is a real problem. The maintainers responded by changing the license to prevent it.

But now the software isn't open source by the OSI definition anymore. It's "source available" or "business source." You can read it, you can run it yourself, you can't build a competing cloud service.

The open source community splits every time this happens. Some people understand why the maintainers made the move. Others see it as a betrayal. Both are kind of right.

## What I Think Happens Next

More license fragmentation. The permissive open source model works great for tooling (compilers, editors, dev tools) where no one is directly monetizing the tool itself. It gets harder for infrastructure software where the value is in running the service.

More consolidation around foundations for critical infrastructure. The OpenSSF (Open Source Security Foundation) exists now specifically to fund security work on critical open source projects. That's good and overdue.

More forks. When a project changes licenses or governance, the community forks. OpenSearch is a fork of Elasticsearch. Valkey is a fork of Redis. Forks are painful in the short term and often create healthy competition in the long term.

And probably more incidents like Log4Shell. Because the dependency graph keeps growing and the maintainer pool isn't growing proportionally.

The software that runs the world is largely written by people doing it for free, or for love, or for clout. That's remarkable. It's also a fragile situation we've all gotten comfortable not thinking about.

Worth thinking about.
