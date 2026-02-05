// --- 8. UI HTML (Formatted & Copy Protected) ---
function GetCyberUI()
{
    return `
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
        
        <style>
            /* --- 1. CORE VARIABLES --- */
            :root { 
                --bg: #0f172a; 
                --card: #1e293b; 
                --text: #ffffff; 
                --accent: #10b981; 
            }
            
            [data-theme="light"] { 
                --bg: #f8fafc; 
                --card: #ffffff; 
                --text: #1e293b; 
                --accent: #059669; 
            }

            /* --- 2. GLOBAL STYLES & COPY PROTECTION --- */
            * {
                -webkit-user-select: none;   /* Chrome/Android: Disable text selection */
                user-select: none;           /* Standard: Disable text selection */
                -webkit-touch-callout: none; /* Disable long-press context menu */
            }

            body { 
                background: var(--bg); 
                color: var(--text); 
                font-family: 'Roboto', sans-serif; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: space-between; 
                height: 100vh; 
                margin: 0; 
                padding: 20px; 
                box-sizing: border-box; 
                transition: background 0.3s, color 0.3s;
            }

            /* Allow typing in inputs even if selection is disabled elsewhere */
            input { 
                -webkit-user-select: text; 
                user-select: text; 
            }

            /* Prevent dragging images */
            img { 
                pointer-events: none; 
            }

            /* --- 3. HEADER --- */
            .header { 
                color: var(--accent); 
                font-family: 'Orbitron', sans-serif; 
                font-weight: bold; 
                font-size: 18px;
                width: 100%; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
            }

            .settings-btn {
                cursor: pointer;
                padding: 5px;
            }

            /* --- 4. GAUGE (CIRCLE) --- */
            .gauge { 
                width: 220px; 
                height: 220px; 
                border-radius: 50%; 
                background: var(--card); 
                border: 4px solid #334155; 
                position: relative; 
                overflow: hidden; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                box-shadow: 0 0 20px rgba(16,185,129,0.2); 
            }

            .liquid { 
                position: absolute; 
                bottom: 0; 
                width: 100%; 
                height: 0%; 
                background: var(--accent); 
                opacity: 0.8; 
                transition: height 0.5s ease-in-out; 
                box-shadow: 0 0 20px var(--accent); 
            }

            .text { 
                z-index: 10; 
                font-size: 50px; 
                font-family: 'Orbitron', sans-serif; 
                font-weight: bold; 
                text-shadow: 0 2px 5px rgba(0,0,0,0.5); 
            }

            .status { 
                position: absolute; 
                bottom: 50px; 
                z-index: 10; 
                font-size: 14px; 
                opacity: 0.8; 
                letter-spacing: 1px; 
                font-weight: 500;
            }

            /* --- 5. CONTROLS --- */
            .ctrl { 
                width: 100%; 
                background: var(--card); 
                padding: 20px; 
                border-radius: 15px; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
            }

            .ctrl-header {
                display: flex; 
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }

            input[type=range] { 
                width: 100%; 
                margin: 15px 0; 
                -webkit-appearance: none; 
                background: #334155; 
                height: 6px; 
                border-radius: 5px; 
            }

            input[type=range]::-webkit-slider-thumb { 
                -webkit-appearance: none; 
                width: 25px; 
                height: 25px; 
                background: var(--accent); 
                border-radius: 50%; 
                cursor: pointer; 
                box-shadow: 0 0 5px rgba(0,0,0,0.3);
            }

            button { 
                width: 100%; 
                padding: 15px; 
                border: none; 
                border-radius: 10px; 
                font-weight: bold; 
                margin-top: 10px; 
                font-family: 'Orbitron', sans-serif; 
                cursor: pointer; 
                font-size: 16px;
                transition: transform 0.1s;
            }
            
            button:active {
                transform: scale(0.98);
            }

            .start { 
                background: var(--accent); 
                color: white; 
            }
            
            .stop { 
                background: #ef4444; 
                color: white; 
                display: none; 
            }

            /* Toggle Buttons based on Active State */
            .active .start { display: none; } 
            .active .stop { display: block; }

        </style>
    </head>
    
    <body data-theme="dark">
        <div class="header">
            CYBER GUARDIAN 
            <span class="settings-btn" onclick="send('openSettings')">⚙️</span>
        </div>

        <div class="gauge">
            <div class="liquid" id="liq"></div>
            <div class="text" id="lvl">--%</div>
            <div class="status" id="stat">WAITING</div>
        </div>

        <div class="ctrl">
            <div class="ctrl-header">
                <span>Alert Threshold</span>
                <span style="color:var(--accent); font-weight:bold" id="tgt">85%</span>
            </div>
            
            <input type="range" min="15" max="100" value="85" oninput="updT(this.value)">
            
            <button class="start" onclick="tog(true)">ACTIVATE GUARD</button>
            <button class="stop" onclick="tog(false)">DEACTIVATE</button>
        </div>

        <script>
            // 1. Disable Context Menu (Right Click / Long Press)
            document.addEventListener('contextmenu', event => event.preventDefault());

            var t = 85; 

            // Send data back to DroidScript
            function send(action) {
                console.log("msg:" + JSON.stringify({ action: action, target: t }));
            }

            // Change Theme Color
            function setTheme(mode) {
                document.body.setAttribute('data-theme', mode);
            }

            // Update Slider Text
            function updT(val) {
                t = val; 
                document.getElementById('tgt').innerText = val + "%";
            }

            // Toggle Monitoring State
            function tog(state) {
                if(state) {
                    document.body.classList.add('active');
                    send('start');
                } else {
                    document.body.classList.remove('active');
                    send('stop');
                }
            }

            // Update Dashboard Data (Called by DroidScript)
            function updateDashboard(level, isCharging) {
                document.getElementById('lvl').innerText = Math.floor(level) + "%"; 
                document.getElementById('liq').style.height = level + "%"; 
                
                if(isCharging) {
                    document.getElementById('stat').innerText = "CHARGING ⚡"; 
                } else {
                    document.getElementById('stat').innerText = "DISCHARGING";
                }
            }
        </script>
    </body>
    </html>
    `;
}

