package edu.bingo.eventbrowser;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;

import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.CompoundButton;
import android.widget.Spinner;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.gson.Gson;

import org.json.JSONArray;

import edu.bingo.eventbrowser.databinding.FragmentFormBinding;

public class FormFragment extends Fragment {

    private FragmentFormBinding binding;
    private String[] keywordSuggestions;
    private final SearchParameters searchCriteria;

    private static class KeywordInputTextWatcher implements TextWatcher {

        private final FormFragment formFragment;
        private final ArrayAdapter<String> adapter;
        private final Gson gson;
        private static final String REQUEST_PREFIX = "https://eventfinder-android.wl.r.appspot.com/api/suggest?keyword=";

        public KeywordInputTextWatcher(ArrayAdapter<String> adapter, FormFragment formFragment) {
            this.formFragment = formFragment;
            this.adapter = adapter;
            this.gson = new Gson();
        }

        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {

        }

        @Override
        public void onTextChanged(CharSequence s, int start, int count, int after) {
//            Log.d("FormFragment:KeywordInputTextWatcher", "Text change detected");
            if (s.length() > 0) {
//                Log.d("FormFragment:KeywordInputTextWatcher", "New text: " + s);
                JsonArrayRequest request = new JsonArrayRequest(
                        Request.Method.GET,
                        REQUEST_PREFIX + s,
                        null,
                        new Response.Listener<JSONArray>() {
                            @Override
                            public void onResponse(JSONArray response) {
//                                Log.d("FormFragment:KeywordInputTextWatcher", "Auto complete response: " + response.toString());
                                KeywordInputTextWatcher.this.formFragment.keywordSuggestions =
                                        KeywordInputTextWatcher.this.gson.fromJson(response.toString(), String[].class);
                                KeywordInputTextWatcher.this.adapter.clear();
                                KeywordInputTextWatcher.this.adapter.addAll(KeywordInputTextWatcher.this.formFragment.keywordSuggestions);
//                                KeywordInputTextWatcher.this.formFragment.binding.keywordInput.refreshAutoCompleteResults();
                                KeywordInputTextWatcher.this.adapter
                                        .getFilter()
                                        .filter(KeywordInputTextWatcher.this.formFragment.binding.keywordInput.getText(), KeywordInputTextWatcher.this.formFragment.binding.keywordInput);
                            }
                        },
                        new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                Snackbar.make(
                                        KeywordInputTextWatcher.this.formFragment.getActivity().findViewById(R.id.root_layout),
                                        "Auto-complete response error",
                                        Snackbar.LENGTH_SHORT
                                ).show();
                                Log.e("FormFragment:94:autocomplete", error.getMessage());
                            }
                        }
                );
                VolleyClient.getInstance(formFragment.getContext()).addToRequestQueue(request);
            }
        }

        @Override
        public void afterTextChanged(Editable inputBox) {
            this.formFragment.binding.keywordInput.refreshAutoCompleteResults();
        }
    }

    public FormFragment() {
        this.keywordSuggestions = new String[]{};
        this.searchCriteria = new SearchParameters();
    }

    @Override
    public View onCreateView(
            @NonNull LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState
    ) {
        this.binding = FragmentFormBinding.inflate(inflater, container, false);
        final Spinner spinner = this.binding.categoryDropdown;
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(getContext(), R.array.dropdown_items, R.layout.spinner_item_layout);
        adapter.setDropDownViewResource(R.layout.spinner_item_layout);
        spinner.setAdapter(adapter);
        spinner.setSelection(0);
        this.binding.locationInputBox.setHint(R.string.location_input_placeholder);
        return this.binding.getRoot();
    }

    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        ArrayAdapter<String> adapter = new ArrayAdapter<>(getActivity(), R.layout.autocomplete_item_layout, this.keywordSuggestions);
        final AutoCompleteTextView keywordInput = this.binding.keywordInput;
        keywordInput.setThreshold(1);
        keywordInput.setAdapter(adapter);
        keywordInput.addTextChangedListener(new KeywordInputTextWatcher(adapter, FormFragment.this));
        keywordInput.setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override
            public void onFocusChange(View v, boolean hasFocus) {
                if (hasFocus) {
                    keywordInput.setHint("");
                } else {
                    keywordInput.setHint(R.string.keyword_input_placeholder);
                }
            }
        });

        this.binding.autoDetectSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                TextInputEditText locationInputBox = FormFragment.this.binding.locationInputBox;
                if (isChecked) {
                    locationInputBox.setEnabled(false);
                    locationInputBox.setText("");
                } else {
                    locationInputBox.setEnabled(true);
                }
            }
        });

        TextInputLayout locationInput = this.binding.locationInput;
        locationInput.setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override
            public void onFocusChange(View v, boolean hasFocus) {
                if (hasFocus) {
                    locationInput.setHint("");
                } else {
                    locationInput.setHint(R.string.location_input_placeholder);
                }
            }
        });

        // gets coordinates first, and then navigate to results fragment
        this.binding.searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentFormBinding fragBinding = FormFragment.this.binding;
                SearchParameters searchParameters = FormFragment.this.searchCriteria;
                // check inputs
                try {
                    String keyword = fragBinding.keywordInput.getText().toString();
                    String distanceStr = fragBinding.distanceInputBox.getText().toString();
                    String location = fragBinding.autoDetectSwitch.isChecked() ? "A" : fragBinding.locationInputBox.getText().toString();
                    String category = fragBinding.categoryDropdown.getSelectedItem().toString();
                    if (keyword.length() == 0 || distanceStr.length() == 0 || location.length() == 0) {
                        Snackbar.make(getActivity().findViewById(R.id.root_layout), "Please fill out all fields", Snackbar.LENGTH_SHORT).show();
                        return;
                    }
                    int distance = Integer.parseInt(distanceStr);
                    if (distance <= 0) {
                        throw new NumberFormatException();
                    }
                    searchParameters.keyword = keyword;
                    searchParameters.distance = distance;
                    searchParameters.category = category;
                }
                catch (NumberFormatException e) {
                    Snackbar.make(getActivity().findViewById(R.id.root_layout), "Distance must be a positive integer", Snackbar.LENGTH_SHORT).show();
                    return;
                }
                catch (Exception e) {
                    Snackbar.make(getActivity().findViewById(R.id.root_layout), "An error occurred while reading your inputs", Snackbar.LENGTH_SHORT).show();
                    return;
                }

                try {
                    if (fragBinding.autoDetectSwitch.isChecked()) {
                        NavHostFragment
                                .findNavController(FormFragment.this)
                                .navigate(FormFragmentDirections.actionFormFragmentToResultsFragment(
                                        searchParameters.keyword,
                                        searchParameters.category,
                                        searchParameters.distance,
                                        true,
                                        ""
                                ));
                    } else {
                        NavHostFragment
                                .findNavController(FormFragment.this)
                                .navigate(FormFragmentDirections.actionFormFragmentToResultsFragment(
                                        searchParameters.keyword,
                                        searchParameters.category,
                                        searchParameters.distance,
                                        false,
                                        fragBinding.locationInputBox.getText().toString()
                                ));
                    }
                }
                catch (Exception e) {
                    Snackbar.make(getActivity().findViewById(R.id.root_layout), "Navigation error", Snackbar.LENGTH_SHORT).show();
                    Log.e("FormFragment", e.getMessage());
                }
            }
        });

        this.binding.clearButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentFormBinding fragBinding = FormFragment.this.binding;
                fragBinding.keywordInput.setText("");
                fragBinding.distanceInputBox.setText("10");
                fragBinding.locationInputBox.setText("");
                fragBinding.categoryDropdown.setSelection(0);
                fragBinding.autoDetectSwitch.setChecked(false);
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
    }
}