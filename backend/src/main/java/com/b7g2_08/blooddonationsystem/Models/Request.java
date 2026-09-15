package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Enums.reqStatus;
import com.b7g2_08.blooddonationsystem.Models.Users.Hospital;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "reqID"
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reqID;

    //TODO: test and find out how this works, if it's too difficult use multiple columns
    @ElementCollection
    @CollectionTable(name = "Request_Quantities ", joinColumns = @JoinColumn(name = "reqID"))
    @Column(name = "Quantities")
    private List<Integer> quantities;

    @Column(name = "Deadline")
    private LocalDate deadline;

    @Column(name = "Status")
    private reqStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Hospital ID", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private Hospital hospital;

    public Integer getReqID() {
        return reqID;
    }

    public void setReqID(Integer reqID) {
        this.reqID = reqID;
    }

    public List<Integer> getQuantities() {
        return quantities;
    }

    public void setQuantities(List<Integer> quantities) {
        this.quantities = quantities;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public reqStatus getStatus() {
        return status;
    }

    public void setStatus(reqStatus status) {
        this.status = status;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }
}
