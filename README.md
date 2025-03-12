# The NYT News Observatory

A dynamic visualization of The New York Times news ecosystem, displaying both real-time and popular content in an interactive orbital system.

## Features

- **Central News Stream**: Real-time visualization of newest articles as orbiting planets
- **Popular Articles Constellation**: Static backdrop of most popular NYT articles
- **Time-Based Accumulation**: 24-hour clock interface showing daily news patterns
- **Interactive Elements**: Filtering options, article interaction, and real-time indicators

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your NYT API key:
   ```
   VITE_NYT_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## API Requirements

This project uses the following New York Times APIs:
- NYT Newswire API (Real-time component)
- NYT Most Popular API (Non-real-time component)
- NYT Article Search API (Historical component)

You can obtain an API key from [The New York Times Developer Portal](https://developer.nytimes.com/).

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
