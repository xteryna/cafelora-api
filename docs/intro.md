---
layout: default
title: API Documentation
permalink: /
nav_order: 0
---

# Documentation of Café Lóra API

Here you can find documentation to all the API endpoints for Café Lóra.

This page is about getting all the data.

## Authentication

You authenticate with an `Authorization` header with value

```
Email your@email.com
```

The server will create a new account for every new e-mail automatically.

## All drinks [GET]

```
{{ site.apibase }}/me/drinks
```

## One drink [GET]

```
{{ site.apibase }}/me/drinks/{drinkId}
```

Return the drink with id `drinkId`.

## Make order [PATCH]

```
{{ site.apibase }}/me/drinks/{drinkId}
```

Body:

```
{
  "ordered": true
}

Makes an order of drink with id `drinkId`. You can send `true` to order a drink or `false` to cancel the order.
