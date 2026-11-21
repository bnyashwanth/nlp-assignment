package ai.linguabridge.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(NllbOfflinePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
