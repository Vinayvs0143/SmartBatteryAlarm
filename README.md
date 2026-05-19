🔋 Smart Battery Alarm ORG

A smart Android battery monitoring application built using [DroidScript]() that alerts users with a custom audio alarm when the battery reaches a user-defined charging percentage.

This project supports:

🎵 Custom MP3 alarm selection

🔋 Battery percentage monitoring

⚙️ User-defined battery target

🔄 Background monitoring service

🔌 Auto-start when charger is connected

📱 Lightweight Android-native UI



---

📸 Project Preview


---

✨ Features

✅ Core Features

Monitor battery percentage in real-time

Set custom charging target (1–100%)

Select your own MP3 alarm tone

Continuous battery checking every few seconds

Stop alarm button


🚀 Advanced Features

Background battery monitoring service

Auto-launch monitoring when charger is plugged in

Looping alarm sound until stopped

Lightweight and beginner-friendly code structure



---

🛠️ Built With

[DroidScript](https://droidscript.github.io/?utm_source=chatgpt.com)

JavaScript

Android Native APIs

MediaPlayer API



---

📂 Project Structure

BatteryAlarmORG/
│
├── BatteryAlarm.js          # Main UI application
├── BatteryService.js        # Background monitoring service
├── BatteryService.manifest  # Service configuration
└── README.md


---

⚙️ How It Works

1️⃣ User Opens App

The user:

Selects an MP3 file

Sets a battery percentage target


2️⃣ Background Monitoring Starts

The service:

Continuously checks battery percentage

Runs even when the app is minimized


3️⃣ Battery Reaches Target

When the target percentage is reached:

Alarm starts playing

Notification/popup appears

User can stop the alarm manually



---

📦 Installation

Requirements

Android Device

[DroidScript App](https://play.google.com/store/apps/details?id=com.smartphoneremote.androidscriptfree&utm_source=chatgpt.com)


Steps

1. Install DroidScript
2. Create a new project
3. Add all project files
4. Run BatteryAlarm.js


---

🔌 Auto Start on Charging

The project uses:

android.intent.action.ACTION_POWER_CONNECTED

to automatically start monitoring whenever the charger is connected.


---

🧠 Future Improvements

📊 Battery charging graph

🔔 Notification controls

🌙 Dark/Light theme switch

⏱ Charging time estimation

🔥 Temperature monitoring

📱 APK export support

📈 Battery health analytics

☁ Cloud backup for settings



---

📸 Screenshots Ideas

You can add screenshots here later:

![Home Screen](screenshots/home.png)
![Target Selection](screenshots/target.png)
![Alarm Triggered](screenshots/alarm.png)


---

🚀 Possible Use Cases

Prevent overcharging

Monitor overnight charging

Battery care and maintenance

Custom charging notifications

Smart charging assistant



---

🤝 Contributing

Contributions are welcome!

You can:

Improve UI/UX

Optimize battery monitoring

Add notifications

Add Material Design support

Improve background service reliability



---

📜 License

This project is licensed under the MIT License.


---

👨‍💻 Author

Vinay
Student Developer | Android & DroidScript Enthusiast


---

⭐ Support

If you like this project:

⭐ Star the repository

🍴 Fork the project

🛠 Contribute improvements



---

🔥 Project Vision

Battery Alarm ORG aims to become a lightweight smart charging assistant that helps users maintain healthier charging habits and extend battery lifespan using simple automation and Android-native capabilities.
