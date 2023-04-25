package edu.bingo.eventbrowser;

import android.content.Context;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;

// https://google.github.io/volley/requestqueue.html
public class VolleyClient {
    private static VolleyClient instance;
    private RequestQueue requestQueue;
    private static Context context;

    private VolleyClient(Context appContext) {
        context = appContext;
    }

    public static synchronized VolleyClient getInstance(Context appContext) {
        if (instance == null) {
            instance = new VolleyClient(appContext);
        }
        return instance;
    }

    public RequestQueue getRequestQueue() {
        if (this.requestQueue == null) {
            this.requestQueue = Volley.newRequestQueue(context.getApplicationContext());
        }
        return this.requestQueue;
    }

    public <T> void addToRequestQueue(Request<T> request) {
        this.getRequestQueue().add(request);
    }
}
