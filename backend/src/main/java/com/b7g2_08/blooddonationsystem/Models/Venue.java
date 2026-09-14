package com.b7g2_08.blooddonationsystem.Models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.util.Set;

@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "venueID"
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer venueID;

    @Column(name = "Venue Name")
    private String name;

    @Column(name = "Address")
    private String address;

    @ManyToMany(mappedBy = "venueSet")
    Set<Campaign> campaignSet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bankID", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private Bank assignedBank;

    public Integer getVenueID() {
        return venueID;
    }

    public void setVenueID(Integer venueID) {
        this.venueID = venueID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Bank getAssignedBank() {
        return assignedBank;
    }

    public void setAssignedBank(Bank assignedBank) {
        this.assignedBank = assignedBank;
    }
}
