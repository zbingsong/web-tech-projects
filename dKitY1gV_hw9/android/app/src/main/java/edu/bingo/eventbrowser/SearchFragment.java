package edu.bingo.eventbrowser;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

import edu.bingo.eventbrowser.databinding.FragmentSearchBinding;

public class SearchFragment extends Fragment {

    private FragmentSearchBinding binding;

    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState
    ) {
        super.onCreateView(inflater, container, savedInstanceState);
        this.binding = FragmentSearchBinding.inflate(inflater, container, false);
        return this.binding.getRoot();
    }

    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // tab layout
        TabLayout tabLayout = this.binding.tablayoutSearch;
        tabLayout.addTab(tabLayout.newTab().setText("SEARCH"), 0);
        tabLayout.addTab(tabLayout.newTab().setText("FAVORITES"), 1);
        // ViewPager
        ViewPager2 viewPager = this.binding.viewpager;
        viewPager.setAdapter(new SearchViewPagerAdapter(this, 2));
        // link tabLayout to viewPager
        new TabLayoutMediator(
                tabLayout,
                viewPager,
                ((tab, position) -> tab.setText(
                        position == 0 ? R.string.search_tab_title : R.string.favorites_tab_title)
                )
        ).attach();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        this.binding = null;
    }
}