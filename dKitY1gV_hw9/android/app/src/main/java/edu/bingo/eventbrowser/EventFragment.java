package edu.bingo.eventbrowser;

import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Paint;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.google.android.material.snackbar.Snackbar;
import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import edu.bingo.eventbrowser.databinding.FragmentEventBinding;

public class EventFragment extends Fragment {

    private FragmentEventBinding binding;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        this.binding = FragmentEventBinding.inflate(inflater, container, false);
        return this.binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        DetailViewModel detailViewModel = new ViewModelProvider(getActivity()).get(DetailViewModel.class);
        detailViewModel.getData().observe(getViewLifecycleOwner(), eventDetailData -> {
            try {
                JSONArray artists = eventDetailData.getJSONArray("artists");
                String[] artistNames = new String[artists.length()];
                for (int i = 0; i < artists.length(); i++) {
                    artistNames[i] = artists.getJSONObject(i).getString("name");
                }
                this.binding.artistInfo.setText(String.join(" | ", artistNames));
                this.binding.artistInfo.setSelected(true);
                this.binding.venueInfo.setText(eventDetailData.getString("venue"));
                this.binding.venueInfo.setSelected(true);
                this.binding.dateInfo.setText(eventDetailData.getString("date").equals("") ? "" :
                        LocalDate
                                .parse(eventDetailData.getString("date"), DateTimeFormatter.ofPattern("uuuu-MM-dd"))
                                .format(DateTimeFormatter.ofPattern("MMM d, uuuu"))
                );
                this.binding.dateInfo.setSelected(true);
                //  https://stackoverflow.com/questions/6907968/how-to-convert-24-hr-format-time-in-to-12-hr-format
                this.binding.timeInfo.setText(eventDetailData.getString("time").equals("") ? "" :
                        LocalTime
                                .parse(eventDetailData.getString("time"), DateTimeFormatter.ofPattern("HH:mm:ss"))
                                .format(DateTimeFormatter.ofPattern("hh:mm a"))
                );
                this.binding.genresInfo.setText(eventDetailData.getString("genre"));
                this.binding.genresInfo.setSelected(true);
                this.binding.priceInfo.setText(eventDetailData.getString("price"));
                this.binding.priceInfo.setSelected(true);
                this.binding.statusInfo.setText(eventDetailData.getString("status"));
                int statusColor = 0;
                switch (eventDetailData.getString("status_color")) {
                    case "black": statusColor = Color.BLACK; break;
                    case "green": statusColor = Color.GREEN; break;
                    case "orange": statusColor = Color.rgb(255, 140, 0); break;
                    case "red": statusColor = Color.RED; break;
                }
                this.binding.statusInfoContainer.setBackgroundTintList(ColorStateList.valueOf(statusColor));
                String purchaseUrl = eventDetailData.getString("buy");
                this.binding.purchaseInfo.setText(purchaseUrl);
                this.binding.purchaseInfo.setPaintFlags(Paint.UNDERLINE_TEXT_FLAG);
                this.binding.purchaseInfo.setSelected(true);
                this.binding.purchaseInfo.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        // https://www.tutorialkart.com/kotlin-android/android-open-url-in-browser-activity/
                        Intent goToWebsite = new Intent(Intent.ACTION_VIEW);
                        goToWebsite.setData(Uri.parse(purchaseUrl));
                        startActivity(goToWebsite);
                    }
                });

                Picasso
                        .get()
                        .load(eventDetailData.getString("seatmap"))
                        .fit()
                        .centerInside()
                        .into(this.binding.seatmapImg, new Callback() {
                            @Override
                            public void onSuccess() {
                                EventFragment.this.binding.eventProgressBar.setVisibility(View.GONE);
                                EventFragment.this.binding.scrollView2.setVisibility(View.VISIBLE);
                            }

                            @Override
                            public void onError(Exception e) {
                                Log.e("EventFragment:Picasso", e.getMessage());
                                Snackbar.make(
                                        EventFragment.this.getActivity().findViewById(R.id.root_layout),
                                        "Failed to retrieve event seatmap.",
                                        Snackbar.LENGTH_SHORT
                                ).show();
                            }
                        });

            }
            catch (Exception e) {
                Log.e("EventFragment:onViewCreated", e.getMessage());
                Snackbar.make(
                        getActivity().findViewById(R.id.root_layout),
                        "Failed to retrieve event information.",
                        Snackbar.LENGTH_SHORT
                ).show();
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        this.binding = null;
    }
}