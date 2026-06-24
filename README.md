# 🏡 Baytology Frontend

Welcome to the **Baytology Frontend** repository! This is an elegant, robust, and modern web application built with **Angular** to provide a seamless real estate experience.

## 🚀 Tech Stack

- **Framework:** Angular 21
- **Styling:** Tailwind CSS & Vanilla CSS
- **Real-Time:** Microsoft SignalR
- **Maps:** Leaflet & `@types/leaflet`
- **Internationalization:** `@ngx-translate` (i18n support)
- **Forms & Inputs:** `ngx-intl-tel-input`, `google-libphonenumber`

## ✨ Features

- **Property Listings:** View and manage properties dynamically.
- **Bookings Management:** Detailed booking flows and components.
- **Real-Time Updates:** Live data integration with SignalR.
- **Localization:** Multi-language support (AR/EN).
- **Interactive Maps:** Embedded maps for property locations using Leaflet.
- **Responsive Design:** Optimized for all screen sizes using modern CSS techniques and Tailwind.

## 🛠️ Development Server

To start the local development server, run:

```bash
npm install
npm run start
# or ng serve
```

Once the server is running, navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🏗️ Build

To build the project for production, run:

```bash
npm run build
# or ng build
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

To run the unit tests with [Vitest](https://vitest.dev/), use:

```bash
npm run test
# or ng test
```

## 📂 Project Structure

```
src/
├── app/
│   ├── core/         # Core singletons, interceptors, models, services
│   ├── features/     # Feature modules (bookings, properties, profile, auth, etc.)
│   ├── shared/       # Shared UI components (navbar, footer, cards), directives, pipes
│   └── app.ts        # Main application component
```

## 🤝 Contributing

1. Clone the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
*Built with ❤️ by the Baytology Team*
