package com.tasbih.pro;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webview = getBridge().getWebView();
            if (webview != null) {
                webview.clearCache(true);
            }
        } catch (Exception e) {}
    }
}
