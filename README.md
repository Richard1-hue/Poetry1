# Alpha-O

Alpha-O is a browser-based AI assistant and workflow-planning workspace, with GitHub Actions automation for answering newly opened repository issues. The web app provides chat, voice, file attachment, and workflow-building interfaces; workflow execution in Automate is currently simulation-only.

## Project features

### Alpha-O chat app

The main app is `index.html`. Its interface includes:

- Chat conversations with browser-local history, chat search, editing, regenerating, and saving answers
- Assistant modes, suggested prompts, and a command palette
- Streaming AI responses, with connection status and retry handling
- Markdown-formatted answers, code highlighting, and code preview/run controls
- File attachments for images and selected text/code formats, with a 4 MB size limit
- Voice input and spoken responses, with an animated 3D robot interface
- Dark, light, and system themes; configurable voice and notification preferences
- Responsive layouts, keyboard shortcuts, reduced-motion support, and accessibility features
- Service-worker support for caching the app shell and loading the page offline; chat/API requests are not cached

The frontend sends chat requests to a Cloudflare Worker. The settings describe responses as being routed through that Worker to Google Gemini, Groq, or Cloudflare Workers AI. The backend implementation is not included in this repository.

### Automate workspace

Open `automate/automate.html` to use the workflow workspace. It includes:

- A dashboard with workflow and simulated-run summaries
- Workflow creation, editing, duplication, deletion, search, filters, and sorting
- A template library and starter templates
- An Automate AI interface that proposes workflows using local keyword rules; it is not connected to an AI model
- A workflow test engine that simulates triggers, evaluates conditions, and previews actions
- Run reports, logs, and browser-local run history
- Workspace/client, integration, and role/access previews

**Automate does not run real automations.** Its triggers and actions are simulated in the browser. It does not send emails or notifications, modify external services, run schedules, or continue running after the page is closed. Workflows are saved in browser storage by default; the UI also provides an optional Cloudflare workflow-storage connection.

### GitHub issue replies

`.github/workflows/reply.yml` runs when an issue is opened. It sends the issue title and body to Gemini and posts the answer as a comment. The response is intended to be a brief, beginner-friendly technical explanation.

## Repository layout

```text
.
├── index.html                         Main chat app
├── admin.html                         Additional HTML page
├── sw.js                              Service worker for app-shell caching
├── automate/
│   ├── automate.html                  Automate workspace UI
│   ├── automate.css                   Workspace styles
│   ├── automate.js                    Workflow builder and workspace UI logic
│   ├── engine.js                      Simulation-only workflow engine
│   └── alpha-o-logo.png               Automate logo
└── .github/
    ├── ISSUE_TEMPLATE/                Code review, discussion, urgent-risk,
    │                                  and approval issue forms
    └── workflows/
        ├── ci.yml                     Repository validation
        ├── hello.yml                  Push smoke test
        └── reply.yml                  AI response to newly opened issues
```

The repository also includes icons and logo assets. The main app references `manifest.webmanifest`, but that file is not present in the current repository tree.

## Running locally

This is a static HTML/CSS/JavaScript project; it has no package manifest or build step. From the repository root, start a local static server:

```bash
python -m http.server 8000
```

Then open:

- Chat app: <http://localhost:8000/>
- Automate workspace: <http://localhost:8000/automate/automate.html>

The service worker registers on HTTPS or `localhost`. Real chat responses depend on the configured Cloudflare Worker being available. The Worker/backend is external to this repository.

## GitHub Actions setup

To enable issue replies, add a repository Actions secret named `GEMINI_API_KEY`. The workflow uses the built-in `github.token` to post comments and requests `issues: write` permission.

The reply workflow triggers only for newly opened issues. The issue templates in `.github/ISSUE_TEMPLATE/` provide forms for code discussion, code review requests, urgent security/production risks, and approval-before-merge requests.

## CI and validation

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`. It:

- Requires `index.html` and the three main Automate files
- Uses Node.js 20 to syntax-check inline JavaScript in `index.html`
- Runs `htmlhint` on `index.html` and `automate/automate.html`

`hello.yml` is a separate push smoke test that prints a greeting and lists repository files.

## Technology

- HTML, CSS, and vanilla JavaScript
- GitHub Actions and GitHub Issues
- Gemini API for the issue-reply workflow
- Cloudflare Worker endpoint for the browser chat and optional Automate storage connection
- Browser APIs including local storage, service workers, speech recognition, and speech synthesis
- Three.js, loaded from a CDN, for the voice-mode robot

## Current limitations

- The web app’s AI backend is hosted separately and is not included here.
- Automate’s workflow engine is a local simulation, not a production automation service.
- Automate AI proposals use local rules, not a connected language model.
- Workspace, integration, and role/access screens are previews; they do not enforce permissions or connect integrations.
- The app references `manifest.webmanifest`, but it is absent from the current repository tree.
