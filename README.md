# PeregrinoBits - Camino Cold Storage

A minimalist, multilingual landing page for PeregrinoBits, a limited-edition physical Bitcoin cold storage project. This project bridges the spirit of the Camino de Santiago pilgrimage with modern financial sovereignty, built upon Ballet's non-electronic wallet architecture.

## Overview
This repository contains the source code for the PeregrinoBits website, built as a single-page application (SPA) to ensure high performance, security, and easy static hosting. 

## Features
* **Blazor WebAssembly (WASM):** Client-side UI built with C# and .NET, compiled to WebAssembly to run directly in the browser without a backend server.
* **Dynamic Localization:** Built-in language state management using C# `[CascadingParameter]` and switch expressions to toggle seamlessly between English, Spanish (ES), and Portuguese (PT) without page reloads.
* **Static Hosting:** Configured with `.nojekyll` and `404.html` routing fallbacks for free, automated hosting on GitHub Pages.
* **Responsive Dark Theme:** Custom, minimalist CSS grid and flexbox architecture designed for modern displays and mobile devices.

## Tech Stack
* **Framework:** .NET 8.0 / Blazor WebAssembly
* **Language:** C#
* **Styling:** Custom CSS3
* **CI/CD:** GitHub Actions (Automated build and deploy to `gh-pages`)

## Local Development
To run this project locally, ensure you have the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) installed.

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/peregrinobits-site.git](https://github.com/YOUR_USERNAME/peregrinobits-site.git)
