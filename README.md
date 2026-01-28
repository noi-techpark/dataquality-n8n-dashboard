# N8N_ODH_Dashboard
This is the repository for the Open Data Hub Dashboard, created using React and n8n workflow.

## Table of Contents
- [Getting started](#getting-started)
- [Build for production](#build-for-production)
- [Information](#information)

## Getting started
These instructions will get you a copy of this repository and prepare it for development of the Dashboard.

### Prerequisites
To build the projects in the repository, the following prerequisites must be met:
- Node.js, at least v18 LTS (recommended)

### Installing
Get a copy of the repository, e.g. by cloning it from its location:
```bash
git clone <repository-url>
cd dashboard
```

Install the dependencies:
```bash
npm install
```

Copy the file `.env.example` to `.env` and adjust the configuration parameters if required.

Start the development server:
```bash
npm run dev
```
On successful start, the Dashboard application can be found at http://localhost:5173 (or the port specified in the console).

## Build for production
Build the production version:
```bash
npm run build
```
The result, found in the `./dist` folder, can be deployed to a web server.

## Information

### Support
For support, please contact NOI Techpark Südtirol - Alto Adige.

### Contributing
Please take a look at the Contributor Guidelines.

### Authors
- NOI Techpark Südtirol - Alto Adige
- A. Abuhassan

### Acknowledgements
- NOI Techpark Südtirol - Alto Adige
