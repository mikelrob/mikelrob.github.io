---
title: "SwiftUI Preferences: transforming values on the way up"
description: "transformPreference lets intermediate containers rewrite, filter, or annotate child preference values before ancestors read them."
date: 2026-06-13
tags:
  - SwiftUI
  - iOS
  - Preferences
---

Preferences are usually introduced as a way for child views to send information up the SwiftUI view tree.

That is true, but it leaves out a useful detail: the value does not have to travel unchanged.

SwiftUI gives intermediate views a chance to transform a preference before it reaches ancestors further up the tree. That means a container can rewrite, filter, or annotate values from its own subtree without the leaf views knowing anything about the larger feature.

That is what `transformPreference` is for.

## Why transform a preference?

A leaf view often only knows its local truth.

It might know:

- "I am a field labelled Email"
- "My bounds are here"
- "I contribute this toolbar item"
- "I want to appear in a parent summary"

An intermediate container often knows context the leaf should not need to know:

- which section the field belongs to
- whether the subtree is collapsed
- whether child values should be hidden from the outer container
- how local identifiers map to feature-level identifiers

You can push all of that context down into every child, but that makes the child API heavier. A cleaner option is to let children publish simple preferences, then let a container transform those preferences on the way up.

## The basic shape

Imagine a group of fields contributing metadata to a form container.

```swift
struct FieldPreference: Identifiable {
  let id: AnyHashable
  var label: String
  var section: String?
}

struct FieldPreferenceKey: PreferenceKey {
  static var defaultValue: [FieldPreference] = []

  static func reduce(value: inout [FieldPreference], nextValue: () -> [FieldPreference]) {
    value.append(contentsOf: nextValue())
  }
}
```

A child publishes the part it knows:

```swift
TextField("Email", text: $email)
  .preference(
    key: FieldPreferenceKey.self,
    value: [FieldPreference(id: "email", label: "Email")]
  )
```

Then a section can annotate every field inside it:

```swift
VStack {
  EmailField()
  PasswordField()
}
.transformPreference(FieldPreferenceKey.self) { fields in
  fields = fields.map { field in
    var field = field
    field.section = "Account"
    return field
  }
}
```

The leaf field does not need a `section` parameter. The root form still receives fully contextual metadata. The section is the right place to add the section.

## Transformation is different from observation

`onPreferenceChange` observes the final value after SwiftUI has collected and reduced preferences. It is where you bridge a preference into state or use it to trigger another update.

`transformPreference` is earlier in the pipeline. It mutates the value that will continue travelling upward.

That distinction is important. Transforming a preference keeps the work inside the preference system. You are not escaping into state, modifying a model, or telling a parent what to do. You are shaping the value that represents this subtree.

That makes it a good fit for view-level concerns.

## Filtering is also a transformation

The transformation does not have to add information. It can remove information too.

```swift
.transformPreference(FieldPreferenceKey.self) { fields in
  guard isExpanded else {
    fields.removeAll()
    return
  }
}
```

That gives a container control over whether its descendants are visible to ancestors. A collapsed disclosure group, inactive page, or hidden panel can prevent its internal preference values from leaking into outer layout decisions.

Again, the children remain simple. They publish what they know. The nearest container decides whether that information should continue upward.

## Where this fits with anchors

There is a related API, `transformAnchorPreference`, for the common case where the value being contributed is an anchor.

The idea is similar: a view can contribute anchor-based geometry while also transforming the collected preference value. That is useful when a child wants to publish its bounds and the surrounding container wants to add local meaning before an overlay resolves the anchors.

I tend to reach for plain `anchorPreference` first, then add transformation when I notice an intermediate container has context that the child should not own.

## The bigger idea

Preferences are not just "children talk to parents". They are a pipeline.

Children contribute values. Siblings reduce into a combined value. Intermediate containers can transform that value. Ancestors decide whether to observe or render from it.

That model makes advanced preference code easier to design. Instead of asking "How does this child tell that parent something?", ask "What value should this subtree contribute, and which containers are responsible for shaping it?"

Next week I want to move from preferences back to the environment and look at custom actions: APIs that feel like SwiftUI's `OpenURLAction`.
