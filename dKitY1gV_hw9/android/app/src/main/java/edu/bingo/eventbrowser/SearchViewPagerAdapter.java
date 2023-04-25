package edu.bingo.eventbrowser;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

public class SearchViewPagerAdapter extends FragmentStateAdapter {
    private final int fragmentCount;

    public SearchViewPagerAdapter(Fragment fragment, int fragmentCount) {
        super(fragment);
        this.fragmentCount = fragmentCount;
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        Fragment fragment;
        if (position == 0) {
            fragment = new FormResultNavFragment();
        } else {
            fragment = new FavoritesFragment();
        }
        return fragment;
    }

    @Override
    public int getItemCount() {
        return this.fragmentCount;
    }
}
