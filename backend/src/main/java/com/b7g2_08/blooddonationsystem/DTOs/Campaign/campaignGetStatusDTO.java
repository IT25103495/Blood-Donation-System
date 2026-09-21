package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;

public class campaignGetStatusDTO {

    private campStatus status;

    public campaignGetStatusDTO(campStatus status) {
        this.status = status;
    }

    public campStatus getStatus() {
        return status;
    }

}
