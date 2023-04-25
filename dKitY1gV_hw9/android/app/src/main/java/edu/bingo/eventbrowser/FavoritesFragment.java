package edu.bingo.eventbrowser;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.google.android.material.snackbar.Snackbar;
import com.google.gson.Gson;
import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import edu.bingo.eventbrowser.databinding.FragmentFavoritesBinding;


public class FavoritesFragment extends Fragment {

    private FragmentFavoritesBinding binding;
    private SharedPreferences localStorage;
    private Gson gson;
    private SharedPreferences.OnSharedPreferenceChangeListener listener;

    private static class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerViewAdapter.ViewHolder> {
        private final List<JSONObject> data;
        private final SharedPreferences localStorage;
        private final Gson gson;
        private final FavoritesFragment fragment;

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

        public RecyclerViewAdapter(FavoritesFragment fragment, SharedPreferences localStorage, List<JSONObject> data) {
            this.gson = new Gson();
            this.fragment = fragment;
            this.localStorage = localStorage;
            this.data = ((Map<String, String>) this.localStorage.getAll())
                    .values()
                    .stream()
                    .map(itemData -> this.gson.fromJson(itemData, JSONObject.class))
                    .collect(Collectors.toList());
        }

        @Override
        @NonNull
        public RecyclerViewAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int viewType) {
            View view = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.results_item, viewGroup, false);
            return new RecyclerViewAdapter.ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(RecyclerViewAdapter.ViewHolder viewHolder, final int pos) {
            View view = viewHolder.getView();
            JSONObject itemData = this.data.get(pos);

            TextView resultName = view.findViewById(R.id.result_info_name);
            TextView resultVenue = view.findViewById(R.id.result_info_venue);
            TextView resultGenre = view.findViewById(R.id.result_info_genre);

            try {
                Picasso
                        .get()
                        .load(itemData.getString("image_url"))
                        .fit()
                        .centerCrop()
                        .into((ImageView) view.findViewById(R.id.result_image), new Callback() {
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

                Button favButton = view.findViewById(R.id.fav_button);
                favButton.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.baseline_favorite_24, 0);
                favButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        try {
                            // remove from local storage
                            SharedPreferences sp = RecyclerViewAdapter.this.localStorage;
                            SharedPreferences.Editor editor = sp.edit();
                            editor.remove(itemData.getString("id"));
                            editor.apply();
                            Snackbar.make(
                                    RecyclerViewAdapter.this.fragment.getActivity().findViewById(R.id.root_layout),
                                    itemData.getString("name") + " removed from favorites",
                                    Snackbar.LENGTH_SHORT
                            ).show();
                        }
                        catch (Exception e) {
                            Log.e("FavoritesFragment:onBindViewHolder:OnClickListener", e.getMessage());
                        }
                    }
                });
            }
            catch (Exception e) {
                Log.e("FavoritesFragment:onBindViewHolder", e.getMessage());
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
        this.gson = new Gson();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        this.binding = FragmentFavoritesBinding.inflate(inflater, container, false);
        this.localStorage = this.getContext().getSharedPreferences("localStorage", Context.MODE_PRIVATE);
        return this.binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        RecyclerView favList = this.binding.favListContainer;
        ConstraintLayout noFav = this.binding.noFavContainer;

        this.listener = new SharedPreferences.OnSharedPreferenceChangeListener() {
            @Override
            public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
                List<JSONObject> data = ((Map<String, String>) FavoritesFragment.this.localStorage.getAll())
                        .values()
                        .stream()
                        .map(itemData -> FavoritesFragment.this.gson.fromJson(itemData, JSONObject.class))
                        .collect(Collectors.toList());
                if (data.size() == 0) {
                    favList.setVisibility(View.INVISIBLE);
                    noFav.setVisibility(View.VISIBLE);
                } else {
                    favList.setVisibility(View.VISIBLE);
                    noFav.setVisibility(View.INVISIBLE);
                }
                favList.setAdapter(new RecyclerViewAdapter(FavoritesFragment.this, sharedPreferences, data));
            }
        };

        this.localStorage.registerOnSharedPreferenceChangeListener(this.listener);

        List<JSONObject> data = ((Map<String, String>) this.localStorage.getAll())
                .values()
                .stream()
                .map(itemData -> this.gson.fromJson(itemData, JSONObject.class))
                .collect(Collectors.toList());

        if (data.size() == 0) {
            favList.setVisibility(View.INVISIBLE);
            return;
        }

        noFav.setVisibility(View.INVISIBLE);
        favList.setAdapter(new RecyclerViewAdapter(this, this.localStorage, data));
        favList.setLayoutManager(new LinearLayoutManager(this.binding.getRoot().getContext()));
    }
}