---
title: "Custom SwiftUI actions: APIs that feel like OpenURLAction"
description: "OpenURLAction shows a useful SwiftUI pattern: pass behavior through the environment so views can request work without owning the implementation."
date: 2026-06-22
tags:
  - SwiftUI
  - iOS
  - Environment
  - Actions
---

One of the quieter pieces of SwiftUI API design is `OpenURLAction`.

A view does not usually open a URL by grabbing an application singleton. It asks the environment:

```swift
@Environment(\.openURL) private var openURL

Button("Website") {
  openURL(URL(string: "https://www.example.com")!)
}
```

That tiny API says a lot about how SwiftUI wants behavior to flow. The view can request an action, but it does not own the implementation. A parent, scene, app, or test can decide what "open this URL" actually means.

That pattern is worth stealing for our own view APIs.

## Actions are context too

Environment values are often described as data, but SwiftUI also puts behavior in the environment. `openURL`, `dismiss`, `refresh`, and related APIs are all forms of contextual behavior.

That makes sense. Whether a URL opens Safari, shows an in-app browser, logs analytics, or gets blocked by parental controls is not really the button's decision. The button knows the user's intent. The surrounding context decides how to handle it.

Custom actions are useful when a child view needs to ask for something, but should not know who performs the work.

For example:

```swift
struct SaveDraftAction {
  var handler: (Draft) -> Void

  func callAsFunction(_ draft: Draft) {
    handler(draft)
  }
}
```

With a matching environment key, a view can read `saveDraft` and call it.

```swift
private struct SaveDraftActionKey: EnvironmentKey {
  static let defaultValue = SaveDraftAction { _ in }
}

extension EnvironmentValues {
  var saveDraft: SaveDraftAction {
    get { self[SaveDraftActionKey.self] }
    set { self[SaveDraftActionKey.self] = newValue }
  }
}
```

The feature root can provide the real implementation. A preview can provide a print statement. A test can provide a spy.

The child stays focused on UI.

## Why not just pass a closure?

Sometimes a closure parameter is absolutely the right answer.

If one parent creates one child and the action is core to that child's purpose, an initializer closure is direct and readable:

```swift
DeleteButton(onDelete: deleteItem)
```

The environment starts to pay off when the action is cross-cutting, deeply nested, or part of a family of views that should feel like one system.

Think about `openURL`. SwiftUI could have required every `Link` and every child view to accept an `onOpenURL` closure. That would be exhausting. Instead, the behavior is ambient and scoped. Override it where needed, ignore it everywhere else.

That is the sweet spot for custom actions.

## Designing a good custom action

The nice detail in `OpenURLAction` is that it is a type, not just a naked closure. That gives the API a name, a place for documentation, and room to grow.

`OpenURLAction` can return a result. Your custom action can do the same.

```swift
struct ExportAction {
  enum Result {
    case handled
    case failed
  }

  var handler: (ExportRequest) -> Result

  func callAsFunction(_ request: ExportRequest) -> Result {
    handler(request)
  }
}
```

That is more expressive than passing `(ExportRequest) -> Bool` through a random initializer. The action becomes part of the vocabulary of the feature.

I like custom action types when:

- the action has a domain name worth preserving
- several views may need to request the same behavior
- the implementation should be replaceable in previews or tests
- the caller should not know whether the behavior is local, delegated, logged, blocked, or ignored

## The danger

The same warning from environment values applies here: do not hide essential feature wiring just because you can.

If an action is required for a view to make sense, passing it explicitly may be better. If the action is contextual behavior that many descendants can request, the environment can make the API feel much more SwiftUI-native.

The goal is not fewer initializer parameters at all costs. The goal is the right ownership boundary.

`OpenURLAction` is a good model because it preserves intent. The view says what the user asked for. The environment decides how that intent should be handled.

That is the pattern I want more custom SwiftUI APIs to copy.
