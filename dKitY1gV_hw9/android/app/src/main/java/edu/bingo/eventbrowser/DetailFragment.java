package edu.bingo.eventbrowser;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.viewpager2.widget.ViewPager2;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import com.google.gson.Gson;

import org.json.JSONObject;

import java.net.URLEncoder;

import edu.bingo.eventbrowser.databinding.FragmentDetailBinding;

public class DetailFragment extends Fragment {

    private FragmentDetailBinding binding;

    private SharedPreferences localStorage;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        super.onCreateView(inflater, container, savedInstanceState);
        this.binding = FragmentDetailBinding.inflate(inflater, container, false);
        this.localStorage = this.getContext().getSharedPreferences("localStorage", Context.MODE_PRIVATE);
        return this.binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        Bundle extras = this.getActivity().getIntent().getExtras();
        String eventId = extras.getString("eventId");
        String eventName = extras.getString("eventName");
        String eventImageUrl = extras.getString("eventImageUrl");
        DetailViewModel detailViewModel = new ViewModelProvider(getActivity()).get(DetailViewModel.class);

        // tab layout
        TabLayout tabLayout = this.binding.tablayoutDetail;
        TabLayout.Tab detailTab = tabLayout.newTab();
        detailTab.setText("DETAILS");
        detailTab.setIcon(R.drawable.ic_event_tab);
        tabLayout.addTab(detailTab, 0);
        TabLayout.Tab artistTab = tabLayout.newTab();
        artistTab.setText("ARTIST(S)");
        artistTab.setIcon(R.drawable.ic_artist_tab);
        tabLayout.addTab(artistTab, 1);
        TabLayout.Tab venueTab = tabLayout.newTab();
        venueTab.setText("VENUE");
        venueTab.setIcon(R.drawable.ic_venue_tab);
        tabLayout.addTab(venueTab, 2);
        // viewpager
        ViewPager2 viewPager = this.binding.viewpager2;
        viewPager.setAdapter(new DetailViewPagerAdapter(this, 3));
        // link viewpager to tab layout
        new TabLayoutMediator(
                tabLayout,
                viewPager,
                (tab, position) -> {
                    if (position == 0) {
                        tab.setText("DETAILS"); tab.setIcon(R.drawable.ic_event_tab);
                    } else if (position == 1) {
                        tab.setText("ARTIST(S)"); tab.setIcon(R.drawable.ic_artist_tab);
                    } else {
                        tab.setText("VENUE"); tab.setIcon(R.drawable.ic_venue_tab);
                    }
                }
        ).attach();

        // back button
        this.binding.detailBackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                DetailFragment.this.getActivity().onBackPressed();
            }
        });

        // title
        this.binding.eventTitle.setText(eventName);
        this.binding.eventTitle.setSelected(true);
        // favorite button icon
        if (this.localStorage.contains(eventId)) {
            this.binding.favoriteButton.setImageResource(R.mipmap.liked_icon_foreground);
        }

        // make request to retrieve event detail
        String url = "https://eventfinder-android.wl.r.appspot.com/api/event/" + eventId;
        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            // pass data to view model
                            detailViewModel.setData(response);
                            // facebook button
                            DetailFragment.this.binding.facebookButton.setOnClickListener(new View.OnClickListener() {
                                @Override
                                public void onClick(View v) {
                                    try {
                                        // https://www.tutorialkart.com/kotlin-android/android-open-url-in-browser-activity/
                                        Intent shareToFacebook = new Intent(Intent.ACTION_VIEW);
                                        shareToFacebook.setData(Uri.parse(
                                        "https://www.facebook.com/sharer.php?u="
                                                + URLEncoder.encode(response.getString("buy"), "UTF-8")
                                                 + "&amp"
                                        ));
                                        startActivity(shareToFacebook);
                                    }
                                    catch (Exception e) {
                                        Log.e("DetailFragment:FacebookButton", e.getMessage());
                                    }
                                }
                            });
                            // twitter button
                            DetailFragment.this.binding.twitterButton.setOnClickListener(new View.OnClickListener() {
                                @Override
                                public void onClick(View v) {
                                    try {
                                        // https://www.tutorialkart.com/kotlin-android/android-open-url-in-browser-activity/
                                        Intent shareToTwitter = new Intent(Intent.ACTION_VIEW);
                                        shareToTwitter.setData(Uri.parse(
                                            "https://twitter.com/intent/tweet?text=Check%20"
                                                    + URLEncoder.encode(response.getString("name"), "UTF-8")
                                                    + "%20on%20Ticketmaster&url="
                                                    + URLEncoder.encode(response.getString("buy"), "UTF-8")
                                        ));
                                        startActivity(shareToTwitter);
                                    }
                                    catch (Exception e) {
                                        Log.e("DetailFragment:FacebookButton", e.getMessage());
                                    }
                                }
                            });
                            // favorite button
                            DetailFragment.this.binding.favoriteButton.setOnClickListener(new View.OnClickListener() {
                                @Override
                                public void onClick(View v) {
                                    Gson gson = new Gson();
                                    try {
                                        SharedPreferences sp = DetailFragment.this.localStorage;
                                        SharedPreferences.Editor editor = sp.edit();
                                        if (sp.contains(eventId)) {
                                            editor.remove(eventId);
                                            DetailFragment.this.binding.favoriteButton.setImageResource(R.mipmap.like_not_icon_foreground);
                                            Snackbar.make(
                                                    DetailFragment.this.getActivity().findViewById(R.id.root_layout2),
                                                    eventName + " removed from favorites",
                                                    Snackbar.LENGTH_SHORT
                                            ).show();
                                        } else {
                                            JSONObject eventInfo = new JSONObject();
                                            eventInfo.put("id", eventId);
                                            eventInfo.put("date", response.getString("date"));
                                            eventInfo.put("time", response.getString("time"));
                                            eventInfo.put("image_url", eventImageUrl);
                                            eventInfo.put("name", response.getString("name"));
                                            eventInfo.put("genre", response.getString("category"));
                                            eventInfo.put("venue", response.getString("venue"));
                                            editor.putString(eventId, gson.toJson(eventInfo, JSONObject.class));
                                            DetailFragment.this.binding.favoriteButton.setImageResource(R.mipmap.liked_icon_foreground);
                                            Snackbar.make(
                                                    DetailFragment.this.getActivity().findViewById(R.id.root_layout2),
                                                    eventName + " added to favorites",
                                                    Snackbar.LENGTH_SHORT
                                            ).show();
                                        }
                                        editor.apply();
                                    }
                                    catch (Exception e) {
                                        Log.e("DetailFragment:FavoriteButton", e.getMessage());
                                    }
                                }
                            });
                        }
                        catch (Exception e) {
                            Log.e("DetailFragment:Volley:onResponse", e.getMessage());
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.e("DetailFragment:Volley:onErrorResponse", error.toString());
                        Snackbar.make(
                                getActivity().findViewById(R.id.root_layout),
                                "Error loading event detail",
                                Snackbar.LENGTH_SHORT
                        ).show();
                    }
                }
        );
        VolleyClient.getInstance(getContext()).addToRequestQueue(request);
    }
}