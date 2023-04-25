package edu.bingo.eventbrowser;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.google.android.material.snackbar.Snackbar;
import com.google.gson.Gson;
import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;

import edu.bingo.eventbrowser.databinding.FragmentResultsBinding;

public class ResultsFragment extends Fragment {

    private FragmentResultsBinding binding;
    private SharedPreferences.OnSharedPreferenceChangeListener listener;
    private SharedPreferences localStorage;
    private static class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerViewAdapter.ViewHolder> {
        private final ArrayList<JSONObject> data;
        private final SharedPreferences localStorage;
        private final Gson gson;
        private final ResultsFragment fragment;

        public static class ViewHolder extends RecyclerView.ViewHolder {
            private final View view;

            public ViewHolder(View view) {
                super(view);
                this.view = view.findViewById(R.id.result_item);
            }

            public View getView() {
                return this.view;
            }
        }

        public RecyclerViewAdapter(JSONArray data, ResultsFragment fragment, SharedPreferences localStorage) {
            this.fragment = fragment;
            this.localStorage = localStorage;
            this.gson = new Gson();
            this.data = new ArrayList<>();
            try {
                for (int i = 0; i < data.length(); i++) {
                    this.data.add(data.getJSONObject(i));
                }
                this.data.sort(new Comparator<JSONObject>() {
                    @Override
                    public int compare(JSONObject o1, JSONObject o2) {
                        int res;
                        try {
                            String date1 = o1.getString("date");
                            String date2 = o2.getString("date");
                            res = date1.compareTo(date2);
                            if (res == 0) {
                                String time1 = o1.getString("time");
                                String time2 = o2.getString("time");
                                res = time1.compareTo(time2);
                            }
                        }
                        catch (Exception e) {
                            Log.e("Results:Adapter:constructor", e.getMessage());
                            res = 0;
                        }
                        return res;
                    }
                });
            }
            catch (Exception e) {
                Log.e("Results:Adapter:constructor", e.getMessage());
            }
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int viewType) {
            View view = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.results_item, viewGroup, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder viewHolder, final int pos) {
            try {
                View view = viewHolder.getView();
                JSONObject itemData = (JSONObject) this.data.get(pos);

                TextView resultName = view.findViewById(R.id.result_info_name);
                TextView resultVenue = view.findViewById(R.id.result_info_venue);
                TextView resultGenre = view.findViewById(R.id.result_info_genre);

                Picasso
                        .get()
                        .load(itemData.getString("image_url"))
                        .fit()
                        .centerCrop()
                        .into(view.findViewById(R.id.result_image), new Callback() {
                            @Override
                            public void onSuccess() {
                                view.findViewById(R.id.img_progress_bar).setVisibility(View.GONE);
                            }

                            @Override
                            public void onError(Exception e) {
                                view.findViewById(R.id.result_image).setVisibility(View.GONE);
                                Snackbar.make(
                                        RecyclerViewAdapter.this.fragment.getActivity().findViewById(R.id.root_layout),
                                        "Failed to load event image",
                                        Snackbar.LENGTH_SHORT
                                ).show();
                                Log.e("ResultsFragment:Picasso", e.getMessage());
                            }
                        });
                resultName.post(() -> {
                    try {
                        resultName.setText(itemData.getString("name"));
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                    resultName.setSelected(true);
                });
                resultVenue.post(() -> {
                    try {
                        resultVenue.setText(itemData.getString("venue"));
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                    resultVenue.setSelected(true);
                });
                resultGenre.post(() -> {
                    try {
                        resultGenre.setText(itemData.getString("genre"));
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                    resultGenre.setSelected(true);
                });
                ((TextView) view.findViewById(R.id.result_info_date)).setText(itemData.getString("date").equals("") ? "" :
                        LocalDate
                                .parse(itemData.getString("date"), DateTimeFormatter.ofPattern("uuuu-MM-dd"))
                                .format(DateTimeFormatter.ofPattern("MM/dd/uuuu"))
                );
                //  https://stackoverflow.com/questions/6907968/how-to-convert-24-hr-format-time-in-to-12-hr-format
                ((TextView) view.findViewById(R.id.result_info_time)).setText(itemData.getString("time").equals("") ? "" :
                        LocalTime
                                .parse(itemData.getString("time"), DateTimeFormatter.ofPattern("HH:mm:ss"))
                                .format(DateTimeFormatter.ofPattern("hh:mm a"))
                );
                view.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        try {
                            Intent intent = new Intent(fragment.getActivity(), MainActivity2.class);
                            intent.putExtra("eventId", itemData.getString("id"));
                            intent.putExtra("eventName", itemData.getString("name"));
                            intent.putExtra("eventImageUrl", itemData.getString("image_url"));
                            fragment.startActivity(intent);
                        }
                        catch (Exception e) {
                            Snackbar.make(
                                    RecyclerViewAdapter.this.fragment.getActivity().findViewById(R.id.root_layout),
                                    "Cannot navigate to event detail.",
                                    Snackbar.LENGTH_SHORT
                            ).show();
                            Log.e("ResultsFragment:navToEventDetail", e.getMessage());
                        }
                    }
                });

                Button favButton = view.findViewById(R.id.fav_button);
                if (this.localStorage.contains(itemData.getString("id"))) {
                    // https://stackoverflow.com/questions/22297073/how-to-programmatically-set-drawableright-on-android-edittext
                    favButton.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.baseline_favorite_24, 0);
                }
                favButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        SharedPreferences sp = RecyclerViewAdapter.this.localStorage;
                        SharedPreferences.Editor editor = sp.edit();
                        String eventId;
                        String eventName;
                        try {
                            eventId = itemData.getString("id");
                            eventName = itemData.getString("name");
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                        if (sp.contains(eventId)) {
                            editor.remove(eventId);
                            favButton.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.baseline_favorite_border_24, 0);
                            Snackbar.make(
                                    RecyclerViewAdapter.this.fragment.getActivity().findViewById(R.id.root_layout),
                                    eventName + " removed from favorites.",
                                    Snackbar.LENGTH_SHORT
                            ).show();
                        } else {
                            editor.putString(eventId, RecyclerViewAdapter.this.gson.toJson(itemData));
                            favButton.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.baseline_favorite_24, 0);
                            Snackbar.make(
                                    RecyclerViewAdapter.this.fragment.getActivity().findViewById(R.id.root_layout),
                                    eventName + " added to favorites.",
                                    Snackbar.LENGTH_SHORT
                            ).show();
                        }
                        editor.apply();
                    }
                });
            }
            catch (Exception e) {
                Snackbar
                        .make(
                                fragment.getActivity().findViewById(R.id.root_layout),
                                "Get location error",
                                Snackbar.LENGTH_SHORT
                        )
                        .show();
                Log.e("ResultsFragment:116", e.getMessage());
            }

        }

        @Override
        public int getItemCount() {
            return this.data.size();
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState
    ) {
        this.binding = FragmentResultsBinding.inflate(inflater, container, false);
        this.localStorage = this.getContext().getSharedPreferences("localStorage", Context.MODE_PRIVATE);
        return this.binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        this.binding.resultBackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                NavHostFragment
                        .findNavController(ResultsFragment.this)
                        .navigate(ResultsFragmentDirections.actionResultsFragmentToFormFragment());
            }
        });

        boolean ifDetect = ResultsFragmentArgs.fromBundle(getArguments()).getIfDetect();
        String location = ResultsFragmentArgs.fromBundle(getArguments()).getLocation();

        try {
            String url;
            JsonObjectRequest request;
            if (ifDetect) {
                url = "https://ipinfo.io/?token=4c616ba7471362";
                request = new JsonObjectRequest(
                        Request.Method.GET,
                        url,
                        null,
                        new Response.Listener<JSONObject>() {
                            @Override
                            public void onResponse(JSONObject response) {
                                try {
                                    String[] coords = response.getString("loc").split(",");
                                    float lng = Float.parseFloat(coords[1]);
                                    float lat = Float.parseFloat(coords[0]);
                                    String url;
                                    try {
                                        String keyword = ResultsFragmentArgs.fromBundle(getArguments()).getKeyword();
                                        String category = ResultsFragmentArgs.fromBundle(getArguments()).getCategory();
                                        int distance = ResultsFragmentArgs.fromBundle(getArguments()).getDistance();
                                        if (category.equals("All")) {
                                            category = "Default";
                                        } else if (category.equals("Arts & Theatre")) {
                                            category = "Arts";
                                        }
                                        url = String.format(
                                                "https://eventfinder-android.wl.r.appspot.com/api/search?keyword=%s&distance=%d&category=%s&lng=%f&lat=%f",
                                                URLEncoder.encode(keyword, "UTF-8"),
                                                distance,
                                                category,
                                                lng,
                                                lat
                                        );
                                    }
                                    catch (Exception e) {
                                        url = "https://eventfinder-android.wl.r.appspot.com/api/search?keyword=Ed%20Sheeran&distance=10&category=Default&lng=-118.286301&lat=34.002998";
                                    }
//                                    Log.d("ResultsFragment:onViewCreated:request_url", url);
                                    JsonArrayRequest request = new JsonArrayRequest(
                                            Request.Method.GET,
                                            url,
                                            null,
                                            new Response.Listener<JSONArray>() {
                                                @Override
                                                public void onResponse(JSONArray data) {
                                                    ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                                    RecyclerView resultList = ResultsFragment.this.binding.resultListContainer;
                                                    ConstraintLayout noResultView = ResultsFragment.this.binding.noResultContainer;
                                                    if (data.length() > 0) {
//                                                        Log.d("Results:Volley:request:aft_auto", data.toString());
                                                        ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                                        resultList.setVisibility(View.VISIBLE);
                                                        noResultView.setVisibility(View.GONE);
                                                        resultList.setHasFixedSize(true);
                                                        resultList.setAdapter(new RecyclerViewAdapter(data, ResultsFragment.this, ResultsFragment.this.localStorage));
                                                        resultList.setLayoutManager(new LinearLayoutManager(ResultsFragment.this.binding.getRoot().getContext()));
                                                        ResultsFragment.this.listener = new SharedPreferences.OnSharedPreferenceChangeListener() {
                                                            @Override
                                                            public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
                                                                resultList.setAdapter(new RecyclerViewAdapter(data, ResultsFragment.this, ResultsFragment.this.localStorage));
                                                            }
                                                        };
                                                        ResultsFragment.this.localStorage.registerOnSharedPreferenceChangeListener(ResultsFragment.this.listener);
                                                    } else {
                                                        ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                                        noResultView.setVisibility(View.VISIBLE);
                                                        resultList.setVisibility(View.GONE);
                                                    }
                                                }
                                            },
                                            new Response.ErrorListener() {
                                                @Override
                                                public void onErrorResponse(VolleyError error) {
                                                    Snackbar
                                                            .make(
                                                                    getActivity().findViewById(R.id.root_layout),
                                                                    "Get event list error. Please try searching again.",
                                                                    Snackbar.LENGTH_SHORT
                                                            )
                                                            .show();
                                                }
                                            }
                                    );
                                    VolleyClient.getInstance(getContext()).addToRequestQueue(request);
                                }
                                catch (Exception e) {
                                    Snackbar.make(getActivity().findViewById(R.id.root_layout), "Location response parsing error: IPInfo", Snackbar.LENGTH_SHORT).show();
                                }
                            }
                        },
                        new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                Snackbar.make(getActivity().findViewById(R.id.root_layout), "Location response error: IPInfo", Snackbar.LENGTH_SHORT).show();
                                Log.e("FormFragment:235:Location IPInfo", error.getMessage());
                            }
                        }
                );
            } else {
                url = String.format(
                        "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=AIzaSyAzeFEsfPKDhdxHcwYkDuDirDo4IAifTfk",
                        URLEncoder.encode(location, "UTF-8")
                );
                request = new JsonObjectRequest(
                        Request.Method.GET,
                        url,
                        null,
                        new Response.Listener<JSONObject>() {
                            @Override
                            public void onResponse(JSONObject response) {
                                try {
                                    JSONArray coordsList = response.getJSONArray("results");
                                    float lng;
                                    float lat;
                                    if (coordsList.length() == 0) {
                                        ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                        ResultsFragment.this.binding.noResultContainer.setVisibility(View.VISIBLE);
                                        ResultsFragment.this.binding.resultListContainer.setVisibility(View.GONE);
                                        return;
                                    } else {
                                        JSONObject coords = (JSONObject) ((JSONObject) ((JSONObject) coordsList.get(0)).get("geometry")).get("location");
                                        lng = Float.parseFloat(coords.getString("lng"));
                                        lat = Float.parseFloat(coords.getString("lat"));
                                    }
                                    String url;
                                    try {
                                        String keyword = ResultsFragmentArgs.fromBundle(getArguments()).getKeyword();
                                        String category = ResultsFragmentArgs.fromBundle(getArguments()).getCategory();
                                        int distance = ResultsFragmentArgs.fromBundle(getArguments()).getDistance();
                                        if (category.equals("All")) {
                                            category = "Default";
                                        } else if (category.equals("Arts & Theatre")) {
                                            category = "Arts";
                                        }
                                        url = String.format(
                                                "https://eventfinder-android.wl.r.appspot.com/api/search?keyword=%s&distance=%d&category=%s&lng=%f&lat=%f",
                                                URLEncoder.encode(keyword, "UTF-8"),
                                                distance,
                                                category,
                                                lng,
                                                lat
                                        );
                                    }
                                    catch (Exception e) {
                                        url = "https://eventfinder-android.wl.r.appspot.com/api/search?keyword=Ed%20Sheeran&distance=10&category=Default&lng=-118.286301&lat=34.002998";
                                    }
//                                    Log.d("ResultsFragment:onViewCreated:request_url", url);
                                    JsonArrayRequest request = new JsonArrayRequest(
                                            Request.Method.GET,
                                            url,
                                            null,
                                            new Response.Listener<JSONArray>() {
                                                @Override
                                                public void onResponse(JSONArray data) {
                                                    ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                                    RecyclerView resultList = ResultsFragment.this.binding.resultListContainer;
                                                    ConstraintLayout noResultView = ResultsFragment.this.binding.noResultContainer;
                                                    if (data.length() > 0) {
                                                        ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                                        resultList.setVisibility(View.VISIBLE);
                                                        noResultView.setVisibility(View.GONE);
                                                        resultList.setHasFixedSize(true);
                                                        resultList.setAdapter(new RecyclerViewAdapter(data, ResultsFragment.this, ResultsFragment.this.localStorage));
                                                        resultList.setLayoutManager(new LinearLayoutManager(ResultsFragment.this.binding.getRoot().getContext()));
                                                        ResultsFragment.this.listener = new SharedPreferences.OnSharedPreferenceChangeListener() {
                                                            @Override
                                                            public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
                                                                resultList.setAdapter(new RecyclerViewAdapter(data, ResultsFragment.this, ResultsFragment.this.localStorage));
                                                            }
                                                        };
                                                        ResultsFragment.this.localStorage.registerOnSharedPreferenceChangeListener(ResultsFragment.this.listener);
                                                    } else {
                                                        ResultsFragment.this.binding.resultProgressBar.setVisibility(View.GONE);
                                                        noResultView.setVisibility(View.VISIBLE);
                                                        resultList.setVisibility(View.GONE);
                                                    }
                                                }
                                            },
                                            new Response.ErrorListener() {
                                                @Override
                                                public void onErrorResponse(VolleyError error) {
                                                    Snackbar
                                                            .make(
                                                                    getActivity().findViewById(R.id.root_layout),
                                                                    "Get event list error. Please try searching again.",
                                                                    Snackbar.LENGTH_SHORT
                                                            )
                                                            .show();
                                                }
                                            }
                                    );
                                    VolleyClient.getInstance(getContext()).addToRequestQueue(request);
                                }
                                catch (Exception e) {
                                    Snackbar.make(getActivity().findViewById(R.id.root_layout), "Location response parsing error: GMap", Snackbar.LENGTH_SHORT).show();
                                }
                            }
                        },
                        new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                Snackbar.make(getActivity().findViewById(R.id.root_layout), "Location response error: GMap", Snackbar.LENGTH_SHORT).show();
                            }
                        }
                );
            }
            VolleyClient.getInstance(getContext()).addToRequestQueue(request);
        }
        catch (Exception e) {
            Snackbar.make(getActivity().findViewById(R.id.root_layout), "Get location error", Snackbar.LENGTH_SHORT).show();
            Log.e("FormFragment:280:get coordinates", e.getMessage());
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        this.binding = null;
    }
}