# Bolus Calculator

[Live Site](https://leonjoyce88.github.io/BolusCalc/)

A web-based tool to calculate mealtime and correction insulin doses using live blood glucose data and user inputs.

---

## Features

* Fetches live blood glucose readings via a Node/TypeScript backend.
* Calculates bolus insulin based on:

  * Carbohydrate intake (grams)
  * Carbohydrate ratio (grams/unit)
  * Correction factor (mmol/L/unit)
  * Target blood glucose
* Supports manual entry for flexibility when live data is unavailable.

---

## Tech Stack

* Backend: Node.js + TypeScript
* Frontend: React + TypeScript + Tailwind CSS
* Deployment: GitHub Pages (frontend)
---

## Future Improvements

* Login and save dexcom credentials so accommodate multiple users
* Visualise glucose data
* Calculations using insulin on board
