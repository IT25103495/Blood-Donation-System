package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Enums.appStatus;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.time.LocalDate;

@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "appID"
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer appID;

    @Column(name = "Date")
    private LocalDate date;

    @Column(name = "Status")
    private appStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Donor ID", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private Donor donor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "campID", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venueID", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private Venue venue;

    //FIXME: If this doesn't work, map by appID
    @OneToOne(mappedBy = "appointment")
    @JsonIdentityReference(alwaysAsId = true)
    private Inventory item;

    public Integer getAppID() {
        return appID;
    }

    public void setAppID(Integer appID) {
        this.appID = appID;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public appStatus getStatus() {
        return status;
    }

    public void setStatus(appStatus status) {
        this.status = status;
    }

    public Donor getDonor() {
        return donor;
    }

    public void setDonor(Donor donor) {
        this.donor = donor;
    }

    public Campaign getCampaign() {
        return campaign;
    }

    public void setCampaign(Campaign campaign) {
        this.campaign = campaign;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public Inventory getItem() {
        return item;
    }

    public void setItem(Inventory item) {
        this.item = item;
    }
}
