+++
date = '2025-08-17T16:30:05-07:00'
title = 'Set Up Hugo Blog'
+++
# Setting Up a Hugo-based Blog on GitHub Pages

I will be showing you how I set up a Hugo blog, being published to GitHub Pages using GitHub Actions for free. 

## Install Hugo on your Computer
I will be performing these actions from my MacBook, the basic ideas should be compatible across any platform beyond the initial install. 

I installed Hugo via Homebrew:

```bash
brew install hugo
```

## Create a Hugo site locally
This will setup the files required by Hugo to operate. It will create a directory named after your site. 

Let's create our site:

```bash
~ $ hugo new site myblog
Congratulations! Your new Hugo site was created in ~/myblog.

Just a few more steps...

1. Change the current directory to ~/myblog.
2. Create or install a theme:
   - Create a new theme with the command "hugo new theme <THEMENAME>"
   - Or, install a theme from https://themes.gohugo.io/
3. Edit hugo.toml, setting the "theme" property to the theme name.
4. Create new content with the command "hugo new content <SECTIONNAME>/<FILENAME>.<FORMAT>".
5. Start the embedded web server with the command "hugo server --buildDrafts".

See documentation at https://gohugo.io/.
```

Next, I will install the "Hugo Blog Awesome" theme as a git submodule. You can skip this or set up a different theme, but make sure to use submodules for any theme you choose (this is required so that GitHub Actions works properly).

First, initialize git and add the theme as a submodule:

```bash
~ $ cd myblog
~/myblog $ git init
~/myblog $ git submodule add https://github.com/hugo-sid/hugo-blog-awesome.git themes/hugo-blog-awesome
~/myblog $ code .
```

I opened the Hugo site directory in VS Code. You then edit the `hugo.toml` file to include this line for your theme:
`theme = "hugo-blog-awesome"`

## Test Run
Let's test it out locally before pushing it to GitHub. First we need to create a new post so we can show content.

```bash
~/myblog $ hugo new posts/hello-world.md
Content "~/myblog/content/posts/hello-world.md" created
```

This is going to create a page under the content subdirectory, we'll go add the content "Hello, World!" to the page.

```bash
+++
date = '2025-08-17T15:13:15-07:00'
draft = true
title = 'Hello World'
+++

Hello, World!
```

Here is output as I get the first page to show. Don't forget to remove the draft tag like I did. 

```bash
~/myblog $ cat hugo.toml
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'My New Hugo Site'
theme = "hugo-blog-awesome"
~/myblog $ hugo server
Watching for changes in ~/myblog/{archetypes,assets,content,data,i18n,layouts,static,themes}
Watching for config changes in ~/myblog/hugo.toml
Start building sites …
hugo v0.148.2+extended+withdeploy darwin/amd64 BuildDate=2025-07-27T12:43:24Z VendorInfo=brew

                  │ EN
──────────────────┼────
 Pages            │ 10
 Paginator pages  │  0
 Non-page files   │  0
 Static files     │  5
 Processed images │  0
 Aliases          │  1
 Cleaned          │  0

Built in 62 ms
Environment: "development"
Serving pages from disk
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
^C%
~/myblog $ cat content/posts/hello-world.md
+++
date = '2025-08-17T15:13:15-07:00'
draft = true
title = 'Hello World'
+++

Hello, World!%
~/myblog $ hugo server
Watching for changes in ~/myblog/{archetypes,assets,content,data,i18n,layouts,static,themes}
Watching for config changes in ~/myblog/hugo.toml
Start building sites …
hugo v0.148.2+extended+withdeploy darwin/amd64 BuildDate=2025-07-27T12:43:24Z VendorInfo=brew

                  │ EN
──────────────────┼────
 Pages            │ 11
 Paginator pages  │  0
 Non-page files   │  0
 Static files     │  5
 Processed images │  0
 Aliases          │  1
 Cleaned          │  0

Built in 55 ms
Environment: "development"
Serving pages from disk
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
^C%
~/myblog $ cat content/posts/hello-world.md
+++
date = '2025-08-17T15:13:15-07:00'
title = 'Hello World'
+++

Hello, World!%
```

## Push it to GitHub
I created a public repository directly on GitHub. I then changed the name of my local directory to match so it's easy to find in the future. 

