---
title: "Advanced SwiftUI Preferences: measuring without coupling"
description: "How PreferenceKey and anchors can coordinate layout across child views while keeping containers and descendants independent."
date: 2026-05-30
tags:
  - SwiftUI
  - iOS
  - Preferences
  - Layout
---

The basic `PreferenceKey` pattern is useful, but the advanced version is where it starts to feel like a real SwiftUI primitive.

The common use case is measurement. A parent needs to know something about its children after layout has happened: their frames, their baselines, their widths, or where an indicator should be drawn. The children know their own geometry, but they should not know how the parent will use it.

Preferences let those children contribute measurements upward. Anchors make those measurements resilient.

## Why anchors are better than raw frames

It is tempting to report a `CGRect` from a `GeometryReader` and call it done. That can work, but raw frames are tied to a coordinate space at the moment you captured them.

Anchors are more flexible. An `Anchor<CGRect>` says "this view's bounds", but the ancestor resolves that anchor in the coordinate space where it actually needs to draw.

That difference matters when containers move, scroll, animate, or nest.

The pattern looks like this:

```swift
struct BoundsPreferenceKey: PreferenceKey {
  static var defaultValue: [AnyHashable: Anchor<CGRect>] = [:]

  static func reduce(
    value: inout [AnyHashable: Anchor<CGRect>],
    nextValue: () -> [AnyHashable: Anchor<CGRect>]
  ) {
    value.merge(nextValue(), uniquingKeysWith: { _, new in new })
  }
}
```

Each child writes an anchor keyed by an identifier. The parent reads the collected dictionary and resolves the anchors where it renders an overlay.

```swift
.anchorPreference(key: BoundsPreferenceKey.self, value: .bounds) {
  [id: $0]
}
```

The child still does not know about the overlay. It only contributes its bounds.

## Preferences compose well with overlays

The parent side is usually an `overlayPreferenceValue` or `backgroundPreferenceValue`.

That pairing is important. The preference gathers information from descendants. The overlay uses that information to draw something above the complete subtree.

This is ideal for UI like:

- a segmented control indicator that tracks the selected segment
- a custom tab bar underline
- labels that align to the widest child
- callouts connected to specific child views
- a scroll progress marker based on content anchors

In all of those examples, the child views should remain boring. They describe their content and expose enough geometry for a container to enhance the presentation.

## The sharp edges

Advanced preferences are powerful, but they can become hard to debug if the data model is vague.

I try to keep three rules:

1. Prefer small, purpose-specific keys.
2. Include stable identifiers when collecting values from multiple children.
3. Keep the reducer obvious.

The reducer is not the place for cleverness. If the key stores a dictionary of child bounds, merge dictionaries. If it stores sizes, choose max or append into an array. The easier the reducer is to read, the easier it is to trust the layout behavior.

Also watch for feedback loops. If a measured value changes state, and that state changes layout, you can create a view that jitters or repeatedly invalidates itself. Sometimes that is a sign the layout should be expressed with SwiftUI's `Layout` protocol instead.

## The bigger idea

Preferences are not just a workaround for missing APIs. They are one of SwiftUI's composition tools.

Environment sends context down. Preferences send derived information up. Together they let containers and children cooperate without knowing too much about each other.

Next week I want to cover the part of preferences that is easy to miss: transforming values as they move through intermediate containers.
