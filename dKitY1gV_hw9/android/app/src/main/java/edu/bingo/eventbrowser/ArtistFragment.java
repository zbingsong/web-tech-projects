package edu.bingo.eventbrowser;

import android.content.Intent;
import android.graphics.Paint;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.ArrayList;

import edu.bingo.eventbrowser.databinding.FragmentArtistBinding;

public class ArtistFragment extends Fragment {

    private FragmentArtistBinding binding;

    private static class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerViewAdapter.ViewHolder> {

        private final ArrayList<JSONObject> data;
        private final ArtistFragment parentFragment;

        public static class ViewHolder extends RecyclerView.ViewHolder {
            private final View view;

            public ViewHolder(View view) {
                super(view);
                this.view = view.findViewById(R.id.artist_item_container);
            }

            public View getView() {
                return this.view;
            }
        }

        public RecyclerViewAdapter(ArrayList<JSONObject> data, ArtistFragment parentFragment) {
            this.data = data;
            this.parentFragment = parentFragment;
        }

        @NonNull
        @Override
        public RecyclerViewAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int viewType) {
//            Log.d("ArtistFragment:RecyclerViewAdapter:onCreateViewHolder", "view inflated");
            View view = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.artist_item_layout, viewGroup, false);
            return new RecyclerViewAdapter.ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull RecyclerViewAdapter.ViewHolder viewHolder, final int pos) {
//            Log.d("ArtistFragment:RecyclerViewAdapter:0", "start binding to viewholder");
            View view = viewHolder.getView();
            JSONObject artistDetail = this.data.get(pos);
            try {
//                Log.d("ArtistFragment:RecyclerViewAdapter:0", "prepare to set artist image");
                // artist image
                Picasso
                        .get()
                        .load(artistDetail.getString("image"))
                        .fit()
                        .centerCrop()
                        .into(view.findViewById(R.id.artist_image), new Callback() {
                            @Override
                            public void onSuccess() {
//                                Log.d("ArtistFragment:RecyclerViewAdapter:Picasso", "set artist image");
                                view.findViewById(R.id.img_progress_bar).setVisibility(View.GONE);
                            }

                            @Override
                            public void onError(Exception e) {
                                Log.e("ArtistFragment:RecyclerViewAdapter:Picasso", e.getMessage());
                            }
                        });
                // artist name, followers, popularity
//                Log.d("ArtistFragment:RecyclerViewAdapter:1", "prepare to set name and followers");
                ((TextView) view.findViewById(R.id.artist_name)).setText(artistDetail.getString("name"));
                ((TextView) view.findViewById(R.id.artist_followers)).setText(artistDetail.getString("followers"));
                view.findViewById(R.id.artist_link).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        try {
                            Intent goToSpotify = new Intent(Intent.ACTION_VIEW);
                            goToSpotify.setData(Uri.parse(artistDetail.getString("url")));
                            RecyclerViewAdapter.this.parentFragment.startActivity(goToSpotify);
                        }
                        catch (Exception e) {
                            Log.e("ArtistFragment:RecyclerViewAdapter:artist_link", e.getMessage());
                        }
                    }
                });
                ((TextView) view.findViewById(R.id.artist_link)).setPaintFlags(Paint.UNDERLINE_TEXT_FLAG);
                int popularity = artistDetail.getInt("popularity");
                ((ProgressBar) view.findViewById(R.id.artist_popularity_bar)).setProgress(popularity);
                ((TextView) view.findViewById(R.id.artist_popu_number)).setText(String.valueOf(popularity));
