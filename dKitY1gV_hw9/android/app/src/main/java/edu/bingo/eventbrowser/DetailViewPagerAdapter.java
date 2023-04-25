package edu.bingo.eventbrowser;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

public class DetailViewPagerAdapter extends FragmentStateAdapter {
    private final int fragmentCount;

    public DetailViewPagerAdapter(Fragment fragment, int fragmentCount) {
        super(fragment);
        this.fragmentCount = fragmentCount;
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        Fragment fragment;
        switch (position) {
            case 0: fragment = new EventFragment();
                break;
            case 1: fragment = new ArtistFragment();
                break;
            case 2: fragment = new VenueFragment();
                break;
            default: fragment = new EventFragment();
                break;
        }
        return fragment;
    }

    @Override
    public int getItemCount() {
        return this.fragmentCount;
    }
}
