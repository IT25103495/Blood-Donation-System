package com.b7g2_08.blooddonationsystem.DTOs.Request;

import com.b7g2_08.blooddonationsystem.Enums.reqStatus;

public class requestGetStatusDTO {

    protected reqStatus status;

    public requestGetStatusDTO(reqStatus status) {
        this.status = status;
    }

    public reqStatus getStatus() {
        return status;
    }
}
