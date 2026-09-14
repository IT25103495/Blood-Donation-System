package com.b7g2_08.blooddonationsystem.DTOs.Inventory;

//import java.time.LocalDate;

public class inventoryCreateDTO {
    protected String bloodType;
//    private LocalDate dateCollected;
    protected Integer appointmentID;
    protected Integer bankID;

    public String getBloodType() {
        return bloodType;
    }

//    public LocalDate getDateCollected() {
//        return dateCollected;
//    }

    public Integer getAppointmentID() {
        return appointmentID;
    }

    public Integer getBankID() {
        return bankID;
    }
}
