---
title: "Dice Roller Guide"
description: "How to use the ScoriMundi dice roller engine for your games."
---

# ScoriMundi Dice Roller Guide

Welcome to the ScoriMundi dice roller! Our engine supports everything from simple checks to complex math and automatic advantage/disadvantage modifiers. Simply type your roll into the input box and hit **Spin!**.

## Basic Rolling

You can type standard tabletop dice notation directly into the roller. The engine also understands standard math, so you can add, subtract, multiply, and use parentheses.

*   `1d20 + 5`
*   `2d8 + 1d4 + 3`
*   `(1d6 + 2) * 2`

## Supported Dice Notation

**Note:** The leading number is optional. Typing `d20` is the exact same as typing `1d20`.

| Notation | Description | Example | Result |
| :--- | :--- | :--- | :--- |
| **XdY** | Roll X dice with Y sides. | `3d6` | Rolls three 6-sided dice. |
| **dY** | Roll 1 die with Y sides. | `d20` | Rolls one 20-sided die. |
| **a** | Advantage. Rolls 2 dice, keeps the highest. | `d20a` | Rolls 2d20, keeps the highest. |
| **d** | Disadvantage. Rolls 2 dice, keeps the lowest. | `d20d` | Rolls 2d20, keeps the lowest. |
| **hX** | Keep Highest. Rolls dice, keeps highest X. | `4d6h3` | Rolls 4 dice, keeps the 3 highest. |
| **lX** | Keep Lowest. Rolls dice, keeps lowest X. | `4d6l3` | Rolls 4 dice, keeps the 3 lowest. |
| **v** | Variable Modifier. Links to your UI toggles. | `d20v` | See below. |

## The Variable (v) Tag

If you are using the Advantage or Disadvantage toggle buttons on the screen, you can use the **Variable (v) Tag** to tell the roller which dice should be affected by those buttons.

By adding `v` to a die (e.g., `d20v`), it will listen to your current toggle settings:

*   **If Advantage is toggled ON**, `1d20v` rolls with advantage.
*   **If Disadvantage is toggled ON**, `1d20v` rolls with disadvantage.
*   **If set to Normal**, it just rolls a standard `1d20`.

This is incredibly useful for complex rolls. For example, if you type `d20v + 2d6` with Advantage turned on, the engine is smart enough to only give advantage to the `d20` and will leave your `2d6` damage dice completely alone!

## Reading Your Results

When you spin, the log will show your total result. It also provides a breakdown of the exact physical dice that were rolled behind the scenes, so you can always see exactly how your fate was decided.
