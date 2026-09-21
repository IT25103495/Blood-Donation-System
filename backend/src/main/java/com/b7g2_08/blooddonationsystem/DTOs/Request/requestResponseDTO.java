package com.b7g2_08.blooddonationsystem.DTOs.Request;

import com.b7g2_08.blooddonationsystem.Enums.reqStatus;
import com.b7g2_08.blooddonationsystem.Models.Request;

import java.time.LocalDate;
import java.util.List;

public class requestResponseDTO {

    private  Integer reqID;
    private List<Integer> quantities;
    private LocalDate deadline;
    private reqStatus status;
    private Integer hospitalID;

    public requestResponseDTO(Request req) {
        this.reqID = req.getReqID();
        this.quantities = req.getQuantities() == null ? List.of() : List.copyOf(req.getQuantities());
        this.deadline = req.getDeadline();
        this.status = req.getStatus();
        this.hospitalID = req.getHospital().getID();
    }

    public Integer getReqID() { return reqID; }
    public List<Integer> getQuantities() { return quantities; }
    public LocalDate getDeadline() { return deadline; }
    public reqStatus getStatus() { return status; }
    public Integer getHospitalID() { return hospitalID; }
}
