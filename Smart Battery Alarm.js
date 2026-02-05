// =====================================================
// GLOBAL VARIABLES
// =====================================================
var mainLayout, settingsLayout, loginLayout;
var splashLayout, tipsLayout, aboutLayout, webView;

var sysTarget      = 85;
var isMonitoring   = false;
var isDarkMode     = true;
var currentUser    = "";
var svcNotification = null;

// =====================================================
// AUDIO VARIABLES
// =====================================================
var alarmType       = "TTS";
var customAudioPath = "";
var audioPlayer     = null;

// =====================================================
// 1. APP STARTUP
// =====================================================
function OnStart()
{
    app.SetOrientation("Portrait");
    app.PreventScreenLock(true);

    // Load saved settings
    currentUser     = app.LoadText("username", "");
    customAudioPath = app.LoadText("audioPath", "");
    alarmType       = app.LoadText("alarmType", "TTS");

    // Create Screens
    CreateSplash();
    CreateLogin();
    CreateMainScreen();
    CreateSettingsScreen();
    CreateTipsScreen();
    CreateAboutScreen();

    // Show splash screen
    app.AddLayout(splashLayout);

    setTimeout(function () {
        splashLayout.Animate("FadeOut", function () {
            app.RemoveLayout(splashLayout);

            if (currentUser == "")
                app.AddLayout(loginLayout);
            else
                app.AddLayout(mainLayout);
        });
    }, 3000);

    // Background battery check
    setInterval(GlobalBatteryCheck, 3000);
}

// =====================================================
// 2. SPLASH SCREEN
// =====================================================
function CreateSplash()
{
    splashLayout = app.CreateLayout("Linear", "FillXY,VCenter");
    splashLayout.SetBackColor("#0f172a");

    var t = app.CreateText(
        "⚡\nSMART BATTERY ALARM",
        0.8,
        -1,
        "Bold,Multiline"
    );

    t.SetTextSize(30);
    t.SetTextColor("#10b981");
    splashLayout.AddChild(t);
}

// =====================================================
// 3. LOGIN SCREEN
// =====================================================
function CreateLogin()
{
    loginLayout = app.CreateLayout("Linear", "FillXY,VCenter");
    loginLayout.SetBackColor("#0f172a");

    var card = app.CreateLayout("Linear", "VCenter,FillX");
    card.SetSize(0.85, 0.4);
    card.SetBackColor("#1e293b");
    card.SetPadding(0.05, 0.05, 0.05, 0.05);

    if (card.SetCornerRadius)
        card.SetCornerRadius(20);

    var title = app.CreateText("WELCOME USER", 0.8, -1, "Bold");
    title.SetTextColor("#10b981");
    title.SetTextSize(22);
    title.SetMargins(0, 0, 0, 0.05);
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

    btnLogin.SetOnTouch(function () {
        var name = edtUser.GetText();

        if (name.length < 2) {
            app.ShowPopup("Enter a valid name");
            return;
        }

        app.SaveText("username", name);
        currentUser = name;

        app.ShowPopup("Account Created!");
        loginLayout.Animate("SlideToLeft");
        app.AddLayout(mainLayout);
    });

    card.AddChild(btnLogin);
    loginLayout.AddChild(card);
}

// =====================================================
// 4. MAIN SCREEN (WEBVIEW)
// =====================================================
function CreateMainScreen()
{
    mainLayout = app.CreateLayout("Linear", "FillXY");
    mainLayout.SetBackColor("#0f172a");

    webView = app.CreateWebView(1.0, 1.0);
    webView.SetBackColor("#0f172a");

    mainLayout.AddChild(webView);
    webView.LoadHtml(GetCyberUI());

    webView.SetOnConsole(function (msg) {
        if (msg.startsWith("msg:")) {
            HandleWebAction(
                JSON.parse(msg.substring(4))
            );
        }
    });
}