```bash
# Rename the directory by moving it, this name matches my GitHub repository
~ $ mv myblog gereader.xyz-site
~ $ cd gereader.xyz-site

# Add all our files to git
git add .
git commit -m "Initial Hugo site setup"
```

Now we need to set up our local directory to be linked with our public repo. You do this by adding the remote origin address. GitHub will give you directions in your empty repo if you need more assistance. 

```bash
git remote add origin https://github.com/yourusername/yourreponame.git
git branch -M main
git push -u origin main
```

## Setup GitHub Actions to Deploy

To configure GitHub Actions we need to define the workflow file. I am creating mine like this:
`.github/workflows/hugo.yaml` 

I will show the details I put in my workflow file, I tried to add comments to be as descriptive of each step as possible when I felt the names didn't fully describe the intent. 

```yaml
---

name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

# Default to bash
defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        # Checkout submodules too, want the latest content
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          # Required for most modern themes
          extended: true

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4

      - name: Build with Hugo
        env:
          # For maximum backward compatibility with Hugo modules
          HUGO_ENVIRONMENT: production
          HUGO_ENV: production
        run: |
          hugo \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Update GitHub Pages Settings
In your GitHub account under the public repo you can go into the settings to configure GitHub Pages. We're going to set our source to be GitHub Actions since we'll be deploying with GitHub Actions. There are other methods that I won't go into details on in this post. 

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**

## Deploy your website
We've done all the work. Now you need to commit your changes and push them up into your repository.

```bash
git add .github/workflows/hugo.yaml
git commit -m "Add Hugo deployment workflow"
git push
```

And just like that, GitHub Actions should automatically build and deploy your site to GitHub Pages. You can watch the deployment in the "Actions" tab of your repository. Once that deployment completes your site should be accessible via `https://yourusername.github.io/yourreponame`.

## Key Points to Remember

- Your repository must be **public** for free GitHub Pages, you can have a private repo in the paid version
- Use git **submodules** for themes, not just `git clone` — maintains updateable theme connection
- Set Pages source to **"GitHub Actions"**, this is required for GitHub Actions to deploy the website
- The workflow uses Hugo extended version which is required for most modern themes

## Optional Steps 
I am going to be using a custom domain for my GitHub Pages so I thought I would share the requirements to do that.
If you want to use your own domain instead of the default GitHub Pages URL, I will set it to always use SSL without having to provide my own certificates.

### Configure DNS (Using Cloudflare)
My domain registrar is Cloudflare. I am sure these steps are similar among other registrars, but I will only be showing how I accomplished this task with Cloudflare specifically. 

Add a CNAME record for your domain to point your desired subdomain to GitHub.

```
Type: CNAME
Name: blog (or whatever subdomain you want)
Target: yourusername.github.io
Proxy status: DNS only (not proxied)
```

This will make it so that when you go to `blog.yourdomain.com` the DNS record will respond with the GitHub DNS entry. 

### Configure GitHub Pages Custom Domain

1. Go to your repository **Settings** → **Pages**
2. In the "Custom domain" field, enter your domain: `blog.yourdomain.com`
3. Click **Save**

### Add CNAME file to Hugo

Create a CNAME file in your Hugo project. This is required by GitHub Pages for CNAME to be used (which is what we configured in Cloudflare).

```bash
echo "blog.yourdomain.com" > static/CNAME
```

### Update your hugo.toml

Change the baseURL in your `hugo.toml` to match the CNAME as well. This is used to determine absolute URLs in your website. 

```toml
baseURL = 'https://blog.yourdomain.com/'
languageCode = 'en-us'
title = 'My New Hugo Site'
theme = "hugo-blog-awesome"
```

### Push the changes to GitHub

```bash
git add static/CNAME hugo.toml
git commit -m "Add custom domain configuration"
git push
```

### Wait for SSL and enable HTTPS

1. Wait 5-10 minutes for DNS propagation, this can take a long time
2. Wait 15-30 minutes for GitHub to generate an SSL certificate, this doesn't start until GitHub validates DNS
3. Go back to **Settings** → **Pages**
4. Once you see a green checkmark next to your domain, check **"Enforce HTTPS"**, this will redirect HTTP to HTTPS

Your site should now be live at `https://blog.yourdomain.com` with a valid SSL certificate.