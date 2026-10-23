# ARES — Above the Red Planet

A complete, standalone browser 3D flight game. Pilot the AE–01 Kestrel exploration spacecraft above an endless procedurally generated Mars. No account, API keys, asset downloads, npm installation or build step is required to play the GitHub Pages version.

## Play on GitHub Pages

1. Unzip `ARES_Mars_Flight_GitHub.zip` on your computer.
2. Create a GitHub repository and upload **all the extracted files and the `vendor` folder**. `index.html` must be directly in the repository root. Upload the contents of the ZIP, not the ZIP itself or its containing folder.
3. In the repository, open **Settings → Pages**.
4. Set **Source → Deploy from a branch**, choose **main** and **/(root)**, then **Save**.
5. Once publishing completes, use **Visit site** in that same Pages screen. Open that HTTPS address on your desktop or phone.

The official GitHub guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

This package contains a `.nojekyll` file. If your file picker hides it, the game still works with GitHub's normal static handling. Keep `vendor/three.module.js` alongside the other files in its folder. All file references are relative, so project subdirectories work.

## Modes

**Free Flight** starts airborne with unlimited fuel. There is no timer limit, map edge, or automatic mission end. Follow the horizon for as long as you like, visit the spaceport, land and take off again. Terrain chunks are generated ahead and old chunks are disposed of.

**Flight Training** starts on Runway 36 at Elysium Spaceport. Accelerate, rotate, fly through four amber navigation rings and land on the runway. Stop with the wheel brake to complete the mission. The report shows flight time, distance and maximum altitude. You can continue into free flight after success.

## Keyboard

| Control | Action |
| --- | --- |
| W / S | Pitch nose down / up |
| A / D | Roll left / right |
| Q / E | Yaw left / right; ground steering |
| Shift / Ctrl | Increase / decrease throttle |
| Space | Wheel brake on the ground; airbrake in flight |
| C | Cycle normal, wide and cinematic chase cameras |
| Mouse drag on the scene | Look around the aircraft; release to recenter |
| F | Toggle flight assist |
| H | Toggle controls/help panel |
| P / Escape | Pause / resume |
| R | Restart current flight |

## First takeoff

Hold **Shift** until thrust reaches 100%. Keep the ship on the runway centreline. Above **120 km/h**, hold **S** briefly to raise the nose. Release near 15–20 degrees of pitch; don't hold S continuously unless you want a steep climb. A gentle A/D bank turns the ship; Q/E makes smaller heading corrections. Flight assist damps roll when the controls are released, while preserving momentum.

## Returning to land

1. Use the radar to find Elysium. The peach line marks the north–south runway and a peach dot at the edge points toward base when it is beyond radar range. North is always up.
2. After the final ring, give yourself room to turn and line up. You can fly an extra circuit before landing; there is no time limit. The beam above the spaceport helps identify the field.
3. Line up on **heading 000 or 180** with the runway centreline. The runway runs from -900 to +900 metres on the north–south axis.
4. Set roughly **15–25% thrust**, reduce speed to **100–180 km/h**, and make a shallow descent. Tap W to lower the nose, S to arrest your descent. Use Space as an airbrake if needed.
5. Cross the threshold with wings level and a descent under **5 m/s**. Set thrust to zero after touchdown and hold **Space** until stopped.

Touchdowns outside the prepared runway, hard impacts, excessive bank, poor alignment, excessive landing speed and spaceport structure collisions end the flight. Gear deploys automatically near the ground. This is an accessible sci-fi flight model with powered lift and Martian gravity, rather than an aerospace engineering simulation.

## Phone and tablet

Rotate to landscape for the largest view. Touch controls appear automatically on touch devices:

- Left virtual stick: move left/right to roll. Pull down for nose up, push up for nose down.
- Q/E buttons: yaw and ground steering.
- Right slider: thrust.
- BRAKE: hold to brake.
- GYRO: enable motion steering; the screen position when the first sensor sample arrives becomes neutral.
- Open **? → RECENTER GYRO** after changing your grip. Screen rotation also resets neutral.
- The square-corners button requests fullscreen when the browser supports it.

Gyro needs a phone with orientation sensors, browser motion permission and **HTTPS**. Tap GYRO directly and allow the permission if asked. Keep the phone still for initial calibration. Tilt side-to-side to roll and forward/backward to pitch. Keyboard and touch controls remain available. If the browser reports no sensor data or denies permission, use the stick. Gyro is off by default and does not send motion data anywhere.

Official motion API reference: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static

On a desktop, **? → SHOW / HIDE TOUCH CONTROLS** lets you show the same controls with a mouse. **? → Graphics** switches between Adaptive, High and Performance. Adaptive starts with a capped pixel ratio and reduces rendering cost if the initial measured frame rate is low. High uses dynamic shadows; Performance disables them.

## Run locally

Do not double-click `index.html`: JavaScript modules need an HTTP server.

With Python installed, open a terminal in the extracted folder:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. For phone gyro, use the HTTPS GitHub Pages address instead of an unsecured LAN URL. The game needs WebGL 2 and browser hardware acceleration.

## Source layout

- `index.html`: game screens and HUD.
- `style.css`: responsive desktop, portrait and landscape interface.
- `game.js`: game flow, input, touch/gyro, audio, camera and instruments.
- `physics.js`: deterministic flight dynamics and mission logic.
- `world.js`: terrain, procedural sky, runway, terminal, lights and scenery.
- `ship.js`: original procedural spacecraft model.
- `geometry.js`: merges static geometry to reduce graphics draw calls on phones.
- `vendor/three.module.js`: bundled Three.js r170; no CDN dependency.
- `tests/`: Node simulation and scene-construction tests.

The original source checkout uses `dist/` for the game files. In this download the playable files are flattened into the root for direct GitHub Pages upload; the tests are adjusted accordingly.

To run the included tests with Node.js:

```sh
node --test tests/*.test.mjs
```

## Verification and limits

Fourteen automated checks pass: runway takeoff, correct A/D roll and turn direction, pitch/yaw, inertia, braking, safe landing, hard/terrain impact, mission progression, two simulated hours of free flight, portrait/landscape gyro mapping, scene construction, beacon terrain clearance, a four-beacon flight over the actual terrain and a continuous runway approach to a stopped landing.

Live 3D rendering and browser gameplay could not be visually verified in the development preview because that browser reported WebGL as disabled. Actual phone gyro hardware was unavailable. The full source, local dependency and test suite are included so the project can be run and adjusted on your own device. This is a complete procedural prototype; it uses original geometry and shaders rather than photogrammetry or commercial game assets.

## Licenses

Original game code and procedural artwork: MIT (see `LICENSE`). Three.js: MIT (see `vendor/THREE-LICENSE.txt`). No external fonts, tracking, network services, accounts or paid assets are used. Engine audio is synthesised locally and is muted until you enable it.
