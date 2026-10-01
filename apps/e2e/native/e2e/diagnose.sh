#!/bin/sh
# Prints what the device shows after a failed run: the Maestro version, the view hierarchy of a
# freshly opened scenario, and the app's JS and crash logs from that launch.
SCENARIO_LINK='ngforge-e2e://test/group-fields/group-initial-values'

maestro --version
adb logcat -c
adb shell am force-stop com.ngforge.e2e
adb shell am start -W -a android.intent.action.VIEW -d "$SCENARIO_LINK" com.ngforge.e2e
sleep 10
maestro hierarchy
adb logcat -d -s ReactNativeJS:V ReactNative:V ReactNativeJNI:V AndroidRuntime:E | tail -n 300
