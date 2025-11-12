#  Dynamic Form Management System

A modular and reusable **React** application built with **Vite**, featuring:
- Dynamic Formik forms with Yup validation
- Multiple input types (text, number, textarea, date, select, multiselect, file upload)
- Role-based authentication
- API integration with Axios + React Query
- Lazy-loaded dropdowns with dependent field support
- Skeleton loading states for form fields

##  Tech Stack

- [Vite](https://vitejs.dev/) – Fast build tool and dev server
- [React](https://react.dev/) – UI library
- [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup) – Form handling and validation
- [React Query](https://tanstack.com/query) – API state management
- [Axios](https://axios-http.com/) – HTTP client
- [React Select](https://react-select.com/) – Customizable select components
- [react-loading-skeleton](https://github.com/dvtng/react-loading-skeleton) – Loading skeletons

##  Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/your-project.git
cd your-project
pnpm install
```

*(or use `yarn install` / `ppnpm install`)*

##  Development

Start the local development server:

```bash
pnpm dev
```

The app will run at:

```
http://localhost:5173
```

##  Production Build

Create a production-ready build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

##  Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── forms/         # Dynamic Formik form components
│   └── tables/        # Reusable table components
├── contexts/          # Global state (AuthContext, etc.)
├── hooks/             # Custom hooks (useApiQuery, useApiMutation)
├── pages/             # Page-level components
├── services/          # API client & interceptors
├── utils/             # Helper functions
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

##  Available Scripts

| Command            | Description                               |
|--------------------|-------------------------------------------|
| `pnpm dev`      | Start development server                  |
| `pnpm build`    | Build for production                      |
| `pnpm preview`  | Preview production build locally          |
| `pnpm lint`     | Run ESLint (if configured)                |

##  Environment Variables

Create a `.env` file in the root with:

```env
VITE_API_BASE_URL=https://your-api.com
VITE_AUTH_TOKEN_KEY=your-token-key
```

##  Features

- **Dynamic Forms**
  - Supports all field types
  - Validation rules from `isMandatory` flag
  - Dependent dropdown logic
  - File uploads handled as FormData

- **Authentication**
  - Role-based routing
  - Token-based Axios requests with interceptors

- **Performance**
  - Code splitting via Vite
  - Lazy-loading for dropdown APIs
  - Skeleton UI placeholders during loading

##  License

This project is licensed under the [MIT License](LICENSE).
