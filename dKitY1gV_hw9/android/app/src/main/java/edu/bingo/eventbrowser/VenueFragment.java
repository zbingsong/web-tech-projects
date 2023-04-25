package edu.bingo.eventbrowser;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModelProvider;

import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.material.snackbar.Snackbar;

import org.json.JSONObject;

import edu.bingo.eventbrowser.databinding.FragmentVenueBinding;

public class VenueFragment extends Fragment implements OnMapReadyCallback {

    private FragmentVenueBinding binding;
    private final MutableLiveData<JSONObject> location;
    private GoogleMap googleMap;

    public VenueFragment() {
        this.location = new MutableLiveData<>();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        this.binding = FragmentVenueBinding.inflate(inflater, container, false);
        return this.binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        DetailViewModel detailViewModel = new ViewModelProvider(this.getActivity()).get(DetailViewModel.class);

        MapView mapView = this.binding.mapView;
        mapView.onCreate(savedInstanceState);
        mapView.onResume();
        mapView.getMapAsync(this);

        detailViewModel.getData().observe(getViewLifecycleOwner(), eventDetailData -> {
            try {
                String venueId = eventDetailData.getString("venue_id");
                JsonObjectRequest request = new JsonObjectRequest(
                        Request.Method.GET,
                        "https://eventfinder-android.wl.r.appspot.com/api/venue/" + venueId,
                        null,
                        new Response.Listener<JSONObject>() {
                            @Override
                            public void onResponse(JSONObject response) {
//                                Log.d("VenueFragment:onViewCreated", response.toString());
                                FragmentVenueBinding binding1 = VenueFragment.this.binding;
                                try {
                                    VenueFragment.this.location.setValue(response.getJSONObject("location"));
                                    binding1.venueName.setText(response.getString("name"));
                                    binding1.venueName.setSelected(true);
                                    binding1.venueAddress.setText(response.getString("address"));
                                    binding1.venueAddress.setSelected(true);
                                    binding1.venueCity.setText(response.getString("city_state"));
                                    binding1.venueCity.setSelected(true);
                                    binding1.venueContact.setText(response.getString("phone"));
                                    TextView openHours = binding1.venueOpenHours;
                                    openHours.setText(response.getString("open_hours"));
                                    openHours.setOnClickListener(new View.OnClickListener() {
                                        @Override
                                        public void onClick(View v) {
                                            if (openHours.getEllipsize() == null) {
                                                openHours.setMaxLines(3);
                                                openHours.setEllipsize(TextUtils.TruncateAt.END);
                                            } else {
                                                openHours.setMaxLines(Integer.MAX_VALUE);
                                                openHours.setEllipsize(null);
                                            }
                                        }
                                    });
                                    TextView generalRules = binding1.venueGeneralRules;
                                    generalRules.setText(response.getString("gen_rule"));
                                    generalRules.setOnClickListener(new View.OnClickListener() {
                                        @Override
                                        public void onClick(View v) {
                                            if (generalRules.getEllipsize() == null) {
                                                generalRules.setMaxLines(3);
                                                generalRules.setEllipsize(TextUtils.TruncateAt.END);
                                            } else {
                                                generalRules.setMaxLines(Integer.MAX_VALUE);
                                                generalRules.setEllipsize(null);
                                            }
                                        }
                                    });
                                    TextView childRules = binding1.venueChildRules;
                                    childRules.setText(response.getString("child_rule"));
                                    childRules.setOnClickListener(new View.OnClickListener() {
                                        @Override
                                        public void onClick(View v) {
                                            if (childRules.getEllipsize() == null) {
                                                childRules.setMaxLines(3);
                                                childRules.setEllipsize(TextUtils.TruncateAt.END);
                                            } else {
                                                childRules.setMaxLines(Integer.MAX_VALUE);
                                                childRules.setEllipsize(null);
                                            }
                                        }
                                    });
                                }
                                catch (Exception e) {
                                    Log.e("VenueFragment:Volley:onResponse", e.getMessage());
                                }
                            }
                        },
                        new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                Log.e("VenueFragment:Volley", error.getMessage());
                            }
                        }
                );
                VolleyClient.getInstance(getContext()).addToRequestQueue(request);
            }
            catch (Exception e) {
                Log.e("VenueFragment:onViewCreated", e.getMessage());
                Snackbar.make(view, "Failed to retrieve venue information.", Snackbar.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
//        Log.d("VenueFragment:onMapReady", "google map is ready");
        this.googleMap = googleMap;
        this.location.observe(getViewLifecycleOwner(), location -> {
            try {
                // https://developers.google.com/maps/documentation/android-sdk/start
//                Log.d("VenueFragment:onMapReady", "received location of venue for google map");
                LatLng markerPosition = new LatLng(location.getDouble("lat"), location.getDouble("lng"));
                VenueFragment.this.googleMap.addMarker(new MarkerOptions().position(markerPosition));
                VenueFragment.this.googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(markerPosition, 14.0f));
            }
            catch (Exception e) {
                Log.e("VenueFragment:onMapReady", e.getMessage());
                Snackbar.make(this.getActivity().findViewById(R.id.root_layout), "Failed to load Google Maps.", Snackbar.LENGTH_SHORT).show();
            }
        });
    }
}