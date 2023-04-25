package edu.bingo.eventbrowser;

import java.io.Serializable;

public class SearchParameters implements Serializable {
    public String keyword;
    public int distance;
    public String category;
    public double lng;
    public double lat;

    public SearchParameters() {
        this.keyword = "";
        this.distance = 0;
        this.category = "All";
        this.lng = 0;
        this.lat = 0;
    }

    public SearchParameters(String keyword, int distance, String category, double lng, double lat) {
        this.keyword = keyword;
        this.distance = distance;
        this.category = category;
        this.lng = lng;
        this.lat = lat;
    }
}
