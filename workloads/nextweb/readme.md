# Getting Started

This file is for getting setup with NextJS and PNPM.

## Traditional Build And Run

- First, we cloned a Next project for the files
- Then we do `corepack enable` and `corepack use pnpm@latest-11` (this pins the version of pnpm into package.json)
  - the use part is not required from next time, just doing `pnpm i` will start downloading pnpm
  - it may try to use default registry so set the `COREPACK_NPM_REGISTRY` to internal-mirror as in env-variables
- Then we can do `pnpm install` which will install dependencies (may need to increase pnpm timeout by `pnpm config set fetch-retry-maxtimeout 600000`)
  - if we aren't cloning a project, we will need to generate the project
- Then doing `pnpm dev` to start the dev server for localhost testing
  - we can use `pnpm build && pnpm start` to build an optimized build and start it on localhost
- Access it on `http://localhost:3000`

### Motivations

- PNPM helps in maintaining singular copies of dependencies (like maven does) instead of maintaining copies of it across all projects, thereby speeding up dependency installations
- Husky simplifies managing Git hooks in the development workflow
  - we do linting (ESLINT & Prettier) pre-commit and typescript type-checking pre-push

### NextJs Development

- Directory structure defines how pages are visible
- AppRouter is used by default
- We need to create a `layout.tsx` which takes a `children` prop
  - this is for all common things like headers and footers
- Then we create a `page.tsx` which gets injected into the `children` prop automatically
  - this is to expose a single route at `/`
- We can create `src/components` for common common components and `route/_components` for specific ones
  - each component is a direct `.tsx` file and a corresponding `.module.css` file for custom CSS if required
- Javascript event listeners can only be used in client components so do `use client` on top as default is server component

---

## Kubernetes Build and Run

### Dockerfile

- First, for docker deployment, the next.config file should have `output: 'standalone'` as this optimizes the image size
- Then we create the `.dockerignore` and `Dockerfile` as shown
- Then we build the image with `docker build -t k8s-dck-nextweb:0.0.1 ./workloads/nextweb`
- Then we run the image using `docker run -d -p 3000:3000 --name kdnw k8s-dck-nextweb:0.0.1`
- Now, the app will be again accessible on `http://localhost:3000/k8s-nextweb`
- Currently, this only works outside of VPN, but the initial image comes from artifactory [CAVEAT]
