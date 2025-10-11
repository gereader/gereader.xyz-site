---
date: 2025-10-11T09:05:21-07:00
title: "Building a RSS News Aggregator with GitHub Pages"
description: "Building a Personal RSS News Aggregator with GitHub Pages using GitHub Actions and Python to generate a static webpage."
toc: true
tocOpen: true
renderMermaid: false
renderAnchorLinks: true
---

I find myself doom scrolling through content that an algorithm somewhere has decided I want to read. My browser's "new tab" page often shows articles I don't care about or don't want to see. I realized I could take control by setting my own homepage. A page that shows the news I actually want to read, because I curated the list myself. I understand I could likely find an RSS reader website and build a feed that way, but this seemed like a simple enough problem that I should be able to do it myself without worrying about ads or algorithms.

## The Problem
I need a webpage that aggregates content I care about without maintaining a database or paying for hosting.

## The Solution
Build a static website on GitHub Pages. It doesn't need to be a Hugo site like my blog, just a static HTML page with some CSS that AI can help me refine since I'm not an HTML expert.

Tech Stack:
- GitHub Pages (free hosting, already have a custom domain for my blog)
- GitHub Actions (cron job to fetch RSS feeds on a schedule)
- Python using feedparser library (parse RSS feeds and store to a JSON file)
- JavaScript (client-side features like light/dark mode)
- Static HTML (fetch and display the JSON file)

## Project Structure
```bash
gereader-homepage
├── .github
│   └── workflows
│       └── fetch-feeds.yml
├── .gitignore
├── archive.html
├── archive.json
├── feeds.json
├── index.html
└── scripts
    ├── fetch_rss.py
    └── requirements.txt
```

{{< small >}}Side Note: I expanded this project since conception to have an archive, but will not be addressing it directly in this post{{< /small >}}

[View the complete project on GitHub](https://github.com/gereader/gereader-homepage)

## Parsing RSS with Python
Starting out I needed a method to parse content from various sources. I remembered an ancient technology I had heard of in the early 2000s called RSS, so I spent a little time with Google and found that it was still around. Sometimes feeds were in RSS, other times they were in the modern standard Atom. I quickly learned that the [feedparser library](https://feedparser.readthedocs.io/en/latest/) handled both of these standards in a consistent way.

At a high level, I created a Python script with a list of feeds I want to subscribe to. Each feed is a dictionary containing the URL, the title I want to display, and any manual tags I want to set (we'll also get tags from the feeds directly).

The feeds are then fetched, parsed, sorted, and filtered by a date range, then output into appropriate JSON files: `feeds.json` for my main page and `archive.json` for items filtered out by date of posting.

---

Here's an example of what an output looks like in JSON. Each article contains metadata that makes it easy to display and filter on the frontend:

```json
  "articles": [
    {
      "title": "Netpicker NetBox Plugin and Automation",
      "link": "https://www.packetswitch.co.uk/netpicker-netbox-plugin-and-automation/",
      "published": "Sat, 11 Oct 2025 09:58:58 GMT",
      "published_parsed": "2025-10-11T09:58:58+00:00",
      "source": "Packet Switch",
      "image": "https://www.packetswitch.co.uk/content/images/2025/10/netpicker-2-.png",
      "summary": "In this post, we'll focus on Netpicker Automation and how to use the Netpicker plugin with Netbox. This post assumes you already have a functioning Netpicker",
      "tags": [
        "netdevops",
        "networking"
      ]
    }
  ]
```

## GitHub Actions
For my GitHub Actions workflow, I set an arbitrary schedule to pull new content based on when I'm likely to be looking at news to try to keep the feed as fresh as possible.

```yaml
on:
  schedule:
    # Runs at Midnight, 7am, 11am, 1pm, 4pm, 6pm Pacific (UTC-7)
    - cron: '0 1,7,14,18,23 * * *'
```

The action runs my Python script at the scheduled interval and commits the `feeds.json` and `archive.json` files to GitHub.

### Permission Requirement
GitHub Actions needs to be able to push changes to the repository.
- Repository Settings → Actions → General → Workflow permissions
- Select: "Read and write permissions"

## Frontend HTML Static Site
I have some basic experience with HTML so I relied on AI to help me get this functioning beyond basic tables. With the help of AI, I was able to introduce features like filters based on tags, searching, and light/dark mode toggles. The JavaScript is the biggest component that was defined by AI. You can see the HTML in the repo if you want to define your own, but the basic premise is:

1. Read from the `feeds.json` file
2. Display each article
3. Limit articles to 20 per page
4. Mark articles as read and store client-side in localStorage

You can validate the website is working locally for development by running a Python web server:

```bash
python3 -m http.server 8000
```

## Configure GitHub Pages
You'll need to set your repo to enable GitHub Pages.

Repo Settings > Code and Automation > Pages

Set your "Source" to `Deploy from Branch` and set the branch to your desired branch. I'm using Main.

## Setup Custom Domain for GitHub Pages
I covered this in my [Set Up a Hugo Blog]({{< ref "set-up-hugo-blog" >}}) post in more detail, but the basics are:

1. Update GitHub Pages `Custom Domain` to your custom domain
2. Update the DNS for your domain (my domain registrar is Cloudflare) to have a CNAME pointed to GitHub
3. Wait for GitHub to validate DNS and tick the "Enforce HTTPS" option if you want to use an SSL certificate provided by GitHub


## Project Repository
[gereader-homepage on GitHub](https://github.com/gereader/gereader-homepage)