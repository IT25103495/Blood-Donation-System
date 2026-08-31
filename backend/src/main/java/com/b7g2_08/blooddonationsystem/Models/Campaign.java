package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Set;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer campID;

    @Column(name = "Campaign Name")
    private String name;

    @Column(name = "Starting Date")
    private LocalDate startDate;

    @Column(name = "Ending Date")
    private LocalDate endDate;

    @Column(name = "Status")
    private campStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID", nullable = false)
    private Hoster hoster;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "Campaign_Venues",
            joinColumns = @JoinColumn(name = "campID"),
            inverseJoinColumns = @JoinColumn(name = "venueID"))
    private Set<Venue> venueSet;

    public Integer getCampID() {
        return campID;
    }

    public void setCampID(Integer campID) {
        this.campID = campID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public campStatus getStatus() {
        return status;
    }

    public void setStatus(campStatus status) {
        this.status = status;
    }

    public Hoster getHoster() {
        return hoster;
    }

    public void setHoster(Hoster hoster) {
        this.hoster = hoster;
    }

    public Set<Venue> getVenueSet() {
        return venueSet;
    }

    public void setVenueSet(Set<Venue> venueSet) {
        this.venueSet = venueSet;
    }
}
