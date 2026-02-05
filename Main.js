// --- GLOBAL VARIABLES ---
var mainLayout, settingsLayout, loginLayout, splashLayout, tipsLayout, aboutLayout, webView;
var sysTarget = 85;
var isMonitoring = false;
var isDarkMode = true;
var currentUser = "";
var svcNotification = null;
// --- AUDIO VARIABLES ---
var alarmType = "TTS";
var customAudioPath = "";
var audioPlayer = null;
// --- 1. APP STARTUP ---
function OnStart()
{
  app.SetOrientation("Portrait");
  app.PreventScreenLock(true);
  // Load saved settings
  currentUser = app.LoadText("username", "");
  customAudioPath = app.LoadText("audioPath", "");
  alarmType = app.LoadText("alarmType", "TTS");
  // Create Screens
  CreateSplash();
  CreateLogin();
  CreateMainScreen();
  CreateSettingsScreen();
  CreateTipsScreen();
  CreateAboutScreen();
  // Show Splash first
  app.AddLayout(splashLayout);
  // Animation: Wait 3 seconds then switch
  setTimeout(function(){
    splashLayout.Animate("FadeOut", function(){
      app.RemoveLayout(splashLayout);
      if(currentUser == "") app.AddLayout(loginLayout);
      else app.AddLayout(mainLayout);
    }
    );
  }
  , 3000);
  // Start Background Loop
  setInterval(GlobalBatteryCheck, 3000);
}
// --- 2. SPLASH SCREEN ---
function CreateSplash()
{
  splashLayout = app.CreateLayout("Linear", "FillXY,VCenter");
  splashLayout.SetBackColor("#0f172a");
  var t = app.CreateText("⚡\nSMART BATTERY ALARM", 0.8, -1, "Bold,Multiline");
  t.SetTextSize(30);
  t.SetTextColor("#10b981");
  splashLayout.AddChild(t);
}
// --- 3. LOGIN SCREEN ---
function CreateLogin()
{
  loginLayout = app.CreateLayout("Linear", "FillXY,VCenter");
  loginLayout.SetBackColor("#0f172a");
  // Using Linear instead of Card to prevent crash on older versions
  var card = app.CreateLayout("Linear", "VCenter,FillX");
  card.SetSize(0.85, 0.4);
  card.SetBackColor("#1e293b");
  card.SetPadding(0.05, 0.05, 0.05, 0.05);
  if( card.SetCornerRadius ) card.SetCornerRadius(20);
  var title = app.CreateText("WELCOME USER", 0.8, -1, "Bold");
  title.SetTextColor("#10b981");
  title.SetTextSize(22);
  title.SetMargins(0,0,0,0.05);
  card.AddChild(title);
  var edtUser = app.CreateTextEdit("", 0.7, -1, "SingleLine,Hint");
  edtUser.SetHint("Enter Username");
  edtUser.SetBackColor("#334155");
  edtUser.SetTextColor("#ffffff");
  card.AddChild(edtUser);
  var btnLogin = app.CreateButton("CREATE ACCOUNT", 0.7, 0.08);
  btnLogin.SetMargins(0, 0.05, 0, 0);
  btnLogin.SetBackColor("#10b981");
  btnLogin.SetTextColor("#ffffff");
  btnLogin.SetOnTouch(function(){
    var name = edtUser.GetText();
    if(name.length < 2) {
      app.ShowPopup("Enter a valid name");
      return;
    }
    app.SaveText("username", name);
    currentUser = name;
    app.ShowPopup("Account Created!");
    loginLayout.Animate("SlideToLeft");
    app.AddLayout(mainLayout);
  }
  );
  card.AddChild(btnLogin);
  loginLayout.AddChild(card);
}
// --- 4. MAIN SCREEN (WEBVIEW) ---
function CreateMainScreen()
{
  mainLayout = app.CreateLayout("Linear", "FillXY");
  mainLayout.SetBackColor("#0f172a");
  webView = app.CreateWebView(1.0, 1.0);
  webView.SetBackColor("#0f172a");
  mainLayout.AddChild(webView);
  webView.LoadHtml( GetCyberUI() );
  webView.SetOnConsole( function(consoleMsg) {
    if(consoleMsg.startsWith("msg:")) {
      var data = JSON.parse(consoleMsg.substring(4));
      HandleWebAction(data);
    }
  }
  );
}
// --- 5. SETTINGS SCREEN ---
function CreateSettingsScreen()
{
  settingsLayout = app.CreateLayout("Linear", "FillXY,VCenter");
  settingsLayout.SetBackColor("#1e293b");
  settingsLayout.SetVisibility("Hide");
  var head = app.CreateText("SETTINGS", 0.8, -1, "Bold");
  head.SetTextSize(24);
  head.SetTextColor("#10b981");
  settingsLayout.AddChild(head);
  // --- Audio Picker ---
  var lblSound = app.CreateText("ALARM CONFIG", 0.8, -1, "Left");
  lblSound.SetTextColor("#aaaaaa");
  lblSound.SetMargins(0,0.05,0,0.01);
  settingsLayout.AddChild(lblSound);
  var spin = app.CreateSpinner("Text-to-Speech (Default),Custom Audio File", 0.7, 0.1);
  spin.SetBackColor("#334155");
  spin.SetTextColor("white");
  spin.SetText(alarmType == "TTS" ? "Text-to-Speech (Default)" : "Custom Audio File");
  spin.SetOnTouch(function(item){
    if(item.includes("Custom")) {
      alarmType = "Custom";
      btnPick.SetVisibility("Show");
      app.ShowPopup("Mode: Audio File");
    }
    else {
      alarmType = "TTS";
      btnPick.SetVisibility("Hide");
      app.ShowPopup("Mode: Robot Voice");
    }
    app.SaveText("alarmType", alarmType);
  }
  );
  settingsLayout.AddChild(spin);
  // Select File Button
  var btnPick = app.CreateButton("📂 SELECT AUDIO FILE", 0.7, 0.08);
  btnPick.SetBackColor("#3b82f6");
  btnPick.SetOnTouch(PickAudioFile);
  settingsLayout.AddChild(btnPick);
  if(alarmType == "TTS") btnPick.SetVisibility("Hide");
  // --- Theme Toggle ---
  var tglTheme = app.CreateToggle("Dark Mode", 0.6, -1);
  tglTheme.SetChecked(true);
  tglTheme.SetMargins(0, 0.05, 0, 0);
  tglTheme.SetOnTouch(function(isChecked){
    isDarkMode = isChecked;
    var themeCmd = isChecked ? "dark" : "light";
    webView.Execute(`setTheme('${
      themeCmd
    }
    ')`);
  }
  );
  settingsLayout.AddChild(tglTheme);
  // --- Menu Buttons ---
  CreateMenuBtn(settingsLayout, "CHARGING TIPS", function(){
    ShowScreen(tipsLayout);
  }
  );
  CreateMenuBtn(settingsLayout, "DEVELOPER INFO", function(){
    ShowScreen(aboutLayout);
  }
  );
  var btnBack = app.CreateButton("BACK TO DASHBOARD", 0.6, 0.08);
  btnBack.SetMargins(0,0.05,0,0);
  btnBack.SetBackColor("#ef4444");
  btnBack.SetOnTouch(function(){
    ShowScreen(mainLayout);
  }
  );
  settingsLayout.AddChild(btnBack);
  app.AddLayout(settingsLayout);
}
function CreateMenuBtn(layout, text, callback) {
  var btn = app.CreateButton(text, 0.7, 0.08);
  btn.SetMargins(0, 0.01, 0, 0);
  btn.SetBackColor("#334155");
  btn.SetOnTouch(callback);
  layout.AddChild(btn);
}
// --- 6. TIPS SCREEN ---
function CreateTipsScreen() {
  tipsLayout = app.CreateLayout("Linear", "FillXY");
  tipsLayout.SetBackColor("#0f172a");
  tipsLayout.SetVisibility("Hide");
  var t = app.CreateText("CHARGING TIPS", 0.8, -1, "Bold");
  t.SetTextColor("#10b981");
  t.SetTextSize(24);
  t.SetMargins(0,0.05,0,0.05);
  tipsLayout.AddChild(t);
  var tips = "1. Avoid charging to 100% constantly.\n\n2. Do not let battery drop below 15%.\n\n3. Remove phone case if hot.\n\n4. Use original cables.";
  var l = app.CreateText(tips, 0.9, -1, "Multiline,Left");
  l.SetTextColor("white");
  tipsLayout.AddChild(l);
  var b = app.CreateButton("BACK", 0.5, 0.08);
  b.SetBackColor("#ef4444");
  b.SetMargins(0,0.1,0,0);
  b.SetOnTouch(function(){
    ShowScreen(settingsLayout);
  }
  );
  tipsLayout.AddChild(b);
  app.AddLayout(tipsLayout);
}
// --- 7. ABOUT SCREEN ---
function CreateAboutScreen() {
  aboutLayout = app.CreateLayout("Linear", "FillXY,VCenter");
  aboutLayout.SetBackColor("#0f172a");
  aboutLayout.SetVisibility("Hide");
  var t = app.CreateText("DEVELOPER", 0.8, -1, "Bold");
  t.SetTextColor("#10b981");
  t.SetTextSize(22);
  aboutLayout.AddChild(t);
  var d = app.CreateText("Built with DroidScript Developed By \n Gummula Vinay\nVersion 2.5", 0.8, -1, "Multiline");
  d.SetTextColor("#aaaaaa");
  d.SetMargins(0,0.02,0,0.05);
  aboutLayout.AddChild(d);
  CreateMenuBtn(aboutLayout, "GitHub / Web", function(){
    app.OpenUrl("https://google.com");
  }
  );
  var b = app.CreateButton("BACK", 0.5, 0.08);
  b.SetBackColor("#ef4444");
  b.SetMargins(0,0.05,0,0);
  b.SetOnTouch(function(){
    ShowScreen(settingsLayout);
  }
  );
  aboutLayout.AddChild(b);
  app.AddLayout(aboutLayout);
}
// --- LOGIC FUNCTIONS ---
function ShowScreen(target) {
  mainLayout.SetVisibility("Hide");
  settingsLayout.SetVisibility("Hide");
  tipsLayout.SetVisibility("Hide");
  aboutLayout.SetVisibility("Hide");
  target.SetVisibility("Show");
  target.Animate("FadeIn");
}
// --- CORRECTED FUNCTION: PickAudioFile ---
function PickAudioFile() {
  // 1. Open picker (Syntax: Message, Type, Callback)
  // using "*/*" to allow ANY file type
  app.ChooseFile("Select Audio", "*/*", function(path) {
    // 2. CRITICAL FIX: Check if path is valid AND not "null" string
    if(path && path != "null") {
      customAudioPath = path;
      app.SaveText("audioPath", path);
      // Safely get filename
      var fileName = "Audio File";
      try {
        fileName = decodeURIComponent(path).split("/").pop();
      }
      catch(e) {
      }
      app.ShowPopup("Audio Saved: " + fileName);
      // 3. Test Play
      if(audioPlayer) audioPlayer.Release();
      audioPlayer = app.CreateMediaPlayer();
      // Only SetFile if we are sure path is valid
      audioPlayer.SetFile(customAudioPath);
      audioPlayer.SetOnReady(function(){
        audioPlayer.Play();
      }
      );
      setTimeout(function(){
        if(audioPlayer) audioPlayer.Stop();
      }
      , 3000);
    }
    else {
      app.ShowPopup("No file selected.");
    }
  }
  );
}
function TriggerAlarm(level) {
  app.ShowPopup("⚡ LIMIT REACHED!");
  app.Vibrate("0,1000,500,1000");
  if(alarmType == "TTS") {
    app.TextToSpeech("Battery limit reached. Unplug now.");
  }
  else if(alarmType == "Custom" && customAudioPath && customAudioPath != "") {
    if(audioPlayer) audioPlayer.Release();
    audioPlayer = app.CreateMediaPlayer();
    audioPlayer.SetFile(customAudioPath);
    audioPlayer.SetOnReady(function(){
      audioPlayer.Play();
    }
    );
  }
  else {
    app.TextToSpeech("Battery full.");
  }
}
function GlobalBatteryCheck()
{
  var level = app.GetBatteryLevel() * 100;
  var chargeType = app.GetChargeType();
  var isCharging = (chargeType != "None");
  if(isCharging && !isMonitoring) {
    isMonitoring = true;
    app.ShowPopup("🔌 Charger Detected! Auto-Starting.");
    webView.Execute("toggle(true)");
  }
  var jsCode = `updateDashboard(${
    level
  }
  , ${
    isCharging
  }
  )`;
  if(mainLayout.GetVisibility() == "Show") webView.Execute(jsCode);
  if(isMonitoring && isCharging && level >= sysTarget) {
    TriggerAlarm(level);
  }
}
function HandleWebAction(d) {
  if(d.action=="start"){
    isMonitoring=true;
    sysTarget=parseInt(d.target);
  }
  else if(d.action=="stop"){
    isMonitoring=false;
  }
  else if(d.action=="openSettings"){
    ShowScreen(settingsLayout);
  }
}
// --- 8. UI HTML ---
function GetCyberUI() {
  return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;
  700&family=Roboto:wght@400;
  500&display=swap" rel="stylesheet">
  <style>
  :root {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #fff;
    --accent: #10b981;
  }
  [data-theme="light"] {
    --bg: #f8fafc;
    --card: #fff;
    --text: #1e293b;
    --accent: #059669;
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
  }
  .header {
    color: var(--accent);
    font-family: 'Orbitron', sans-serif;
    font-weight: bold;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
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
    transition: height 0.5s;
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
  }
  .ctrl {
    width: 100%;
    background: var(--card);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  input {
    width: 100%;
    margin: 15px 0;
    -webkit-appearance: none;
    background: #334155;
    height: 6px;
    border-radius: 5px;
  }
  input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 25px;
    height: 25px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
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
  .active .start {
    display: none;
  }
  .active .stop {
    display: block;
  }
  </style></head><body data-theme="dark">
  <div class="header">SMART BATTERY ALARM<span onclick="send('openSettings')">⚙️</span></div>
  <div class="gauge"><div class="liquid" id="liq"></div><div class="text" id="lvl">--%</div><div class="status" id="stat">WAITING</div></div>
  <div class="ctrl">
  <div style="display:flex;
  justify-content:space-between"><span>Alert Threshold</span><span style="color:var(--accent);
  font-weight:bold" id="tgt">85%</span></div>
  <input type="range" min="15" max="100" value="85" oninput="updT(this.value)">
  <button class="start" onclick="tog(true)">ACTIVATE ALARM</button><button class="stop" onclick="tog(false)">DEACTIVATE</button>
  </div>
  <script>
  var t=85;
  function send(a){
    console.log("msg:"+JSON.stringify({
      action:a,target:t
    }
    ));
  }
  function setTheme(m){
    document.body.setAttribute('data-theme',m);
  }
  function updT(v){
    t=v;
    document.getElementById('tgt').innerText=v+"%";
  }
  function tog(s){
    if(s){
      document.body.classList.add('active');
      send('start');
    }
    else{
      document.body.classList.remove('active');
      send('stop');
    }
  }
  function updateDashboard(l,c){
    document.getElementById('lvl').innerText=Math.floor(l)+"%";
    document.getElementById('liq').style.height=l+"%";
    if(c) document.getElementById('stat').innerText="CHARGING ⚡";
    else document.getElementById('stat').innerText="DISCHARGING";
  }
  </script></body></html>`;
    }

