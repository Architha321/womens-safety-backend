package com.shieldsafe.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(
    name = "SmsPlugin",
    permissions = {
        @com.getcapacitor.annotation.Permission(
            alias = "sms",
            strings = { Manifest.permission.SEND_SMS }
        )
    }
)
public class SmsPlugin extends Plugin {

    @com.getcapacitor.PluginMethod
    public void sendSMS(PluginCall call) {

        String phoneNumber = call.getString("phoneNumber");
        String message = call.getString("message");

        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            call.reject("Phone number is required");
            return;
        }

        if (message == null || message.trim().isEmpty()) {
            call.reject("Message is required");
            return;
        }

        if (ContextCompat.checkSelfPermission(
                getContext(),
                Manifest.permission.SEND_SMS
        ) != PackageManager.PERMISSION_GRANTED) {

            requestPermissionForAlias("sms", call, "smsPermissionCallback");
            return;
        }

        sendSMSInternal(call, phoneNumber, message);
    }

    @com.getcapacitor.annotation.PermissionCallback
    private void smsPermissionCallback(PluginCall call) {

        if (ContextCompat.checkSelfPermission(
                getContext(),
                Manifest.permission.SEND_SMS
        ) != PackageManager.PERMISSION_GRANTED) {

            call.reject("SMS permission was denied");
            return;
        }

        String phoneNumber = call.getString("phoneNumber");
        String message = call.getString("message");

        sendSMSInternal(call, phoneNumber, message);
    }

    private void sendSMSInternal(
            PluginCall call,
            String phoneNumber,
            String message
    ) {
        try {
            SmsManager smsManager = SmsManager.getDefault();

            smsManager.sendTextMessage(
                    phoneNumber,
                    null,
                    message,
                    null,
                    null
            );

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("phoneNumber", phoneNumber);

            call.resolve(result);

        } catch (Exception e) {
            call.reject("Failed to send SMS: " + e.getMessage());
        }
    }
}