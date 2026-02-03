import androidhelper
import time
import os
import re

def smart_battery_guardian():
    droid = androidhelper.Android()
    
    # FIX 1: Save log to the same folder as the script (No Permission Error)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_path = os.path.join(script_dir, "battery_log.csv")
    
    print("--- SMART BATTERY GUARDIAN v2.2 ---")
    print(f"Log path: {log_path}")
    droid.makeToast("System Initializing...")

    # --- Connection Check Function ---
    def wait_for_charger():
        droid.batteryStartMonitoring()
        time.sleep(1)
        
        is_waiting_message_said = False
        
        while True:
            # Get Status (some phones return string, so we force int)
            try:
                status = int(droid.batteryGetStatus().result)
            except:
                status = 1 # unknown default
            
            if status == 2: # Charging
                print(">> Charger Connected. Starting System.")
                droid.ttsSpeak("Charger connected. System active.")
                return 
            elif status == 5: # Full
                 print(">> Battery is already full.")
                 droid.ttsSpeak("Battery is already full.")
                 return
            else:
                if not is_waiting_message_said:
                    print(">> Waiting for charger...")
                    droid.ttsSpeak("Please connect charger.")
                    is_waiting_message_said = True
                time.sleep(3)

    wait_for_charger()

    # --- Target Setup ---
    droid.ttsSpeak("Target percentage?")
    time.sleep(1)
    target_percent = 90
    try:
        voice_result = droid.recognizeSpeech("Say a number (e.g., 90)").result
        if voice_result:
            numbers = re.findall(r'\d+', voice_result)
            if numbers:
                target_percent = int(numbers[0])
                droid.ttsSpeak(f"Target set to {target_percent}.")
    except:
        pass

    print(f"Target: {target_percent}%")
    print(">> Monitoring started...")

    # --- Main Loop ---
    running = True
    while running:
        try:
            # FIX 2: Force 'level' to be a Number (Float)
            # This handles "73.0" (String) turning into 73.0 (Number)
            raw_level = droid.batteryGetLevel().result
            level = float(raw_level) 
            
            status = int(droid.batteryGetStatus().result)
            
            # Check if unplugged
            if status != 2 and status != 5:
                print("!! Charger Disconnected !!")
                droid.ttsSpeak("Charger disconnected. Paused.")
                wait_for_charger()
            
            print(f"Level: {level}% | Status: Charging")

            # Logging
            if not os.path.exists(log_path):
                with open(log_path, "w") as f:
                    f.write("Time,Level,Status\n")
            
            with open(log_path, "a") as f:
                f.write(f"{time.strftime('%H:%M:%S')},{level},{status}\n")

            # Alarm Check (Now comparing Number vs Number)
            if level >= target_percent:
                droid.makeToast("BATTERY FULL")
                while True: 
                    droid.vibrate(1000)
                    droid.ttsSpeak(f"Battery at {int(level)} percent. Unplug now.")
                    
                    curr_status = int(droid.batteryGetStatus().result)
                    if curr_status != 2: # Unplugged
                        droid.ttsSpeak("System shutting down.")
                        running = False
                        break
                    time.sleep(4)
            
            time.sleep(10)

        except Exception as e:
            print(f"Error: {e}")
            # Keep trying instead of crashing
            time.sleep(5)

    droid.batteryStopMonitoring()

if __name__ == "__main__":
    smart_battery_guardian()
