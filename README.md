# CountMyRep

A simple PWA to log workout repetitions and track progress over time. Supports both bodyweight exercises (pullups, pushups) and weighted exercises (deadlift, bench press, squats, overhead press).

Sets logged on the same day are grouped into a single workout, with day-over-day progress tracking.

## Features

- Log reps and weight per set
- Same-day entries grouped as one workout with multiple sets
- Day-over-day progress percentage (volume for weighted, reps for bodyweight)
- Offline support via service worker
- Installable as a PWA
- Data stored locally in the browser (localStorage)

## Run Locally

You need any static file server. Pick one of the options below:

### Python (built-in)

```bash
cd countmyrep
python3 -m http.server 8000
```

### Node.js (npx)

```bash
cd countmyrep
npx serve .
```

### PHP (built-in)

```bash
cd countmyrep
php -S localhost:8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

> **Note:** Opening `index.html` directly as a file (`file://`) won't register the service worker. Use a local server for full PWA functionality.
