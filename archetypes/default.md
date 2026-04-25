---
date: {{ .Date }}
lastmod: {{ .Date }}
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
description: "{{ replace .File.ContentBaseName "-" " " | title }}"
toc: true
tocOpen: true
renderMermaid: false
renderAnchorLinks: true
categories: []
tags: []
---