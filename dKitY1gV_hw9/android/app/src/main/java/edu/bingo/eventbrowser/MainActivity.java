package edu.bingo.eventbrowser;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import edu.bingo.eventbrowser.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {
    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(this.binding.getRoot());
    }
}