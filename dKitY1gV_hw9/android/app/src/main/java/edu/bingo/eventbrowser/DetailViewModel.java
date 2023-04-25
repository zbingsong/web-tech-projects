package edu.bingo.eventbrowser;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import org.json.JSONObject;

import java.util.ArrayList;

public class DetailViewModel extends ViewModel {

    private final MutableLiveData<JSONObject> eventDetail;
    private final MutableLiveData<ArrayList<JSONObject>> artistData;

    public DetailViewModel() {
        this.eventDetail = new MutableLiveData<>();
        this.artistData = new MutableLiveData<>();
    }

    public MutableLiveData<JSONObject> getData() {
        return this.eventDetail;
    }

    public void setData(JSONObject newEventDetail) {
        this.eventDetail.setValue(newEventDetail);
    }

    public MutableLiveData<ArrayList<JSONObject>> getArtistData() {
        return this.artistData;
    }

    public void setArtistData(ArrayList<JSONObject> newArtistData) {
        this.artistData.setValue(newArtistData);
    }
}
