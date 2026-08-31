package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Enums.itemStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemID;

    @Column(name = "Blood Type")
    private String bloodType;

    @Column(name = "Date Collected")
    private LocalDate dateCollected;

    @Column(name = "Expiry Date")
    private LocalDate expiry;

    @Column(name = "Status")
    private itemStatus status;

    @OneToOne
    @JoinColumn(name = "appID", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bankID", nullable = false)
    private Bank bank;


    public Integer getItemID() {
        return itemID;
    }

    public void setItemID(Integer itemID) {
        this.itemID = itemID;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public LocalDate getDateCollected() {
        return dateCollected;
    }

    public void setDateCollected(LocalDate dateCollected) {
        this.dateCollected = dateCollected;
        this.expiry = dateCollected.plusDays(40);
    }

    public LocalDate getExpiry() {
        return expiry;
    }

//    public void setExpiry(LocalDate expiry) {
//        this.expiry = expiry;
//    }

    public itemStatus getStatus() {
        return status;
    }

    public void setStatus(itemStatus status) {
        this.status = status;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public Bank getBank() {
        return bank;
    }

    public void setBank(Bank bank) {
        this.bank = bank;
    }
}
