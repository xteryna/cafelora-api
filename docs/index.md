---
layout: page.liquid
title: Café Lóra API
---

# API Documentation

Documentation for all the endpoints for Café Lóra API.

## Authentication
          
To authenticate use your kodim.cz apps token:
          
```
Bearer your-token-here
```
          
The server will automatically create new account for every new e-mail.

## All drinks [GET]

Get list of all the drinks

```
{{ config.serverUrl }}/api/me/drinks
```

## One drink [GET]

Get the drink with the given `drinkId`:

```
{{ config.serverUrl }}/api/me/drinks/{drinkId}
```

## Make order [PATCH]

Makes an order of the drink with id `drinkId`.

```
{{ config.serverUrl }}/api/me/drinks/{drinkId}
```

Body:

```
{
  "ordered": true
}
```

You can send `true` to order a drink or `false` to cancel the order.

Returns the updated drink.
