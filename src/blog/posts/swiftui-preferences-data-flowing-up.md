---
title: "SwiftUI Preferences: data flowing up the tree"
description: "PreferenceKey is SwiftUI's answer for child views reporting layout and semantic information back to ancestors without tight coupling."
date: 2026-05-25
tags:
  - SwiftUI
  - iOS
  - Preferences
---

Most SwiftUI data flows down.

A parent owns some state, passes values into child views, and SwiftUI re-renders the body when that state changes. The environment is another version of that same direction: a parent provides context and descendants read it.

Preferences are different. They let children report values up the view tree.

That sounds small, but it unlocks a whole class of problems that are awkward with ordinary bindings. A tab item wants to tell a parent its title. A child view wants to report its measured size. Several descendants want to contribute anchors so an ancestor can draw an overlay. The parent needs information from below, but the children should not need to know who is listening.

That is what `PreferenceKey` is for.

## A preference is not state

The first mistake I made with preferences was treating them like another storage mechanism. They are not. Preferences are derived from the current view tree.

A child writes:

```swift
.preference(key: TitlePreferenceKey.self, value: "Settings")
```

An ancestor reads:

```swift
.onPreferenceChange(TitlePreferenceKey.self) { title in
  self.title = title
}
```

The preference exists because that child exists. If the child disappears, the preference disappears too. That is a feature, because the value stays tied to layout and hierarchy instead of becoming stale app state.

## The key defines how values combine

A `PreferenceKey` has two important pieces: a default value and a reducer.

```swift
struct TitlePreferenceKey: PreferenceKey {
  static var defaultValue: String?

  static func reduce(value: inout String?, nextValue: () -> String?) {
    value = nextValue() ?? value
  }
}
```

The reducer matters because multiple children can publish the same preference. SwiftUI walks the tree and combines those values. Sometimes the right behavior is "last value wins". Sometimes it is "append everything to an array". Sometimes it is "take the maximum height".

That makes preferences feel a little like a fold over the rendered subtree.

Once I started thinking about them that way, they became easier to use. A preference is not a message sent to a specific parent. It is a value contributed to the tree, and an ancestor can decide whether it cares.

## When preferences are the right tool

Preferences shine when a child has local knowledge that an ancestor needs in order to render the final result.

Examples:

- collecting tab metadata from custom tab items
- measuring child sizes for equal-width or equal-height layouts
- passing anchor positions to an overlay
- letting content influence a container's title, toolbar, or chrome

They are less compelling when the child is trying to trigger business logic. In those cases a binding, callback, model method, or custom action is usually clearer.

The key question is: "Is this value a property of the rendered child hierarchy?" If yes, preferences are worth considering.

## Why this fits SwiftUI

Preferences preserve the loose coupling that makes SwiftUI composition work. A child can publish information without importing the parent type, holding a reference, or accepting a callback for every possible container.

That makes them especially useful for view APIs that should feel native. The child declares what it knows. The container decides what to do with it.

Next week I want to go deeper into the more advanced version of this pattern: using preferences and anchors to coordinate layout across multiple descendants.
