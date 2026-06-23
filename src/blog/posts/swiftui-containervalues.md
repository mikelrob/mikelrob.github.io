---
title: "SwiftUI ContainerValues: metadata for custom containers"
description: "ContainerValues let child views give local metadata to a custom container without sending it all the way up the view tree."
date: 2026-06-13
tags:
  - SwiftUI
  - iOS
  - ContainerValues
---

Environment values and preferences are both about moving information through a SwiftUI hierarchy.

The environment moves context down. Preferences move derived information up. `ContainerValues` sit in a more specific place: they let a child give metadata to the custom container that is directly arranging or interpreting it.

That makes them easy to confuse with preferences, but the intent is different.

Preferences are good when information needs to travel up the tree until some ancestor chooses to observe it. Container values are good when a custom container is already looking at its immediate subviews and needs each child to describe how it should be treated.

## The problem they solve

Imagine a custom tab bar, carousel, or segmented control.

Each child might need to say:

- use this label in the container chrome
- treat me as featured
- apply this priority when space is tight
- use this badge value
- associate this stable identifier with my subview

You could pass all of that through the container's initializer, but then the parent has to maintain parallel arrays of views and metadata. You could use preferences, but then the metadata travels through the broader preference pipeline even though only the immediate container cares.

Container values let the metadata live with the child view.

## The shape of the API

A custom value starts with a key:

```swift
private struct TabTitleKey: ContainerValueKey {
  static let defaultValue = ""
}

extension ContainerValues {
  var tabTitle: String {
    get { self[TabTitleKey.self] }
    set { self[TabTitleKey.self] = newValue }
  }
}
```

A child sets the value where it is declared:

```swift
Text("Account")
  .containerValue(\.tabTitle, "Profile")
```

Then the custom container reads the value from each subview it receives:

```swift
struct TabStrip<Content: View>: View {
  @ViewBuilder var content: Content

  var body: some View {
    HStack {
      Group(subviews: content) { subviews in
        ForEach(subviews) { subview in
          VStack {
            subview
            Text(subview.containerValues.tabTitle)
              .font(.caption)
          }
        }
      }
    }
  }
}
```

The important part is the ownership boundary. The child owns the local label. The custom container owns what that label means.

## Why not a preference?

Preferences still make sense when a value needs to bubble beyond the immediate container or participate in a larger reduction.

Container values are narrower. They are not a general "send this up the tree" mechanism. They are part of SwiftUI's custom container story: when a container decomposes its content into subviews, those subviews can carry metadata with them.

That means the container can avoid guessing. Instead of inspecting view types or requiring a separate model, it reads explicit child-provided values.

I think of the difference like this:

- Use a preference when an ancestor needs a value from the rendered subtree.
- Use a container value when a custom container needs metadata for each immediate child.

That is a small distinction, but it keeps APIs cleaner.

## A better child API

You can wrap the raw key in a domain-specific modifier:

```swift
extension View {
  func tabTitle(_ title: String) -> some View {
    containerValue(\.tabTitle, title)
  }
}
```

Then call sites read like part of your component language:

```swift
TabStrip {
  AccountView()
    .tabTitle("Profile")

  BillingView()
    .tabTitle("Billing")
}
```

That feels more SwiftUI-native than passing a separate configuration array into `TabStrip`.

The metadata stays attached to the view it describes, and the container stays responsible for presentation.

## The bigger idea

`ContainerValues` complete a nice set of tools:

- Environment: parent context flows down.
- Preferences: child information flows up.
- Transformed preferences: intermediate containers reshape upward information.
- Container values: children annotate themselves for their immediate custom container.

Used well, they help custom SwiftUI APIs stay declarative. The caller describes each child in place. The container decides how to render those children together.

Next week I want to move from metadata to behavior and look at custom actions: APIs that feel like SwiftUI's `OpenURLAction`.