//                // album pictures
//                Log.d("ArtistFragment:RecyclerViewAdapter:2", "prepare to set albums");
                JSONArray albums = artistDetail.getJSONArray("albums");
                if (albums.length() == 0) {
                    view.findViewById(R.id.album1_progress_bar).setVisibility(View.GONE);
                    view.findViewById(R.id.album2_progress_bar).setVisibility(View.GONE);
                    view.findViewById(R.id.album3_progress_bar).setVisibility(View.GONE);
                    return;
                }
                Picasso
                        .get()
                        .load(albums.getString(0))
                        .fit()
                        .centerCrop()
                        .into(view.findViewById(R.id.album1_img), new Callback() {
                            @Override
                            public void onSuccess() {
                                view.findViewById(R.id.album1_progress_bar).setVisibility(View.GONE);
                            }

                            @Override
                            public void onError(Exception e) {
                                Log.e("ArtistFragment:RecyclerViewAdapter:Picasso:album1", e.getMessage());
                                view.findViewById(R.id.album1_progress_bar).setVisibility(View.GONE);
                            }
                        });
                if (albums.length() == 1) {
                    view.findViewById(R.id.album2_progress_bar).setVisibility(View.GONE);
                    view.findViewById(R.id.album3_progress_bar).setVisibility(View.GONE);
                    return;
                }
                Picasso
                        .get()
                        .load(albums.getString(1))
                        .fit()
                        .centerCrop()
                        .into(view.findViewById(R.id.album2_img), new Callback() {
                            @Override
                            public void onSuccess() {
                                view.findViewById(R.id.album2_progress_bar).setVisibility(View.GONE);
                            }

                            @Override
                            public void onError(Exception e) {
                                Log.e("ArtistFragment:RecyclerViewAdapter:Picasso:album2", e.getMessage());
                                view.findViewById(R.id.album2_progress_bar).setVisibility(View.GONE);
                            }
                        });
                if (albums.length() == 2) {
                    view.findViewById(R.id.album3_progress_bar).setVisibility(View.GONE);
                    return;
                }
                Picasso
                        .get()
                        .load(albums.getString(2))
                        .fit()
                        .centerCrop()
                        .into(view.findViewById(R.id.album3_img), new Callback() {
                            @Override
                            public void onSuccess() {
                                view.findViewById(R.id.album3_progress_bar).setVisibility(View.GONE);
                            }

                            @Override
                            public void onError(Exception e) {
                                Log.e("ArtistFragment:RecyclerViewAdapter:Picasso:album3", e.getMessage());
                                view.findViewById(R.id.album3_progress_bar).setVisibility(View.GONE);
                            }
                        });
            }
            catch (Exception e) {
                Log.e("ArtistFragment:RecyclerViewAdapter", e.getMessage());
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
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        this.binding = FragmentArtistBinding.inflate(inflater, container, false);
        return this.binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        DetailViewModel detailViewModel = new ViewModelProvider(this.getActivity()).get(DetailViewModel.class);

        detailViewModel.getData().observe(getViewLifecycleOwner(), eventDetailData -> {
            try {
                String eventCategory = eventDetailData.getString("category");

                // if event is not a Music event, display "no artist"
                if (!eventCategory.equals("Music")) {
                    this.binding.progreeBarContainer.setVisibility(View.GONE);
                    this.binding.artistListContainer.setVisibility(View.GONE);
                    return;
                }

                // otherwise, retrieve artist info
                final ArrayList<JSONObject> artistsDetail = new ArrayList<>();
                final int[] artistsNum = {0};
                JSONArray artistsInfo = eventDetailData.getJSONArray("artists");

                VolleyClient volleyClient = VolleyClient.getInstance(getContext());

                for (int i = 0; i < artistsInfo.length(); i++) {
                    if (!artistsInfo.getJSONObject(i).getString("category").equals("Music")) {
//                        Log.d("ArtistFragment:Volley", "not music artist, skipped");
                        continue;
                    }
                    artistsNum[0] ++;
                    String artistName = artistsInfo.getJSONObject(i).getString("name");
//                    Log.d("ArtistFragment:Volley", "creating response for music artist");
                    JsonObjectRequest request = new JsonObjectRequest(
                            Request.Method.GET,
                            "https://eventfinder-android.wl.r.appspot.com/api/artist?keyword=" + URLEncoder.encode(artistName, "UTF-8"),
                            null,
                            new Response.Listener<JSONObject>() {
                                @Override
                                public void onResponse(JSONObject response) {
                                    artistsDetail.add(response);
                                    detailViewModel.setArtistData(artistsDetail);
//                                    Log.d("ArtistFragment:Volley", "received response");
                                }
                            },
                            new Response.ErrorListener() {
                                @Override
                                public void onErrorResponse(VolleyError error) {
                                    Log.e("ArtistFragment:RecyclerViewAdapter", error.getMessage());
                                }
                            }
                    );
                    volleyClient.addToRequestQueue(request);
//                    Log.d("ArtistFragment:Volley", "response added to queue");
                }

//                Log.d("ArtistFragment:onViewCreated", "received all responses");
                if (artistsNum[0] == 0) {
                    this.binding.artistListContainer.setVisibility(View.GONE);
                    this.binding.progreeBarContainer.setVisibility(View.GONE);
                } else {
                    detailViewModel.getArtistData().observe(getViewLifecycleOwner(), artistData -> {
                        if (artistData.size() < artistsNum[0]) {
                            return;
                        }
//                        Log.d("ArtistFragment:onViewCreated", "prepare to set adapter");
//                        Log.d("ArtistFragment:onViewCreated", artistData.toString());
                        this.binding.artistListEmpty.setVisibility(View.GONE);
                        RecyclerView artistListContainer = this.binding.artistListContainer;
                        artistListContainer.setHasFixedSize(true);
                        artistListContainer.setAdapter(new RecyclerViewAdapter(artistsDetail, this));
                        artistListContainer.setLayoutManager(new LinearLayoutManager(ArtistFragment.this.binding.getRoot().getContext()));
                        this.binding.progreeBarContainer.setVisibility(View.GONE);
                    });
                }
            }
            catch (Exception e) {
                Log.e("ArtistFragment:onViewCreated", e.getMessage());
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        this.binding = null;
    }
}